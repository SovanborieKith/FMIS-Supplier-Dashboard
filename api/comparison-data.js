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
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading comparison data:', error);
    
    // Fallback mock comparison data
    const mockData = {
      vendors: [
        { id: 1, name: "ក្រុមហ៊ុន សាន់ដា (ខេមបូឌា) ឯ.ក", totalOrders: 45 },
        { id: 2, name: "ជី ប្រូវីសិន ឯ.ក", totalOrders: 32 }
      ],
      yearlyData: [
        { year: 2023, total: 8500000 },
        { year: 2024, total: 15750000 }
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
