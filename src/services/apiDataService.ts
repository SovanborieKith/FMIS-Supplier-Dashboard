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
        return null;
      }

    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.error('⏱️ API request timed out');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('🔌 Cannot connect to API server. Make sure it\'s running on http://localhost:3001');
        console.log('💡 To start the API server:');
        console.log('   1. npm install express cors xlsx');
        console.log('   2. node server.js');
      } else {
        console.error('❌ Error fetching data from API:', error);
      }
      return null;
    }
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
        return null;
      }

    } catch (error) {
      console.error('❌ Error fetching comparison data from API:', error);
      return null;
    }
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
