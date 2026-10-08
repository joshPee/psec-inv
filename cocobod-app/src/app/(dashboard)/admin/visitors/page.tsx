'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Clock, CheckCircle, LogOut, Repeat, Download } from 'lucide-react';

export default function VisitorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allVisitors, setAllVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVisitors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const fetchVisitors = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      setAllVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setAllVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const currentlyInside = Array.isArray(allVisitors) ? allVisitors.filter(v => v.check_in_status === 'CHECKED_IN') : [];
  const visitorHistory = Array.isArray(allVisitors) ? allVisitors.filter(v => v.check_in_status === 'CHECKED_OUT') : [];

  const filteredVisitors = Array.isArray(allVisitors) ? allVisitors.filter(visitor =>
    visitor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.organisation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    visitor.phone?.includes(searchQuery) ||
    visitor.registration_code?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const paginatedVisitors = getPaginatedData(filteredVisitors);
  const paginatedCurrentlyInside = getPaginatedData(currentlyInside);
  const paginatedVisitorHistory = getPaginatedData(visitorHistory);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Checked In</Badge>;
      case 'CHECKED_OUT':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Checked Out</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Not Checked In</Badge>;
    }
  };

  const formatCheckInTime = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return 'N/A';
    if (!checkOut) {
      // For currently inside visitors, calculate duration from check-in to now
      const diff = new Date().getTime() - new Date(checkIn).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleExportCSV = (data: any[]) => {
    const csvContent = [
      ['Registration Code', 'Name', 'Phone', 'Location', 'Organisation', 'Host', 'Department', 'Purpose', 'Vehicle', 'Status', 'Check-in', 'Check-out', 'Duration'],
      ...data.map(v => [
        v.registration_code,
        v.full_name,
        v.phone || '',
        v.location || '',
        v.organisation,
        v.host_name || '',
        v.host_department || '',
        v.visit_purpose || '',
        v.vehicle_registration || '',
        v.check_in_status,
        formatDateTime(v.check_in_date) || '',
        formatDateTime(v.check_out_date) || '',
        formatDuration(v.check_in_date, v.check_out_date)
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Visitors</TabsTrigger>
          <TabsTrigger value="inside">Active Visitors</TabsTrigger>
          <TabsTrigger value="history">Visitor History</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, organization, phone, or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    {filteredVisitors.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No visitors found</p>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Org</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Host</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dept</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-in</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-out</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedVisitors.map((visitor) => (
                            <tr key={visitor.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-blue-700">{visitor.registration_code}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.full_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.phone}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.organisation}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_department}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.visit_purpose}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.vehicle_registration || '-'}</td>
                              <td className="px-4 py-3 text-sm">{getStatusBadge(visitor.check_in_status)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.check_in_date) || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.check_out_date) || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVisitors.length)} of {filteredVisitors.length} visitors
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-blue-700 hover:bg-blue-800" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
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
        </TabsContent>

        <TabsContent value="inside" className="space-y-4">
          <Card>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    {currentlyInside.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No visitors currently on site</p>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-green-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Org</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Host</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dept</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-in</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedCurrentlyInside.map((visitor) => (
                            <tr key={visitor.id} className="hover:bg-green-50">
                              <td className="px-4 py-3 text-sm font-medium text-blue-700">{visitor.registration_code}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  {visitor.full_name}
                                  {visitor.is_recurring && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      <Repeat className="w-3 h-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.phone}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.organisation}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_department}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.visit_purpose}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.vehicle_registration || '-'}</td>
                              <td className="px-4 py-3 text-sm">{getStatusBadge(visitor.check_in_status)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.check_in_date) || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDuration(visitor.check_in_date, visitor.check_out_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {Math.ceil(currentlyInside.length / itemsPerPage) > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, currentlyInside.length)} of {currentlyInside.length} visitors
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.ceil(currentlyInside.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-green-700 hover:bg-green-800" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(currentlyInside.length / itemsPerPage)}
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  {visitorHistory.length} visitor{visitorHistory.length !== 1 ? 's' : ''} in history
                </div>
                <Button
                  onClick={() => handleExportCSV(visitorHistory)}
                  disabled={visitorHistory.length === 0}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    {visitorHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No visitor history available</p>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-amber-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Org</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Host</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dept</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vehicle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-in</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Check-out</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginatedVisitorHistory.map((visitor) => (
                            <tr key={visitor.id} className="hover:bg-amber-50">
                              <td className="px-4 py-3 text-sm font-medium text-blue-700">{visitor.registration_code}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  {visitor.full_name}
                                  {visitor.is_recurring && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                      <Repeat className="w-3 h-3 mr-1" />
                                      Recurring
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.phone}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.organisation}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.host_department}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.visit_purpose}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{visitor.vehicle_registration || '-'}</td>
                              <td className="px-4 py-3 text-sm">{getStatusBadge(visitor.check_in_status)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.check_in_date) || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(visitor.check_out_date) || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{formatDuration(visitor.check_in_date, visitor.check_out_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {Math.ceil(visitorHistory.length / itemsPerPage) > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, visitorHistory.length)} of {visitorHistory.length} visitors
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: Math.ceil(visitorHistory.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-amber-700 hover:bg-amber-800" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(visitorHistory.length / itemsPerPage)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
