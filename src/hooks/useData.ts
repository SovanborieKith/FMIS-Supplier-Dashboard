import { useState, useEffect } from 'react';
import { dataService, DashboardMetrics, TimeSeriesData, ProcurementByOU, PurchaseOrder } from '../services/dataService';

// Custom hook for dashboard data
export const useDashboardData = (filters?: {
  operatingUnit?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeframeData, setTimeframeData] = useState<TimeSeriesData[]>([]);
  const [procurementByOU, setProcurementByOU] = useState<ProcurementByOU[]>([]);
  const [poCountsByOU, setPOCountsByOU] = useState<{ unit: string; value: number }[]>([]);
  const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([]);
  const [topVendors, setTopVendors] = useState<Array<{ vendor: string; amount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🎯 Starting to fetch dashboard data...');
        console.log('🎯 Applied filters:', filters);

        // Fetch all dashboard data in parallel
        const [
          metricsData,
          timeframeData,
          procurementData,
          poCountsData,
          recentPOsData,
          topVendorsData
        ] = await Promise.all([
          dataService.getDashboardMetrics(filters),
          dataService.getProcurementTimeframe(filters),
          dataService.getProcurementByOU(filters),
          dataService.getPOCountsByOU(filters),
          dataService.getRecentPurchaseOrders(filters), // Remove limit to show all filtered data
          dataService.getTopVendors({ ...filters, limit: 10 })
        ]);

        console.log('🎯 Dashboard data loaded successfully:', {
          metrics: metricsData,
          timeframe: timeframeData?.length,
          procurement: procurementData?.length,
          poCounts: poCountsData?.length,
          recentPOs: recentPOsData?.length,
          topVendors: topVendorsData?.length
        });

        // Add detailed metrics logging
        if (metricsData) {
          console.log('🔢 Detailed metrics from API:', {
            totalVendors: metricsData.totalVendors,
            totalOperatingUnits: metricsData.totalOperatingUnits,
            totalProcurement: metricsData.totalProcurement,
            activePOs: metricsData.activePOs,
            avgSpendPerVendor: metricsData.avgSpendPerVendor
          });
        } else {
          console.error('❌ No metrics data received from API');
        }

        setMetrics(metricsData);
        setTimeframeData(timeframeData);
        setProcurementByOU(procurementData);
        setPOCountsByOU(poCountsData);
        setRecentPOs(recentPOsData);
        setTopVendors(topVendorsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('❌ Error fetching dashboard data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters?.operatingUnit, filters?.year, filters?.startDate, filters?.endDate]);

  return {
    metrics,
    timeframeData,
    procurementByOU,
    poCountsByOU,
    recentPOs,
    topVendors,
    loading,
    error,
    refetch: () => {
      // Trigger a refetch
      setLoading(true);
    }
  };
};

// Custom hook for comparison data
export const useComparisonData = (selectedYears: string[]) => {
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);

        const years = selectedYears.map(year => parseInt(year));
        const data = await dataService.getVendorComparisonData(years);
        setComparisonData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching comparison data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYears.length > 0) {
      fetchComparisonData();
    }
  }, [selectedYears]);

  return {
    comparisonData,
    loading,
    error
  };
};

// Custom hook for operating units
export const useOperatingUnits = () => {
  const [operatingUnits, setOperatingUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatingUnits = async () => {
      try {
        setLoading(true);
        setError(null);

        const units = await dataService.getOperatingUnits();
        setOperatingUnits(units);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching operating units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperatingUnits();
  }, []);

  return {
    operatingUnits,
    loading,
    error
  };
};
