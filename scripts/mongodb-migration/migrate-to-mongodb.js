#!/usr/bin/env node
/**
 * PostgreSQL (Supabase) to MongoDB Migration Script
 * 
 * This script migrates data from a PostgreSQL database to MongoDB.
 * Run with: node migrate-to-mongodb.js
 * 
 * Prerequisites:
 * - npm install @supabase/supabase-js mongodb dotenv
 * - Create .env file with SUPABASE_URL, SUPABASE_SERVICE_KEY, MONGODB_URI
 */

const { createClient } = require('@supabase/supabase-js');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mznwzwuyhcmuaewqsojo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'cataleon';

// Tables to migrate with their configurations
const TABLES_CONFIG = [
  { name: 'audit_logs', indexes: [{ user_id: 1 }, { created_at: -1 }, { entity_type: 1 }] },
  { name: 'blog_posts', indexes: [{ slug: 1 }, { published: 1, published_at: -1 }, { category: 1 }] },
  { name: 'blog_comments', indexes: [{ blog_post_id: 1 }, { status: 1 }, { created_at: -1 }] },
  { name: 'brands', indexes: [{ active: 1, display_order: 1 }] },
  { name: 'catalog_inquiries', indexes: [{ share_link_id: 1 }, { created_at: -1 }] },
  { name: 'custom_orders', indexes: [{ share_link_id: 1 }, { status: 1 }, { created_at: -1 }] },
  { name: 'diamond_prices', indexes: [{ shape: 1, color_grade: 1, clarity_grade: 1 }, { carat_range_min: 1, carat_range_max: 1 }] },
  { name: 'diamond_price_history', indexes: [{ price_id: 1 }, { changed_at: -1 }] },
  { name: 'guest_calculator_usage', indexes: [{ ip_address: 1 }, { calculator_type: 1 }, { used_at: -1 }] },
  { name: 'invoice_templates', indexes: [{ user_id: 1 }, { is_default: 1 }] },
  { name: 'manufacturing_cost_estimates', indexes: [{ user_id: 1, created_at: -1 }, { status: 1 }, { share_token: 1 }] },
  { name: 'newsletter_subscribers', indexes: [{ email: 1 }, { is_active: 1 }] },
  { name: 'permission_templates', indexes: [{ name: 1 }] },
  { name: 'points_history', indexes: [{ user_id: 1, created_at: -1 }, { expires_at: 1 }, { expired: 1 }] },
  { name: 'press_releases', indexes: [{ published_date: -1 }, { featured: 1 }] },
  { name: 'product_interests', indexes: [{ product_id: 1 }, { share_link_id: 1 }] },
  { name: 'products', indexes: [{ user_id: 1, deleted_at: 1 }, { category: 1 }, { product_type: 1 }, { created_at: -1 }] },
  { name: 'purchase_inquiries', indexes: [{ product_id: 1 }, { share_link_id: 1 }, { status: 1 }] },
  { name: 'redemptions', indexes: [{ user_id: 1 }, { reward_id: 1 }, { status: 1 }] },
  { name: 'rewards_catalog', indexes: [{ is_active: 1 }, { points_cost: 1 }] },
  { name: 'scratch_leads', indexes: [{ email: 1 }, { session_id: 1 }] },
  { name: 'scratch_rewards', indexes: [{ session_id: 1 }, { claimed: 1 }] },
  { name: 'settings', indexes: [{ key: 1 }] },
  { name: 'share_links', indexes: [{ user_id: 1 }, { share_token: 1 }, { is_active: 1, expires_at: 1 }] },
  { name: 'share_link_product_views', indexes: [{ share_link_id: 1 }, { product_id: 1 }, { viewed_at: -1 }] },
  { name: 'user_approval_status', indexes: [{ user_id: 1 }, { status: 1 }] },
  { name: 'user_roles', indexes: [{ user_id: 1 }, { role: 1 }] },
  { name: 'user_sessions', indexes: [{ user_id: 1 }, { session_id: 1 }, { last_activity: -1 }] },
  { name: 'vendor_milestones', indexes: [{ user_id: 1 }, { milestone_type: 1 }] },
  { name: 'vendor_permissions', indexes: [{ user_id: 1 }, { subscription_plan: 1 }] },
  { name: 'vendor_points', indexes: [{ user_id: 1 }] },
  { name: 'vendor_profiles', indexes: [{ user_id: 1 }, { business_name: 1 }] },
  { name: 'video_requests', indexes: [{ product_id: 1 }, { share_link_id: 1 }, { status: 1 }] },
  { name: 'wishlist_items', indexes: [{ wishlist_id: 1 }, { product_id: 1 }] },
  { name: 'wishlists', indexes: [{ user_id: 1 }, { session_id: 1 }, { share_token: 1 }] },
];

// Transform UUID to MongoDB ObjectId format (where possible)
function transformDocument(doc) {
  if (!doc) return doc;
  
  const transformed = { ...doc };
  
  // Convert PostgreSQL timestamps to MongoDB Date objects
  const dateFields = ['created_at', 'updated_at', 'published_at', 'reviewed_at', 
    'expires_at', 'redeemed_at', 'achieved_at', 'viewed_at', 'used_at',
    'claimed_at', 'subscribed_at', 'last_activity', 'deleted_at',
    'gold_rate_updated_at', 'plan_updated_at', 'trial_ends_at',
    'invoice_date', 'payment_date', 'payment_due_date', 'last_reminder_sent_at',
    'estimated_completion_date', 'moderated_at', 'changed_at', 'applied_at', 'added_at'];
  
  dateFields.forEach(field => {
    if (transformed[field] && typeof transformed[field] === 'string') {
      transformed[field] = new Date(transformed[field]);
    }
  });
  
  // Keep original id as postgres_id and generate MongoDB _id
  if (transformed.id) {
    transformed.postgres_id = transformed.id;
    delete transformed.id;
  }
  
  return transformed;
}

// Fetch all data from a Supabase table
async function fetchTableData(supabase, tableName) {
  console.log(`  Fetching data from ${tableName}...`);
  
  let allData = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error(`  Error fetching ${tableName}:`, error.message);
      return [];
    }
    
    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    offset += limit;
    
    if (data.length < limit) break;
  }
  
  console.log(`  Found ${allData.length} records in ${tableName}`);
  return allData;
}

// Create indexes for a collection
async function createIndexes(collection, indexes) {
  for (const index of indexes) {
    try {
      await collection.createIndex(index);
    } catch (err) {
      console.error(`  Warning: Could not create index ${JSON.stringify(index)}:`, err.message);
    }
  }
}

// Main migration function
async function migrateToMongoDB() {
  console.log('='.repeat(60));
  console.log('PostgreSQL to MongoDB Migration Script');
  console.log('='.repeat(60));
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_KEY environment variable is required');
    console.log('\nPlease set the following environment variables:');
    console.log('  SUPABASE_URL (optional, defaults to project URL)');
    console.log('  SUPABASE_SERVICE_KEY (required)');
    console.log('  MONGODB_URI (optional, defaults to localhost)');
    console.log('  MONGODB_DB_NAME (optional, defaults to "cataleon")');
    process.exit(1);
  }
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // Initialize MongoDB client
  let mongoClient;
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('\nConnected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
  
  const db = mongoClient.db(MONGODB_DB_NAME);
  
  // Migration statistics
  const stats = {
    total: 0,
    success: 0,
    failed: 0,
    tables: {}
  };
  
  console.log(`\nMigrating ${TABLES_CONFIG.length} tables to MongoDB...\n`);
  
  for (const tableConfig of TABLES_CONFIG) {
    const { name: tableName, indexes } = tableConfig;
    console.log(`\n[${tableName}]`);
    
    try {
      // Fetch data from PostgreSQL
      const data = await fetchTableData(supabase, tableName);
      
      if (data.length === 0) {
        console.log(`  Skipping ${tableName} (no data)`);
        stats.tables[tableName] = { count: 0, status: 'skipped' };
        continue;
      }
      
      // Transform documents
      const transformedData = data.map(transformDocument);
      
      // Drop existing collection if exists
      try {
        await db.collection(tableName).drop();
      } catch (e) {
        // Collection may not exist
      }
      
      // Create collection and insert data
      const collection = db.collection(tableName);
      const result = await collection.insertMany(transformedData);
      
      // Create indexes
      if (indexes && indexes.length > 0) {
        console.log(`  Creating ${indexes.length} indexes...`);
        await createIndexes(collection, indexes);
      }
      
      console.log(`  ✓ Migrated ${result.insertedCount} documents`);
      stats.tables[tableName] = { count: result.insertedCount, status: 'success' };
      stats.success++;
      stats.total += result.insertedCount;
      
    } catch (err) {
      console.error(`  ✗ Failed to migrate ${tableName}:`, err.message);
      stats.tables[tableName] = { count: 0, status: 'failed', error: err.message };
      stats.failed++;
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total documents migrated: ${stats.total}`);
  console.log(`Tables successful: ${stats.success}`);
  console.log(`Tables failed: ${stats.failed}`);
  console.log(`Tables skipped: ${TABLES_CONFIG.length - stats.success - stats.failed}`);
  
  console.log('\nDetailed Results:');
  for (const [table, result] of Object.entries(stats.tables)) {
    const status = result.status === 'success' ? '✓' : result.status === 'skipped' ? '-' : '✗';
    console.log(`  ${status} ${table}: ${result.count} documents`);
  }
  
  // Close connections
  await mongoClient.close();
  console.log('\nMigration complete!');
}

// Export data to JSON files
async function exportToJSON() {
  console.log('='.repeat(60));
  console.log('Exporting PostgreSQL data to JSON files');
  console.log('='.repeat(60));
  
  if (!SUPABASE_SERVICE_KEY) {
    console.error('ERROR: SUPABASE_SERVICE_KEY environment variable is required');
    process.exit(1);
  }
  
  const fs = require('fs');
  const path = require('path');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const outputDir = path.join(__dirname, 'exported-data');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`\nExporting to: ${outputDir}\n`);
  
  for (const tableConfig of TABLES_CONFIG) {
    const { name: tableName } = tableConfig;
    
    try {
      const data = await fetchTableData(supabase, tableName);
      
      const filePath = path.join(outputDir, `${tableName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      console.log(`  ✓ ${tableName}: ${data.length} records -> ${tableName}.json`);
    } catch (err) {
      console.error(`  ✗ ${tableName}: ${err.message}`);
    }
  }
  
  console.log('\nExport complete!');
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0] || 'migrate';

switch (command) {
  case 'migrate':
    migrateToMongoDB().catch(console.error);
    break;
  case 'export':
    exportToJSON().catch(console.error);
    break;
  default:
    console.log('Usage: node migrate-to-mongodb.js [migrate|export]');
    console.log('  migrate - Migrate data directly to MongoDB');
    console.log('  export  - Export data to JSON files');
}
