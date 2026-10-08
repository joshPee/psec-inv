'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle, Search, LogOut, XCircle } from 'lucide-react';

export default function CheckOutPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyCheckedOut, setAlreadyCheckedOut] = useState(false);
  const [notes, setNotes] = useState('');
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
    }, 300);

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
    setAlreadyCheckedOut(false);

    try {
      const response = await fetch(`/api/participants/search?q=${encodeURIComponent(searchQuery)}&checkInStatus=CHECKED_IN`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
      } else {
        setSearchResults(data);
        // Auto-select first result for faster security guard workflow
        if (data.length === 1) {
          setSelectedVisitor(data[0]);
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

  const handleCheckOut = async (visitor: any) => {
    setSelectedVisitor(visitor);
    setLoading(true);
    setError('');
    setSuccess(false);
    setAlreadyCheckedOut(false);

    try {
      console.log('Checking out visitor:', visitor);
      const registrationCode = visitor.registration_code;
      console.log('Registration Code:', registrationCode);
      
      if (!registrationCode) {
        setError('Invalid visitor data - missing registration code');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationCode, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyCheckedOut) {
          setAlreadyCheckedOut(true);
          setSelectedVisitor({ ...visitor, checkOutData: data });
        } else {
          setError(data.error || 'Check-out failed');
        }
      } else {
        setSuccess(true);
        setSelectedVisitor({ ...visitor, checkOutData: data });
        // Update the visitor in search results
        setSearchResults(prev => 
          prev.map(p => p.id === visitor.id ? { ...p, check_in_status: 'CHECKED_OUT' } : p)
        );
        // Auto-reset after 3 seconds for faster security guard workflow
        setTimeout(() => {
          resetSearch();
        }, 3000);
      }
    } catch (error) {
      setError('An error occurred during check-out');
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
    setAlreadyCheckedOut(false);
    setNotes('');
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

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <div className="p-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-foreground uppercase">VISITOR CHECK-OUT</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div>
              <Label htmlFor="search" className="flex items-center gap-2 mb-1.5 text-xs">
                <Search className="w-3.5 h-3.5" />
                Search Checked-In Visitors
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
            {paginatedResults.map((visitor) => (
              <div
                key={visitor.id}
                className="p-4 hover:bg-muted cursor-pointer"
                onClick={() => setSelectedVisitor(visitor)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{visitor.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{visitor.organisation}</p>
                    <p className="text-sm text-muted-foreground truncate">{visitor.position}</p>
                    {visitor.visitor_type && <p className="text-xs text-muted-foreground truncate">Type: {visitor.visitor_type}</p>}
                  </div>
                  <div className="ml-4 text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{visitor.registration_code}</p>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Checked In
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
              <h3 className="text-lg font-bold text-foreground mb-2">CHECK-OUT SUCCESSFUL</h3>
              <p className="text-sm text-muted-foreground mb-2">{selectedVisitor.full_name}</p>
              <p className="text-sm font-semibold text-[#123B70] mb-2">{selectedVisitor.registration_code}</p>
              <p className="text-sm text-muted-foreground">
                Checked out at {new Date(selectedVisitor.checkOutData?.check_out_time).toLocaleTimeString()}
              </p>
              <Button
                onClick={resetSearch}
                className="mt-6 bg-[#123B70] hover:bg-[#0d2d52] h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm w-full"
              >
                <span className="hidden sm:inline">Check Out Another Visitor</span>
                <span className="sm:hidden">Check Out Another</span>
              </Button>
            </CardContent>
          ) : alreadyCheckedOut ? (
            <CardContent className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">ALREADY CHECKED OUT</h3>
              <p className="text-sm text-muted-foreground mb-2">{selectedVisitor.full_name}</p>
              <p className="text-sm text-muted-foreground mb-2">
                Checked out at {new Date(selectedVisitor.checkOutData?.check_out_time).toLocaleTimeString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Checked out by {selectedVisitor.checkOutData?.checked_out_by}
              </p>
              <Button
                onClick={resetSearch}
                className="mt-6 bg-[#123B70] hover:bg-[#0d2d52] h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm w-full"
              >
                <span className="hidden sm:inline">Check Out Another Visitor</span>
                <span className="sm:hidden">Check Out Another</span>
              </Button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <LogOut className="h-4 w-4" />
                  Verify Visitor Check-Out
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-muted-foreground">Full Name</span>
                  <span className="text-sm font-semibold text-foreground">{selectedVisitor.full_name}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-muted-foreground">Organisation</span>
                  <span className="text-sm font-semibold text-foreground">{selectedVisitor.organisation}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-muted-foreground">Position</span>
                  <span className="text-sm font-semibold text-foreground">{selectedVisitor.position}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-muted-foreground">Visitor Code</span>
                  <span className="text-sm font-semibold text-foreground">{selectedVisitor.registration_code}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-xs text-muted-foreground">Check-In Status</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    Checked In
                  </Badge>
                </div>
                {selectedVisitor.check_in_date && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-xs text-muted-foreground">Checked In At</span>
                    <span className="text-sm font-semibold text-foreground">
                      {new Date(selectedVisitor.check_in_date).toLocaleString()}
                    </span>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2 mb-1.5 text-xs">
                    Check-Out Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about the visit"
                    className="h-9 text-sm"
                  />
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleCheckOut(selectedVisitor)}
                    disabled={loading}
                    className="flex-1 bg-[#123B70] hover:bg-[#0d2d52] h-10 text-sm"
                  >
                    {loading ? 'Checking out...' : 'Confirm & Check Out'}
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
    </div>
  );
}
