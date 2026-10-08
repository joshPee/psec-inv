'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tag, Plus, Search, Trash2, Edit, CheckCircle, XCircle, Shield, User, CheckSquare } from 'lucide-react';

export default function VisitorCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requires_badge: true,
    requires_host: false,
    requires_pre_approval: false,
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/visitor-categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching visitor categories:', error);
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
        ? `/api/visitor-categories/${editingId}`
        : '/api/visitor-categories';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save visitor category');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Visitor category updated successfully' : 'Visitor category added successfully');
        setMessageType('success');
        setFormData({
          name: '',
          description: '',
          requires_badge: true,
          requires_host: false,
          requires_pre_approval: false,
        });
        setShowForm(false);
        setEditingId(null);
        fetchCategories();
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
    if (!confirm('Are you sure you want to delete this visitor category?')) return;

    try {
      const response = await fetch(`/api/visitor-categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Visitor category deleted successfully');
        setMessageType('success');
        fetchCategories();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete visitor category');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      requires_badge: category.requires_badge,
      requires_host: category.requires_host,
      requires_pre_approval: category.requires_pre_approval,
    });
    setShowForm(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: '',
                description: '',
                requires_badge: true,
                requires_host: false,
                requires_pre_approval: false,
              });
            }}
            className="bg-[#123B70] hover:bg-[#0d2d52]"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </>
            )}
          </Button>
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
              <Tag className="h-5 w-5" />
              {editingId ? 'Edit Visitor Category' : 'Add Visitor Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Contractor, VIP, Event Guest"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this visitor type..."
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Requirements</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="requiresBadge"
                    type="checkbox"
                    checked={formData.requires_badge}
                    onChange={(e) => setFormData({ ...formData, requires_badge: e.target.checked })}
                    className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded"
                  />
                  <Label htmlFor="requiresBadge" className="text-sm text-gray-900 cursor-pointer flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Requires Badge
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="requiresHost"
                    type="checkbox"
                    checked={formData.requires_host}
                    onChange={(e) => setFormData({ ...formData, requires_host: e.target.checked })}
                    className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded"
                  />
                  <Label htmlFor="requiresHost" className="text-sm text-gray-900 cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Requires Host Assignment
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="requiresPreApproval"
                    type="checkbox"
                    checked={formData.requires_pre_approval}
                    onChange={(e) => setFormData({ ...formData, requires_pre_approval: e.target.checked })}
                    className="h-4 w-4 text-blue-700 focus:ring-blue-700 border-gray-300 rounded"
                  />
                  <Label htmlFor="requiresPreApproval" className="text-sm text-gray-900 cursor-pointer flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Requires Pre-Approval
                  </Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      requires_badge: true,
                      requires_host: false,
                      requires_pre_approval: false,
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
                placeholder="Search by name or description..."
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
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No visitor categories found' : 'No visitor categories configured yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Badge Required</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Host Required</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pre-Approval Required</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <Tag className="h-4 w-4 text-blue-600" />
                            {category.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{category.description || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              category.requires_badge
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }>
                              {category.requires_badge ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              category.requires_host
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }>
                              {category.requires_host ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={
                              category.requires_pre_approval
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }>
                              {category.requires_pre_approval ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(category)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
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