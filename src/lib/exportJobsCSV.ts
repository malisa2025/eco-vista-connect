export const exportJobsToCSV = (jobs: any[]) => {
  const headers = [
    'Job Title',
    'Business Name',
    'Category',
    'Location',
    'Status',
    'Posted Date',
    'Expires At',
    'Applications',
    'Views',
    'Conversion Rate',
    'Salary Range',
    'Job Type',
    'Experience Level',
  ];

  const rows = jobs.map((job) => [
    job.title,
    job.businesses?.name || '',
    job.category,
    job.location || '',
    job.status,
    new Date(job.posted_at).toLocaleDateString(),
    job.expires_at ? new Date(job.expires_at).toLocaleDateString() : '',
    job.application_count || 0,
    job.views_count || 0,
    job.conversion_rate || '0',
    job.salary_range || '',
    job.job_type,
    job.experience_level,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `jobs-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
