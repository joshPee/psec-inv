'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, Search, Trash2, Edit, CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ShiftHandoverPage() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    outgoing_officer: '',
    incoming_officer: '',
    shift_date: '',
    notes: '',
    visitors_on_site: '',
    incidents: '',
    pending_tasks: '',
    equipment_status: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchHandovers();
  }, []);

  const fetchHandovers = async () => {
    try {
      const response = await fetch('/api/shift-handover');
      const data = await response.json();
      setHandovers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching handovers:', error);
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
        ? `/api/shift-handover/${editingId}`
        : '/api/shift-handover';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to save handover');
        setMessageType('error');
      } else {
        setMessage(editingId ? 'Handover updated successfully' : 'Handover created successfully');
        setMessageType('success');
        setFormData({
          outgoing_officer: '',
          incoming_officer: '',
          shift_date: '',
          notes: '',
          visitors_on_site: '',
          incidents: '',
          pending_tasks: '',
          equipment_status: '',
        });
        setShowForm(false);
        setEditingId(null);
        fetchHandovers();
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
    if (!confirm('Are you sure you want to delete this handover?')) return;

    try {
      const response = await fetch(`/api/shift-handover/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Handover deleted successfully');
        setMessageType('success');
        fetchHandovers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete handover');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    }
  };

  const handleEdit = (handover: any) => {
    setEditingId(handover.id);
    setFormData({
      outgoing_officer: handover.outgoing_officer,
      incoming_officer: handover.incoming_officer,
      shift_date: handover.shift_date,
      notes: handover.notes,
      visitors_on_site: handover.visitors_on_site,
      incidents: handover.incidents,
      pending_tasks: handover.pending_tasks,
      equipment_status: handover.equipment_status,
    });
    setShowForm(true);
  };

  const generatePDF = async (handover: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(18, 59, 112);
      doc.text('COCOBOD Security Equipment Management', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.setTextColor(51, 51, 51);
      doc.text('Shift Handover Report', pageWidth / 2, 30, { align: 'center' });

      // Handover details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Shift Date: ${new Date(handover.shift_date).toLocaleDateString()}`, 20, 45);
      doc.text(`Outgoing Officer: ${handover.outgoing_officer}`, 20, 55);
      doc.text(`Incoming Officer: ${handover.incoming_officer}`, 20, 65);

      // Fetch equipment movement data for the shift
      const shiftStart = new Date(handover.shift_date);
      shiftStart.setHours(0, 0, 0, 0);
      const shiftEnd = new Date(handover.shift_date);
      shiftEnd.setHours(23, 59, 59, 999);

      const movementsResponse = await fetch('/api/reports/movements/export');
      const movementsData = await movementsResponse.json();

      // Filter movements for the shift date
      const shiftMovements = movementsData.filter((m: any) => {
        const movementDate = new Date(m.createdAt);
        return movementDate >= shiftStart && movementDate <= shiftEnd;
      });

      // Issued items
      const issuedItems = shiftMovements.filter((m: any) => m.action === 'ISSUED');
      const returnedItems = shiftMovements.filter((m: any) => m.action === 'RETURNED');
      const damagedItems = shiftMovements.filter((m: any) => m.action === 'DAMAGED');
      const missingItems = shiftMovements.filter((m: any) => m.action === 'MISSING');

      // Summary section
      doc.setFontSize(14);
      doc.setTextColor(18, 59, 112);
      doc.text('Equipment Summary', 20, 85);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Items Issued: ${issuedItems.length}`, 20, 95);
      doc.text(`Items Returned: ${returnedItems.length}`, 20, 105);
      doc.text(`Damaged Records: ${damagedItems.length}`, 20, 115);
      doc.text(`Missing Records: ${missingItems.length}`, 20, 125);

      // Additional details
      if (handover.visitors_on_site) {
        doc.text(`Visitors On Site: ${handover.visitors_on_site}`, 20, 140);
      }
      if (handover.incidents) {
        doc.text(`Incidents: ${handover.incidents}`, 20, 150);
      }
      if (handover.pending_tasks) {
        doc.text(`Pending Tasks: ${handover.pending_tasks}`, 20, 160);
      }
      if (handover.equipment_status) {
        doc.text(`Equipment Status: ${handover.equipment_status}`, 20, 170);
      }
      if (handover.notes) {
        doc.text(`Notes: ${handover.notes}`, 20, 180);
      }

      // Issued Items Table
      if (issuedItems.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(18, 59, 112);
        doc.text('Items Issued This Shift', 20, 20);

        const issuedTableData = issuedItems.map((m: any) => [
          m.equipment?.itemName || 'N/A',
          m.guard?.fullName || 'N/A',
          m.guard?.staffId || 'N/A',
          new Date(m.createdAt).toLocaleTimeString(),
          m.dutyPoint || 'N/A',
        ]);

        autoTable(doc, {
          startY: 30,
          head: [['Equipment', 'Guard', 'Staff ID', 'Time', 'Duty Point']],
          body: issuedTableData,
          theme: 'grid',
          headStyles: { fillColor: [18, 59, 112] },
        });
      }

      // Returned Items Table
      if (returnedItems.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(18, 59, 112);
        doc.text('Items Returned This Shift', 20, 20);

        const returnedTableData = returnedItems.map((m: any) => [
          m.equipment?.itemName || 'N/A',
          m.guard?.fullName || 'N/A',
          m.condition || 'N/A',
          new Date(m.createdAt).toLocaleTimeString(),
        ]);

        autoTable(doc, {
          startY: 30,
          head: [['Equipment', 'Guard', 'Condition', 'Time']],
          body: returnedTableData,
          theme: 'grid',
          headStyles: { fillColor: [18, 59, 112] },
        });
      }

      // Damaged/Missing Items Table
      if (damagedItems.length > 0 || missingItems.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(18, 59, 112);
        doc.text('Damaged & Missing Records', 20, 20);

        const incidentTableData = [...damagedItems, ...missingItems].map((m: any) => [
          m.action,
          m.equipment?.itemName || 'N/A',
          m.guard?.fullName || 'N/A',
          m.condition || 'N/A',
          new Date(m.createdAt).toLocaleTimeString(),
        ]);

        autoTable(doc, {
          startY: 30,
          head: [['Action', 'Equipment', 'Guard', 'Condition', 'Time']],
          body: incidentTableData,
          theme: 'grid',
          headStyles: { fillColor: [18, 59, 112] },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Generated on ${new Date().toLocaleString()}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`shift-handover-${handover.shift_date}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const filteredHandovers = handovers.filter(handover =>
    handover.outgoing_officer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.incoming_officer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handover.shift_date?.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shift Handover</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setFormData({
                ...formData,
                shift_date: today,
              });
              setShowForm(true);
            }}
            variant="outline"
            className="border-[#123B70] text-[#123B70] hover:bg-[#123B70]/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#123B70] hover:bg-[#0d2d52]"
          >
            {showForm ? 'Cancel' : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Handover
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

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {editingId ? 'Edit Handover' : 'Create New Handover'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outgoingOfficer">Outgoing Officer *</Label>
                  <Input
                    id="outgoingOfficer"
                    value={formData.outgoing_officer}
                    onChange={(e) => setFormData({ ...formData, outgoing_officer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="incomingOfficer">Incoming Officer *</Label>
                  <Input
                    id="incomingOfficer"
                    value={formData.incoming_officer}
                    onChange={(e) => setFormData({ ...formData, incoming_officer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shiftDate">Shift Date *</Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={formData.shift_date}
                    onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="visitorsOnSite">Visitors On Site</Label>
                <Input
                  id="visitorsOnSite"
                  value={formData.visitors_on_site}
                  onChange={(e) => setFormData({ ...formData, visitors_on_site: e.target.value })}
                  placeholder="Number of visitors currently on site"
                />
              </div>
              <div>
                <Label htmlFor="incidents">Incidents/Issues</Label>
                <Input
                  id="incidents"
                  value={formData.incidents}
                  onChange={(e) => setFormData({ ...formData, incidents: e.target.value })}
                  placeholder="Any incidents or issues during the shift"
                />
              </div>
              <div>
                <Label htmlFor="pendingTasks">Pending Tasks</Label>
                <Input
                  id="pendingTasks"
                  value={formData.pending_tasks}
                  onChange={(e) => setFormData({ ...formData, pending_tasks: e.target.value })}
                  placeholder="Tasks that need to be completed"
                />
              </div>
              <div>
                <Label htmlFor="equipmentStatus">Equipment Status</Label>
                <Input
                  id="equipmentStatus"
                  value={formData.equipment_status}
                  onChange={(e) => setFormData({ ...formData, equipment_status: e.target.value })}
                  placeholder="Status of security equipment"
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any other important information"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Handover' : 'Create Handover'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      outgoing_officer: '',
                      incoming_officer: '',
                      shift_date: '',
                      notes: '',
                      visitors_on_site: '',
                      incidents: '',
                      pending_tasks: '',
                      equipment_status: '',
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
                placeholder="Search by officer name or date..."
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
                {filteredHandovers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {searchQuery ? 'No handovers found' : 'No handovers recorded yet'}
                  </p>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Outgoing</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Incoming</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Visitors</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Incidents</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredHandovers.map((handover) => (
                        <tr key={handover.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            {new Date(handover.shift_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{handover.outgoing_officer}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{handover.incoming_officer}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{handover.visitors_on_site || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{handover.incidents || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{handover.notes || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generatePDF(handover)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Download PDF Report"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(handover)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(handover.id)}
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