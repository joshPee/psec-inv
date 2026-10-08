'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Plus, Search, Trash2, Edit, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { canEditResource, type UserRole } from '@/lib/rbac';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    reason: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchWatchlist();
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

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist');
      const data = await response.json();
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
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
        ? `/api/watchlist/${editingId}`
        : '/api/watchlist';
      
      const method = editingId ? 'PUT' : 'POST';
      
      // For new entries, we need to get the current user ID
      const body = editingId 
        ? formData
        : { ...formData, added_by: 1 }; // TODO: Get actual user ID from session

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save watchlist entry');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Watchlist entry updated successfully' : 'Watchlist entry added successfully');
        setMessageType('success');
        setFormData({ full_name: '', reason: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        fetchWatchlist();
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
    if (!confirm('Are you sure you want to remove this person from the watchlist?')) return;

    try {
      const response = await fetch(`/api/watchlist/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Watchlist entry removed successfully');
        setMessageType('success');
        fetchWatchlist();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to remove watchlist entry');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setFormData({
      full_name: entry.full_name,
      reason: entry.reason,
      description: entry.description || '',
    });
    setShowForm(true);
  };

  const canEdit = canEditResource(userRole as UserRole, 'watchlist');
  const filteredWatchlist = watchlist.filter(entry =>
    entry.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
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
          {canEdit && (
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ full_name: '', reason: '', description: '' });
              }}
              className="bg-[#123B70] hover:bg-[#0d2d52]"
            >
              {showForm ? 'Cancel' : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
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
              <ShieldAlert className="h-5 w-5" />
              {editingId ? 'Edit Watchlist Entry' : 'Add to Watchlist'}
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
              <div>
                <Label htmlFor="reason">Reason for Watchlist *</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="e.g., Security risk, Trespassing, etc."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Entry' : 'Add to Watchlist'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ full_name: '', reason: '', description: '' });
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
                placeholder="Search by name or reason..."
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
                {filteredWatchlist.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No watchlist entries found' : 'Watchlist is empty'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reason</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Added By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Added</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        {canEdit && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredWatchlist.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            {entry.full_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{entry.reason}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{entry.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{entry.added_by_name || 'Unknown'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date_added)}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              entry.is_active
                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }>
                              {entry.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry.id)}
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