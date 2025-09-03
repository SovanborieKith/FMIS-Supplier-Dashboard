import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CompareDashboard } from './components/CompareDashboard';
import { Leaf, Settings, RefreshCw } from 'lucide-react';
import { useOperatingUnits } from './hooks/useData';
import { initKhmerFontDetection } from './utils/khmerFontDetection';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    operatingUnit: 'all',
    year: 'all'
  });
  const { operatingUnits } = useOperatingUnits();

  // Initialize Khmer font detection
  useEffect(() => {
    console.log('🔤 Initializing Khmer font detection...');
    initKhmerFontDetection();
    
    // Test with a delay to ensure DOM is ready
    setTimeout(() => {
      console.log('🔍 Running Khmer font detection for table data...');
      
      // Manually trigger detection for any newly loaded content
      if ((window as any).testKhmerFontDetection) {
        (window as any).testKhmerFontDetection();
      }
    }, 2000);
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="/FMIS_Logo.png" 
                alt="FMIS Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <h1 className="dashboard-header text-2xl font-semibold text-green-700 tracking-tight">
              Supplier Information Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex gap-6">
          {/* Main Dashboard Area */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="overview" className="mt-0">
                <OverviewDashboard filters={{
                  operatingUnit: filters.operatingUnit === 'all' ? undefined : filters.operatingUnit,
                  year: filters.year === 'all' ? undefined : parseInt(filters.year)
                }} />
              </TabsContent>
              <TabsContent value="compare" className="mt-0">
                <CompareDashboard filters={{
                  operatingUnit: filters.operatingUnit === 'all' ? undefined : filters.operatingUnit,
                  year: filters.year === 'all' ? undefined : parseInt(filters.year)
                }} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar Filters */}
          <div className="w-64 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Operating Unit</label>
                  <Select 
                    value={filters.operatingUnit} 
                    onValueChange={(value) => handleFilterChange('operatingUnit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {operatingUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.code}>
                          {unit.code} - {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Year</label>
                  <Select 
                    value={filters.year} 
                    onValueChange={(value) => handleFilterChange('year', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Applied Filters:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {filters.operatingUnit !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          OU: {filters.operatingUnit}
                        </Badge>
                      )}
                      {filters.year !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          Year: {filters.year}
                        </Badge>
                      )}
                      {filters.operatingUnit === 'all' && filters.year === 'all' && (
                        <span className="text-gray-400">No filters applied</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}