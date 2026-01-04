import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, MapPin, Briefcase, MessageSquare, Download, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ResumeDatabase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filters, setFilters] = useState({
    experienceLevel: 'all',
    location: 'all',
    availability: 'all',
  });

  // Check subscription access
  const { data: hasAccess } = useQuery({
    queryKey: ['resume-database-access'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if user owns a business with active subscription
      const { data: businesses } = await supabase
        .from('business_owners')
        .select('business_id')
        .eq('user_id', user.id);

      if (!businesses?.length) return false;

      const { data: subscription } = await supabase
        .from('business_subscriptions')
        .select('*')
        .in('business_id', businesses.map(b => b.business_id))
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .single();

      return !!subscription;
    },
  });

  // Fetch profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['resume-database', searchQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .not('resume_url', 'is', null);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`);
      }

      if (filters.experienceLevel !== 'all') {
        query = query.eq('experience_years', parseInt(filters.experienceLevel));
      }

      if (filters.location !== 'all') {
        query = query.contains('preferred_locations', [filters.location]);
      }

      if (filters.availability !== 'all') {
        query = query.eq('availability', filters.availability);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: hasAccess === true,
  });

  const handleContactCandidate = async (profileId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's business
    const { data: business } = await supabase
      .from('business_owners')
      .select('business_id, businesses(*)')
      .eq('user_id', user.id)
      .single();

    if (!business) {
      toast.error('No business found');
      return;
    }

    // Create or get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', business.business_id)
      .eq('user_id', profileId)
      .single();

    if (convError && convError.code !== 'PGRST116') {
      toast.error('Failed to create conversation');
      return;
    }

    let conversationId = conversation?.id;

    if (!conversation) {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          business_id: business.business_id,
          user_id: profileId,
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to create conversation');
        return;
      }

      conversationId = newConv.id;
    }

    navigate(`/inbox?conversation=${conversationId}`);
  };

  const exportProfiles = () => {
    if (!profiles) return;

    const csv = [
      ['Name', 'Email', 'Phone', 'Experience', 'Skills', 'Location', 'Availability'],
      ...profiles.map(p => [
        p.full_name || '',
        p.email || '',
        p.phone || '',
        `${p.experience_years || 0} years`,
        (p.skills || []).join('; '),
        (p.preferred_locations || []).join('; '),
        p.availability || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export successful');
  };

  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Premium Feature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Access to the resume database requires an active business subscription.
              </p>
              <Button onClick={() => navigate('/subscription-plans')} className="w-full">
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold mb-2">Resume Database</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Browse qualified candidates for your open positions</p>
          </div>

          {/* Search & Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Search row - stacks on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, skills, or bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={exportProfiles} variant="outline" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Filters - stacks on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={filters.experienceLevel} onValueChange={(v) => setFilters(f => ({ ...f, experienceLevel: v }))}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="0">Entry Level (0-2y)</SelectItem>
                    <SelectItem value="3">Mid Level (3-5y)</SelectItem>
                    <SelectItem value="6">Senior (6+ years)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.availability} onValueChange={(v) => setFilters(f => ({ ...f, availability: v }))}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
                    <SelectItem value="1_month">1 Month Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-24 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles?.map((profile) => (
                <Card 
                  key={profile.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => setSelectedProfile(profile)}
                >
                  <CardContent className="pt-6 space-y-4">
                    {/* Profile header - stacks on mobile */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                      <Avatar className="h-16 w-16 sm:h-12 sm:w-12">
                        <AvatarImage src={profile.avatar_url || ''} />
                        <AvatarFallback className="text-lg sm:text-base">
                          {profile.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="font-semibold truncate">{profile.full_name || 'Anonymous'}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio || 'No bio'}</p>
                      </div>
                    </div>

                    {/* Info section */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{profile.experience_years || 0} years experience</span>
                      </div>
                      {profile.preferred_locations && profile.preferred_locations.length > 0 && (
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{profile.preferred_locations[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {profile.skills.slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{profile.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Contact button - full width */}
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContactCandidate(profile.id);
                      }}
                      className="w-full h-11 sm:h-9"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && profiles?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No Candidates Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery || filters.experienceLevel !== 'all' || filters.availability !== 'all'
                      ? 'Try adjusting your filters or search terms to find more candidates.'
                      : 'No candidates have uploaded their resumes yet. Check back soon!'}
                  </p>
                </div>
                {(searchQuery || filters.experienceLevel !== 'all' || filters.availability !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ experienceLevel: 'all', location: 'all', availability: 'all' });
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Profile Detail Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-6">
              {/* Profile header - stacks on mobile */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="h-24 w-24 sm:h-20 sm:w-20">
                  <AvatarImage src={selectedProfile.avatar_url || ''} />
                  <AvatarFallback className="text-3xl sm:text-2xl">
                    {selectedProfile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold">{selectedProfile.full_name || 'Anonymous'}</h2>
                  <p className="text-muted-foreground">{selectedProfile.email}</p>
                  {selectedProfile.phone && (
                    <p className="text-muted-foreground">{selectedProfile.phone}</p>
                  )}
                </div>
              </div>

              {selectedProfile.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{selectedProfile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Experience</h3>
                  <p className="text-muted-foreground">{selectedProfile.experience_years || 0} years</p>
                </div>
                {selectedProfile.availability && (
                  <div>
                    <h3 className="font-semibold mb-2">Availability</h3>
                    <p className="text-muted-foreground">{selectedProfile.availability}</p>
                  </div>
                )}
              </div>

              {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.education && (
                <div>
                  <h3 className="font-semibold mb-2">Education</h3>
                  <p className="text-muted-foreground">{selectedProfile.education}</p>
                </div>
              )}

              {selectedProfile.preferred_locations && selectedProfile.preferred_locations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Preferred Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.preferred_locations.map((loc: string) => (
                      <Badge key={loc} variant="outline">{loc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons - stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => handleContactCandidate(selectedProfile.id)} className="flex-1 h-12 sm:h-10">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                {selectedProfile.resume_url && (
                  <Button variant="outline" asChild className="h-12 sm:h-10">
                    <a href={selectedProfile.resume_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ResumeDatabase;
