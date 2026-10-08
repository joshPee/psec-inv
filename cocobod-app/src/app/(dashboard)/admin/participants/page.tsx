'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Download, Edit, Trash2, RefreshCw, Filter } from 'lucide-react';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [checkInFilter, setCheckInFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organisation: '',
    position: '',
    region: '',
    tags: '',
    participant_status: 'EXPECTED'
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchQuery, statusFilter, checkInFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, checkInFilter]);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      setParticipants(data);
      setFilteredParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.participant_status === statusFilter);
    }

    // Apply check-in filter
    if (checkInFilter !== 'ALL') {
      filtered = filtered.filter(p => p.check_in_status === checkInFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.organisation?.toLowerCase().includes(query) ||
        p.position?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.phone?.includes(query) ||
        p.registration_code?.toLowerCase().includes(query)
      );
    }

    setFilteredParticipants(filtered);
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          organisation: '',
          position: '',
          region: '',
          tags: '',
          participant_status: 'EXPECTED'
        });
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleEditParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/participants/${selectedParticipant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedParticipant(null);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          organisation: '',
          position: '',
          region: '',
          tags: '',
          participant_status: 'EXPECTED'
        });
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error updating participant:', error);
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;

    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error deleting participant:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Registration Code', 'Name', 'Email', 'Phone', 'Organisation', 'Position', 'Region', 'Status', 'Check-in Status'];
    const csvContent = [
      headers.join(','),
      ...filteredParticipants.map(p => [
        p.registration_code || '',
        p.full_name || '',
        p.email || '',
        p.phone || '',
        p.organisation || '',
        p.position || '',
        p.region || '',
        p.participant_status || '',
        p.check_in_status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openEditModal = (participant: any) => {
    setSelectedParticipant(participant);
    setFormData({
      full_name: participant.full_name || '',
      email: participant.email || '',
      phone: participant.phone || '',
      organisation: participant.organisation || '',
      position: participant.position || '',
      region: participant.region || '',
      tags: participant.tags || '',
      participant_status: participant.participant_status || 'EXPECTED'
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'EXPECTED') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Expected</Badge>;
    } else if (status === 'REGISTERED') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Registered</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  const getCheckInBadge = (status: string) => {
    if (status === 'CHECKED_IN') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Checked In</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Not Checked In</Badge>;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#123B70] hover:bg-[#0d2d52] h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Participant</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search" className="flex items-center gap-2 mb-1.5 text-xs">
                    <Search className="w-3.5 h-3.5" />
                    Search
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, email, phone, org..."
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="statusFilter" className="flex items-center gap-2 mb-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5" />
                    Status
                  </Label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-background"
                  >
                    <option value="ALL">All Status</option>
                    <option value="EXPECTED">Expected</option>
                    <option value="REGISTERED">Registered</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="checkInFilter" className="flex items-center gap-2 mb-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5" />
                    Check-in Status
                  </Label>
                  <select
                    id="checkInFilter"
                    value={checkInFilter}
                    onChange={(e) => setCheckInFilter(e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md bg-background"
                  >
                    <option value="ALL">All Check-in Status</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="NOT_CHECKED_IN">Not Checked In</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card>
            <CardContent className="divide-y">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading participants...
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchQuery ? `No participants found matching "${searchQuery}"` : 'No participants found'}
                </div>
              ) : (
                <>
                  {paginatedParticipants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className="p-4 hover:bg-muted cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground w-6">{startIndex + index + 1}.</span>
                            <p className="text-sm font-semibold text-foreground">{participant.full_name}</p>
                            {getStatusBadge(participant.participant_status)}
                            {getCheckInBadge(participant.check_in_status)}
                          </div>
                          {participant.phone && <p className="text-sm text-muted-foreground">{participant.phone}</p>}
                          {participant.location && <p className="text-sm text-muted-foreground">{participant.location}</p>}
                          {participant.organisation && <p className="text-sm text-muted-foreground">{participant.organisation}</p>}
                          {participant.host_name && <p className="text-xs text-muted-foreground">Visiting: {participant.host_name}</p>}
                          {participant.host_department && <p className="text-xs text-muted-foreground">Dept: {participant.host_department}</p>}
                          {participant.vehicle_registration && <p className="text-xs text-muted-foreground">Vehicle: {participant.vehicle_registration}</p>}
                          {participant.registration_code && (
                            <p className="text-xs font-medium text-[#123B70]">{participant.registration_code}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openEditModal(participant)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteParticipant(participant.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredParticipants.length)} of {filteredParticipants.length} results
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

        {/* Add Participant Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Add Participant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddParticipant} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="flex items-center gap-2 mb-1.5 text-xs">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="organisation" className="flex items-center gap-2 mb-1.5 text-xs">
                      Organisation *
                    </Label>
                    <Input
                      id="organisation"
                      type="text"
                      value={formData.organisation}
                      onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="position" className="flex items-center gap-2 mb-1.5 text-xs">
                      Position *
                    </Label>
                    <Input
                      id="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5 text-xs">
                      Contact Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 h-9 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                    >
                      Add Participant
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Participant Modal */}
        {showEditModal && selectedParticipant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Edit Participant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditParticipant} className="space-y-4">
                  <div>
                    <Label htmlFor="editFullName" className="flex items-center gap-2 mb-1.5 text-xs">
                      Full Name *
                    </Label>
                    <Input
                      id="editFullName"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editOrganisation" className="flex items-center gap-2 mb-1.5 text-xs">
                      Organisation *
                    </Label>
                    <Input
                      id="editOrganisation"
                      type="text"
                      value={formData.organisation}
                      onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPosition" className="flex items-center gap-2 mb-1.5 text-xs">
                      Position *
                    </Label>
                    <Input
                      id="editPosition"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPhone" className="flex items-center gap-2 mb-1.5 text-xs">
                      Contact Number *
                    </Label>
                    <Input
                      id="editPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 h-9 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                    >
                      Update Participant
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
