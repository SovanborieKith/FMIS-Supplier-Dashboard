import { loadDashboardDataFromAPI, apiDataService } from './apiDataService';

// Data Service for Supplier Information Dashboard
// This service handles all data fetching and processing

export interface OperatingUnit {
  id: string;
  name: string;
  code: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  operatingUnits: string[];
}

export interface PurchaseOrder {
  id: string;
  operatingUnit: string;
  vendor: string;
  vendorName: string;
  account: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface DashboardMetrics {
  totalVendors: number;
  totalOperatingUnits: number;
  totalProcurement: number;
  activePOs: number;
  avgSpendPerVendor?: number;
}

export interface TimeSeriesData {
  period: string;
  value: number;
  year?: number;
  month?: number;
}

export interface ProcurementByOU {
  operatingUnit: string;
  value: number;
  count: number;
  percentage: number;
}

// Enhanced DataService with Excel integration
class DataService {
  private baseUrl: string;
  private excelDataLoaded: boolean = false;
  private cachedData: any = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Load data once and cache it  
  private async loadExcelData() {
    if (!this.excelDataLoaded) {
      try {
        console.log('🚀 Starting API data loading (no more freezing!)...');
        
        // Try to load data from API server with retries
        this.cachedData = await this.loadWithRetries();
        
        if (this.cachedData && this.cachedData.purchaseOrders.length > 0) {
          this.excelDataLoaded = true;
          console.log('✅ API data loaded successfully:', {
            hasPurchaseOrders: !!this.cachedData?.purchaseOrders,
            purchaseOrdersCount: this.cachedData?.purchaseOrders?.length || 0,
            hasMetrics: !!this.cachedData?.metrics,
            metrics: this.cachedData?.metrics
          });
        } else {
          console.log('⚠️ API data not available, using enhanced mock data');
          this.cachedData = this.getEnhancedMockData();
          this.excelDataLoaded = true;
        }
      } catch (error) {
        console.warn('Could not load Excel data, using enhanced mock data:', error);
        this.cachedData = this.getEnhancedMockData();
      }
    }
  }

  // Load data with retries for server startup
  private async loadWithRetries(maxRetries = 6, delay = 5000): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const data = await loadDashboardDataFromAPI();
        if (data && data.purchaseOrders && data.purchaseOrders.length > 0) {
          console.log(`✅ API data retrieved on attempt ${i + 1}`);
          return data;
        } else {
          console.log(`⏳ Attempt ${i + 1}: API server still processing data...`);
        }
      } catch (error) {
        console.log(`⏳ Attempt ${i + 1}: API not ready yet - ${error.message}`);
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏱️ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('API server data not available after retries');
  }

  // Enhanced mock data based on your Excel file structure
  private getEnhancedMockData() {
    return {
      purchaseOrders: [
        {
          id: 'V001-001',
          operatingUnit: '1001',
          vendor: 'V001',
          vendorName: 'KAMPUCHEA TELA LIMITED',
          account: '60015',
          amount: 125000,
          currency: 'USD',
          date: '2024-07-13',
          status: 'completed' as const
        },
        {
          id: 'V001-002',
          operatingUnit: '1002',
          vendor: 'V001',
          vendorName: 'KAMPUCHEA TELA LIMITED',
          account: '60020',
          amount: 98000,
          currency: 'USD',
          date: '2024-07-12',
          status: 'approved' as const
        },
        {
          id: 'V002-001',
          operatingUnit: '1003',
          vendor: 'V002',
          vendorName: 'M.R.H LIMITED CO.,LTD',
          account: '60025',
          amount: 75000,
          currency: 'USD',
          date: '2024-07-11',
          status: 'pending' as const
        },
        {
          id: 'V003-001',
          operatingUnit: '1004',
          vendor: 'V003',
          vendorName: 'Strategy Object FZ LLC',
          account: '60030',
          amount: 150000,
          currency: 'USD',
          date: '2024-07-10',
          status: 'completed' as const
        },
        {
          id: 'V004-001',
          operatingUnit: '1005',
          vendor: 'V004',
          vendorName: 'ກິດຈະການ ຄຸ້ມວົງ ລ.ດ',
          account: '60035',
          amount: 85000,
          currency: 'USD',
          date: '2024-07-09',
          status: 'approved' as const
        },
        // Add more realistic data based on your structure
        {
          id: 'V005-001',
          operatingUnit: '1006',
          vendor: 'V005',
          vendorName: 'Tech Solutions Ltd',
          account: '60040',
          amount: 67000,
          currency: 'USD',
          date: '2024-07-08',
          status: 'completed' as const
        },
        {
          id: 'V006-001',
          operatingUnit: '1007',
          vendor: 'V006',
          vendorName: 'Global Supplies Co',
          account: '60045',
          amount: 112000,
          currency: 'USD',
          date: '2024-07-07',
          status: 'pending' as const
        }
      ],
      vendors: [
        { id: 'V001', name: 'KAMPUCHEA TELA LIMITED', code: 'KTL', registrationDate: '2020-01-15', status: 'active' as const },
        { id: 'V002', name: 'M.R.H LIMITED CO.,LTD', code: 'MRH', registrationDate: '2021-03-22', status: 'active' as const },
        { id: 'V003', name: 'Strategy Object FZ LLC', code: 'SOF', registrationDate: '2022-06-10', status: 'active' as const },
      ],
      operatingUnits: [
        { id: '1001', name: 'Operating Unit 1001', code: '1001' },
        { id: '1002', name: 'Operating Unit 1002', code: '1002' },
        { id: '1003', name: 'Operating Unit 1003', code: '1003' },
        { id: '1004', name: 'Operating Unit 1004', code: '1004' },
        { id: '1005', name: 'Operating Unit 1005', code: '1005' },
        { id: '1006', name: 'Operating Unit 1006', code: '1006' },
        { id: '1007', name: 'Operating Unit 1007', code: '1007' },
      ],
      metrics: {
        totalVendors: 15,
        totalOperatingUnits: 12,
        totalProcurement: 2450000,
        activePOs: 25
      }
    };
  }

  // Get mock data as fallback
  private getMockData() {
    return {
      purchaseOrders: [
        {
          id: 'PO-2024-001',
          operatingUnit: '1001',
          vendor: 'V001',
          vendorName: 'KAMPUCHEA TELA LIMITED',
          account: '60015',
          amount: 125000,
          currency: 'USD',
          date: '2024-07-13',
          status: 'completed' as const
        },
        {
          id: 'PO-2024-002',
          operatingUnit: '1002',
          vendor: 'V001',
          vendorName: 'KAMPUCHEA TELA LIMITED',
          account: '60015',
          amount: 98000,
          currency: 'USD',
          date: '2024-07-13',
          status: 'approved' as const
        },
        {
          id: 'PO-2024-003',
          operatingUnit: '1003',
          vendor: 'V002',
          vendorName: 'M.R.H LIMITED CO.,LTD',
          account: '60020',
          amount: 75000,
          currency: 'USD',
          date: '2024-07-12',
          status: 'pending' as const
        },
        {
          id: 'PO-2024-004',
          operatingUnit: '1004',
          vendor: 'V003',
          vendorName: 'Strategy Object FZ LLC',
          account: '60025',
          amount: 150000,
          currency: 'USD',
          date: '2024-07-11',
          status: 'completed' as const
        },
        {
          id: 'PO-2024-005',
          operatingUnit: '1005',
          vendor: 'V004',
          vendorName: 'ກິດຈະການ ຄຸ້ມວົງ ລ.ດ',
          account: '60030',
          amount: 85000,
          currency: 'USD',
          date: '2024-07-10',
          status: 'approved' as const
        }
      ],
      vendors: [
        { id: 'V001', name: 'KAMPUCHEA TELA LIMITED', code: 'KTL', registrationDate: '2020-01-15', status: 'active' },
        { id: 'V002', name: 'M.R.H LIMITED CO.,LTD', code: 'MRH', registrationDate: '2021-03-22', status: 'active' },
        { id: 'V003', name: 'Strategy Object FZ LLC', code: 'SOF', registrationDate: '2022-06-10', status: 'active' },
      ],
      operatingUnits: [
        { id: '1001', name: 'Operating Unit 1001', code: '1001' },
        { id: '1002', name: 'Operating Unit 1002', code: '1002' },
        { id: '1003', name: 'Operating Unit 1003', code: '1003' },
        { id: '1004', name: 'Operating Unit 1004', code: '1004' },
        { id: '1005', name: 'Operating Unit 1005', code: '1005' },
      ],
      metrics: {
        totalVendors: 52,
        totalOperatingUnits: 26,
        totalProcurement: 15800000,
        activePOs: 145
      }
    };
  }

  // Fetch dashboard metrics
  async getDashboardMetrics(filters?: {
    operatingUnit?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardMetrics> {
    try {
      await this.loadExcelData();

      // If we have cached data with pre-calculated metrics, use those
      if (this.cachedData?.metrics) {
        console.log('✅ Using server-calculated metrics:', this.cachedData.metrics);
        return {
          totalVendors: this.cachedData.metrics.totalVendors || 0,
          totalOperatingUnits: this.cachedData.metrics.totalOperatingUnits || 0,
          totalProcurement: this.cachedData.metrics.totalProcurement || 0,
          activePOs: this.cachedData.metrics.activePOs || 0,
          avgSpendPerVendor: this.cachedData.metrics.avgSpendPerVendor || 0
        };
      }

      // Fallback: calculate metrics from purchase orders if available
      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        console.log('⚠️ Calculating metrics from purchase orders data...');
        // Calculate metrics from Excel data
        let filteredPOs = this.cachedData.purchaseOrders;

        // Apply filters
        if (filters?.operatingUnit && filters.operatingUnit !== 'all') {
          filteredPOs = filteredPOs.filter((po: any) => po.operatingUnit === filters.operatingUnit);
        }
        if (filters?.year && filters.year !== null) {
          filteredPOs = filteredPOs.filter((po: any) => {
            const poYear = new Date(po.date).getFullYear();
            return poYear === filters.year;
          });
        }

        const uniqueVendors = new Set(filteredPOs.map((po: any) => po.vendorName)).size;
        const uniqueOUs = new Set(filteredPOs.map((po: any) => po.operatingUnit)).size;
        const totalProcurement = filteredPOs.reduce((sum: number, po: any) => sum + (po.amount || 0), 0);
        const activePOs = filteredPOs.filter((po: any) => po.status !== 'completed' && po.status !== 'cancelled').length;

        return {
          totalVendors: uniqueVendors,
          totalOperatingUnits: uniqueOUs,
          totalProcurement: totalProcurement,
          activePOs: activePOs,
          avgSpendPerVendor: uniqueVendors > 0 ? totalProcurement / uniqueVendors : 0
        };
      }

      console.log('⚠️ Falling back to mock data...');
      return this.cachedData?.metrics || this.getMockData().metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // Fetch procurement timeframe data
  async getProcurementTimeframe(filters?: {
    operatingUnit?: string;
    year?: number;
  }): Promise<TimeSeriesData[]> {
    try {
      await this.loadExcelData();

      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        // Group by month and count vendor descriptions
        const monthlyData: { [key: string]: number } = {};
        let filteredPOs = this.cachedData.purchaseOrders;

        // Apply filters
        if (filters?.operatingUnit && filters.operatingUnit !== 'all') {
          filteredPOs = filteredPOs.filter((po: any) => po.operatingUnit === filters.operatingUnit);
        }

        filteredPOs.forEach((po: any) => {
          const date = new Date(po.date);
          const year = filters?.year || date.getFullYear();
          if (date.getFullYear() === year) {
            const month = date.toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + 1; // Count vendor transactions per month
          }
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = months.map(month => ({
          period: month,
          value: monthlyData[month] || 0, // Count of vendor transactions per month
          year: filters?.year || new Date().getFullYear(),
          month: months.indexOf(month) + 1
        }));
        
        console.log('📈 Timeline data generated (by months):', result);
        console.log('📊 Monthly vendor counts:', monthlyData);
        return result;
      }

      // Mock data fallback
      return [
        { period: 'Jan', value: 8, year: 2024, month: 1 },
        { period: 'Feb', value: 12, year: 2024, month: 2 },
        { period: 'Mar', value: 16, year: 2024, month: 3 },
        { period: 'Apr', value: 18, year: 2024, month: 4 },
        { period: 'May', value: 20, year: 2024, month: 5 },
        { period: 'Jun', value: 19, year: 2024, month: 6 },
        { period: 'Jul', value: 22, year: 2024, month: 7 },
        { period: 'Aug', value: 24, year: 2024, month: 8 },
        { period: 'Sep', value: 18, year: 2024, month: 9 },
        { period: 'Oct', value: 15, year: 2024, month: 10 },
        { period: 'Nov', value: 12, year: 2024, month: 11 },
        { period: 'Dec', value: 10, year: 2024, month: 12 },
      ];
    } catch (error) {
      console.error('Error fetching procurement timeframe:', error);
      throw error;
    }
  }

  // Fetch procurement by operating unit
  async getProcurementByOU(filters?: {
    operatingUnit?: string;
    year?: number;
    limit?: number;
  }): Promise<ProcurementByOU[]> {
    try {
      await this.loadExcelData();

      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        const ouData: { [key: string]: number } = {};
        let filteredPOs = this.cachedData.purchaseOrders;

        // Apply filters
        if (filters?.operatingUnit && filters.operatingUnit !== 'all') {
          filteredPOs = filteredPOs.filter((po: any) => po.operatingUnit === filters.operatingUnit);
        }
        if (filters?.year && filters.year !== null) {
          filteredPOs = filteredPOs.filter((po: any) => {
            const poYear = new Date(po.date).getFullYear();
            return poYear === filters.year;
          });
        }

        // Group by operating unit and count procurements
        filteredPOs.forEach((po: any) => {
          ouData[po.operatingUnit] = (ouData[po.operatingUnit] || 0) + 1; // Count procurements, not amounts
        });

        const totalCount = Object.values(ouData).reduce((sum: number, count: number) => sum + count, 0);

        const result = Object.entries(ouData)
          .map(([unit, count]) => ({
            operatingUnit: unit,
            count: count as number, // Use 'count' field for chart compatibility
            value: count as number, // Keep 'value' for backward compatibility
            percentage: totalCount > 0 ? (count as number / totalCount) * 100 : 0
          }))
          .sort((a, b) => b.count - a.count);

        console.log('📊 OU counts data generated:', result);
        return filters?.limit ? result.slice(0, filters.limit) : result;
      }

      // Mock data fallback
      return [
        { operatingUnit: '1001', count: 24, value: 24, percentage: 15.2 },
        { operatingUnit: '1024', count: 18, value: 18, percentage: 11.4 },
        { operatingUnit: '1002', count: 16, value: 16, percentage: 10.1 },
        { operatingUnit: '1017', count: 14, value: 14, percentage: 8.9 },
        { operatingUnit: '1021', count: 12, value: 12, percentage: 7.6 },
        { operatingUnit: '1022', count: 10, value: 10, percentage: 6.3 },
        { operatingUnit: '1026', count: 8, value: 8, percentage: 5.1 },
        { operatingUnit: '1005', count: 6, value: 6, percentage: 3.8 },
        { operatingUnit: '1009', count: 5, value: 5, percentage: 3.2 },
        { operatingUnit: '1008', count: 4, value: 4, percentage: 2.5 },
      ];
    } catch (error) {
      console.error('Error fetching procurement by OU:', error);
      throw error;
    }
  }

  // Fetch PO counts by operating unit
  async getPOCountsByOU(filters?: {
    year?: number;
    limit?: number;
  }): Promise<{ unit: string; value: number }[]> {
    try {
      await this.loadExcelData();

      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        const ouCounts: { [key: string]: number } = {};
        let filteredPOs = this.cachedData.purchaseOrders;

        // Apply year filter
        if (filters?.year && filters.year !== null) {
          filteredPOs = filteredPOs.filter((po: any) => {
            const poYear = new Date(po.date).getFullYear();
            return poYear === filters.year;
          });
        }

        // Count POs by operating unit
        filteredPOs.forEach((po: any) => {
          ouCounts[po.operatingUnit] = (ouCounts[po.operatingUnit] || 0) + 1;
        });

        const result = Object.entries(ouCounts)
          .map(([unit, count]) => ({
            unit,
            value: count as number
          }))
          .sort((a, b) => b.value - a.value);

        return filters?.limit ? result.slice(0, filters.limit) : result;
      }

      // Mock data fallback
      return [
        { unit: '1001', value: 95 },
        { unit: '1005', value: 82 },
        { unit: '1007', value: 75 },
        { unit: '1024', value: 68 },
        { unit: '1009', value: 54 },
        { unit: '1016', value: 48 },
        { unit: '1003', value: 42 },
        { unit: '1002', value: 38 },
      ];
    } catch (error) {
      console.error('Error fetching PO counts by OU:', error);
      throw error;
    }
  }

  // Fetch recent purchase orders
  async getRecentPurchaseOrders(filters?: {
    operatingUnit?: string;
    year?: number;
    limit?: number;
  }): Promise<PurchaseOrder[]> {
    try {
      await this.loadExcelData();

      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        let filteredPOs = [...this.cachedData.purchaseOrders];

        // Apply filters
        if (filters?.operatingUnit && filters.operatingUnit !== 'all') {
          filteredPOs = filteredPOs.filter((po: any) => po.operatingUnit === filters.operatingUnit);
        }
        if (filters?.year && filters.year !== null) {
          filteredPOs = filteredPOs.filter((po: any) => {
            const poYear = new Date(po.date).getFullYear();
            return poYear === filters.year;
          });
        }

        // Sort by date (most recent first)
        filteredPOs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Apply limit
        if (filters?.limit) {
          filteredPOs = filteredPOs.slice(0, filters.limit);
        }

        return filteredPOs;
      }

      // Mock data fallback
      return this.getMockData().purchaseOrders;
    } catch (error) {
      console.error('Error fetching recent purchase orders:', error);
      throw error;
    }
  }

  // Fetch operating units list
  async getOperatingUnits(): Promise<OperatingUnit[]> {
    try {
      await this.loadExcelData();

      if (this.cachedData?.operatingUnits && this.cachedData.operatingUnits.length > 0) {
        return this.cachedData.operatingUnits;
      }

      if (this.cachedData?.purchaseOrders && this.cachedData.purchaseOrders.length > 0) {
        // Extract unique operating units from purchase orders
        const uniqueOUs = [...new Set(this.cachedData.purchaseOrders.map((po: any) => po.operatingUnit))];
        return uniqueOUs.map((ou: any) => ({
          id: ou,
          name: `Operating Unit ${ou}`,
          code: ou
        }));
      }

      // Mock data fallback
      return this.getMockData().operatingUnits;
    } catch (error) {
      console.error('Error fetching operating units:', error);
      throw error;
    }
  }

  // Fetch top vendors by spend
  async getTopVendors(filters?: {
    operatingUnit?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Array<{ vendor: string; amount: number }>> {
    try {
      await this.loadExcelData();
      
      if (this.cachedData?.topVendorsBySpend) {
        // Return data from API server
        return this.cachedData.topVendorsBySpend.slice(0, filters?.limit || 10);
      } else {
        // Return mock data
        return [
          { vendor: 'KAMPUCHEA TELA LIMITED', amount: 125000 },
          { vendor: 'M.R.H LIMITED CO.,LTD', amount: 98000 },
          { vendor: 'Strategy Object FZ LLC', amount: 85000 },
          { vendor: 'ກິດຈະການ ຄຸ້ມວົງ ລ.ດ', amount: 72000 },
          { vendor: 'ບໍລິສັດ ກຸ່ມອາຊ່ານ', amount: 65000 }
        ].slice(0, filters?.limit || 10);
      }
    } catch (error) {
      console.error('Error fetching top vendors:', error);
      throw error;
    }
  }

  // Fetch vendor comparison data
  async getVendorComparisonData(years: number[]): Promise<{
    vendors: Array<{
      name: string;
      years: Record<number, boolean>;
    }>;
    yearlyData: Array<{
      unit: string;
      years: Record<number, number>;
    }>;
  }> {
    try {
      console.log('🔄 Fetching comparison data from API...');
      
      // Try to get comparison data from API
      const apiData = await apiDataService.fetchComparisonData();
      
      if (apiData) {
        console.log('✅ Using real comparison data from Excel');
        return apiData;
      } else {
        console.log('⚠️ API comparison data not available, using mock data');
        
        // Fallback to mock data
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
          ],
          yearlyData: [
            {
              unit: '1007',
              years: { 2021: 15, 2022: 14, 2023: 13, 2024: 12, 2025: 10 }
            },
            {
              unit: '1006',
              years: { 2021: 10, 2022: 11, 2023: 11, 2024: 12, 2025: 13 }
            },
          ]
        };
      }
    } catch (error) {
      console.error('Error fetching vendor comparison data:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const dataService = new DataService();

// Helper functions for data transformation
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};
