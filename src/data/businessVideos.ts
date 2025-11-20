export interface BusinessVideo {
  id: string;
  title: string;
  description: string;
  category: 'Markets' | 'Startups' | 'Economy' | 'Technology' | 'Property' | 'Agriculture';
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  publishedAt: Date;
  isLive?: boolean;
  isFeatured?: boolean;
}

export const businessVideos: BusinessVideo[] = [
  {
    id: '1',
    title: 'Ghana Stock Exchange Hits 5-Year High',
    description: 'The Ghana Stock Exchange (GSE) composite index reached its highest point in five years, driven by strong performance in banking and telecommunications sectors.',
    category: 'Markets',
    thumbnailUrl: '/demo/tech-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '3:45',
    views: 12500,
    publishedAt: new Date('2024-01-15T10:30:00'),
    isLive: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Tech Startup Raises $2M in Series A Funding',
    description: 'Accra-based fintech startup secures major investment from international venture capital firms to expand operations across West Africa.',
    category: 'Startups',
    thumbnailUrl: '/demo/tech-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '4:20',
    views: 8900,
    publishedAt: new Date('2024-01-14T14:15:00'),
    isFeatured: true
  },
  {
    id: '3',
    title: 'Bank of Ghana Announces New Monetary Policy',
    description: 'Central bank maintains policy rate at 29% as inflation shows signs of stabilization in the fourth quarter.',
    category: 'Economy',
    thumbnailUrl: '/demo/fashion-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '5:10',
    views: 15400,
    publishedAt: new Date('2024-01-14T09:00:00'),
    isFeatured: true
  },
  {
    id: '4',
    title: 'AI Revolution in Ghanaian Healthcare',
    description: 'Local tech companies partner with hospitals to deploy AI-powered diagnostic tools, improving patient outcomes across the country.',
    category: 'Technology',
    thumbnailUrl: '/demo/restaurant-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '6:30',
    views: 7200,
    publishedAt: new Date('2024-01-13T16:45:00')
  },
  {
    id: '5',
    title: 'Accra Real Estate Market Shows Strong Growth',
    description: 'Property prices in prime locations increase by 18% year-over-year as demand for commercial and residential spaces surges.',
    category: 'Property',
    thumbnailUrl: '/demo/restaurant-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '4:55',
    views: 9800,
    publishedAt: new Date('2024-01-13T11:20:00')
  },
  {
    id: '6',
    title: 'Cocoa Exports Reach Record Levels',
    description: 'Ghana cocoa board reports highest export volumes in a decade, boosting foreign exchange reserves and farmer incomes.',
    category: 'Agriculture',
    thumbnailUrl: '/demo/fashion-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '3:30',
    views: 11200,
    publishedAt: new Date('2024-01-12T13:00:00')
  },
  {
    id: '7',
    title: 'Dollar Exchange Rate Stabilizes',
    description: 'The cedi shows resilience against major currencies following successful eurobond issuance and increased remittances.',
    category: 'Markets',
    thumbnailUrl: '/demo/tech-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '2:45',
    views: 13600,
    publishedAt: new Date('2024-01-12T08:30:00')
  },
  {
    id: '8',
    title: 'E-commerce Platform Expands to 5 African Countries',
    description: 'Ghana-founded online marketplace announces expansion plans, creating 500 new jobs across the continent.',
    category: 'Startups',
    thumbnailUrl: '/demo/tech-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    duration: '5:20',
    views: 6800,
    publishedAt: new Date('2024-01-11T15:00:00')
  },
  {
    id: '9',
    title: 'GDP Growth Projections Revised Upward',
    description: 'IMF and World Bank increase growth forecasts for Ghana to 3.8% following strong agricultural and services performance.',
    category: 'Economy',
    thumbnailUrl: '/demo/fashion-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    duration: '4:40',
    views: 10500,
    publishedAt: new Date('2024-01-11T10:15:00')
  },
  {
    id: '10',
    title: '5G Network Rollout Accelerates Nationwide',
    description: 'Major telecom operators announce aggressive 5G deployment plans, promising to cover 70% of urban areas by year-end.',
    category: 'Technology',
    thumbnailUrl: '/demo/restaurant-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '3:15',
    views: 8400,
    publishedAt: new Date('2024-01-10T14:30:00')
  },
  {
    id: '11',
    title: 'New Mixed-Use Development Breaks Ground in Tema',
    description: '$50M investment in integrated commercial and residential complex promises to transform the port city skyline.',
    category: 'Property',
    thumbnailUrl: '/demo/restaurant-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    duration: '5:50',
    views: 7600,
    publishedAt: new Date('2024-01-10T09:45:00')
  },
  {
    id: '12',
    title: 'Smart Farming Technologies Transform Agriculture',
    description: 'IoT sensors and drone technology help farmers optimize yields and reduce water usage by up to 40%.',
    category: 'Agriculture',
    thumbnailUrl: '/demo/fashion-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    duration: '6:10',
    views: 5900,
    publishedAt: new Date('2024-01-09T12:00:00')
  },
  {
    id: '13',
    title: 'Banking Sector Reports Strong Q4 Results',
    description: 'Major banks exceed profit expectations with improved loan quality and growing digital banking adoption.',
    category: 'Markets',
    thumbnailUrl: '/demo/tech-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    duration: '4:25',
    views: 9200,
    publishedAt: new Date('2024-01-09T07:30:00')
  },
  {
    id: '14',
    title: 'Green Energy Startup Secures Government Contract',
    description: 'Solar energy company wins tender to power 100 public schools, marking major milestone in renewable energy push.',
    category: 'Startups',
    thumbnailUrl: '/demo/tech-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '3:55',
    views: 7800,
    publishedAt: new Date('2024-01-08T16:00:00')
  },
  {
    id: '15',
    title: 'Import Duties Adjusted for Key Sectors',
    description: 'Government announces tariff changes aimed at boosting local manufacturing and reducing trade deficit.',
    category: 'Economy',
    thumbnailUrl: '/demo/fashion-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '5:35',
    views: 11800,
    publishedAt: new Date('2024-01-08T11:15:00')
  },
  {
    id: '16',
    title: 'Blockchain Integration in Supply Chain Management',
    description: 'Major logistics companies adopt blockchain technology to improve transparency and reduce fraud in import-export operations.',
    category: 'Technology',
    thumbnailUrl: '/demo/restaurant-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '4:15',
    views: 6500,
    publishedAt: new Date('2024-01-07T13:45:00')
  },
  {
    id: '17',
    title: 'Luxury Apartment Complex Sells Out in Record Time',
    description: 'High-end residential development in Cantonments achieves full occupancy within 3 months of launch.',
    category: 'Property',
    thumbnailUrl: '/demo/restaurant-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '3:40',
    views: 8700,
    publishedAt: new Date('2024-01-07T10:20:00')
  },
  {
    id: '18',
    title: 'Aquaculture Industry Attracts Major Investment',
    description: 'Fish farming sector receives $10M boost as investors recognize potential to meet growing protein demand.',
    category: 'Agriculture',
    thumbnailUrl: '/demo/fashion-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: '5:25',
    views: 4900,
    publishedAt: new Date('2024-01-06T14:50:00')
  },
  {
    id: '19',
    title: 'Gold Prices Drive Mining Sector Growth',
    description: 'Record gold prices boost mining revenues, contributing significantly to export earnings and government revenue.',
    category: 'Markets',
    thumbnailUrl: '/demo/tech-hero.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    duration: '4:05',
    views: 10300,
    publishedAt: new Date('2024-01-06T08:00:00')
  },
  {
    id: '20',
    title: 'EdTech Platform Reaches 1 Million Students',
    description: 'Educational technology startup celebrates milestone, providing digital learning resources to schools across Ghana.',
    category: 'Startups',
    thumbnailUrl: '/demo/tech-logo.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    duration: '3:50',
    views: 9500,
    publishedAt: new Date('2024-01-05T15:30:00')
  }
];

export const getCategoryGradient = (category: BusinessVideo['category']) => {
  const gradients = {
    Markets: 'bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-cyan-500/10',
    Startups: 'bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-pink-500/10',
    Economy: 'bg-gradient-to-br from-green-500/10 via-green-400/5 to-emerald-500/10',
    Technology: 'bg-gradient-to-br from-indigo-500/10 via-indigo-400/5 to-blue-500/10',
    Property: 'bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-amber-500/10',
    Agriculture: 'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-green-500/10'
  };
  return gradients[category];
};

export const getCategoryColor = (category: BusinessVideo['category']) => {
  const colors = {
    Markets: 'text-blue-500',
    Startups: 'text-purple-500',
    Economy: 'text-green-500',
    Technology: 'text-indigo-500',
    Property: 'text-orange-500',
    Agriculture: 'text-teal-500'
  };
  return colors[category];
};
