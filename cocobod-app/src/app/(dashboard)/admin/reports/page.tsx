'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Download, BarChart3, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('daily');
  const [visitorData, setVisitorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate date range labels
  const getDateRangeLabel = (range: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    switch (range) {
      case 'today':
        return formatDate(today);
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return `${formatDate(weekStart)} - ${formatDate(today)}`;
      case '3months':
        const threeMonthsStart = new Date(today);
        threeMonthsStart.setMonth(today.getMonth() - 3);
        return `${formatDate(threeMonthsStart)} - ${formatDate(today)}`;
      case 'custom':
        return startDate && endDate ? `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}` : 'Custom Range';
      default:
        return range;
    }
  };

  // Validate custom date range doesn't exceed 3 months
  const validateDateRange = () => {
    if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const maxDays = 90; // 3 months approximately
      
      if (diffDays > maxDays) {
        alert('Date range cannot exceed 3 months (90 days)');
        setEndDate('');
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (validateDateRange()) {
      fetchVisitorData();
    }
  }, [reportType, dateRange, startDate, endDate]);

  const fetchVisitorData = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?type=${reportType}`;
      
      if (dateRange === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      } else {
        url += `&range=${dateRange}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setVisitorData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setVisitorData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    if (visitorData.length === 0) {
      alert('No data to export');
      return;
    }

    if (format === 'csv') {
      // Create CSV content
      const headers = ['Date', 'Check-ins', 'Check-outs', 'Active'];
      const rows = visitorData.map(item => [
        item.date || item.week || item.month || '',
        item.checkIns,
        item.checkOuts,
        item.checkIns - item.checkOuts
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `visitor-report-${reportType}-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple text-based report for now
      // In a real implementation, you'd use a library like jsPDF
      const reportText = visitorData.map(item => 
        `${item.date || item.week || item.month}: Check-ins: ${item.checkIns}, Check-outs: ${item.checkOuts}, Active: ${item.checkIns - item.checkOuts}`
      ).join('\n');
      
      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `visitor-report-${reportType}-${dateRange}-${new Date().toISOString().split('T')[0]}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const totalCheckIns = visitorData.reduce((sum, item) => sum + (item.checkIns || 0), 0);
  const totalCheckOuts = visitorData.reduce((sum, item) => sum + (item.checkOuts || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visitor Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Visitors</SelectItem>
                  <SelectItem value="weekly">Weekly Visitors</SelectItem>
                  <SelectItem value="monthly">Monthly Visitors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getDateRangeLabel(dateRange)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today - {getDateRangeLabel('today')}</SelectItem>
                  <SelectItem value="week">This Week - {getDateRangeLabel('week')}</SelectItem>
                  <SelectItem value="3months">Last 3 Months - {getDateRangeLabel('3months')}</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Summary Stats */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">Total Check-ins</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{totalCheckIns}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Total Check-outs</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{totalCheckOuts}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600">Average Daily</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {visitorData.length > 0 ? Math.round(totalCheckIns / visitorData.length) : 0}
                  </p>
                </div>
              </div>

              {/* Visitor Data Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        {reportType === 'daily' ? 'Date' : reportType === 'weekly' ? 'Week' : 'Month'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Check-ins
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Check-outs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visitorData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                          No data available for the selected period
                        </td>
                      </tr>
                    ) : (
                      visitorData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {'date' in item ? item.date : 'week' in item ? item.week : 'month' in item ? item.month : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.checkIns}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.checkOuts}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.checkIns - item.checkOuts}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Export Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Visitor Records</p>
                  <p className="text-sm text-gray-500">Export all visitor check-in/check-out records</p>
                </div>
              </div>
              <Button onClick={() => handleExport('csv')} className="bg-blue-700 hover:bg-blue-800">
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Daily Report</p>
                  <p className="text-sm text-gray-500">Export daily visitor statistics</p>
                </div>
              </div>
              <Button onClick={() => handleExport('csv')} className="bg-blue-700 hover:bg-blue-800">
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Weekly Report</p>
                  <p className="text-sm text-gray-500">Export weekly visitor statistics</p>
                </div>
              </div>
              <Button onClick={() => handleExport('csv')} className="bg-blue-700 hover:bg-blue-800">
                Export CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Monthly Report</p>
                  <p className="text-sm text-gray-500">Export monthly visitor statistics</p>
                </div>
              </div>
              <Button onClick={() => handleExport('csv')} className="bg-blue-700 hover:bg-blue-800">
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
