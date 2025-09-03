// Vercel API endpoint for dashboard data
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
    // Read the cached data file
    const dataPath = path.join(process.cwd(), 'public', 'data', 'dashboard_cache.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Fallback mock data for demonstration
    const mockData = {
      purchaseOrders: [
        {
          id: "PO-2024-001",
          vendorName: "ក្រុមហ៊ុន សាន់ដា (ខេមបូឌា) ឯ.ក",
          amount: 125000,
          date: "2024-03-15",
          operatingUnit: "MOF-001",
          status: "completed"
        },
        {
          id: "PO-2024-002", 
          vendorName: "ជី ប្រូវីសិន ឯ.ក",
          amount: 89500,
          date: "2024-03-16",
          operatingUnit: "MOF-002",
          status: "completed"
        }
      ],
      metrics: {
        totalVendors: 52,
        totalOperatingUnits: 26,
        totalPurchaseOrders: 695,
        totalAmount: 15750000
      }
    };
    
    res.status(200).json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      note: "Using fallback mock data"
    });
  }
};
