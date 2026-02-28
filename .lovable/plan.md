
The three partners shown — GCB, Ecobank, and Stanbic — are database records in the `partners` table. The correct fix is a SQL migration to delete them by name.

**File to create:** `supabase/migrations/[timestamp]_remove_gcb_ecobank_stanbic.sql`

```sql
DELETE FROM partners 
WHERE name ILIKE '%GCB%' 
   OR name ILIKE '%Ecobank%' 
   OR name ILIKE '%Stanbic%';
```

That's the only change needed. The partners showcase on the homepage will immediately stop showing these three logos.
