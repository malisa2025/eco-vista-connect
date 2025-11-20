interface ExportData {
  [key: string]: string | number | boolean | null;
}

export const exportToCSV = (
  data: ExportData[],
  filename: string,
  headers?: string[]
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAdPerformance = (
  ads: any[],
  filename: string = `ad-performance-${new Date().toISOString().split('T')[0]}`
) => {
  const exportData = ads.map(ad => ({
    'Ad Title': ad.title,
    'Business': ad.businesses?.name || 'N/A',
    'Ad Spot': ad.ad_spots?.name || 'N/A',
    'Status': ad.status,
    'Start Date': ad.start_date,
    'End Date': ad.end_date,
    'Impressions': ad.impressions || 0,
    'Clicks': ad.total_clicks || 0,
    'CTR (%)': ad.ctr || '0.00',
    'Total Cost': ad.total_cost,
  }));

  exportToCSV(exportData, filename);
};

export const exportDailyStats = (
  dailyStats: any[],
  adTitle: string,
  filename?: string
) => {
  const exportData = dailyStats.map(stat => ({
    'Date': stat.date,
    'Impressions': stat.impressions,
    'Clicks': stat.clicks,
    'CTR (%)': stat.impressions > 0 
      ? ((stat.clicks / stat.impressions) * 100).toFixed(2) 
      : '0.00',
  }));

  const defaultFilename = `${adTitle.replace(/\s+/g, '-').toLowerCase()}-daily-stats-${new Date().toISOString().split('T')[0]}`;
  exportToCSV(exportData, filename || defaultFilename);
};
