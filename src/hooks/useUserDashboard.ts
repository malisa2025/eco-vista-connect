import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardStats {
  upcomingReservations: number;
  upcomingBookings: number;
  savedJobs: number;
  favoriteBusinesses: number;
}

export interface RecentReservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
  business: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

export interface RecentBooking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  hotel: {
    business: {
      id: string;
      name: string;
      image_url: string | null;
    };
  };
}

export interface RecentApplication {
  id: string;
  applied_at: string;
  status: string;
  job: {
    id: string;
    title: string;
    business: {
      name: string;
    };
  };
}

export interface SavedJob {
  id: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string | null;
    salary_range: string | null;
    business: {
      name: string;
    };
  };
}

export const useUserDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const [reservationsCount, bookingsCount, savedJobsCount, favoritesCount] = await Promise.all([
        // Upcoming reservations
        supabase
          .from('restaurant_reservations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('reservation_date', today)
          .in('status', ['pending', 'confirmed']),
        
        // Upcoming hotel bookings
        supabase
          .from('hotel_bookings')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('check_in_date', today)
          .in('status', ['pending', 'confirmed']),
        
        // Saved jobs
        supabase
          .from('saved_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Favorite businesses
        supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      return {
        upcomingReservations: reservationsCount.count || 0,
        upcomingBookings: bookingsCount.count || 0,
        savedJobs: savedJobsCount.count || 0,
        favoriteBusinesses: favoritesCount.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  // Fetch recent reservations
  const { data: recentReservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['user-dashboard-reservations', user?.id],
    queryFn: async (): Promise<RecentReservation[]> => {
      if (!user?.id) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('restaurant_reservations')
        .select(`
          id,
          reservation_date,
          reservation_time,
          party_size,
          status,
          business:businesses(id, name, image_url)
        `)
        .eq('user_id', user.id)
        .gte('reservation_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('reservation_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return (data || []) as unknown as RecentReservation[];
    },
    enabled: !!user?.id,
  });

  // Fetch recent hotel bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-dashboard-bookings', user?.id],
    queryFn: async (): Promise<RecentBooking[]> => {
      if (!user?.id) return [];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('hotel_bookings')
        .select(`
          id,
          check_in_date,
          check_out_date,
          status,
          hotel:hotel_properties(
            business:businesses(id, name, image_url)
          )
        `)
        .eq('user_id', user.id)
        .gte('check_in_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('check_in_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return (data || []) as unknown as RecentBooking[];
    },
    enabled: !!user?.id,
  });

  // Fetch recent job applications
  const { data: recentApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['user-dashboard-applications', user?.id],
    queryFn: async (): Promise<RecentApplication[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          applied_at,
          status,
          job:jobs(
            id,
            title,
            business:businesses(name)
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data || []) as unknown as RecentApplication[];
    },
    enabled: !!user?.id,
  });

  // Fetch saved jobs
  const { data: savedJobs, isLoading: savedJobsLoading } = useQuery({
    queryKey: ['user-dashboard-saved-jobs', user?.id],
    queryFn: async (): Promise<SavedJob[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          created_at,
          job:jobs(
            id,
            title,
            location,
            salary_range,
            business:businesses(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data || []) as unknown as SavedJob[];
    },
    enabled: !!user?.id,
  });

  return {
    stats: stats || {
      upcomingReservations: 0,
      upcomingBookings: 0,
      savedJobs: 0,
      favoriteBusinesses: 0,
    },
    recentReservations: recentReservations || [],
    recentBookings: recentBookings || [],
    recentApplications: recentApplications || [],
    savedJobs: savedJobs || [],
    isLoading: statsLoading || reservationsLoading || bookingsLoading || applicationsLoading || savedJobsLoading,
  };
};
