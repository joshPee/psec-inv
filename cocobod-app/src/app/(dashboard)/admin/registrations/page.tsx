'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchByCode, setSearchByCode] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');
  const [filterPreset, setFilterPreset] = useState('ALL');
  const [sortBy, setSortBy] = useState('registration_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkCheckingIn, setBulkCheckingIn] = useState(false);
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [preRegisterForm, setPreRegisterForm] = useState({
    full_name: '',
    organisation: '',
    position: '',
    phone: ''
  });
  const [preRegistering, setPreRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRegistrations();
  }, [searchQuery, filterStatus, filterSource, filterPreset, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterSource, filterPreset, sortBy, sortOrder]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: filterStatus,
        source: filterSource,
        preset: filterPreset,
        searchByCode: searchByCode.toString(),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/registrations?${params}`);
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (preset: string) => {
    setFilterPreset(preset);
    // Reset other filters when preset is selected
    if (preset !== 'ALL') {
      setFilterStatus('ALL');
      setFilterSource('ALL');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(registrations.filter(r => r.check_in_status !== 'CHECKED_IN').map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkCheckIn = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkCheckingIn(true);
    try {
      const response = await fetch('/api/check-in/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: selectedIds }),
      });

      if (response.ok) {
        setSelectedIds([]);
        fetchRegistrations();
      }
    } catch (error) {
      console.error('Error bulk checking in:', error);
    } finally {
      setBulkCheckingIn(false);
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreRegistering(true);
    try {
      const response = await fetch('/api/participants/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preRegisterForm),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Pre-register response:', data);
        const displayName = data.full_name || preRegisterForm.full_name;
        setShowPreRegisterModal(false);
        setPreRegisterForm({ full_name: '', organisation: '', position: '', phone: '' });
        fetchRegistrations();
        alert(`Pre-registered!\n\nName: ${displayName}\nCode: ${data.registration_code}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to pre-register');
      }
    } catch (error) {
      console.error('Error pre-registering:', error);
      alert('An error occurred while pre-registering');
    } finally {
      setPreRegistering(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: filterStatus,
        source: filterSource,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/registrations/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreRegisterModal(true)}
            className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">Pre-register</span>
            <span className="sm:hidden">Pre-reg</span>
          </Button>
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkCheckIn}
              disabled={bulkCheckingIn}
              className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">{bulkCheckingIn ? 'Checking in...' : `Check In (${selectedIds.length})`}</span>
              <span className="sm:hidden">{bulkCheckingIn ? '...' : `CI (${selectedIds.length})`}</span>
            </Button>
          )}
          <Button
            onClick={handleExportCSV}
            className="bg-[#123B70] hover:bg-[#0d2d52] h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Filter Presets */}
              <div>
                <Label className="flex items-center gap-2 mb-1.5 text-xs">Quick Filters</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filterPreset === 'ALL' ? 'default' : 'outline'}
                    onClick={() => handlePresetChange('ALL')}
                    className="flex-1 h-9 text-xs"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterPreset === 'TODAY' ? 'default' : 'outline'}
                    onClick={() => handlePresetChange('TODAY')}
                    className="flex-1 h-9 text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant={filterPreset === 'CHECKED_IN' ? 'default' : 'outline'}
                    onClick={() => handlePresetChange('CHECKED_IN')}
                    className="flex-1 h-9 text-xs"
                  >
                    Checked In
                  </Button>
                  <Button
                    variant={filterPreset === 'NOT_CHECKED_IN' ? 'default' : 'outline'}
                    onClick={() => handlePresetChange('NOT_CHECKED_IN')}
                    className="flex-1 h-9 text-xs"
                  >
                    Not Checked In
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-1.5 text-xs">Search</Label>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchByCode ? "Registration code only" : "Name, code, or organisation"}
                    className="h-9 text-sm"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id="searchByCode"
                      type="checkbox"
                      checked={searchByCode}
                      onChange={(e) => setSearchByCode(e.target.checked)}
                      className="h-4 w-4 text-[#123B70] focus:ring-[#123B70] border-border rounded"
                    />
                    <Label htmlFor="searchByCode" className="text-xs text-muted-foreground cursor-pointer">
                      Search by code only
                    </Label>
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-1.5 text-xs">Check-in Status</Label>
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
                  <Label className="flex items-center gap-2 mb-1.5 text-xs">Source</Label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full h-9 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123B70]/20"
                  >
                    <option value="ALL">All</option>
                    <option value="ONLINE">Online</option>
                    <option value="WALK_IN">Walk-in</option>
                  </select>
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-1.5 text-xs">Sort By</Label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-');
                      setSortBy(sort);
                      setSortOrder(order);
                    }}
                    className="w-full h-9 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123B70]/20"
                  >
                    <option value="registration_date-DESC">Date (Newest)</option>
                    <option value="registration_date-ASC">Date (Oldest)</option>
                    <option value="full_name-ASC">Name (A-Z)</option>
                    <option value="full_name-DESC">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Registrations</CardTitle>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedIds.length > 0 && registrations.filter(r => r.check_in_status !== 'CHECKED_IN').length === selectedIds.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 text-[#123B70] focus:ring-[#123B70] border-border rounded"
                          />
                        </th>
                        <th
                          onClick={() => handleSort('registration_code')}
                          className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                        >
                          Code {sortBy === 'registration_code' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th
                          onClick={() => handleSort('full_name')}
                          className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                        >
                          Name {sortBy === 'full_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th
                          onClick={() => handleSort('organisation')}
                          className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                        >
                          Organisation {sortBy === 'organisation' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                          Position
                        </th>
                        <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                          Phone
                        </th>
                        <th
                          onClick={() => handleSort('registration_date')}
                          className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted hidden lg:table-cell"
                        >
                          Registration Date {sortBy === 'registration_date' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                          Check-in Time
                        </th>
                        <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {paginatedRegistrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-muted">
                          <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(registration.id)}
                              onChange={(e) => handleSelectOne(registration.id, e.target.checked)}
                              disabled={registration.check_in_status === 'CHECKED_IN'}
                              className="h-4 w-4 text-[#123B70] focus:ring-[#123B70] border-border rounded disabled:opacity-50"
                            />
                          </td>
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
                          <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                            <Badge className={`${
                              registration.registration_source === 'ONLINE'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                            } text-[10px] sm:text-xs`}>
                              {registration.registration_source === 'ONLINE' ? 'Online' : 'Walk-in'}
                            </Badge>
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

      {/* Pre-register Modal */}
      {showPreRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Pre-register Participant</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePreRegister} className="space-y-4">
                <div>
                  <Label htmlFor="preFullName" className="flex items-center gap-2 mb-1.5 text-xs">
                    Full Name *
                  </Label>
                  <Input
                    id="preFullName"
                    type="text"
                    value={preRegisterForm.full_name}
                    onChange={(e) => setPreRegisterForm({ ...preRegisterForm, full_name: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preOrganisation" className="flex items-center gap-2 mb-1.5 text-xs">
                    Organisation *
                  </Label>
                  <Input
                    id="preOrganisation"
                    type="text"
                    value={preRegisterForm.organisation}
                    onChange={(e) => setPreRegisterForm({ ...preRegisterForm, organisation: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prePosition" className="flex items-center gap-2 mb-1.5 text-xs">
                    Position
                  </Label>
                  <Input
                    id="prePosition"
                    type="text"
                    value={preRegisterForm.position}
                    onChange={(e) => setPreRegisterForm({ ...preRegisterForm, position: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="prePhone" className="flex items-center gap-2 mb-1.5 text-xs">
                    Contact Number
                  </Label>
                  <Input
                    id="prePhone"
                    type="tel"
                    value={preRegisterForm.phone}
                    onChange={(e) => setPreRegisterForm({ ...preRegisterForm, phone: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreRegisterModal(false)}
                    className="flex-1 h-9 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={preRegistering}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                  >
                    {preRegistering ? 'Registering...' : 'Pre-register'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
