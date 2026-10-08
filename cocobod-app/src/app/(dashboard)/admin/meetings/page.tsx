'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, MapPin, Users, X, AlertCircle } from 'lucide-react';

interface Meeting {
  id: number;
  name: string;
  date: string;
  venue: string;
  description: string;
  status: string;
  registration_open: boolean;
  participant_count?: number;
  checked_in_count?: number;
  not_checked_in_count?: number;
  attendance_percentage?: number;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [newMeeting, setNewMeeting] = useState({
    name: '',
    date: '',
    venue: '',
    description: '',
    status: 'ACTIVE',
    registrationOpen: true,
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create meeting');
        return;
      }

      setShowCreateModal(false);
      setNewMeeting({
        name: '', date: '', venue: '', description: '', status: 'ACTIVE', registrationOpen: true
      });
      fetchMeetings(); // Refresh list
    } catch (error) {
      setError('An error occurred while creating meeting');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-end items-center">
        <Button 
          className="bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70]"></div>
          </div>
        ) : meetings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No meetings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Current / Upcoming Meeting */}
            <div>
              <h3 className="text-md font-semibold text-foreground mb-4">Current / Upcoming Meeting</h3>
              {meetings.filter(m => m.status === 'ACTIVE').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meetings.filter(m => m.status === 'ACTIVE').map((meeting) => (
                    <Link key={meeting.id} href={`/admin/settings`}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-[#123B70]/30 shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base line-clamp-2 pr-2">{meeting.name}</CardTitle>
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] shrink-0">
                              ACTIVE
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">{meeting.venue}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                            <div className="text-center">
                              <div className="text-lg font-bold text-foreground">{meeting.participant_count || 0}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{meeting.checked_in_count || 0}</div>
                              <div className="text-xs text-muted-foreground">Checked In</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-amber-600">{meeting.attendance_percentage || 0}%</div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-6">
                    <p className="text-sm text-muted-foreground">No active meeting</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Archived Meetings */}
            {meetings.filter(m => m.status !== 'ACTIVE').length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-foreground mb-4">Past / Archived Meetings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meetings.filter(m => m.status !== 'ACTIVE').map((meeting) => (
                    <Link key={meeting.id} href={`/admin/settings`}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full opacity-75 hover:opacity-100">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base line-clamp-2 pr-2 text-muted-foreground">{meeting.name}</CardTitle>
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] shrink-0">
                              {meeting.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">{meeting.venue}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                            <div className="text-center">
                              <div className="text-lg font-bold text-foreground">{meeting.participant_count || 0}</div>
                              <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{meeting.checked_in_count || 0}</div>
                              <div className="text-xs text-muted-foreground">Checked In</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-amber-600">{meeting.attendance_percentage || 0}%</div>
                              <div className="text-xs text-muted-foreground">Rate</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="max-w-md w-full my-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Create New Meeting</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-1.5 text-xs">Event Name *</Label>
                  <Input
                    id="name"
                    required
                    value={newMeeting.name}
                    onChange={(e) => setNewMeeting({ ...newMeeting, name: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2 mb-1.5 text-xs">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="venue" className="flex items-center gap-2 mb-1.5 text-xs">Venue *</Label>
                  <Input
                    id="venue"
                    required
                    value={newMeeting.venue}
                    onChange={(e) => setNewMeeting({ ...newMeeting, venue: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="flex items-center gap-2 mb-1.5 text-xs">Description</Label>
                  <textarea
                    id="description"
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base md:text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none h-20"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="flex items-center gap-2 mb-1.5 text-xs">Status</Label>
                  <select
                    id="status"
                    value={newMeeting.status}
                    onChange={(e) => setNewMeeting({ ...newMeeting, status: e.target.value })}
                    className="w-full h-9 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#123B70]/20"
                  >
                    <option value="ACTIVE">Active (Archives all others)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="flex-1 bg-[#123B70] hover:bg-[#0d2d52]">
                    {creating ? 'Creating...' : 'Create Meeting'}
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
