-- Update partner logos with realistic Ghana organization logos
UPDATE partners SET logo_url = '/partners/ghana-chamber.png', website_url = 'https://www.ghanachamber.org' 
WHERE name = 'Ghana Chamber of Commerce';

UPDATE partners SET logo_url = '/partners/gepa.png', website_url = 'https://www.gepaghana.org' 
WHERE name = 'Ghana Export Promotion Authority';

UPDATE partners SET logo_url = '/partners/police.png', website_url = 'https://police.gov.gh' 
WHERE name = 'Ghana Police Service';

UPDATE partners SET logo_url = '/partners/bank-of-ghana.png', website_url = 'https://www.bog.gov.gh' 
WHERE name = 'Bank of Ghana';

UPDATE partners SET logo_url = '/partners/gra.png', website_url = 'https://gra.gov.gh' 
WHERE name = 'Ghana Revenue Authority';

UPDATE partners SET logo_url = '/partners/gipc.png', website_url = 'https://www.gipcghana.com' 
WHERE name = 'Ghana Investment Promotion Centre';

UPDATE partners SET logo_url = '/partners/gcb-bank.png', website_url = 'https://www.gcbbank.com.gh' 
WHERE name = 'GCB Bank';

UPDATE partners SET logo_url = '/partners/ecobank.png', website_url = 'https://www.ecobank.com' 
WHERE name = 'Ecobank Ghana';