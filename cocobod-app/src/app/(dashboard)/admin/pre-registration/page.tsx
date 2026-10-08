'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Plus, Search, Trash2, Edit, CheckCircle, XCircle, Upload, FileSpreadsheet } from 'lucide-react';

export default function PreRegistrationPage() {
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    organisation: '',
    position: '',
    phone: '',
    expected_date: '',
    expected_time: '',
    host_name: '',
    host_department: '',
    visit_purpose: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchPreRegistrations();
  }, []);

  const fetchPreRegistrations = async () => {
    try {
      const response = await fetch('/api/participants');
      const data = await response.json();
      const preRegistered = Array.isArray(data) 
        ? data.filter(p => p.registration_source === 'PRE_REGISTERED')
        : [];
      setPreRegistrations(preRegistered);
    } catch (error) {
      console.error('Error fetching pre-registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/participants/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expected_arrival: formData.expected_date && formData.expected_time 
            ? `${formData.expected_date}T${formData.expected_time}`
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to pre-register visitor');
        setMessageType('error');
      } else {
        setMessage('Visitor pre-registered successfully');
        setMessageType('success');
        setFormData({
          full_name: '',
          organisation: '',
          position: '',
          phone: '',
          expected_date: '',
          expected_time: '',
          host_name: '',
          host_department: '',
          visit_purpose: '',
        });
        setShowForm(false);
        fetchPreRegistrations();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this pre-registration?')) return;

    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Pre-registration deleted successfully');
        setMessageType('success');
        fetchPreRegistrations();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete pre-registration');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleBulkImport = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file');
      setMessageType('error');
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/participants/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Bulk import failed');
        setMessageType('error');
      } else {
        setMessage(`Successfully imported ${data.importedCount} visitors`);
        setMessageType('success');
        setShowBulkImport(false);
        setCsvFile(null);
        fetchPreRegistrations();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('An error occurred during bulk import');
      setMessageType('error');
    } finally {
      setImporting(false);
    }
  };

  const filteredRegistrations = preRegistrations.filter(reg =>
    reg.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.organisation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.registration_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkImport(!showBulkImport)}
            variant="outline"
            className="border-[#123B70] text-[#123B70] hover:bg-[#123B70]/10"
          >
            {showBulkImport ? 'Cancel' : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import CSV
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#123B70] hover:bg-[#0d2d52]"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Pre-Register Visitor
              </>
            )}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`px-3 py-2 rounded-lg flex items-start gap-2 text-sm ${
          messageType === 'success'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {showBulkImport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Import Visitors from CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-[#123B70]/10 border border-[#123B70]/20 rounded-lg p-4">
                <p className="text-sm text-[#123B70] mb-2">
                  <strong>CSV Format:</strong> Include headers: full_name, organisation, position, phone, expected_date, expected_time, host_name, host_department, visit_purpose
                </p>
                <p className="text-xs text-[#123B70]/80">
                  Example: John Doe, ABC Corp, Manager, 555-1234, 2026-08-25, 09:00, Jane Smith, HR, Meeting
                </p>
              </div>

              <div>
                <Label htmlFor="csvFile">Select CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>

              {csvFile && (
                <div className="text-sm text-gray-600">
                  Selected: {csvFile.name}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkImport}
                  disabled={importing || !csvFile}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {importing ? 'Importing...' : 'Import Visitors'}
                </Button>
                <Button
                  onClick={() => {
                    setShowBulkImport(false);
                    setCsvFile(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              {editingId ? 'Edit Pre-Registration' : 'Pre-Register New Visitor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organisation">Organization *</Label>
                  <Input
                    id="organisation"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDate">Expected Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedTime">Expected Time</Label>
                  <Input
                    id="expectedTime"
                    type="time"
                    value={formData.expected_time}
                    onChange={(e) => setFormData({ ...formData, expected_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hostName">Host Name</Label>
                  <Input
                    id="hostName"
                    value={formData.host_name}
                    onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hostDepartment">Host Department</Label>
                  <Input
                    id="hostDepartment"
                    value={formData.host_department}
                    onChange={(e) => setFormData({ ...formData, host_department: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="visitPurpose">Purpose of Visit</Label>
                <Input
                  id="visitPurpose"
                  value={formData.visit_purpose}
                  onChange={(e) => setFormData({ ...formData, visit_purpose: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : 'Save Pre-Registration'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      full_name: '',
                      organisation: '',
                      position: '',
                      phone: '',
                      expected_date: '',
                      expected_time: '',
                      host_name: '',
                      host_department: '',
                      visit_purpose: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, organization, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70]"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {filteredRegistrations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No pre-registrations found' : 'No pre-registrations yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Organization</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expected Arrival</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Host</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-blue-700">{reg.registration_code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reg.full_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reg.organisation}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reg.position}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(reg.expected_arrival)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reg.host_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reg.visit_purpose || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              reg.check_in_status === 'CHECKED_IN'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                            }>
                              {reg.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(reg.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}