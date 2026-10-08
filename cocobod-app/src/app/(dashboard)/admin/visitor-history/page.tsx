'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Filter, Download, Calendar } from 'lucide-react';

export default function VisitorHistoryPage() {
  const [visitorHistory, setVisitorHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visitorTypeFilter, setVisitorTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchVisitorHistory();
  }, [startDate, endDate, visitorTypeFilter]);

  const fetchVisitorHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/visitor-history?${params.toString()}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setVisitorHistory(data);
        setFilteredHistory(data);
      } else {
        console.error('Unexpected data format:', data);
        setVisitorHistory([]);
        setFilteredHistory([]);
      }
    } catch (error) {
      console.error('Error fetching visitor history:', error);
      setVisitorHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Registration Code', 'Name', 'Organisation', 'Position', 'Phone', 'Recurring', 'Check-In', 'Check-Out', 'Status', 'Duration (hrs)', 'Checked In By', 'Checked Out By', 'Notes'],
      ...filteredHistory.map(v => [
        v.registration_code || '',
        v.full_name,
        v.organisation,
        v.position,
        v.phone || '',
        v.is_recurring ? 'Yes' : 'No',
        new Date(v.check_in_date).toLocaleString(),
        v.check_out_date ? new Date(v.check_out_date).toLocaleString() : 'N/A',
        v.check_in_status,
        v.visit_duration_hours ? v.visit_duration_hours.toFixed(2) : 'N/A',
        v.checked_in_by || 'N/A',
        v.checked_out_by || 'N/A',
        v.check_out_notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (hours: number) => {
    if (!hours) return 'N/A';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Visitor History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-2 mb-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="flex items-center gap-2 mb-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="visitorType" className="flex items-center gap-2 mb-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                Visitor Type
              </Label>
              <select
                id="visitorType"
                value={visitorTypeFilter}
                onChange={(e) => setVisitorTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              >
                <option value="ALL"> all Types</option>
                <option value="GENERAL">General</option>
                <option value="VIP">VIP</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="DELIVERY">Delivery</option>
                <option value="INTERVIEW">Interview</option>
                <option value="MEETING">Meeting</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleExport}
                disabled={loading || filteredHistory.length === 0}
                className="w-full bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70]"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No visitor history found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Reg Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Organisation</th>
                    <th className="text-left py-3 px-4 font-semibold">Position</th>
                    <th className="text-left py-3 px-4 font-semibold">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold">Recurring</th>
                    <th className="text-left py-3 px-4 font-semibold">Check-In</th>
                    <th className="text-left py-3 px-4 font-semibold">Check-Out</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((visitor) => (
                    <tr key={visitor.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{visitor.registration_code}</td>
                      <td className="py-3 px-4 font-medium">{visitor.full_name}</td>
                      <td className="py-3 px-4">{visitor.organisation}</td>
                      <td className="py-3 px-4">{visitor.position}</td>
                      <td className="py-3 px-4">{visitor.phone || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {visitor.is_recurring ? (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">No</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(visitor.check_in_date).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {visitor.check_out_date ? new Date(visitor.check_out_date).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={
                          visitor.check_in_status === 'CHECKED_IN' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : visitor.check_in_status === 'CHECKED_OUT'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }>
                          {visitor.check_in_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {formatDuration(visitor.visit_duration_hours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
