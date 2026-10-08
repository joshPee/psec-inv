'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Trash2, Edit, CheckCircle, XCircle, Building, Mail, Phone } from 'lucide-react';
import { canEditResource, type UserRole } from '@/lib/rbac';

export default function HostsStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    position: '',
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchStaff();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role || 'Security Officer');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId 
        ? `/api/staff/${editingId}`
        : '/api/staff';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save staff member');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Staff member updated successfully' : 'Staff member added successfully');
        setMessageType('success');
        setFormData({ full_name: '', department: '', position: '', email: '', phone: '' });
        setShowForm(false);
        setEditingId(null);
        fetchStaff();
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
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Staff member removed successfully');
        setMessageType('success');
        fetchStaff();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to remove staff member');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      full_name: member.full_name,
      department: member.department || '',
      position: member.position || '',
      email: member.email || '',
      phone: member.phone || '',
    });
    setShowForm(true);
  };

  const canEdit = canEditResource(userRole as UserRole, 'hosts-staff');
  const filteredStaff = staff.filter(member =>
    member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          {canEdit && (
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ full_name: '', department: '', position: '', email: '', phone: '' });
              }}
              className="bg-[#123B70] hover:bg-[#0d2d52]"
            >
              {showForm ? 'Cancel' : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff Member
                </>
              )}
            </Button>
          )}
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingId ? 'Edit Staff Member' : 'Add Staff Member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Staff Member' : 'Add Staff Member'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ full_name: '', department: '', position: '', email: '', phone: '' });
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
                placeholder="Search by name, department, or position..."
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
                {filteredStaff.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No staff members found' : 'No staff members added yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        {canEdit && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredStaff.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            {member.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {member.department ? (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3 text-gray-400" />
                                {member.department}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{member.position || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {member.email ? (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {member.email}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {member.phone ? (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                {member.phone}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              member.is_active
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(member)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(member.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          )}
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