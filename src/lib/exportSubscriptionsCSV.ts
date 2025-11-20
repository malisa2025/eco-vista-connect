export const exportSubscriptionsToCSV = (subscriptions: any[]) => {
  const headers = [
    'Subscriber Name',
    'Email',
    'Status',
    'Start Date',
    'End Date',
    'Applications Submitted',
    'Last Application',
    'Total Paid (GHS)',
    'Auto Renew',
    'Payment Method',
  ];

  const rows = subscriptions.map((sub) => [
    sub.profiles?.full_name || '',
    sub.profiles?.email || '',
    sub.status,
    new Date(sub.start_date).toLocaleDateString(),
    new Date(sub.end_date).toLocaleDateString(),
    sub.application_count || 0,
    sub.last_application_date
      ? new Date(sub.last_application_date).toLocaleDateString()
      : 'N/A',
    sub.lifetime_value || 0,
    sub.auto_renew ? 'Yes' : 'No',
    sub.payment_method,
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
  link.setAttribute('download', `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportRevenueReport = async (
  startDate: Date,
  endDate: Date,
  payments: any[]
) => {
  const headers = [
    'Date',
    'Payment Reference',
    'Subscriber Email',
    'Amount (GHS)',
    'Status',
    'Payment Method',
  ];

  const filteredPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.paid_at || payment.created_at);
    return paymentDate >= startDate && paymentDate <= endDate;
  });

  const rows = filteredPayments.map((payment) => [
    new Date(payment.paid_at || payment.created_at).toLocaleDateString(),
    payment.payment_reference,
    payment.profiles?.email || '',
    payment.amount,
    payment.status,
    payment.payment_method,
  ]);

  const totalRevenue = filteredPayments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
    '',
    `"Total Revenue","","","${totalRevenue}","",""`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `revenue-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
