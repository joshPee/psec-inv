'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Search, RefreshCw, CheckCircle, XCircle, LogIn, LogOut, UserCheck, Edit, Download, Calendar } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let url = `/api/audit-log?limit=${itemsPerPage}&offset=${offset}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setLogs(data.logs || []);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.participant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CHECK_IN':
        return <LogIn className="h-4 w-4 text-green-600" />;
      case 'CHECK_OUT':
        return <LogOut className="h-4 w-4 text-amber-600" />;
      case 'REGISTER':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-purple-600" />;
      default:
        return <ScrollText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CHECK_IN':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Check-In</Badge>;
      case 'CHECK_OUT':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Check-Out</Badge>;
      case 'REGISTER':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Register</Badge>;
      case 'UPDATE':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Update</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{action}</Badge>;
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExportCSV = async () => {
    try {
      let url = '/api/audit-log?export=true';
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        alert('No data to export for the selected date range');
        return;
      }

      const csvContent = [
        ['Timestamp', 'Action', 'User', 'User Email', 'Participant', 'Registration Code', 'Details', 'IP Address'],
        ...data.map(log => [
          formatDateTime(log.action_time),
          log.action,
          log.user_name || 'System',
          log.user_email || '',
          log.participant_name || 'N/A',
          log.registration_code || '',
          log.details || '',
          log.ip_address || ''
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url2 = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `visitor-logs-${startDate || 'all'}-${endDate || 'all'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url2);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs');
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setLoading(true);
                fetchLogs();
              }}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by action, user, participant, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {filteredLogs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No audit logs found' : 'No audit logs available'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Participant</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                            {formatDateTime(log.action_time)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              {getActionBadge(log.action)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <p className="font-medium">{log.user_name || 'System'}</p>
                              {log.user_email && <p className="text-xs text-gray-500">{log.user_email}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <p className="font-medium">{log.participant_name || 'N/A'}</p>
                              {log.registration_code && <p className="text-xs text-gray-500">{log.registration_code}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                            {log.details || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {log.ip_address || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalLogs)} of {totalLogs} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 ${currentPage === pageNum ? 'bg-[#123B70] hover:bg-[#0d2d52]' : ''}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}