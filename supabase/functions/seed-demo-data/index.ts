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

    if (action === 'delete_advertisements') {
      console.log('Deleting all advertisements...');
      
      const { error: deleteError } = await supabase
        .from('advertisements')
        .delete()
        .not('id', 'is', null);
      
      if (deleteError) {
        console.error('Error deleting advertisements:', deleteError);
        throw deleteError;
      }
      
      console.log('All advertisements deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'All advertisements deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
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
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
        {
          business_id: businesses[1].id,
          ad_spot_id: homeHeroSpot?.id,
          title: 'Prime Properties Ghana',
          description: 'Find your dream home in the heart of Accra and beyond',
          image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
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
          title: 'Premium Auto Care',
          description: 'Your trusted partner for vehicle maintenance and repair',
          image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800',
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
          title: 'Professional Development Institute',
          description: 'Empowering Ghana\'s workforce with world-class training',
          image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          video_thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
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

    if (action === 'hotels' || action === 'all') {
      console.log('Starting to seed hotels...');
      
      // Create Hotels & Accommodation category if not exists
      const { error: categoryError } = await supabase
        .from('business_categories')
        .upsert({
          name: 'Hotels & Accommodation',
          icon: 'Hotel',
          description: 'Hotels, resorts, guest houses, and lodging facilities'
        }, { onConflict: 'name' });

      if (categoryError) {
        console.error('Error creating hotel category:', categoryError);
      }

      // Demo hotels data
      const demoHotels = [
        // Luxury Hotels (3)
        {
          name: 'Kempinski Hotel Gold Coast City',
          description: 'Luxury 5-star hotel on the Atlantic coast offering world-class amenities, stunning ocean views, and exceptional service for discerning travelers.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'Barnes Road, Accra',
          phone: '+233 30 261 0000',
          email: 'reservations@kempinski-accra.com',
          website: 'https://kempinski.com',
          latitude: 5.5600,
          longitude: -0.1870,
          rating: 4.8,
          review_count: 250,
          is_featured: true,
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
          ],
          hotel_data: {
            star_rating: 5,
            total_rooms: 145,
            amenities: ['pool', 'spa', 'gym', 'restaurant', 'wifi', 'parking'],
            rooms: [
              { name: 'Deluxe Room', price: 950, quantity: 30, occupancy: 2, size: 45 },
              { name: 'Executive Suite', price: 1800, quantity: 20, occupancy: 3, size: 65 },
              { name: 'Presidential Suite', price: 4500, quantity: 5, occupancy: 4, size: 120 }
            ]
          }
        },
        {
          name: 'Movenpick Ambassador Hotel Accra',
          description: '5-star luxury business hotel near Kotoka International Airport with modern facilities, conference rooms, and elegant accommodations.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'Independence Avenue, Accra',
          phone: '+233 30 240 1000',
          email: 'hotel.accra@movenpick.com',
          latitude: 5.6037,
          longitude: -0.1870,
          rating: 4.7,
          review_count: 180,
          is_featured: true,
          image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          logo_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
          ],
          hotel_data: {
            star_rating: 5,
            total_rooms: 165,
            amenities: ['pool', 'gym', 'restaurant', 'wifi', 'parking', 'conference'],
            rooms: [
              { name: 'Superior Room', price: 850, quantity: 40, occupancy: 2, size: 38 },
              { name: 'Deluxe Suite', price: 1500, quantity: 25, occupancy: 3, size: 55 },
              { name: 'Ambassador Suite', price: 3800, quantity: 8, occupancy: 4, size: 95 }
            ]
          }
        },
        {
          name: 'Royal Senchi Resort & Hotel',
          description: '4-star resort hotel on the banks of the Volta River offering leisure activities, water sports, and breathtaking natural surroundings.',
          category: 'Hotels & Accommodation',
          region: 'Eastern',
          address: 'Akosombo, Eastern Region',
          phone: '+233 30 252 8000',
          email: 'info@royalsenchi.com',
          latitude: 6.2640,
          longitude: 0.0656,
          rating: 4.5,
          review_count: 145,
          is_featured: true,
          image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          logo_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
            'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800'
          ],
          hotel_data: {
            star_rating: 4,
            total_rooms: 85,
            amenities: ['pool', 'restaurant', 'wifi', 'parking', 'waterfront'],
            rooms: [
              { name: 'Standard Room', price: 450, quantity: 35, occupancy: 2, size: 32 },
              { name: 'Resort Suite', price: 750, quantity: 20, occupancy: 3, size: 48 },
              { name: 'Royal Villa', price: 1200, quantity: 10, occupancy: 4, size: 70 }
            ]
          }
        },
        // Mid-Range Hotels (4)
        {
          name: 'Alisa Hotel North Ridge',
          description: '3-star boutique hotel in central Accra offering comfortable rooms, excellent dining, and convenient access to business districts.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'North Ridge, Accra',
          phone: '+233 30 221 2300',
          email: 'reservations@alisahotels.com',
          latitude: 5.5750,
          longitude: -0.1960,
          rating: 4.2,
          review_count: 120,
          image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          logo_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
            'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800'
          ],
          hotel_data: {
            star_rating: 3,
            total_rooms: 55,
            amenities: ['restaurant', 'wifi', 'parking'],
            rooms: [
              { name: 'Standard Room', price: 350, quantity: 30, occupancy: 2, size: 28 },
              { name: 'Superior Room', price: 550, quantity: 20, occupancy: 2, size: 35 },
              { name: 'Family Suite', price: 850, quantity: 5, occupancy: 4, size: 50 }
            ]
          }
        },
        {
          name: 'Lancaster Hotel Kumasi',
          description: '3-star hotel in the heart of Kumasi providing modern amenities, local hospitality, and easy access to cultural attractions.',
          category: 'Hotels & Accommodation',
          region: 'Ashanti',
          address: 'Harper Road, Kumasi',
          phone: '+233 32 202 4830',
          email: 'info@lancasterhotel.com.gh',
          latitude: 6.6885,
          longitude: -1.6244,
          rating: 4.1,
          review_count: 95,
          image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
          logo_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
            'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
            'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800'
          ],
          hotel_data: {
            star_rating: 3,
            total_rooms: 48,
            amenities: ['restaurant', 'wifi', 'parking', 'gym'],
            rooms: [
              { name: 'Standard Room', price: 320, quantity: 28, occupancy: 2, size: 26 },
              { name: 'Deluxe Room', price: 480, quantity: 15, occupancy: 2, size: 32 },
              { name: 'Executive Suite', price: 720, quantity: 5, occupancy: 3, size: 45 }
            ]
          }
        },
        {
          name: 'Best Western Plus Atlantic Hotel',
          description: '3-star international hotel in Takoradi catering to business travelers in the oil and gas industry with modern facilities.',
          category: 'Hotels & Accommodation',
          region: 'Western',
          address: 'John Sarbah Road, Takoradi',
          phone: '+233 31 202 0950',
          email: 'info@atlantichoteltakoradi.com',
          latitude: 4.8970,
          longitude: -1.7573,
          rating: 4.0,
          review_count: 110,
          image_url: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
          logo_url: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800',
            'https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800',
            'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800'
          ],
          hotel_data: {
            star_rating: 3,
            total_rooms: 62,
            amenities: ['pool', 'restaurant', 'wifi', 'parking', 'gym'],
            rooms: [
              { name: 'Standard Room', price: 380, quantity: 35, occupancy: 2, size: 30 },
              { name: 'Business Suite', price: 620, quantity: 20, occupancy: 2, size: 40 },
              { name: 'Atlantic Suite', price: 900, quantity: 7, occupancy: 3, size: 55 }
            ]
          }
        },
        {
          name: 'Miklin Hotel Ho',
          description: '3-star hotel in the Volta Region capital offering comfortable stays with mountain views and regional hospitality.',
          category: 'Hotels & Accommodation',
          region: 'Volta',
          address: 'Kpodzi Street, Ho',
          phone: '+233 36 202 6221',
          email: 'reservations@miklinhotel.com',
          latitude: 6.6111,
          longitude: 0.4720,
          rating: 3.9,
          review_count: 75,
          image_url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
          logo_url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800',
            'https://images.unsplash.com/photo-1584132905271-512c958d674a?w=800',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
          ],
          hotel_data: {
            star_rating: 3,
            total_rooms: 40,
            amenities: ['restaurant', 'wifi', 'parking'],
            rooms: [
              { name: 'Standard Room', price: 280, quantity: 22, occupancy: 2, size: 25 },
              { name: 'Superior Room', price: 420, quantity: 15, occupancy: 2, size: 32 },
              { name: 'Family Room', price: 650, quantity: 3, occupancy: 4, size: 45 }
            ]
          }
        },
        // Budget Hotels (3)
        {
          name: 'Ibis Styles Accra Airport',
          description: 'Modern 2-star budget hotel near the airport offering clean, comfortable rooms and efficient service for travelers.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'Airport City, Accra',
          phone: '+233 30 274 4200',
          email: 'h9736@accor.com',
          latitude: 5.6052,
          longitude: -0.1667,
          rating: 3.8,
          review_count: 140,
          image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
          logo_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
            'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800',
            'https://images.unsplash.com/photo-1631049552240-59c37f3a6c56?w=800'
          ],
          hotel_data: {
            star_rating: 2,
            total_rooms: 72,
            amenities: ['restaurant', 'wifi', 'parking'],
            rooms: [
              { name: 'Economy Room', price: 180, quantity: 45, occupancy: 2, size: 20 },
              { name: 'Standard Room', price: 260, quantity: 27, occupancy: 2, size: 24 }
            ]
          }
        },
        {
          name: 'African Regent Hotel',
          description: '2-star budget hotel in Accra providing affordable accommodation with basic amenities for cost-conscious travelers.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'Barnes Road, Accra',
          phone: '+233 30 276 1640',
          email: 'info@africanregenthotel.com',
          latitude: 5.5580,
          longitude: -0.1850,
          rating: 3.5,
          review_count: 88,
          image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
          logo_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
            'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=800',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
          ],
          hotel_data: {
            star_rating: 2,
            total_rooms: 55,
            amenities: ['wifi', 'parking'],
            rooms: [
              { name: 'Economy Room', price: 150, quantity: 35, occupancy: 2, size: 18 },
              { name: 'Standard Room', price: 220, quantity: 20, occupancy: 2, size: 22 }
            ]
          }
        },
        {
          name: 'Coconut Grove Beach Resort',
          description: '2-star beachfront hotel in Cape Coast offering budget-friendly stays near historic sites and beautiful beaches.',
          category: 'Hotels & Accommodation',
          region: 'Central',
          address: 'Cape Coast Road',
          phone: '+233 33 213 2100',
          email: 'info@coconutgrovegh.com',
          latitude: 5.1054,
          longitude: -1.2466,
          rating: 3.7,
          review_count: 105,
          image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
          logo_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800',
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
          ],
          hotel_data: {
            star_rating: 2,
            total_rooms: 38,
            amenities: ['restaurant', 'wifi', 'beach'],
            rooms: [
              { name: 'Standard Room', price: 200, quantity: 25, occupancy: 2, size: 22 },
              { name: 'Beach View Room', price: 300, quantity: 13, occupancy: 2, size: 26 }
            ]
          }
        },
        // Guest Houses (5)
        {
          name: 'Aylos Bay Guest House',
          description: 'Charming beachfront guest house in Cape Coast offering personalized service, home-cooked meals, and a cozy family atmosphere.',
          category: 'Hotels & Accommodation',
          region: 'Central',
          address: 'Elmina Beach Road, Cape Coast',
          phone: '+233 24 345 6789',
          email: 'stay@aylosbay.com',
          latitude: 5.0836,
          longitude: -1.3547,
          rating: 4.3,
          review_count: 62,
          image_url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          logo_url: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
            'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800',
            'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=800'
          ],
          hotel_data: {
            star_rating: 0,
            total_rooms: 10,
            amenities: ['wifi', 'beach', 'restaurant'],
            rooms: [
              { name: 'Single Room', price: 120, quantity: 4, occupancy: 1, size: 16 },
              { name: 'Double Room', price: 180, quantity: 4, occupancy: 2, size: 20 },
              { name: 'Family Room', price: 320, quantity: 2, occupancy: 4, size: 32 }
            ]
          }
        },
        {
          name: 'Palm Lodge Guest House',
          description: 'Peaceful guest house in residential Accra with garden setting, personalized attention, and local hospitality.',
          category: 'Hotels & Accommodation',
          region: 'Greater Accra',
          address: 'Cantonments, Accra',
          phone: '+233 20 123 4567',
          email: 'info@palmlodgegh.com',
          latitude: 5.5692,
          longitude: -0.1778,
          rating: 4.0,
          review_count: 45,
          image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
          logo_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
            'https://images.unsplash.com/photo-1609766975228-e4f91972d2bb?w=800',
            'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=800'
          ],
          hotel_data: {
            star_rating: 0,
            total_rooms: 8,
            amenities: ['wifi', 'parking', 'garden'],
            rooms: [
              { name: 'Single Room', price: 100, quantity: 3, occupancy: 1, size: 14 },
              { name: 'Double Room', price: 160, quantity: 4, occupancy: 2, size: 18 },
              { name: 'Twin Room', price: 160, quantity: 1, occupancy: 2, size: 18 }
            ]
          }
        },
        {
          name: 'Volta Serene Guest House',
          description: 'Eco-friendly guest house in the Volta Region offering nature views, tranquility, and authentic local experiences.',
          category: 'Hotels & Accommodation',
          region: 'Volta',
          address: 'Wli Waterfalls Road, Hohoe',
          phone: '+233 24 987 6543',
          email: 'hello@voltaserene.com',
          latitude: 7.1508,
          longitude: 0.4720,
          rating: 4.2,
          review_count: 38,
          image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          logo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=800',
            'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800'
          ],
          hotel_data: {
            star_rating: 0,
            total_rooms: 12,
            amenities: ['wifi', 'restaurant', 'nature'],
            rooms: [
              { name: 'Standard Room', price: 90, quantity: 6, occupancy: 2, size: 16 },
              { name: 'Deluxe Room', price: 140, quantity: 4, occupancy: 2, size: 20 },
              { name: 'Family Room', price: 240, quantity: 2, occupancy: 4, size: 30 }
            ]
          }
        },
        {
          name: 'Elmina Beach Resort Guest House',
          description: 'Historic guest house near Elmina Castle offering cultural tours, beach access, and traditional Ghanaian hospitality.',
          category: 'Hotels & Accommodation',
          region: 'Central',
          address: 'Coconut Grove, Elmina',
          phone: '+233 33 221 4321',
          email: 'stay@elminabeachgh.com',
          latitude: 5.0836,
          longitude: -1.3487,
          rating: 3.9,
          review_count: 52,
          image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          logo_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
          ],
          hotel_data: {
            star_rating: 0,
            total_rooms: 14,
            amenities: ['wifi', 'beach', 'restaurant'],
            rooms: [
              { name: 'Single Room', price: 110, quantity: 6, occupancy: 1, size: 15 },
              { name: 'Double Room', price: 170, quantity: 6, occupancy: 2, size: 19 },
              { name: 'Family Suite', price: 300, quantity: 2, occupancy: 4, size: 35 }
            ]
          }
        },
        {
          name: 'Kingsway Guest House Kumasi',
          description: 'Budget-friendly guest house in central Kumasi offering clean rooms, local charm, and easy access to markets and attractions.',
          category: 'Hotels & Accommodation',
          region: 'Ashanti',
          address: 'Adum, Kumasi',
          phone: '+233 32 202 1234',
          email: 'info@kingswaygh.com',
          latitude: 6.6954,
          longitude: -1.6257,
          rating: 3.6,
          review_count: 41,
          image_url: 'https://images.unsplash.com/photo-1631049552240-59c37f3a6c56?w=800',
          logo_url: 'https://images.unsplash.com/photo-1631049552240-59c37f3a6c56?w=200',
          gallery_images: [
            'https://images.unsplash.com/photo-1631049552240-59c37f3a6c56?w=800',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
            'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800'
          ],
          hotel_data: {
            star_rating: 0,
            total_rooms: 15,
            amenities: ['wifi', 'parking'],
            rooms: [
              { name: 'Single Room', price: 80, quantity: 7, occupancy: 1, size: 12 },
              { name: 'Double Room', price: 130, quantity: 6, occupancy: 2, size: 16 },
              { name: 'Twin Room', price: 130, quantity: 2, occupancy: 2, size: 16 }
            ]
          }
        }
      ];

      // Insert businesses and create hotel properties
      for (const hotelData of demoHotels) {
        const { hotel_data, ...businessData } = hotelData;
        
        // Create business
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .insert(businessData)
          .select()
          .single();

        if (businessError || !business) {
          console.error('Error creating hotel business:', businessError);
          continue;
        }

        // Create hotel property
        const { data: hotelProperty, error: hotelError } = await supabase
          .from('hotel_properties')
          .insert({
            business_id: business.id,
            star_rating: hotel_data.star_rating || null,
            check_in_time: '14:00',
            check_out_time: '11:00',
            cancellation_policy: hotel_data.star_rating >= 4 
              ? 'Free cancellation up to 48 hours before check-in. 50% charge for cancellations within 48 hours.' 
              : 'Free cancellation up to 24 hours before check-in. Full charge for no-shows.',
            house_rules: 'Check-in: 2:00 PM | Check-out: 11:00 AM | No smoking | Pets not allowed | Children welcome',
            parking_available: hotel_data.amenities.includes('parking'),
            wifi_available: hotel_data.amenities.includes('wifi'),
            restaurant_on_site: hotel_data.amenities.includes('restaurant'),
            pool_available: hotel_data.amenities.includes('pool'),
            gym_available: hotel_data.amenities.includes('gym'),
            spa_available: hotel_data.amenities.includes('spa'),
            total_rooms: hotel_data.total_rooms
          })
          .select()
          .single();

        if (hotelError || !hotelProperty) {
          console.error('Error creating hotel property:', hotelError);
          continue;
        }

        // Create room types
        for (const roomData of hotel_data.rooms) {
          const { error: roomError } = await supabase
            .from('room_types')
            .insert({
              hotel_id: hotelProperty.id,
              name: roomData.name,
              description: `Comfortable ${roomData.name.toLowerCase()} with modern amenities`,
              max_occupancy: roomData.occupancy,
              bed_configuration: roomData.occupancy === 1 ? '1 Single Bed' : 
                                roomData.occupancy === 2 ? '1 Queen Bed' :
                                roomData.occupancy === 3 ? '1 King Bed + 1 Single Bed' :
                                '1 King Bed + 2 Single Beds',
              room_size_sqm: roomData.size,
              base_price_per_night: roomData.price,
              quantity: roomData.quantity,
              images: businessData.gallery_images,
              amenities: ['Air Conditioning', 'Flat-screen TV', 'Private Bathroom', 'Free Toiletries'],
              is_active: true
            });

          if (roomError) {
            console.error('Error creating room type:', roomError);
          }
        }

        // Create hotel amenities
        const amenityList = [
          { name: '24-hour Front Desk', type: 'service', icon: 'Clock' },
          { name: 'Free WiFi', type: 'connectivity', icon: 'Wifi' },
          { name: 'Room Service', type: 'service', icon: 'Bell' },
          { name: 'Luggage Storage', type: 'service', icon: 'Luggage' }
        ];

        if (hotel_data.amenities.includes('parking')) {
          amenityList.push({ name: 'Free Parking', type: 'facility', icon: 'Parking' });
        }
        if (hotel_data.amenities.includes('pool')) {
          amenityList.push({ name: 'Swimming Pool', type: 'facility', icon: 'Pool' });
        }
        if (hotel_data.amenities.includes('gym')) {
          amenityList.push({ name: 'Fitness Center', type: 'facility', icon: 'Gym' });
        }
        if (hotel_data.amenities.includes('spa')) {
          amenityList.push({ name: 'Spa & Wellness', type: 'facility', icon: 'Spa' });
        }
        if (hotel_data.amenities.includes('restaurant')) {
          amenityList.push({ name: 'Restaurant', type: 'dining', icon: 'Restaurant' });
        }

        for (const amenity of amenityList) {
          await supabase.from('hotel_amenities').insert({
            hotel_id: hotelProperty.id,
            amenity_name: amenity.name,
            amenity_type: amenity.type,
            icon: amenity.icon
          });
        }
      }

      console.log('Hotels seeded successfully');
      result = { success: true, message: 'Hotels seeded successfully' };
    }

    if (action === 'delete_hotels') {
      console.log('Deleting all hotel data...');
      
      // Get all hotel businesses
      const { data: hotelBusinesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id')
        .eq('category', 'Hotels & Accommodation');

      if (fetchError) {
        console.error('Error fetching hotels:', fetchError);
        throw fetchError;
      }

      if (hotelBusinesses && hotelBusinesses.length > 0) {
        const businessIds = hotelBusinesses.map(b => b.id);
        
        // Delete businesses (cascading will handle hotel_properties, room_types, etc.)
        const { error: deleteError } = await supabase
          .from('businesses')
          .delete()
          .in('id', businessIds);

        if (deleteError) {
          console.error('Error deleting hotels:', deleteError);
          throw deleteError;
        }
      }

      console.log('All hotels deleted successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'All hotels deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'all') {
      result = { success: true, message: 'All demo data seeded successfully (jobs, ads, galleries, hotels)' };
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
