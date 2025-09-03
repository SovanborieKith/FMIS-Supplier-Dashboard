const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173']
}));

// Load cached data
let cachedData = null;

console.log('🚀 Starting simple test server...');

try {
  const cacheFilePath = path.join(__dirname, 'public', 'data', 'cached_data.json');
  if (fs.existsSync(cacheFilePath)) {
    console.log('📂 Loading cached data...');
    const cachedJson = fs.readFileSync(cacheFilePath, 'utf8');
    cachedData = JSON.parse(cachedJson);
    console.log(`✅ Loaded ${cachedData.metrics?.totalVendors || 0} vendors from cache`);
    console.log(`📊 Cache contains ${cachedData.purchaseOrders?.length || 0} purchase orders`);
  } else {
    console.log('❌ No cache file found');
  }
} catch (error) {
  console.error('❌ Error loading cache:', error.message);
}

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard data endpoint
app.get('/api/dashboard-data', (req, res) => {
  console.log('📊 Dashboard data requested');
  try {
    if (cachedData) {
      console.log('✅ Returning cached data');
      res.json({
        success: true,
        data: cachedData
      });
    } else {
      console.log('❌ No data available');
      res.json({
        success: false,
        error: 'No data available',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Error in dashboard endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Comparison data endpoint for Compare Dashboard
app.get('/api/comparison-data', (req, res) => {
  console.log('🔄 Comparison data requested');
  try {
    if (cachedData && cachedData.purchaseOrders) {
      console.log('✅ Generating comparison data from cached purchase orders');
      
      // Generate comparison data from purchase orders
      const purchaseOrders = cachedData.purchaseOrders;
      
      // Group vendors by year
      const vendorsByYear = {};
      const ouCountsByYear = {};
      
      purchaseOrders.forEach(po => {
        const year = new Date(po.date).getFullYear();
        const vendorName = po.vendorName;
        const ou = po.operatingUnit;
        
        // Track vendors by year
        if (!vendorsByYear[year]) vendorsByYear[year] = new Set();
        vendorsByYear[year].add(vendorName);
        
        // Track OU counts by year
        if (!ouCountsByYear[year]) ouCountsByYear[year] = {};
        if (!ouCountsByYear[year][ou]) ouCountsByYear[year][ou] = 0;
        ouCountsByYear[year][ou]++;
      });
      
      // Convert vendor sets to arrays and create vendor comparison data
      const allVendors = new Set();
      Object.values(vendorsByYear).forEach(vendorSet => {
        vendorSet.forEach(vendor => allVendors.add(vendor));
      });
      
      const vendors = Array.from(allVendors).map(vendorName => {
        const years = {};
        Object.keys(vendorsByYear).forEach(year => {
          years[year] = vendorsByYear[year].has(vendorName);
        });
        return { name: vendorName, years };
      });
      
      // Create OU yearly data
      const allOUs = new Set();
      Object.values(ouCountsByYear).forEach(ouData => {
        Object.keys(ouData).forEach(ou => allOUs.add(ou));
      });
      
      const yearlyData = Array.from(allOUs).map(unit => {
        const years = {};
        Object.keys(ouCountsByYear).forEach(year => {
          years[year] = ouCountsByYear[year][unit] || 0;
        });
        return { unit, years };
      });
      
      const comparisonData = {
        vendors: vendors.slice(0, 20), // Limit to first 20 vendors for performance
        yearlyData: yearlyData.slice(0, 15) // Limit to first 15 OUs for chart readability
      };
      
      console.log(`📈 Generated comparison data: ${comparisonData.vendors.length} vendors, ${comparisonData.yearlyData.length} OUs`);
      
      res.json({
        success: true,
        data: comparisonData
      });
    } else {
      console.log('❌ No comparison data available');
      res.json({
        success: false,
        error: 'No comparison data available',
        data: null
      });
    }
  } catch (error) {
    console.error('❌ Error in comparison endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: null
    });
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard data available at http://localhost:${PORT}/api/dashboard-data`);
  console.log(`✅ Server ready with ${cachedData ? 'cached data' : 'no data'}`);
});
