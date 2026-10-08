'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, CheckCircle, XCircle, Clock, Search, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';

interface ExpectedAttendee {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  organisation: string;
  position: string;
  region: string;
  tags: string;
  registered: boolean;
  registered_at: string;
  check_in_status: string;
  check_in_date: string;
  participant_id: number;
  reminder_sent: boolean;
}

export default function ExpectedAttendeesPage() {
  const [attendees, setAttendees] = useState<ExpectedAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegistration, setFilterRegistration] = useState('ALL');
  const [filterCheckIn, setFilterCheckIn] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<ExpectedAttendee | null>(null);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    organisation: '',
    position: '',
    region: '',
    tags: '',
  });
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    organisation: '',
    position: '',
    region: '',
    tags: '',
  });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchExpectedAttendees();
  }, [searchQuery, filterRegistration, filterCheckIn]);

  const fetchExpectedAttendees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        registration: filterRegistration,
        checkIn: filterCheckIn,
      });
      const response = await fetch(`/api/expected-attendees?${params}`);
      const data = await response.json();
      setAttendees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching expected attendees:', error);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const response = await fetch('/api/expected-attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      if (response.ok) {
        setShowAddModal(false);
        setAddForm({ full_name: '', email: '', phone: '', organisation: '', position: '', region: '', tags: '' });
        fetchExpectedAttendees();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add expected attendee');
      }
    } catch (error) {
      console.error('Error adding expected attendee:', error);
      alert('An error occurred while adding expected attendee');
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttendee) return;
    
    setEditing(true);
    try {
      const response = await fetch(`/api/expected-attendees/${selectedAttendee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedAttendee(null);
        fetchExpectedAttendees();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update expected attendee');
      }
    } catch (error) {
      console.error('Error updating expected attendee:', error);
      alert('An error occurred while updating expected attendee');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this expected attendee?')) return;
    
    try {
      const response = await fetch(`/api/expected-attendees/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExpectedAttendees();
      }
    } catch (error) {
      console.error('Error deleting expected attendee:', error);
    }
  };

  const handleView = (attendee: ExpectedAttendee) => {
    setSelectedAttendee(attendee);
    setShowViewModal(true);
  };

  const handleEditClick = (attendee: ExpectedAttendee) => {
    setSelectedAttendee(attendee);
    setEditForm({
      full_name: attendee.full_name,
      email: attendee.email,
      phone: attendee.phone,
      organisation: attendee.organisation,
      position: attendee.position,
      region: attendee.region,
      tags: attendee.tags,
    });
    setShowEditModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/expected-attendees/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expected-attendees-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export list');
    }
  };

  const stats = {
    total: attendees.length,
    registered: attendees.filter(a => a.registered).length,
    pending: attendees.filter(a => !a.registered).length,
    checkedIn: attendees.filter(a => a.check_in_status === 'CHECKED_IN').length,
    reminded: attendees.filter(a => a.reminder_sent).length,
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">Expected Attendees</h2>
          <p className="text-sm text-muted-foreground">{stats.total} people expected</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
          >
            Add Attendee
          </Button>
          <Button
            variant="outline"
            className="h-9 text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-9 text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected</p>
                  <p className="text-3xl font-bold text-[#123B70] mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-[#123B70]/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#123B70]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.registered}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Registration</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Checked In</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.checkedIn}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, position, organisation, phone, or registration code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterRegistration}
                  onChange={(e) => setFilterRegistration(e.target.value)}
                  className="h-9 px-3 text-sm border border-input rounded-md bg-background"
                >
                  <option value="ALL">All Registration Status</option>
                  <option value="REGISTERED">Registered</option>
                  <option value="PENDING">Pending</option>
                </select>
                <select
                  value={filterCheckIn}
                  onChange={(e) => setFilterCheckIn(e.target.value)}
                  className="h-9 px-3 text-sm border border-input rounded-md bg-background"
                >
                  <option value="ALL">All Check-In Status</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="NOT_CHECKED_IN">Not Checked In</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterRegistration('ALL');
                    setFilterCheckIn('ALL');
                  }}
                  className="h-9 text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected Attendees List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : attendees.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? `No expected attendees found matching "${searchQuery}"` : 'No expected attendees found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Organisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Check-In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {attendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-muted">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {attendee.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {attendee.position || 'Not Provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {attendee.organisation || 'Not Provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${
                            attendee.registered
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          } text-xs`}>
                            {attendee.registered ? 'Registered' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${
                            attendee.check_in_status === 'CHECKED_IN'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          } text-xs`}>
                            {attendee.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(attendee)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(attendee)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(attendee.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Add Expected Attendee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="flex items-center gap-2 mb-1.5 text-xs">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-1.5 text-xs">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-1.5 text-xs">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="organisation" className="flex items-center gap-2 mb-1.5 text-xs">
                    Organisation *
                  </Label>
                  <Input
                    id="organisation"
                    type="text"
                    value={addForm.organisation}
                    onChange={(e) => setAddForm({ ...addForm, organisation: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position" className="flex items-center gap-2 mb-1.5 text-xs">
                    Position
                  </Label>
                  <Input
                    id="position"
                    type="text"
                    value={addForm.position}
                    onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="region" className="flex items-center gap-2 mb-1.5 text-xs">
                    Region
                  </Label>
                  <Input
                    id="region"
                    type="text"
                    value={addForm.region}
                    onChange={(e) => setAddForm({ ...addForm, region: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="tags" className="flex items-center gap-2 mb-1.5 text-xs">
                    Tags (comma separated)
                  </Label>
                  <Input
                    id="tags"
                    type="text"
                    value={addForm.tags}
                    onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                    className="h-9 text-sm"
                    placeholder="VIP, Management, etc."
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
                    disabled={adding}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                  >
                    {adding ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAttendee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Attendee Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <p className="text-sm font-medium">{selectedAttendee.full_name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position</Label>
                <p className="text-sm">{selectedAttendee.position || 'Not Provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Organisation</Label>
                <p className="text-sm">{selectedAttendee.organisation || 'Not Provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <p className="text-sm">{selectedAttendee.phone || 'Not Provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm">{selectedAttendee.email || 'Not Provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Region</Label>
                <p className="text-sm">{selectedAttendee.region || 'Not Provided'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <p className="text-sm">{selectedAttendee.tags || 'None'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Registration Status</Label>
                <Badge className={`${
                  selectedAttendee.registered
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                } text-xs ml-2`}>
                  {selectedAttendee.registered ? 'Registered' : 'Pending'}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Check-In Status</Label>
                <Badge className={`${
                  selectedAttendee.check_in_status === 'CHECKED_IN'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                } text-xs ml-2`}>
                  {selectedAttendee.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                </Badge>
              </div>
              {selectedAttendee.registered && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration Date</Label>
                    <p className="text-sm">{selectedAttendee.registered_at ? new Date(selectedAttendee.registered_at).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Check-In Time</Label>
                    <p className="text-sm">{selectedAttendee.check_in_date ? new Date(selectedAttendee.check_in_date).toLocaleString() : '-'}</p>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 h-9 text-sm"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAttendee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-base">Edit Expected Attendee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <Label htmlFor="editFullName" className="flex items-center gap-2 mb-1.5 text-xs">
                    Full Name *
                  </Label>
                  <Input
                    id="editFullName"
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail" className="flex items-center gap-2 mb-1.5 text-xs">
                    Email
                  </Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone" className="flex items-center gap-2 mb-1.5 text-xs">
                    Phone
                  </Label>
                  <Input
                    id="editPhone"
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editOrganisation" className="flex items-center gap-2 mb-1.5 text-xs">
                    Organisation *
                  </Label>
                  <Input
                    id="editOrganisation"
                    type="text"
                    value={editForm.organisation}
                    onChange={(e) => setEditForm({ ...editForm, organisation: e.target.value })}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editPosition" className="flex items-center gap-2 mb-1.5 text-xs">
                    Position
                  </Label>
                  <Input
                    id="editPosition"
                    type="text"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editRegion" className="flex items-center gap-2 mb-1.5 text-xs">
                    Region
                  </Label>
                  <Input
                    id="editRegion"
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editTags" className="flex items-center gap-2 mb-1.5 text-xs">
                    Tags (comma separated)
                  </Label>
                  <Input
                    id="editTags"
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    className="h-9 text-sm"
                    placeholder="VIP, Management, etc."
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
                    disabled={editing}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                  >
                    {editing ? 'Saving...' : 'Save'}
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
