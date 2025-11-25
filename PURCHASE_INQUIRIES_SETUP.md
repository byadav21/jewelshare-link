# Purchase Inquiries Setup Guide

This guide explains how to set up automated follow-up reminders for purchase inquiries.

## Features Implemented

### 1. Export Functionality ✅
- **Export to CSV**: Download purchase inquiries data in CSV format
- **Export to Excel**: Download purchase inquiries data in Excel (.xlsx) format
- Both formats include all inquiry details: customer info, product details, status, and timestamps

### 2. Email Notifications ✅
- **Instant Notifications**: Vendors receive an email immediately when a new purchase inquiry is submitted
- Email includes customer details, product information, and total value
- Automatically triggered when customers submit a "Buy Now" inquiry from shareable catalogs

### 3. Automated Follow-up Reminders
- **24-Hour Check**: System checks for purchase inquiries that have been pending for more than 24 hours
- **Reminder Emails**: Vendors receive a consolidated reminder email listing all pending inquiries
- **Smart Grouping**: Multiple pending inquiries are grouped in a single email per vendor

## Setting Up Automated Reminders

To enable automated follow-up reminders, you need to set up a scheduled job (cron) in your Supabase database.

### Step 1: Enable Required Extensions

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable the pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Create the Scheduled Job

Run this SQL to schedule the reminder check to run every hour:

```sql
SELECT cron.schedule(
  'check-pending-purchase-inquiries',
  '0 * * * *', -- Runs every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://mznwzwuyhcmuaewqsojo.supabase.co/functions/v1/check-pending-inquiries',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bnd6d3V5aGNtdWFld3Fzb2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NjAxOTksImV4cCI6MjA3NjQzNjE5OX0.BKLPknX5ye6uVhlWN2ky9kKb8p0s_6jKrEt41rN1NB4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify the Job

Check that the job was created successfully:

```sql
SELECT * FROM cron.job;
```

You should see your job listed with the name `check-pending-purchase-inquiries`.

### Step 4: Monitor Job Execution

You can monitor job runs with:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-pending-purchase-inquiries')
ORDER BY start_time DESC 
LIMIT 10;
```

## Customizing the Schedule

You can adjust how often the check runs by modifying the cron expression:

- `'0 * * * *'` - Every hour at minute 0 (default)
- `'0 */2 * * *'` - Every 2 hours
- `'0 9,17 * * *'` - Twice daily at 9 AM and 5 PM
- `'0 9 * * *'` - Once daily at 9 AM
- `'*/30 * * * *'` - Every 30 minutes

## Edge Functions

### 1. notify-purchase-inquiry
- **Purpose**: Sends instant email notification to vendor when a new inquiry is submitted
- **Triggered**: Automatically when a customer submits a purchase inquiry
- **Email Content**: Product details, customer information, total value

### 2. check-pending-inquiries
- **Purpose**: Checks for inquiries pending > 24 hours and sends reminder emails
- **Triggered**: By the cron job (hourly by default)
- **Email Content**: List of all pending inquiries with details and total potential value

## Testing

### Test Instant Notifications
1. Go to a shareable catalog
2. Click "Buy Now" on any product
3. Fill out and submit the inquiry form
4. Check vendor email for instant notification

### Test Reminder System
1. Manually trigger the reminder check:
   ```sql
   SELECT net.http_post(
       url:='https://mznwzwuyhcmuaewqsojo.supabase.co/functions/v1/check-pending-inquiries',
       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
       body:='{}'::jsonb
   );
   ```
2. Check vendor email for reminder (if there are pending inquiries > 24h old)

## Troubleshooting

### Emails Not Sending
1. Verify RESEND_API_KEY is configured in Supabase secrets
2. Check that vendor email is set in vendor_profiles table
3. Check edge function logs for errors

### Reminders Not Running
1. Verify pg_cron and pg_net extensions are enabled
2. Check cron job exists: `SELECT * FROM cron.job;`
3. Check job run history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
4. Verify the edge function URL and authentication key are correct

### No Reminders Received
- Reminders only send for inquiries that are:
  - Status = 'pending'
  - Created more than 24 hours ago
- Check if any inquiries meet these criteria
