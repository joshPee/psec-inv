'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Car, Plus, Search, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    color: '',
    owner_name: '',
    owner_phone: '',
    purpose: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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
        ? `/api/vehicles/${editingId}`
        : '/api/vehicles';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save vehicle');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Vehicle updated successfully' : 'Vehicle added successfully');
        setMessageType('success');
        setFormData({
          plate_number: '',
          make: '',
          model: '',
          color: '',
          owner_name: '',
          owner_phone: '',
          purpose: '',
        });
        setShowForm(false);
        setEditingId(null);
        fetchVehicles();
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
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Vehicle deleted successfully');
        setMessageType('success');
        fetchVehicles();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete vehicle');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditingId(vehicle.id);
    setFormData({
      plate_number: vehicle.plate_number,
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color,
      owner_name: vehicle.owner_name,
      owner_phone: vehicle.owner_phone,
      purpose: vehicle.purpose,
    });
    setShowForm(true);
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#123B70] hover:bg-[#0d2d52]"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
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
              <Car className="h-5 w-5" />
              {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plateNumber">Plate Number *</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Owner Phone</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Staff vehicle, Visitor, Delivery"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      plate_number: '',
                      make: '',
                      model: '',
                      color: '',
                      owner_name: '',
                      owner_phone: '',
                      purpose: '',
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
                placeholder="Search by plate, make, or owner..."
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
                {filteredVehicles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No vehicles found' : 'No vehicles registered yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Make</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Model</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Color</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Owner</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-blue-700">{vehicle.plate_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.make}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.model}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.color}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.owner_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.owner_phone || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{vehicle.purpose || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(vehicle)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(vehicle.id)}
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