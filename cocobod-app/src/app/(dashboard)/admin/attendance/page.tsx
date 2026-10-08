'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, CheckCircle, Clock, Percent, Download, ArrowUpDown } from 'lucide-react';

export default function AttendancePage() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalCheckedIn: 0,
    totalNotCheckedIn: 0,
    attendancePercentage: 0,
  });
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAttendanceData();
  }, [searchQuery, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortBy, sortOrder]);

  // Refresh data every 10 seconds to keep stats updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendanceData();
    }, 10000);

    return () => clearInterval(interval);
  }, [searchQuery, filterStatus, sortBy, sortOrder]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/attendance/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch registrations with filters
      const params = new URLSearchParams({
        q: searchQuery,
        status: filterStatus,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetch(`/api/registrations?${params}`);
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: filterStatus,
      });

      const response = await fetch(`/api/registrations/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(registrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = registrations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button
          onClick={handleExportCSV}
          className="bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-1.5 text-xs">Search</Label>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, code, organisation, or phone"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1.5 text-xs">Filter by Status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full h-9 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123B70]/20"
                >
                  <option value="ALL">All</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="NOT_CHECKED_IN">Not Checked In</option>
                </select>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-1.5 text-xs">Sort By</Label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 h-9 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123B70]/20"
                  >
                    <option value="sort_order">Registration Order</option>
                    <option value="registration_code">Code</option>
                    <option value="full_name">Name</option>
                    <option value="organisation">Organisation</option>
                    <option value="registration_date">Registration Date</option>
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                    className="h-9 px-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : registrations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No registrations found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Organisation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Check-in Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {paginatedRegistrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-muted">
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-foreground">
                            {registration.registration_code}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-foreground">
                            {registration.full_name}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground">
                            {registration.organisation}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground hidden sm:table-cell">
                            {registration.position}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                            {registration.phone || '-'}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                            {new Date(registration.registration_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                            <Badge className={`${
                              registration.check_in_status === 'CHECKED_IN'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20'
                            } text-[10px] sm:text-xs`}>
                              {registration.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                            {registration.check_in_date
                              ? new Date(registration.check_in_date).toLocaleTimeString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, registrations.length)} of {registrations.length} results
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
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
                              onClick={() => handlePageChange(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className={`h-8 w-8 sm:w-9 text-xs sm:text-sm ${
                                currentPage === pageNum ? 'bg-[#123B70] hover:bg-[#0d2d52]' : ''
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
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
