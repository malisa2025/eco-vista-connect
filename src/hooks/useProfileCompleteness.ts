import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CompletionSection {
  name: string;
  weight: number;
  completed: boolean;
  suggestions?: string[];
}

export const useProfileCompleteness = () => {
  const { profile } = useAuth();

  const sections = useMemo((): CompletionSection[] => {
    if (!profile) return [];

    return [
      {
        name: 'Basic Information',
        weight: 20,
        completed: !!(profile.full_name && profile.phone && profile.bio),
        suggestions: [
          !profile.full_name && 'Add your full name',
          !profile.phone && 'Add your phone number',
          !profile.bio && 'Write a professional bio',
        ].filter(Boolean) as string[],
      },
      {
        name: 'Skills & Expertise',
        weight: 25,
        completed: !!(profile.skills && profile.skills.length >= 3),
        suggestions: [
          (!profile.skills || profile.skills.length < 3) && 'Add at least 3 skills',
        ].filter(Boolean) as string[],
      },
      {
        name: 'Work Experience',
        weight: 20,
        completed: !!(profile.experience_years && profile.experience_years > 0),
        suggestions: [
          !profile.experience_years && 'Add your years of experience',
        ].filter(Boolean) as string[],
      },
      {
        name: 'Education',
        weight: 15,
        completed: !!profile.education,
        suggestions: [
          !profile.education && 'Add your educational background',
        ].filter(Boolean) as string[],
      },
      {
        name: 'Job Preferences',
        weight: 10,
        completed: !!(
          profile.preferred_job_types &&
          profile.preferred_job_types.length > 0 &&
          profile.salary_expectation
        ),
        suggestions: [
          (!profile.preferred_job_types || profile.preferred_job_types.length === 0) &&
            'Set your preferred job types',
          !profile.salary_expectation && 'Add your salary expectations',
        ].filter(Boolean) as string[],
      },
      {
        name: 'Links & Resume',
        weight: 10,
        completed: !!(profile.resume_url || profile.linkedin_url || profile.portfolio_url),
        suggestions: [
          !profile.resume_url && 'Upload your resume',
          !profile.linkedin_url && 'Add your LinkedIn profile',
          !profile.portfolio_url && 'Add your portfolio or website',
        ].filter(Boolean) as string[],
      },
    ];
  }, [profile]);

  const completionPercentage = useMemo(() => {
    return sections.reduce((acc, section) => {
      return acc + (section.completed ? section.weight : 0);
    }, 0);
  }, [sections]);

  const incompleteSections = useMemo(() => {
    return sections.filter((s) => !s.completed);
  }, [sections]);

  return {
    completionPercentage,
    sections,
    incompleteSections,
    isComplete: completionPercentage === 100,
  };
};
