'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Search, Trash2, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: '',
    severity: 'Low',
    location: '',
    reported_by: '',
    status: 'Open',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
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
        ? `/api/incidents/${editingId}`
        : '/api/incidents';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save incident');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Incident updated successfully' : 'Incident reported successfully');
        setMessageType('success');
        setFormData({
          title: '',
          description: '',
          incident_type: '',
          severity: 'Low',
          location: '',
          reported_by: '',
          status: 'Open',
        });
        setShowForm(false);
        setEditingId(null);
        fetchIncidents();
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
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Incident deleted successfully');
        setMessageType('success');
        fetchIncidents();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete incident');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (incident: any) => {
    setEditingId(incident.id);
    setFormData({
      title: incident.title,
      description: incident.description,
      incident_type: incident.incident_type,
      severity: incident.severity,
      location: incident.location,
      reported_by: incident.reported_by,
      status: incident.status,
    });
    setShowForm(true);
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.incident_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    incident.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'medium': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'low': return 'bg-green-100 text-green-700 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'in progress': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'resolved': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'closed': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#123B70] hover:bg-[#0d2d52]"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
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
              <AlertTriangle className="h-5 w-5" />
              {editingId ? 'Edit Incident' : 'Report New Incident'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incidentType">Incident Type *</Label>
                  <Input
                    id="incidentType"
                    value={formData.incident_type}
                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                    placeholder="e.g., Security, Accident, Theft"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="severity">Severity *</Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reportedBy">Reported By *</Label>
                  <Input
                    id="reportedBy"
                    value={formData.reported_by}
                    onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Incident' : 'Report Incident'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      description: '',
                      incident_type: '',
                      severity: 'Low',
                      location: '',
                      reported_by: '',
                      status: 'Open',
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
                placeholder="Search by title, type, or location..."
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
                {filteredIncidents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No incidents found' : 'No incidents reported yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Severity</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reported By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredIncidents.map((incident) => (
                        <tr key={incident.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            {incident.title}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{incident.incident_type}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{incident.location}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{incident.reported_by}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(incident.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(incident)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(incident.id)}
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