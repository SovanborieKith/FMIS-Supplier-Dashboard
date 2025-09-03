import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, TrendingDown, TrendingUp, Settings, Check, X } from 'lucide-react';
import { useComparisonData } from '../hooks/useData';

const vendorData = [
  { name: 'KAMPUCHEA TELA LIMITED', '2021': true, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'M.R.H LIMITED CO.,LTD', '2021': false, '2022': true, '2023': true, '2024': false, '2025': false },
  { name: 'Strategy Object FZ LLC', '2021': false, '2022': false, '2023': false, '2024': true, '2025': true },
  { name: 'ກິດຈະການ ຄຸ້ມວົງ ລ.ດ', '2021': false, '2022': false, '2023': false, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ກຸ່ມອາຊ່ານ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': false },
  { name: 'ບໍລິສັດ ລີດ ໄວ ອອກອາກາດ & ກິດສະນະ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ເອ ຄີ ລິ ກຸ່ມອາຊິດ ລ.ດ', '2021': false, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ເອ ຄີ ລ��� ກິດສະໜອງ ລ.ດ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': false },
  { name: 'ບໍລິສັດ ບຸ່ງ ໄຮລົງ ກະປະຕິກຸ່ມ ລ.ດ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ສກອນ (ເອສເຄ) ລ.ດ', '2021': true, '2022': true, '2023': true, '2024': false, '2025': false },
  { name: 'ບໍລິສັດ ສກອນ (ເອສເບ) ລ.ດ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ສວນໄຮຍໂບວລາງ ລ.ດ', '2021': false, '2022': true, '2023': true, '2024': true, '2025': true },
  { name: 'ບໍລິສັດ ຫງຸ່ນຟິເງແກງເມ ຄໍາຂໍາລອມ', '2021': true, '2022': true, '2023': true, '2024': true, '2025': false },
  { name: 'ບໍລິສັດ ກາມ ຫ້ອງເມັກ', '2021': true, '2022': true, '2023': true, '2024': false, '2025': false },
  { name: 'ບໍລິສັດ ແກງ Ⅴ ແດ ບຸ ມຸ້ນ', '2021': false, '2022': true, '2023': true, '2024': true, '2025': true },
];

const availableYears = ['2021', '2022', '2023', '2024', '2025'];

export function CompareDashboard({ filters }: { 
  filters?: {
    operatingUnit?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
  }
}) {
  const [selectedYears, setSelectedYears] = useState(['2023', '2024']);
  
  // Use real comparison data from API
  const { comparisonData, loading, error } = useComparisonData(selectedYears);

  const handleYearSelection = (year: string) => {
    if (selectedYears.includes(year)) {
      // Only allow deselection if more than 1 year is selected
      if (selectedYears.length > 1) {
        setSelectedYears(selectedYears.filter(y => y !== year));
      }
    } else {
      if (selectedYears.length < 2) {
        setSelectedYears([...selectedYears, year]);
      } else {
        // Replace the first selected year with the new one
        setSelectedYears([selectedYears[1], year]);
      }
    }
  };

  // Calculate metrics based on selected years and real data
  const metrics = useMemo(() => {
    if (selectedYears.length !== 2 || !comparisonData || loading) {
      return { totalVendors: 0, sameVendors: 0, vendorsLost: 0, vendorsNew: 0 };
    }

    const [year1, year2] = selectedYears.sort();
    const vendors = comparisonData.vendors || [];
    
    const year1Vendors = vendors.filter(vendor => vendor.years[year1]).length;
    const year2Vendors = vendors.filter(vendor => vendor.years[year2]).length;
    const sameVendors = vendors.filter(vendor => vendor.years[year1] && vendor.years[year2]).length;
    const vendorsLost = vendors.filter(vendor => vendor.years[year1] && !vendor.years[year2]).length;
    const vendorsNew = vendors.filter(vendor => !vendor.years[year1] && vendor.years[year2]).length;
    
    return {
      totalVendors: Math.max(year1Vendors, year2Vendors),
      sameVendors,
      vendorsLost,
      vendorsNew
    };
  }, [selectedYears, comparisonData, loading]);

    // Filter chart data based on selected years and real data
  const filteredChartData = useMemo(() => {
    if (selectedYears.length !== 2 || !comparisonData || loading) return [];
    
    const yearlyData = comparisonData.yearlyData || [];
    return yearlyData.map(item => ({
      unit: item.unit,
      [selectedYears[0]]: item.years[selectedYears[0]] || 0,
      [selectedYears[1]]: item.years[selectedYears[1]] || 0,
    }));
  }, [selectedYears, comparisonData, loading]);

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Year (Please Select 2 Years)</p>
            <div className="flex gap-2">
              {availableYears.map((year) => (
                <Button
                  key={year}
                  variant={selectedYears.includes(year) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearSelection(year)}
                  className={selectedYears.includes(year) ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50 hover:border-green-300"}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
          {selectedYears.length !== 2 && (
            <p className="text-xs text-amber-600 mt-2">Please select exactly 2 years for comparison</p>
          )}
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Vendor Records</p>
                <p className="text-3xl font-semibold mt-1">{metrics.totalVendors}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Same Vendors</p>
                <p className="text-3xl font-semibold mt-1">{metrics.sameVendors}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Vendors Lost</p>
                <p className="text-3xl font-semibold mt-1">{metrics.vendorsLost}</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Vendors New</p>
                <p className="text-3xl font-semibold mt-1">{metrics.vendorsNew}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendor Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-1/2">Vendor</TableHead>
                    {selectedYears.map(year => (
                      <TableHead key={year} className="text-center w-20">{year}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Show loading state */}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">Loading comparison data...</div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Show error state */}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-red-500">Error: {error}</div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Show real vendor data */}
                  {!loading && !error && comparisonData?.vendors && comparisonData.vendors.map((vendor, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <TableCell className="text-sm">{vendor.name}</TableCell>
                      {selectedYears.map(year => (
                        <TableCell key={year} className="text-center">
                          {vendor.years[year] ? (
                            <Check className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <div className="w-4 h-4 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Vendor Records per OU: {selectedYears.join(' vs ')}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Count of vendor records (rows) per Operating Unit
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              {selectedYears.length === 2 && filteredChartData.length > 0 ? (
                <div className="w-full h-full bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={filteredChartData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis 
                        dataKey="unit"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        domain={[0, 'dataMax + 2']}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          `${value} vendor records`,
                          `Year ${name}`
                        ]}
                        labelFormatter={(label) => `Operating Unit: ${label}`}
                      />
                      <Bar 
                        dataKey={selectedYears[0]} 
                        fill="#059669" 
                        name={selectedYears[0]}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey={selectedYears[1]} 
                        fill="#fbbf24" 
                        name={selectedYears[1]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>
                    {selectedYears.length !== 2 
                      ? "Please select exactly 2 years to view comparison chart"
                      : "No data available for the selected years"
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}