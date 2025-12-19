import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, FileText, Briefcase, GraduationCap, Settings, Link as LinkIcon } from 'lucide-react';
import ProfileCompletenessBar from '@/components/profile/ProfileCompletenessBar';
import SkillsManager from '@/components/profile/SkillsManager';
import PreferencesSection from '@/components/profile/PreferencesSection';
import LinksSection from '@/components/profile/LinksSection';
import { EmailPreferences } from '@/components/profile/EmailPreferences';
import EducationSection from '@/components/profile/EducationSection';

const Profile = () => {
  const { profile, roles, updateProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    experience_years: profile?.experience_years || 0,
    education: profile?.education || '',
    linkedin_url: profile?.linkedin_url || '',
    github_url: profile?.github_url || '',
    portfolio_url: profile?.portfolio_url || '',
    resume_url: profile?.resume_url || '',
    preferred_job_types: profile?.preferred_job_types || [],
    preferred_locations: profile?.preferred_locations || [],
    salary_expectation: profile?.salary_expectation || '',
    availability: profile?.availability || 'immediate',
  });

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        experience_years: profile.experience_years || 0,
        education: profile.education || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        resume_url: profile.resume_url || '',
        preferred_job_types: profile.preferred_job_types || [],
        preferred_locations: profile.preferred_locations || [],
        salary_expectation: profile.salary_expectation || '',
        availability: profile.availability || 'immediate',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(formData);
  };

  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Header Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{profile?.full_name || 'User'}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {profile?.email}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {roles.map(role => (
                        <Badge key={role} variant="secondary">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Completeness */}
            <ProfileCompletenessBar />

            {/* Tabbed Profile Editor */}
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-7 text-xs md:text-sm">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="professional">Pro</TabsTrigger>
                    <TabsTrigger value="education">Edu</TabsTrigger>
                    <TabsTrigger value="preferences">Prefs</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="notifications">Notify</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{profile?.experience_years || 0}</p>
                            <p className="text-sm text-muted-foreground">Years Experience</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">{profile?.skills?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Skills</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <LinkIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <p className="text-2xl font-bold">
                              {[profile?.linkedin_url, profile?.github_url, profile?.portfolio_url, profile?.resume_url].filter(Boolean).length}
                            </p>
                            <p className="text-sm text-muted-foreground">Links Added</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="basic" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">
                        <User className="inline h-4 w-4 mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="inline h-4 w-4 mr-2" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">
                        <FileText className="inline h-4 w-4 mr-2" />
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={6}
                        placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                      />
                    </div>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </TabsContent>

                  <TabsContent value="professional" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label>
                        <Briefcase className="inline h-4 w-4 mr-2" />
                        Years of Experience
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Skills & Expertise</Label>
                      <SkillsManager
                        skills={formData.skills}
                        onChange={(skills) => setFormData({ ...formData, skills })}
                      />
                    </div>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-6">
                    <EducationSection
                      education={formData.education}
                      onChange={(education) => setFormData({ ...formData, education })}
                    />
                    <Button onClick={handleSave}>Save Changes</Button>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-4 mt-6">
                    <PreferencesSection
                      preferredJobTypes={formData.preferred_job_types}
                      preferredLocations={formData.preferred_locations}
                      salaryExpectation={formData.salary_expectation}
                      availability={formData.availability}
                      onJobTypesChange={(types) => setFormData({ ...formData, preferred_job_types: types })}
                      onLocationsChange={(locations) => setFormData({ ...formData, preferred_locations: locations })}
                      onSalaryChange={(salary) => setFormData({ ...formData, salary_expectation: salary })}
                      onAvailabilityChange={(availability) => setFormData({ ...formData, availability })}
                    />
                    <Button onClick={handleSave}>Save Changes</Button>
                  </TabsContent>

                  <TabsContent value="links" className="space-y-4 mt-6">
                    <LinksSection
                      linkedinUrl={formData.linkedin_url}
                      githubUrl={formData.github_url}
                      portfolioUrl={formData.portfolio_url}
                      resumeUrl={formData.resume_url}
                      userId={user?.id || ''}
                      onLinkedinChange={(url) => setFormData({ ...formData, linkedin_url: url })}
                      onGithubChange={(url) => setFormData({ ...formData, github_url: url })}
                      onPortfolioChange={(url) => setFormData({ ...formData, portfolio_url: url })}
                      onResumeUrlChange={(url) => setFormData({ ...formData, resume_url: url })}
                    />
                    <Button onClick={handleSave}>Save Changes</Button>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-4 mt-6">
                    <EmailPreferences />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
