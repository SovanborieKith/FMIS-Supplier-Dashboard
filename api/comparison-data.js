// Vercel API endpoint for comparison data
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Read the cached comparison data
    const dataPath = path.join(process.cwd(), 'public', 'data', 'cached_data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Process raw data into comparison format
    const purchaseOrders = rawData.purchaseOrders || [];
    const years = [2021, 2022, 2023, 2024, 2025];
    
    // Generate vendor comparison data
    const vendorsByYear = {};
    years.forEach(year => {
      vendorsByYear[year] = new Set();
    });
    
    // Track vendors by year
    purchaseOrders.forEach(po => {
      const year = new Date(po.date).getFullYear();
      if (years.includes(year)) {
        vendorsByYear[year].add(po.vendorName);
      }
    });
    
    // Get all unique vendors
    const allVendors = new Set();
    purchaseOrders.forEach(po => {
      allVendors.add(po.vendorName);
    });
    
    // Create vendor comparison data
    const vendors = Array.from(allVendors).map(vendorName => ({
      name: vendorName,
      years: years.reduce((acc, year) => {
        acc[year] = vendorsByYear[year].has(vendorName);
        return acc;
      }, {})
    }));
    
    // Generate yearly data by operating unit
    const ouByYear = {};
    
    purchaseOrders.forEach(po => {
      const year = new Date(po.date).getFullYear();
      const ou = po.operatingUnit;
      
      if (years.includes(year)) {
        if (!ouByYear[ou]) {
          ouByYear[ou] = {};
          years.forEach(y => ouByYear[ou][y] = 0);
        }
        ouByYear[ou][year]++;
      }
    });
    
    const yearlyData = Object.entries(ouByYear).map(([unit, yearData]) => ({
      unit,
      years: yearData
    }));
    
    const comparisonData = {
      vendors,
      yearlyData
    };
    
    console.log('🔧 API Generated comparison data:', {
      vendorsCount: vendors.length,
      yearlyDataCount: yearlyData.length,
      sampleVendors: vendors.slice(0, 3).map(v => v.name),
      sampleYearlyData: yearlyData.slice(0, 2)
    });
    
    res.status(200).json({
      success: true,
      data: comparisonData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading comparison data:', error);
    
    // Fallback mock comparison data
    const mockData = {
      vendors: [
        {
          name: "ក្រុមហ៊ុន សាន់ដា (ខេមបូឌា) ឯ.ក",
          years: { 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
        },
        {
          name: "ជី ប្រូវីសិន ឯ.ក",
          years: { 2021: false, 2022: true, 2023: true, 2024: true, 2025: true }
        },
        {
          name: "អិម.អ.អេច យូណាធីត ឯ.ក",
          years: { 2021: true, 2022: false, 2023: true, 2024: true, 2025: true }
        }
      ],
      yearlyData: [
        {
          unit: "1001",
          years: { 2021: 15, 2022: 18, 2023: 22, 2024: 25, 2025: 20 }
        },
        {
          unit: "1002",
          years: { 2021: 12, 2022: 15, 2023: 18, 2024: 22, 2025: 19 }
        },
        {
          unit: "1003",
          years: { 2021: 8, 2022: 12, 2023: 16, 2024: 20, 2025: 18 }
        }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      note: "Using fallback mock data"
    });
  }
};
