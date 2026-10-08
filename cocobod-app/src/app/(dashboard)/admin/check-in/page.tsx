'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardTopBar } from '@/components/DashboardTopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Search, UserCheck, XCircle, Repeat } from 'lucide-react';

export default function CheckInPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInData, setWalkInData] = useState({ fullName: '', organisation: '', position: '', phone: '', isRecurring: false });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    searchInputRef.current?.focus();
    fetch('/api/events/active')
      .then(res => res.json())
      .then(data => setActiveEvent(data))
      .catch(console.error);
  }, []);

  // Auto-search when query reaches 3 characters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        performSearch();
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setSelectedVisitor(null);
        setError('');
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedVisitor(null);
    setSuccess(false);
    setAlreadyCheckedIn(false);

    try {
      const response = await fetch(`/api/participants/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
      } else {
        // Prioritize recurring visitors in search results
        const sortedResults = [...data].sort((a, b) => {
          if (a.is_recurring && !b.is_recurring) return -1;
          if (!a.is_recurring && b.is_recurring) return 1;
          return 0;
        });
        setSearchResults(sortedResults);
        // Auto-select first result for faster security guard workflow
        if (sortedResults.length === 1) {
          setSelectedVisitor(sortedResults[0]);
        }
      }
    } catch (error) {
      setError('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch();
  };

  const handleCheckIn = async (visitor: any) => {
    setSelectedVisitor(visitor);
    setLoading(true);
    setError('');
    setSuccess(false);
    setAlreadyCheckedIn(false);

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: visitor.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyCheckedIn) {
          setAlreadyCheckedIn(true);
          setSelectedVisitor({ ...visitor, checkInData: data });
        } else {
          setError(data.error || 'Check-in failed');
        }
      } else {
        setSuccess(true);
        setSelectedVisitor({ ...visitor, checkInData: data });
        // Update the visitor in search results
        setSearchResults(prev => 
          prev.map(p => p.id === visitor.id ? { ...p, check_in_status: 'CHECKED_IN' } : p)
        );
        // Auto-reset after 3 seconds for faster security guard workflow
        setTimeout(() => {
          resetSearch();
        }, 3000);
      }
    } catch (error) {
      setError('An error occurred during check-in');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVisitor(null);
    setError('');
    setSuccess(false);
    setAlreadyCheckedIn(false);
    searchInputRef.current?.focus();
  };

  // Calculate pagination
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = searchResults.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleWalkInSubmit = async (e: React.FormEvent, checkInImmediately = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: walkInData.fullName,
          organisation: walkInData.organisation,
          position: walkInData.position,
          phone: walkInData.phone,
          isRecurring: walkInData.isRecurring,
          checkInImmediately,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Walk-in registration failed');
      } else {
        if (checkInImmediately && data.checkInData) {
          setSuccess(true);
          setSelectedVisitor({
            full_name: walkInData.fullName,
            organisation: walkInData.organisation,
            position: walkInData.position,
            registration_code: data.registrationCode,
            checkInData: data.checkInData,
          });
        } else {
          setShowWalkInModal(false);
          setWalkInData({ fullName: '', organisation: '', position: '', phone: '', isRecurring: false });
          // Auto-search for the new participant
          setSearchQuery(data.registrationCode);
          handleSearch(e);
        }
      }
    } catch (error) {
      setError('An error occurred during walk-in registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <div className="p-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-foreground uppercase">VISITOR CHECK-IN</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div>
              <Label htmlFor="search" className="flex items-center gap-2 mb-1.5 text-xs">
                <Search className="w-3.5 h-3.5" />
                Visitor Code or Name
              </Label>
              <div className="flex gap-2">
                <Input
                  ref={searchInputRef}
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Visitor Code or Name"
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm px-4"
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>
          </form>

          <div className="mb-6">
            <Button
              onClick={() => setShowWalkInModal(true)}
              className="w-full bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm"
            >
              + Add Walk-in Visitor
            </Button>
          </div>

          {error && !selectedVisitor && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </Card>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedVisitor && (
            <Card>
              <CardContent className="divide-y p-0">
                {paginatedResults.map((participant) => (
                  <div
                    key={participant.id}
                    className="p-4 hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedVisitor(participant)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground truncate">{participant.full_name}</p>
                          {participant.is_recurring && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                              <Repeat className="w-3 h-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{participant.phone}</p>
                        <p className="text-sm text-muted-foreground truncate">{participant.location}</p>
                        {participant.organisation && <p className="text-xs text-muted-foreground truncate">{participant.organisation}</p>}
                        <p className="text-xs text-muted-foreground truncate">Visiting: {participant.host_name}</p>
                      </div>
                      <div className="ml-4 text-right shrink-0">
                        <p className="text-sm font-medium text-foreground">{participant.registration_code}</p>
                        <Badge className={`${
                          participant.check_in_status === 'CHECKED_IN'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20'
                        } text-xs`}>
                          {participant.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(endIndex, searchResults.length)} of {searchResults.length} results
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
              </CardContent>
            </Card>
          )}

          {/* Selected Visitor / Verification Card */}
          {selectedVisitor && (
            <Card>
              {success ? (
                <CardContent className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-700" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">CHECK-IN SUCCESSFUL</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedVisitor.full_name}</p>
                  <p className="text-sm font-semibold text-[#123B70] mb-2">{selectedVisitor.registration_code}</p>
                  <p className="text-sm text-muted-foreground">
                    Checked in at {new Date(selectedVisitor.checkInData?.check_in_time).toLocaleTimeString()}
                  </p>
                  <Button
                    onClick={resetSearch}
                    className="mt-6 bg-[#123B70] hover:bg-[#0d2d52] h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm w-full"
                  >
                    <span className="hidden sm:inline">Check In Another Visitor</span>
                    <span className="sm:hidden">Check In Another</span>
                  </Button>
                </CardContent>
              ) : alreadyCheckedIn ? (
                <CardContent className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-amber-700" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">ALREADY CHECKED IN</h3>
                  <p className="text-sm text-muted-foreground mb-2">{selectedVisitor.full_name}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Checked in at {new Date(selectedVisitor.checkInData?.check_in_time).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Checked in by {selectedVisitor.checkInData?.checked_in_by}
                  </p>
                  <Button
                    onClick={resetSearch}
                    className="mt-6 bg-[#123B70] hover:bg-[#0d2d52] h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm w-full"
                  >
                    <span className="hidden sm:inline">Check In Another Visitor</span>
                    <span className="sm:hidden">Check In Another</span>
                  </Button>
                </CardContent>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <UserCheck className="h-4 w-4" />
                      Verify Visitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Full Name</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.full_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Phone Number</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.phone}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Location</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.location}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Organization</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.organisation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Person to Visit</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.host_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Department</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.host_department}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Purpose of Visit</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.visit_purpose}</span>
                    </div>
                    {selectedVisitor.vehicle_registration && (
                      <div className="flex justify-between border-b pb-3">
                        <span className="text-xs text-muted-foreground">Vehicle Registration</span>
                        <span className="text-sm font-semibold text-foreground">{selectedVisitor.vehicle_registration}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-xs text-muted-foreground">Visitor Code</span>
                      <span className="text-sm font-semibold text-foreground">{selectedVisitor.registration_code}</span>
                    </div>
                    <div className="flex justify-between pb-3">
                      <span className="text-xs text-muted-foreground">Check-In Status</span>
                      <Badge className={`${
                        selectedVisitor.check_in_status === 'CHECKED_IN'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-[#123B70]/10 text-[#123B70] border-[#123B70]/20'
                      } text-xs`}>
                        {selectedVisitor.check_in_status === 'CHECKED_IN' ? 'Checked In' : 'Not Checked In'}
                      </Badge>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleCheckIn(selectedVisitor)}
                        disabled={loading || selectedVisitor.check_in_status === 'CHECKED_IN'}
                        className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm"
                      >
                        {loading ? 'Checking in...' : 'Confirm & Check In'}
                      </Button>
                      <Button
                        onClick={() => setSelectedVisitor(null)}
                        variant="outline"
                        className="h-10 text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          )}

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-base">Add Walk-in Visitor</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={(e) => handleWalkInSubmit(e, false)} className="space-y-4">
                <div>
                  <Label htmlFor="walkInName" className="flex items-center gap-2 mb-1.5 text-xs">
                    Full Name *
                  </Label>
                  <Input
                    id="walkInName"
                    type="text"
                    required
                    value={walkInData.fullName}
                    onChange={(e) => setWalkInData({ ...walkInData, fullName: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="walkInOrg" className="flex items-center gap-2 mb-1.5 text-xs">
                    Organisation *
                  </Label>
                  <Input
                    id="walkInOrg"
                    type="text"
                    required
                    value={walkInData.organisation}
                    onChange={(e) => setWalkInData({ ...walkInData, organisation: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="walkInPosition" className="flex items-center gap-2 mb-1.5 text-xs">
                    Position
                  </Label>
                  <Input
                    id="walkInPosition"
                    type="text"
                    value={walkInData.position}
                    onChange={(e) => setWalkInData({ ...walkInData, position: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="walkInPhone" className="flex items-center gap-2 mb-1.5 text-xs">
                    Contact Number
                  </Label>
                  <Input
                    id="walkInPhone"
                    type="tel"
                    value={walkInData.phone}
                    onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={walkInData.isRecurring}
                    onChange={(e) => setWalkInData({ ...walkInData, isRecurring: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isRecurring" className="flex items-center gap-2 text-xs cursor-pointer">
                    <Repeat className="w-3.5 h-3.5" />
                    Mark as Recurring Visitor
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                  >
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => handleWalkInSubmit(e, true)}
                    disabled={loading}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-9 text-sm"
                  >
                    {loading ? 'Registering...' : 'Register & Check In'}
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setShowWalkInModal(false);
                    setWalkInData({ fullName: '', organisation: '', position: '', phone: '', isRecurring: false });
                    setError('');
                  }}
                  variant="outline"
                  className="w-full h-9 text-sm"
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
