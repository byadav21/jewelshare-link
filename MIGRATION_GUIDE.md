# Complete Migration Guide: Lovable Cloud → Direct Supabase

## Overview
This guide will help you migrate your Jewelry Catalog application from Lovable Cloud to your own Supabase project.

---

## Step 1: Create New Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Project Name**: `jewelry-catalog` (or your choice)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
4. Wait for project to finish provisioning (~2 minutes)

---

## Step 2: Run Database Migration

1. In your new Supabase project, go to **SQL Editor**
2. Open the file `migration-to-supabase.sql` from your project
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run** (wait for "Success" message)

This creates:
- ✅ All 10 tables
- ✅ All database functions
- ✅ All triggers
- ✅ All RLS policies
- ✅ Storage bucket
- ✅ Indexes

---

## Step 3: Export Current Data

### Option A: Using Supabase Dashboard (Easiest)
1. Contact Lovable support to request data export
2. They will provide CSV files for each table

### Option B: Manual Export (if you have access)
Run these queries in your current database and export as CSV:

```sql
-- Export each table
SELECT * FROM vendor_profiles;
SELECT * FROM user_approval_status;
SELECT * FROM user_roles;
SELECT * FROM vendor_permissions;
SELECT * FROM products;
SELECT * FROM share_links;
SELECT * FROM product_interests;
SELECT * FROM catalog_inquiries;
SELECT * FROM custom_orders;
SELECT * FROM user_sessions;
```

---

## Step 4: Import Data into New Database

1. In your new Supabase project, go to **Table Editor**
2. For each table:
   - Click on the table name
   - Click **Insert** → **Import from CSV**
   - Upload the corresponding CSV file
   - Map columns correctly
   - Click **Import**

**Import Order (important - respect foreign keys):**
1. vendor_profiles
2. user_approval_status
3. user_roles
4. vendor_permissions
5. products
6. share_links
7. product_interests
8. catalog_inquiries
9. custom_orders
10. user_sessions

---

## Step 5: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add your production domain:
   ```
   https://yourdomain.com
   ```
3. Under **Redirect URLs**, add:
   ```
   https://yourdomain.com/*
   http://localhost:8080/*
   ```
4. Under **Email Auth**, enable:
   - ✅ Enable email confirmations (or disable for faster testing)
   - ✅ Secure email change
   
5. **Optional**: Enable providers (Google, etc.) if needed

---

## Step 6: Update Frontend Configuration

### Get Your New Credentials
1. In Supabase Dashboard → **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

### Update .env File
Replace the current `.env` file with:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_REF
```

### No Code Changes Required!
Your React app already uses `@/integrations/supabase/client.ts` which reads from these environment variables.

---

## Step 7: Migrate Edge Functions (Optional)

You have 2 edge functions that need migration:
- `get-shared-catalog`
- `manage-session`

### Option A: Keep on Lovable Cloud
Leave edge functions as-is and update their URLs in your frontend.

### Option B: Deploy to Supabase Edge Functions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Deploy functions:
```bash
supabase functions deploy get-shared-catalog
supabase functions deploy manage-session
```

5. Set environment secrets:
```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## Step 8: Test Everything

### Local Testing
```bash
npm install
npm run dev
```

Test these features:
- ✅ User signup/login
- ✅ Add product
- ✅ View catalog
- ✅ Create share link
- ✅ Import Excel
- ✅ Export PDF
- ✅ View interests
- ✅ Custom orders

### Production Testing
1. Build and deploy:
```bash
npm run build
```

2. Upload `dist` folder to hosting (Vercel/Netlify/Hostinger)

3. Test all features in production

---

## Step 9: Migrate Storage Files (if any)

If you have QR codes or images in storage:

1. Download from old storage:
   - Go to Lovable Cloud → Storage → `vendor-qr-codes`
   - Download all files

2. Upload to new storage:
   - Go to Supabase → Storage → `vendor-qr-codes`
   - Upload files maintaining folder structure

---

## Step 10: Create Admin User

After migration, you need to set up your first admin:

1. Sign up through your app
2. Get your user ID from Supabase Dashboard → Authentication → Users
3. Run this SQL:

```sql
-- Replace with your actual user_id
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');

UPDATE public.user_approval_status
SET status = 'approved'
WHERE user_id = 'YOUR_USER_ID_HERE';
```

---

## Troubleshooting

### Issue: Can't login after migration
**Solution**: Check Auth redirect URLs are set correctly

### Issue: Can't see products
**Solution**: Verify RLS policies are created and user is approved

### Issue: Images not loading
**Solution**: Check storage bucket is public and files are uploaded

### Issue: Edge functions not working
**Solution**: Verify function URLs and CORS headers

---

## Deployment Options

### Vercel (Recommended for React apps)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Hostinger (Manual upload)
1. Build: `npm run build`
2. Upload `dist/*` to `public_html`
3. Add `.htaccess` for SPA routing

---

## Cost Comparison

| Service | Current (Lovable) | New (Supabase) |
|---------|------------------|----------------|
| Database | Included | Free tier: 500MB |
| Auth | Included | Free tier: 50K users |
| Storage | Included | Free tier: 1GB |
| Functions | Included | Free tier: 500K requests |
| Bandwidth | Included | Free tier: 2GB |

**Paid tiers available if you exceed free limits**

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Migration issues**: Check SQL Editor logs for errors

---

## Rollback Plan

If migration fails, you can always:
1. Keep using Lovable Cloud backend
2. Only migrate frontend to Vercel/Hostinger
3. Point frontend to old Lovable Cloud backend URLs

---

**Estimated Migration Time**: 2-4 hours
**Difficulty**: Medium
**Recommended**: Have database backup before starting!
