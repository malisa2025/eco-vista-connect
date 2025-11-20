interface AdPerformance {
  impressions: number;
  clicks: number;
  ctr: number;
  daysActive: number;
  status: string;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  recommendation?: string;
}

export const analyzeAdPerformance = (ad: AdPerformance): Insight[] => {
  const insights: Insight[] = [];
  const { impressions, clicks, ctr, daysActive, status } = ad;

  // CTR Analysis
  if (daysActive >= 7) {
    if (ctr < 1) {
      insights.push({
        type: 'danger',
        title: 'Low Click-Through Rate',
        message: `Your CTR of ${ctr.toFixed(2)}% is below the recommended 1% threshold.`,
        recommendation: 'Consider updating your ad image or adjusting your targeting to improve engagement.',
      });
    } else if (ctr >= 3) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance',
        message: `Your CTR of ${ctr.toFixed(2)}% is performing above average!`,
        recommendation: 'Great work! Consider extending this ad campaign.',
      });
    } else if (ctr >= 1 && ctr < 2) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        message: `Your CTR of ${ctr.toFixed(2)}% is average.`,
        recommendation: 'Test different ad copy or images to boost engagement.',
      });
    }
  }

  // Impression Analysis
  if (impressions === 0 && daysActive >= 2) {
    insights.push({
      type: 'danger',
      title: 'No Impressions',
      message: 'Your ad has not received any impressions yet.',
      recommendation: 'Check if your ad is properly configured and active in the right ad spot.',
    });
  } else if (impressions > 0 && clicks === 0 && daysActive >= 3) {
    insights.push({
      type: 'warning',
      title: 'No Clicks Yet',
      message: `Your ad has ${impressions} impressions but no clicks.`,
      recommendation: 'Your ad is being seen but not clicked. Try a more compelling call-to-action or image.',
    });
  }

  // Status insights
  if (status === 'paused') {
    insights.push({
      type: 'info',
      title: 'Ad Paused',
      message: 'This ad is currently paused and not receiving impressions.',
      recommendation: 'Resume your ad to continue reaching customers.',
    });
  }

  return insights;
};

export const getRecommendations = (ctr: number, platformAvgCTR: number = 2.5): string[] => {
  const recommendations: string[] = [];

  if (ctr < platformAvgCTR * 0.5) {
    recommendations.push('Update your ad image with a more eye-catching visual');
    recommendations.push('Revise your ad title to be more compelling');
    recommendations.push('Consider targeting a different ad spot location');
    recommendations.push('Test your ad during different times of day');
  } else if (ctr < platformAvgCTR) {
    recommendations.push('A/B test different ad images');
    recommendations.push('Add urgency to your call-to-action');
    recommendations.push('Ensure your landing page matches ad expectations');
  } else {
    recommendations.push('This ad is performing well! Consider increasing budget.');
    recommendations.push('Replicate this ad creative for other campaigns');
    recommendations.push('Share learnings with other ad campaigns');
  }

  return recommendations;
};

export const compareToBenchmark = (ctr: number, avgCTR: number = 2.5): string => {
  const difference = ((ctr - avgCTR) / avgCTR) * 100;
  
  if (difference > 20) {
    return `Your CTR is ${Math.abs(difference).toFixed(0)}% above the platform average. Excellent!`;
  } else if (difference > 0) {
    return `Your CTR is ${Math.abs(difference).toFixed(0)}% above the platform average.`;
  } else if (difference > -20) {
    return `Your CTR is ${Math.abs(difference).toFixed(0)}% below the platform average.`;
  } else {
    return `Your CTR is ${Math.abs(difference).toFixed(0)}% below the platform average. Needs improvement.`;
  }
};

export const calculateCostPerClick = (totalCost: number, clicks: number): string => {
  if (clicks === 0) return 'N/A';
  return `GH₵${(totalCost / clicks).toFixed(2)}`;
};

export const estimateReach = (impressions: number): string => {
  // Estimate unique users (assuming ~60% unique views)
  const estimatedReach = Math.floor(impressions * 0.6);
  if (estimatedReach >= 1000) {
    return `~${(estimatedReach / 1000).toFixed(1)}K users`;
  }
  return `~${estimatedReach} users`;
};
