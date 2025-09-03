// API Data Service - Fetches data from Express server
// This replaces client-side Excel processing to prevent freezing

export interface DashboardData {
  purchaseOrders: any[];
  vendors: any[];
  operatingUnits: any[];
  topVendorsBySpend?: Array<{ vendor: string; amount: number }>; // New: Top vendors analytics
  metrics: {
    totalVendors: number;
    totalOperatingUnits: number;
    totalProcurement: number;
    activePOs: number;
    avgSpendPerVendor?: number; // New: Average spend per vendor
  };
}

export interface ApiResponse {
  success: boolean;
  data: DashboardData | null;
  error?: string;
}

class ApiDataService {
  private baseUrl: string;
  private cachedData: DashboardData | null = null;

  constructor() {
    // API server URL - use relative paths for Vercel deployment
    this.baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';
  }

  /**
   * Fetch dashboard data from API server
   */
  async fetchDashboardData(): Promise<DashboardData | null> {
    try {
      console.log('🌐 Fetching data from API server...');
      
      const response = await fetch(`${this.baseUrl}/api/dashboard-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Successfully received data from API server');
        console.log('📊 Data summary:', {
          purchaseOrders: result.data.purchaseOrders.length,
          operatingUnits: result.data.operatingUnits.length,
          metrics: result.data.metrics
        });
        
        this.cachedData = result.data;
        return result.data;
      } else {
        console.error('❌ API returned error:', result.error);
        throw new Error('API returned error');
      }

    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.error('⏱️ API request timed out');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('🔌 Cannot connect to API server. Falling back to static data...');
      } else {
        console.error('❌ Error fetching data from API:', error);
      }
      
      // Fallback: fetch static JSON file directly
      return this.fetchStaticData();
    }
  }

  /**
   * Fallback: Fetch data directly from static JSON file
   */
  async fetchStaticData(): Promise<DashboardData | null> {
    try {
      console.log('📄 Fetching data from static JSON file...');
      
      const response = await fetch('/data/cached_data.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch static data: ${response.status}`);
      }
      
      const rawData = await response.json();
      
      // Process the raw data into the expected format
      const processedData = this.processRawData(rawData);
      
      console.log('✅ Successfully loaded static data');
      console.log('📊 Static data summary:', {
        purchaseOrders: processedData.purchaseOrders.length,
        operatingUnits: processedData.operatingUnits.length,
        metrics: processedData.metrics
      });
      
      this.cachedData = processedData;
      return processedData;
      
    } catch (error) {
      console.error('❌ Failed to load static data:', error);
      return null;
    }
  }

  /**
   * Process raw cached data into dashboard format
   */
  private processRawData(rawData: any): DashboardData {
    const purchaseOrders = rawData.purchaseOrders || [];
    
    // Extract unique vendors
    const vendorMap = new Map();
    purchaseOrders.forEach((po: any) => {
      if (po.vendorName && !vendorMap.has(po.vendorName)) {
        vendorMap.set(po.vendorName, {
          name: po.vendorName,
          id: po.id || po.vendorName,
          totalSpend: 0,
          orderCount: 0
        });
      }
    });
    
    // Calculate vendor spending
    purchaseOrders.forEach((po: any) => {
      if (po.vendorName && vendorMap.has(po.vendorName)) {
        const vendor = vendorMap.get(po.vendorName);
        vendor.totalSpend += po.amount || 0;
        vendor.orderCount += 1;
      }
    });
    
    const vendors = Array.from(vendorMap.values());
    
    // Extract unique operating units
    const operatingUnits = [...new Set(purchaseOrders.map((po: any) => po.operatingUnit))].filter(Boolean);
    
    // Calculate metrics
    const totalProcurement = purchaseOrders.reduce((sum: number, po: any) => sum + (po.amount || 0), 0);
    const avgSpendPerVendor = vendors.length > 0 ? totalProcurement / vendors.length : 0;
    
    // Get top vendors by spending
    const topVendorsBySpend = vendors
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10)
      .map(v => ({ vendor: v.name, amount: v.totalSpend }));

    return {
      purchaseOrders,
      vendors,
      operatingUnits,
      topVendorsBySpend,
      metrics: {
        totalVendors: vendors.length,
        totalOperatingUnits: operatingUnits.length,
        totalProcurement,
        activePOs: purchaseOrders.length,
        avgSpendPerVendor
      }
    };
  }

  /**
   * Check if API server is available
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        console.log('✅ API server is healthy');
        return true;
      } else {
        console.warn('⚠️ API server returned non-OK status:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ API server health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get cached data (if available)
   */
  getCachedData(): DashboardData | null {
    return this.cachedData;
  }

  /**
   * Fetch comparison data from API server
   */
  async fetchComparisonData(): Promise<any | null> {
    try {
      console.log('🔄 Fetching comparison data from API server...');
      
      const response = await fetch(`${this.baseUrl}/api/comparison-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Successfully received comparison data from API server');
        return result.data;
      } else {
        console.error('❌ API returned error for comparison data:', result.error);
        throw new Error('API returned error');
      }

    } catch (error) {
      console.error('❌ Error fetching comparison data from API:', error);
      console.log('📄 Falling back to static data for comparison...');
      
      // Fallback: use the same static data processing
      if (!this.cachedData) {
        await this.fetchDashboardData(); // This will load and cache the static data
      }
      
      // Generate comparison data from our cached dashboard data
      return this.generateComparisonDataFromCache();
    }
  }

  /**
   * Generate comparison data structure from cached dashboard data
   */
  private generateComparisonDataFromCache(): any {
    if (!this.cachedData || !this.cachedData.purchaseOrders) {
      console.log('⚠️ No cached data available for comparison, using fallback mock data');
      return {
        vendors: [
          {
            name: 'KAMPUCHEA TELA LIMITED',
            years: { 2021: true, 2022: true, 2023: true, 2024: true, 2025: true }
          },
          {
            name: 'M.R.H LIMITED CO.,LTD',
            years: { 2021: false, 2022: true, 2023: true, 2024: false, 2025: false }
          },
          {
            name: 'Strategy Object FZ LLC',
            years: { 2021: false, 2022: false, 2023: false, 2024: true, 2025: true }
          },
          {
            name: 'ກິດຈະການ ຄຸ້ມວົງ ລ.ດ',
            years: { 2021: false, 2022: false, 2023: false, 2024: true, 2025: true }
          },
          {
            name: 'ບໍລິສັດ ກຸ່ມອາຊ່ານ',
            years: { 2021: true, 2022: true, 2023: true, 2024: true, 2025: false }
          }
        ],
        yearlyData: [
          {
            unit: '1001',
            years: { 2021: 15, 2022: 18, 2023: 22, 2024: 25, 2025: 20 }
          },
          {
            unit: '1002',
            years: { 2021: 12, 2022: 15, 2023: 18, 2024: 22, 2025: 19 }
          },
          {
            unit: '1003',
            years: { 2021: 8, 2022: 12, 2023: 16, 2024: 20, 2025: 18 }
          },
          {
            unit: '1004',
            years: { 2021: 10, 2022: 14, 2023: 18, 2024: 23, 2025: 21 }
          },
          {
            unit: '1005',
            years: { 2021: 6, 2022: 9, 2023: 13, 2024: 17, 2025: 15 }
          }
        ]
      };
    }

    console.log('🔄 Generating comparison data from real Excel data...');
    
    // Process real data to create comparison structure
    const purchaseOrders = this.cachedData.purchaseOrders;
    const years = [2021, 2022, 2023, 2024, 2025];
    
    // Generate vendor comparison data
    const vendorsByYear: Record<number, Set<string>> = {};
    years.forEach(year => {
      vendorsByYear[year] = new Set();
    });
    
    // Track vendors by year
    purchaseOrders.forEach((po: any) => {
      const year = new Date(po.date).getFullYear();
      if (years.includes(year)) {
        vendorsByYear[year].add(po.vendorName);
      }
    });
    
    // Get all unique vendors
    const allVendors = new Set<string>();
    purchaseOrders.forEach((po: any) => {
      allVendors.add(po.vendorName);
    });
    
    // Create vendor comparison data
    const vendors = Array.from(allVendors).map(vendorName => ({
      name: vendorName,
      years: years.reduce((acc, year) => {
        acc[year] = vendorsByYear[year].has(vendorName);
        return acc;
      }, {} as Record<number, boolean>)
    }));
    
    // Generate yearly data by operating unit
    const ouByYear: Record<string, Record<number, number>> = {};
    
    purchaseOrders.forEach((po: any) => {
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
    
    console.log('✅ Generated comparison data:', {
      vendorsCount: vendors.length,
      yearlyDataCount: yearlyData.length,
      sampleVendors: vendors.slice(0, 3).map(v => v.name),
      sampleYearlyData: yearlyData.slice(0, 2),
      fullVendorsData: vendors.slice(0, 3),
      fullYearlyData: yearlyData.slice(0, 3)
    });
    
    return {
      vendors,
      yearlyData
    };
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.cachedData = null;
  }
}

// Create singleton instance
export const apiDataService = new ApiDataService();

// Helper function to load dashboard data with fallback
export async function loadDashboardDataFromAPI(): Promise<DashboardData | null> {
  try {
    // First check if server is available
    const isHealthy = await apiDataService.checkServerHealth();
    
    if (!isHealthy) {
      console.log('🔧 API server not available. Instructions to start:');
      console.log('   1. Open a new terminal');
      console.log('   2. cd to your project directory');
      console.log('   3. npm install express cors xlsx');
      console.log('   4. node server.js');
      console.log('   5. Refresh this page');
      return null;
    }

    // Fetch data from API
    const data = await apiDataService.fetchDashboardData();
    
    if (data) {
      return data;
    } else {
      console.log('📄 API returned no data');
      return null;
    }

  } catch (error) {
    console.error('💥 Critical error in API data loading:', error);
    return null;
  }
}
