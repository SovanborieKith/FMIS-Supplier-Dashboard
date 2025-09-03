import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Treemap
} from 'recharts';
import { Building2, TrendingUp, Loader2, ShoppingCart } from 'lucide-react';
import { useDashboardData } from '../hooks/useData';
import { formatDate } from '../services/dataService';

// Heatmap Grid Component
// Custom Treemap Content Component
const CustomTreemapContent = (props) => {
  const { depth, x, y, width, height, index, name, value } = props;
  const colors = ['#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5'];
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
      />
      {width > 60 && height > 30 && (
        <>
          <text 
            x={x + width / 2} 
            y={y + height / 2 - 6} 
            textAnchor="middle" 
            fill="rgba(255, 255, 255, 0.95)" 
            fontSize={Math.min(width / 9, 10)}
            fontWeight="400"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {name}
          </text>
          <text 
            x={x + width / 2} 
            y={y + height / 2 + 8} 
            textAnchor="middle" 
            fill="rgba(255, 255, 255, 0.8)" 
            fontSize={Math.min(width / 12, 8)}
            fontWeight="300"
            fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            {value}
          </text>
        </>
      )}
    </g>
  );
};

const HeatmapGrid = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="grid grid-cols-6 gap-2 h-64 p-1 overflow-hidden">
      {data.slice(0, 24).map((item, index) => {
        const intensity = item.value / maxValue;
        const alpha = 0.4 + intensity * 0.6;
        
        return (
          <div
            key={index}
            className="relative group rounded-md flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:z-10 cursor-pointer border border-white/20"
            style={{
              backgroundColor: `rgba(5, 150, 105, ${alpha})`,
              aspectRatio: '1',
              minHeight: '45px'
            }}
          >
            <div className="text-center px-1">
              <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
              <p className="text-[10px] text-white/90 leading-tight">{item.percentage.toFixed(0)}%</p>
            </div>
            
            {/* Compact Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
              <div className="text-center">
                <p className="font-semibold">OU {item.name}</p>
                <p>{item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function OverviewDashboard({ filters }: { 
  filters?: {
    operatingUnit?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
  }
}) {
  const {
    metrics, 
    recentPOs,
    timeframeData,
    procurementByOU,
    poCountsByOU,
    topVendors,
    loading, 
    error 
  } = useDashboardData(filters);

  // Apply Khmer fonts when data loads
  useEffect(() => {
    if (recentPOs && recentPOs.length > 0) {
      console.log('📊 Purchase orders loaded, applying Khmer fonts...');
      
      // Wait a bit for DOM to update
      setTimeout(() => {
        // Find all vendor name cells and apply Khmer font directly
        const vendorCells = document.querySelectorAll('table tbody tr td:nth-child(3)');
        console.log(`🔍 Found ${vendorCells.length} vendor cells`);
        
        vendorCells.forEach((cell, index) => {
          if (cell instanceof HTMLElement) {
            const text = cell.textContent || '';
            // Check if contains Khmer characters
            if (/[\u1780-\u17FF]/.test(text)) {
              // Apply exact same style as working font test page
              cell.style.fontFamily = "'Khmer OS Battambang', serif";
              cell.classList.add('has-khmer-text');
              console.log(`✅ Applied Khmer font to vendor ${index}: ${text.substring(0, 30)}`);
            }
          }
        });

        // Also trigger global detection
        if ((window as any).testKhmerFontDetection) {
          (window as any).testKhmerFontDetection();
        }
      }, 500);
    }
  }, [recentPOs]);

  // Debug logging
  console.log('🎯 Dashboard data:', {
    metrics,
    timeframeData: timeframeData?.length,
    procurementByOU: procurementByOU?.length,
    poCountsByOU: poCountsByOU?.length,
    loading,
    error,
    appliedFilters: filters
  });

  // Chart-specific debugging
  useEffect(() => {
    console.log('🎯 Timeline Chart Data:', {
      timeframeData,
      length: timeframeData?.length,
      sample: timeframeData?.[0],
      filters
    });
    console.log('🎯 OU Chart Data:', {
      procurementByOU,
      length: procurementByOU?.length,
      sample: procurementByOU?.[0],
      filters
    });
  }, [timeframeData, procurementByOU, filters]);

  // Transform procurement data to treemap format
  const treemapData = React.useMemo(() => {
    if (!procurementByOU || procurementByOU.length === 0) return [];
    
    const total = procurementByOU.reduce((sum, item) => sum + item.count, 0);
    const colors = [
      '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', 
      '#7c3aed', '#c026d3', '#dc2626', '#ea580c', '#f59e0b', '#84cc16',
      '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
      '#a855f7', '#d946ef', '#f97316'
    ];
    
    return procurementByOU.map((item, index) => ({
      name: item.operatingUnit,
      value: item.count,
      color: colors[index % colors.length],
      percentage: (item.count / total) * 100
    }));
  }, [procurementByOU, filters]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading real Excel data...</span>
            </div>
            <div className="text-sm text-gray-500">
              Processing 13MB Excel file with 60,000+ records...
            </div>
            <div className="text-xs text-gray-400 mt-2">
              This may take 30-60 seconds for first load, then instant thereafter
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-green-600 h-2 rounded-full animate-pulse w-[45%]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading dashboard data</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Status Indicator */}
      {(filters?.operatingUnit || filters?.year) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-medium">Active Filters:</span>
              {filters?.operatingUnit && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  OU: {filters.operatingUnit}
                </Badge>
              )}
              {filters?.year && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Year: {filters.year}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Vendors</p>
                <p className="text-3xl font-semibold mt-1">{metrics?.totalVendors || 0}</p>
                <p className="text-green-100 text-xs mt-1">Active Suppliers</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Operating Units</p>
                <p className="text-3xl font-semibold mt-1">{metrics?.totalOperatingUnits || 0}</p>
                <p className="text-white text-xs mt-1">Active Units</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Procurement by OU - Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Procurement by OU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {treemapData && treemapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#059669"
                    content={<CustomTreemapContent />}
                  />
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p>No procurement data available</p>
                    <p className="text-xs mt-1">Data length: {procurementByOU?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PO Timeframe - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PO Timeframe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {timeframeData && timeframeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeframeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={[0, 'dataMax']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [value, 'Vendor Transactions']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#059669" 
                      strokeWidth={3}
                      dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#047857' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p>No timeline data available</p>
                    <p className="text-xs mt-1">Data length: {timeframeData?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total PO by Operating Unit - Column Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total PO by Operating Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {procurementByOU && procurementByOU.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={procurementByOU} 
                    margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis 
                      dataKey="operatingUnit"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      domain={[0, 'dataMax + 10']}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [value, 'PO Count']}
                      labelFormatter={(label) => `Unit ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#059669" 
                      radius={[4, 4, 0, 0]}
                      minPointSize={2}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p>No procurement data available</p>
                    <p className="text-xs mt-1">Data length: {procurementByOU?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table - Recent Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Purchase Orders Information</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPOs && recentPOs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operating Unit</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>PO Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPOs.map((po, index) => (
                    <TableRow key={`${po.id}-${index}`}>
                      <TableCell>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {po.operatingUnit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{po.account}</TableCell>
                      <TableCell 
                        className="has-khmer-text"
                        style={{
                          fontFamily: /[\u1780-\u17FF]/.test(po.vendorName) 
                            ? "'Khmer OS Battambang', 'Khmer OS', serif" 
                            : undefined
                        }}
                      >
                        {po.vendorName}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(po.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No purchase orders available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
