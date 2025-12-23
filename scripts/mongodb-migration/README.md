# Cataleon PostgreSQL to MongoDB Migration

This directory contains scripts to migrate data from Cataleon's PostgreSQL (Supabase) database to MongoDB.

## Prerequisites

1. **Node.js** v18 or higher
2. **MongoDB** instance (local or remote)
3. **Supabase Service Role Key** (from Supabase dashboard)

## Installation

```bash
cd scripts/mongodb-migration
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```
SUPABASE_URL=https://mznwzwuyhcmuaewqsojo.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=cataleon
```

## Usage

### Option 1: Direct Migration
Migrate data directly from PostgreSQL to MongoDB:
```bash
npm run migrate
```

### Option 2: Two-Step Migration
First export to JSON files, then import to MongoDB:

```bash
# Step 1: Export all tables to JSON files
npm run export

# Step 2: Import JSON files to MongoDB
npm run import
```

## Tables Migrated

The migration includes all 35 tables:

| Table | Description |
|-------|-------------|
| audit_logs | System audit trail |
| blog_posts | Blog content |
| blog_comments | Blog comments |
| brands | Jewelry brands |
| catalog_inquiries | Customer inquiries |
| custom_orders | Custom order requests |
| diamond_prices | Diamond pricing data |
| diamond_price_history | Price change history |
| guest_calculator_usage | Calculator analytics |
| invoice_templates | Invoice templates |
| manufacturing_cost_estimates | Cost estimates |
| newsletter_subscribers | Email subscribers |
| permission_templates | Permission presets |
| points_history | Reward points history |
| press_releases | Press content |
| product_interests | Product interest tracking |
| products | Product catalog |
| purchase_inquiries | Purchase requests |
| redemptions | Reward redemptions |
| rewards_catalog | Available rewards |
| scratch_leads | Gamification leads |
| scratch_rewards | Scratch card rewards |
| settings | System settings |
| share_links | Shareable catalog links |
| share_link_product_views | View analytics |
| user_approval_status | Vendor approvals |
| user_roles | Role assignments |
| user_sessions | Session management |
| vendor_milestones | Achievement tracking |
| vendor_permissions | Permission settings |
| vendor_points | Points balance |
| vendor_profiles | Vendor information |
| video_requests | Video request tracking |
| wishlist_items | Wishlist contents |
| wishlists | Customer wishlists |

## Data Transformations

During migration, the following transformations are applied:

1. **UUID to ObjectId**: PostgreSQL UUIDs are preserved as `postgres_id` field
2. **Timestamps**: String timestamps are converted to MongoDB Date objects
3. **Indexes**: Appropriate indexes are created for query optimization

## MongoDB Schema

After migration, each collection will have:
- `_id`: MongoDB generated ObjectId
- `postgres_id`: Original PostgreSQL UUID
- All original fields with proper types

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running: `mongod --dbpath /path/to/data`
- Verify Supabase service key has correct permissions

### Memory Issues
For large datasets, increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run migrate
```

### Partial Migration
If migration fails, you can safely re-run - existing collections will be dropped and recreated.

## Verification

After migration, verify data in MongoDB:
```bash
mongosh cataleon
> db.products.countDocuments()
> db.vendor_profiles.find().limit(1).pretty()
```
