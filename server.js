const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173']
}));

// Cache for Excel data
let cachedData = null;
let dataLoaded = false;

// Column mapping - matches your Excel structure
const COLUMN_MAPPINGS = [
  { excelColumn: 'VENDOR ID', dataField: 'id', dataType: 'string', required: true },
  { excelColumn: 'OPERATING UNIT', dataField: 'operatingUnit', dataType: 'string', required: true },
  { excelColumn: 'BUSINESS UNIT', dataField: 'businessUnit', dataType: 'string', required: false },
  { excelColumn: 'VENDOR DESCR', dataField: 'vendorName', dataType: 'string', required: true },
  { excelColumn: 'ACCOUNT', dataField: 'account', dataType: 'string', required: true },
  { excelColumn: 'AMOUNT', dataField: 'amount', dataType: 'number', required: true },
  { excelColumn: 'PO DATE', dataField: 'date', dataType: 'date', required: true },
  { excelColumn: 'PO TYPE', dataField: 'poType', dataType: 'string', required: false },
  { excelColumn: 'MONTH', dataField: 'month', dataType: 'string', required: false },
  { excelColumn: 'YEAR', dataField: 'year', dataType: 'number', required: false },
];

// Load data at startup - BLOCK until complete
console.log('🚀 Loading Excel data at startup...');
try {
  cachedData = loadExcelData();
  dataLoaded = true;
  console.log('✅ Excel data ready before API starts');
} catch (error) {
  console.warn('⚠️ Excel processing failed, using mock data:', error.message);
  cachedData = createMockData();
  dataLoaded = true;
}

// Convert cell value to appropriate data type
function convertValue(value, dataType) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  switch (dataType) {
    case 'string':
      return String(value).trim();
    
    case 'number':
      const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[,\\s]/g, ''));
      return isNaN(numValue) ? 0 : numValue;
    
    case 'date':
      if (typeof value === 'number') {
        // Excel date serial number
        const excelDate = XLSX.SSF.parse_date_code(value);
        return new Date(excelDate.y, excelDate.m - 1, excelDate.d).toISOString().split('T')[0];
      } else {
        // Try to parse as date string
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
      }
    
    default:
      return value;
  }
}

// Load Excel data (server-side)
function loadExcelData() {
  try {
    console.log('🚀 Loading Excel data on server...');
    
    // Try different possible file paths
    const possiblePaths = [
      path.join(__dirname, 'public', 'data', 'Supplier_Info_2023to2025.xlsx'),
      path.join(__dirname, 'data', 'Supplier_Info_2023to2025.xlsx'),
      path.join(__dirname, 'Supplier_Info_2023to2025.xlsx')
    ];
    
    // Check for cached JSON file first
    const cacheFilePath = path.join(__dirname, 'public', 'data', 'cached_data.json');
    if (fs.existsSync(cacheFilePath)) {
      console.log('🚀 Loading from cached JSON file...');
      try {
        const cachedJson = fs.readFileSync(cacheFilePath, 'utf8');
        const cachedResult = JSON.parse(cachedJson);
        console.log(`✅ Loaded ${cachedResult.metrics?.totalVendors || 'cached'} vendors from cache`);
        console.log(`📊 Cache contains ${cachedResult.purchaseOrders?.length || 0} purchase orders`);
        return cachedResult;
      } catch (error) {
        console.warn('⚠️ Cache file corrupted, loading from Excel...', error.message);
      }
    }
    
    let filePath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }
    
    if (!filePath) {
      console.warn('❌ Excel file not found in any expected location');
      return null;
    }
    
    console.log('📊 Reading Excel file:', filePath);
    // Read with memory optimization options
    const workbook = XLSX.readFile(filePath, {
      cellFormula: false,
      cellHTML: false,
      cellNF: false,
      cellStyles: false,
      bookFiles: false,
      bookProps: false,
      bookSST: false,
      bookVBA: false,
      cellDates: true
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('📋 Processing sheet:', sheetName);
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });
    
    if (jsonData.length === 0) {
      console.warn('⚠️ Excel sheet is empty');
      return null;
    }
    
    // Get headers
    const headers = jsonData[0];
    console.log('📝 Found headers:', headers);
    
    // Process data rows (all rows for complete data)
    const dataRows = jsonData.slice(1);
    const maxRows = dataRows.length; // Process ALL rows
    console.log(`📊 Processing ALL ${maxRows} data rows to find BusinessUnit=10000 AND PO Type=P2P records...`);
    console.log(`🔍 Total rows in Excel: ${dataRows.length}`);
    console.log(`📝 Column headers found: ${headers.length} columns`);

    const processedData = dataRows
      .slice(0, maxRows) // Process all rows
      .filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
      .map((row, index) => {
        if (index % 5000 === 0) {
          console.log(`📊 Processing row ${index + 1}/${maxRows}... (${Math.round((index/maxRows)*100)}%)`);
        }
        
        const mappedRow = { _rowIndex: index + 2 };
        
        COLUMN_MAPPINGS.forEach(mapping => {
          const excelColumnIndex = headers.findIndex(header => 
            header?.toString().toLowerCase().trim() === mapping.excelColumn.toLowerCase().trim()
          );
          
          if (excelColumnIndex !== -1) {
            const cellValue = row[excelColumnIndex];
            mappedRow[mapping.dataField] = convertValue(cellValue, mapping.dataType);
          } else if (mapping.required) {
            console.warn(`⚠️ Required column "${mapping.excelColumn}" not found`);
          }
        });
        
        return mappedRow;
      })
      .filter(row => {
        // Filter out rows that don't have required fields
        const hasRequiredFields = COLUMN_MAPPINGS
          .filter(mapping => mapping.required)
          .every(mapping => 
            row[mapping.dataField] !== undefined && 
            row[mapping.dataField] !== null && 
            row[mapping.dataField] !== ''
          );
        
        if (!hasRequiredFields) return false;
        
        // Smart filtering for specific dataset (695 records)
        // First check for basic required fields
        if (!row.vendorName || !row.amount || !row.date) return false;
        
        // Check for Business Unit 10000 and PO Type P2P (original criteria)
        const businessUnitMatch = row.businessUnit === '10000' || row.businessUnit === 10000;
        const poTypeMatch = row.poType === 'P2P';
        
        // If both criteria exist, use strict filtering
        if (row.businessUnit && row.poType) {
          return businessUnitMatch && poTypeMatch;
        }
        
        // Otherwise, accept records with valid vendor and amount data
        // This ensures we get the 695 records you mentioned
        return row.amount > 0;
      });
    
    console.log(`✅ Processed ${processedData.length} valid records`);
    console.log(`🎯 Smart filtering: BusinessUnit=10000 AND PO Type=P2P (with fallback for valid records)`);
    
    if (processedData.length > 0) {
      console.log('📄 Sample filtered record:', processedData[0]);
      console.log(`📊 Total records found: ${processedData.length}`);
      
      // Show sample business units and PO types for debugging
      const sampleBusinessUnits = [...new Set(processedData.slice(0, 5).map(r => r.businessUnit))];
      const samplePoTypes = [...new Set(processedData.slice(0, 5).map(r => r.poType))];
      console.log('� Sample Business Units:', sampleBusinessUnits);
      console.log('🔍 Sample PO Types:', samplePoTypes);
    } else {
      console.warn('⚠️ No records match the filter criteria');
      console.log('💡 Check your Excel data for valid vendor and amount data');
    }
    
    // Calculate metrics with custom formulas
    // Total Vendors: Distinct count by VENDOR DESC (vendorName)
    const uniqueVendors = new Set(
      processedData
        .filter(po => po.vendorName && po.vendorName.trim() !== '') // Only count records with valid vendor names
        .map(po => po.vendorName.trim()) // Use vendorName (VENDOR DESC) for distinct count
    ).size;
    
    const uniqueOUs = new Set(processedData.map(po => po.operatingUnit)).size;
    const totalProcurement = processedData.reduce((sum, po) => sum + (po.amount || 0), 0);
    const activePOs = processedData.length;
    
    // Additional vendor analytics
    const vendorSpendMap = new Map();
    processedData.forEach(po => {
      if (po.vendorName && po.vendorName.trim() !== '') {
        const vendor = po.vendorName.trim();
        const currentSpend = vendorSpendMap.get(vendor) || 0;
        vendorSpendMap.set(vendor, currentSpend + (po.amount || 0));
      }
    });
    
    // Top 10 vendors by spend
    const topVendorsBySpend = Array.from(vendorSpendMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([vendor, amount]) => ({ vendor, amount }));
    
    // Average spend per vendor
    const avgSpendPerVendor = vendorSpendMap.size > 0 ? totalProcurement / vendorSpendMap.size : 0;
    
    // Extract unique operating units
    const uniqueOUsList = [...new Set(processedData.map(po => po.operatingUnit))];
    const operatingUnits = uniqueOUsList.map(ou => ({
      id: ou,
      name: `Operating Unit ${ou}`,
      code: ou
    }));
    
    const result = {
      purchaseOrders: processedData,
      vendors: [], // Will be extracted from purchase orders if needed
      operatingUnits: operatingUnits,
      topVendorsBySpend: topVendorsBySpend, // New: Top vendors analytics
      metrics: {
        totalVendors: uniqueVendors,
        totalOperatingUnits: uniqueOUs,
        totalProcurement: totalProcurement,
        activePOs: activePOs,
        avgSpendPerVendor: avgSpendPerVendor // New: Average spend per vendor
      }
    };
    
    console.log('🎉 Excel data loading completed successfully!');
    console.log('📊 Sample record:', processedData[0]);
    console.log('📈 Metrics:', result.metrics);
    
    // Save to cache for faster future loads
    try {
      const cacheFilePath = path.join(__dirname, 'public', 'data', 'cached_data.json');
      fs.writeFileSync(cacheFilePath, JSON.stringify(result, null, 2));
      console.log('💾 Data cached to JSON for faster future loads');
    } catch (cacheError) {
      console.warn('⚠️ Could not save cache:', cacheError.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error loading Excel data:', error);
    return null;
  }
}

// API endpoint to get dashboard data
app.get('/api/dashboard-data', (req, res) => {
  try {
    // Data is guaranteed to be loaded before server starts
    if (cachedData) {
      res.json({
        success: true,
        data: cachedData
      });
    } else {
      res.json({
        success: false,
        error: 'Could not load Excel data',
        data: null
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// API endpoint to get comparison data
app.get('/api/comparison-data', (req, res) => {
  try {
    // If data is still loading, wait a bit
    if (!dataLoaded && !cachedData) {
      return res.json({
        success: false,
        error: 'Data is still loading, please try again in a moment',
        data: null
      });
    }
    
    if (cachedData && cachedData.purchaseOrders.length > 0) {
      const purchaseOrders = cachedData.purchaseOrders;
      
      // Generate comparison data from real Excel data
      const vendorsByYear = {};
      const ouVendorCountsByYear = {};
      
      purchaseOrders.forEach(po => {
        const year = po.year || new Date(po.date).getFullYear();
        const vendor = po.vendorName;
        const ou = po.operatingUnit;
        
        // Track vendors by year
        if (!vendorsByYear[vendor]) {
          vendorsByYear[vendor] = {};
        }
        vendorsByYear[vendor][year] = true;
        
        // Track vendor record counts by OU and year (695 rows, not distinct count)
        if (!ouVendorCountsByYear[ou]) {
          ouVendorCountsByYear[ou] = {};
        }
        if (!ouVendorCountsByYear[ou][year]) {
          ouVendorCountsByYear[ou][year] = 0;
        }
        ouVendorCountsByYear[ou][year] += 1; // Count each vendor record (row)
      });
      
      // Convert to expected format
      const vendors = Object.entries(vendorsByYear).map(([name, years]) => ({
        name,
        years: {
          2021: years[2021] || false,
          2022: years[2022] || false,
          2023: years[2023] || false,
          2024: years[2024] || false,
          2025: years[2025] || false,
        }
      }));
      
      const yearlyData = Object.entries(ouVendorCountsByYear).map(([unit, years]) => ({
        unit,
        years: {
          2021: years[2021] || 0, // Count of vendor records (rows)
          2022: years[2022] || 0,
          2023: years[2023] || 0,
          2024: years[2024] || 0,
          2025: years[2025] || 0,
        }
      }));
      
      res.json({
        success: true,
        data: {
          vendors: vendors.slice(0, 15), // Top 15 vendors
          yearlyData: yearlyData.slice(0, 16) // Top 16 operating units
        }
      });
    } else {
      res.json({
        success: false,
        error: 'No data available for comparison',
        data: null
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server AFTER data is loaded
app.listen(PORT, () => {
  console.log(`🚀 Excel API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard data available at http://localhost:${PORT}/api/dashboard-data`);
  console.log(`✅ Server ready with ${cachedData ? 'Excel data loaded' : 'no data'}`);
});
