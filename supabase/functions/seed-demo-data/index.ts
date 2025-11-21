import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { action } = await req.json();
    console.log('Seeding action:', action);

    let result = { success: false, message: '' };

    if (action === 'jobs' || action === 'all') {
      console.log('Starting to seed jobs...');
      
      // Get first 5 businesses
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('id')
        .limit(5);

      if (bizError || !businesses || businesses.length === 0) {
        console.error('No businesses found:', bizError);
        throw new Error('No businesses available. Please seed businesses first.');
      }

      const demoJobs = [
        {
          business_id: businesses[0].id,
          title: 'Senior Software Engineer',
          description: 'We are looking for an experienced software engineer to join our growing team.',
          category: 'Technology',
          job_type: 'full_time',
          experience_level: 'senior',
          location: 'Accra, Ghana',
          salary_range: 'GHS 8,000 - 12,000/month',
          requirements: '5+ years experience in software development\nProficiency in React and Node.js\nStrong problem-solving skills',
          responsibilities: 'Lead development of new features\nMentor junior developers\nCode review and quality assurance',
          status: 'active',
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[1].id,
          title: 'Digital Marketing Manager',
          description: 'Join our marketing team to drive digital campaigns and brand awareness.',
          category: 'Marketing',
          job_type: 'full_time',
          experience_level: 'mid',
          location: 'Kumasi, Ghana',
          salary_range: 'GHS 5,000 - 8,000/month',
          requirements: '3+ years in digital marketing\nSEO and SEM expertise\nData-driven approach',
          responsibilities: 'Develop marketing strategies\nManage social media campaigns\nAnalyze campaign performance',
          status: 'active',
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[2].id,
          title: 'Head Chef',
          description: 'Seeking an experienced chef to lead our kitchen team.',
          category: 'Hospitality',
          job_type: 'full_time',
          experience_level: 'senior',
          location: 'Accra, Ghana',
          salary_range: 'GHS 6,000 - 10,000/month',
          requirements: 'Culinary degree or equivalent\n7+ years experience\nMenu planning expertise',
          responsibilities: 'Oversee kitchen operations\nCreate innovative menus\nManage kitchen staff',
          status: 'active',
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[3].id,
          title: 'Data Analyst',
          description: 'Analyze business data to provide actionable insights.',
          category: 'Technology',
          job_type: 'full_time',
          experience_level: 'mid',
          location: 'Kumasi, Ghana',
          salary_range: 'GHS 4,500 - 7,000/month',
          requirements: 'Strong SQL and Excel skills\n2+ years experience\nStatistical analysis knowledge',
          responsibilities: 'Create reports and dashboards\nAnalyze trends\nPresent findings to stakeholders',
          status: 'active',
          posted_at: new Date().toISOString(),
        },
        {
          business_id: businesses[4].id,
          title: 'Sales Representative',
          description: 'Drive sales growth and build customer relationships.',
          category: 'Sales',
          job_type: 'full_time',
          experience_level: 'entry',
          location: 'Kumasi, Ghana',
          salary_range: 'GHS 3,000 - 5,000/month + Commission',
          requirements: 'Excellent communication skills\nSales experience preferred\nCustomer-focused mindset',
          responsibilities: 'Generate leads\nClose sales deals\nMaintain customer relationships',
          status: 'active',
          posted_at: new Date().toISOString(),
        },
      ];

      const { error: jobsError } = await supabase.from('jobs').insert(demoJobs);
      
      if (jobsError) {
        console.error('Error inserting jobs:', jobsError);
        throw jobsError;
      }
      
      console.log('Jobs seeded successfully');
      result = { success: true, message: 'Jobs seeded successfully' };
    }

    if (action === 'advertisements' || action === 'all') {
      console.log('Starting to seed advertisements...');
      
      // Get businesses and ad spots
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('id')
        .limit(5);

      const { data: adSpots, error: spotsError } = await supabase
        .from('ad_spots')
        .select('id, location, price_per_day');

      if (bizError || !businesses || businesses.length === 0) {
        throw new Error('No businesses available for ads');
      }
      
      if (spotsError || !adSpots || adSpots.length === 0) {
        throw new Error('No ad spots available');
      }

      const homeHeroSpot = adSpots.find(spot => spot.location === 'home_hero');
      const sidebarSpot = adSpots.find(spot => spot.location === 'home_sidebar');
      const businessListSpot = adSpots.find(spot => spot.location === 'business_list_top');

      // Video ads for home_hero carousel
      const videoAds = [
        {
          business_id: businesses[0].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Taste of Ghana - Authentic Cuisine',
          description: 'Experience the rich flavors of Ghanaian cuisine at our award-winning restaurant',
          image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[1].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Fashion Forward Ghana',
          description: 'Discover the latest trends in Ghanaian fashion and style',
          image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[2].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Tech Innovation Hub',
          description: 'Leading the way in technology and innovation across West Africa',
          image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[3]?.id || businesses[0].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Wellness & Spa Retreat',
          description: 'Relax and rejuvenate at Ghana\'s premier wellness center',
          image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[4]?.id || businesses[1].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Arts & Culture Gallery',
          description: 'Celebrating Ghanaian art, culture, and heritage',
          image_url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[0].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Fitness & Sports Center',
          description: 'Your journey to better health starts here',
          image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
          video_url: 'https://customer-2p6sx6trhhf4rpgy.cloudflarestream.com/d29d16dd888b8c173bc2aba21962048a/downloads/default.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
          video_duration: 60,
          link_url: '/business-news',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (homeHeroSpot?.price_per_day || 100) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_VIDEO_' + Math.random().toString(36).substr(2, 9)
        },
      ];

      // Regular image ads for sidebar and other locations
      const imageAds = [
        {
          business_id: businesses[1].id,
          ad_spot_id: sidebarSpot?.id,
          title: 'Featured Restaurant',
          description: 'Best dining experience in Accra',
          image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
          link_url: '#',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (sidebarSpot?.price_per_day || 50) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_IMG_' + Math.random().toString(36).substr(2, 9)
        },
        {
          business_id: businesses[2].id,
          ad_spot_id: businessListSpot?.id,
          title: 'Shop Local',
          description: 'Support local businesses',
          image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          link_url: '#',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_cost: (businessListSpot?.price_per_day || 50) * 30,
          status: 'active',
          payment_status: 'success',
          paid_at: new Date().toISOString(),
          payment_reference: 'DEMO_IMG_' + Math.random().toString(36).substr(2, 9)
        },
      ];

      const allAds = [...videoAds, ...imageAds];

      const { error: adsError } = await supabase.from('advertisements').insert(allAds);
      
      if (adsError) {
        console.error('Error inserting ads:', adsError);
        throw adsError;
      }
      
      console.log('Advertisements seeded successfully');
      result = { success: true, message: 'Advertisements seeded successfully' };
    }

    if (action === 'galleries' || action === 'all') {
      console.log('Starting to seed galleries...');
      
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('id, category');

      if (bizError || !businesses) {
        throw new Error('Failed to fetch businesses');
      }

      const categoryImages = {
        fashion: {
          gallery: ['/demo/fashion-hero.jpg', '/demo/fashion-logo.jpg', '/demo/fashion-hero.jpg'],
          image: '/demo/fashion-hero.jpg',
          logo: '/demo/fashion-logo.jpg',
          video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        restaurant: {
          gallery: ['/demo/restaurant-hero.jpg', '/demo/restaurant-logo.jpg', '/demo/restaurant-hero.jpg'],
          image: '/demo/restaurant-hero.jpg',
          logo: '/demo/restaurant-logo.jpg',
          video: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        },
        technology: {
          gallery: ['/demo/tech-hero.jpg', '/demo/tech-logo.jpg', '/demo/tech-hero.jpg'],
          image: '/demo/tech-hero.jpg',
          logo: '/demo/tech-logo.jpg',
          video: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        },
      };

      for (const business of businesses) {
        const category = business.category?.toLowerCase() || '';
        let images = categoryImages.technology; // default

        if (category.includes('fashion') || category.includes('clothing')) {
          images = categoryImages.fashion;
        } else if (category.includes('restaurant') || category.includes('food') || category.includes('hospitality')) {
          images = categoryImages.restaurant;
        }

        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            gallery_images: images.gallery,
            image_url: images.image,
            logo_url: images.logo,
            video_url: images.video,
          })
          .eq('id', business.id);

        if (updateError) {
          console.error(`Error updating business ${business.id}:`, updateError);
        }
      }
      
      console.log('Galleries seeded successfully');
      result = { success: true, message: 'Galleries seeded successfully' };
    }

    if (action === 'all') {
      result = { success: true, message: 'All demo data seeded successfully' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in seed-demo-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to seed demo data';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
