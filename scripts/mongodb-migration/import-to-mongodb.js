#!/usr/bin/env node
/**
 * Import JSON files to MongoDB
 * 
 * This script imports previously exported JSON files into MongoDB.
 * Run with: node import-to-mongodb.js
 * 
 * Prerequisites:
 * - npm install mongodb dotenv
 * - JSON files in ./exported-data/ directory
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'cataleon';

// Indexes configuration for collections
const INDEXES_CONFIG = {
  audit_logs: [{ user_id: 1 }, { created_at: -1 }, { entity_type: 1 }],
  blog_posts: [{ slug: 1 }, { published: 1, published_at: -1 }, { category: 1 }],
  blog_comments: [{ blog_post_id: 1 }, { status: 1 }, { created_at: -1 }],
  brands: [{ active: 1, display_order: 1 }],
  catalog_inquiries: [{ share_link_id: 1 }, { created_at: -1 }],
  custom_orders: [{ share_link_id: 1 }, { status: 1 }, { created_at: -1 }],
  diamond_prices: [{ shape: 1, color_grade: 1, clarity_grade: 1 }, { carat_range_min: 1, carat_range_max: 1 }],
  diamond_price_history: [{ price_id: 1 }, { changed_at: -1 }],
  guest_calculator_usage: [{ ip_address: 1 }, { calculator_type: 1 }, { used_at: -1 }],
  invoice_templates: [{ user_id: 1 }, { is_default: 1 }],
  manufacturing_cost_estimates: [{ user_id: 1, created_at: -1 }, { status: 1 }, { share_token: 1 }],
  newsletter_subscribers: [{ email: 1 }, { is_active: 1 }],
  permission_templates: [{ name: 1 }],
  points_history: [{ user_id: 1, created_at: -1 }, { expires_at: 1 }, { expired: 1 }],
  press_releases: [{ published_date: -1 }, { featured: 1 }],
  product_interests: [{ product_id: 1 }, { share_link_id: 1 }],
  products: [{ user_id: 1, deleted_at: 1 }, { category: 1 }, { product_type: 1 }, { created_at: -1 }],
  purchase_inquiries: [{ product_id: 1 }, { share_link_id: 1 }, { status: 1 }],
  redemptions: [{ user_id: 1 }, { reward_id: 1 }, { status: 1 }],
  rewards_catalog: [{ is_active: 1 }, { points_cost: 1 }],
  scratch_leads: [{ email: 1 }, { session_id: 1 }],
  scratch_rewards: [{ session_id: 1 }, { claimed: 1 }],
  settings: [{ key: 1 }],
  share_links: [{ user_id: 1 }, { share_token: 1 }, { is_active: 1, expires_at: 1 }],
  share_link_product_views: [{ share_link_id: 1 }, { product_id: 1 }, { viewed_at: -1 }],
  user_approval_status: [{ user_id: 1 }, { status: 1 }],
  user_roles: [{ user_id: 1 }, { role: 1 }],
  user_sessions: [{ user_id: 1 }, { session_id: 1 }, { last_activity: -1 }],
  vendor_milestones: [{ user_id: 1 }, { milestone_type: 1 }],
  vendor_permissions: [{ user_id: 1 }, { subscription_plan: 1 }],
  vendor_points: [{ user_id: 1 }],
  vendor_profiles: [{ user_id: 1 }, { business_name: 1 }],
  video_requests: [{ product_id: 1 }, { share_link_id: 1 }, { status: 1 }],
  wishlist_items: [{ wishlist_id: 1 }, { product_id: 1 }],
  wishlists: [{ user_id: 1 }, { session_id: 1 }, { share_token: 1 }],
};

// Transform document for MongoDB
function transformDocument(doc) {
  if (!doc) return doc;
  
  const transformed = { ...doc };
  
  // Convert string dates to Date objects
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
  
  // Keep original id as postgres_id
  if (transformed.id) {
    transformed.postgres_id = transformed.id;
    delete transformed.id;
  }
  
  return transformed;
}

async function importToMongoDB() {
  console.log('='.repeat(60));
  console.log('Importing JSON files to MongoDB');
  console.log('='.repeat(60));
  
  const dataDir = path.join(__dirname, 'exported-data');
  
  if (!fs.existsSync(dataDir)) {
    console.error(`ERROR: Data directory not found: ${dataDir}`);
    console.log('Please run "npm run export" first to export data from PostgreSQL');
    process.exit(1);
  }
  
  // Get all JSON files
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.error('ERROR: No JSON files found in', dataDir);
    process.exit(1);
  }
  
  console.log(`Found ${files.length} JSON files\n`);
  
  // Connect to MongoDB
  let mongoClient;
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    console.log('Connected to MongoDB\n');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
  
  const db = mongoClient.db(MONGODB_DB_NAME);
  
  const stats = { total: 0, success: 0, failed: 0 };
  
  for (const file of files) {
    const collectionName = path.basename(file, '.json');
    
    try {
      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`  - ${collectionName}: No data to import`);
        continue;
      }
      
      // Transform documents
      const transformedData = data.map(transformDocument);
      
      // Drop existing collection
      try {
        await db.collection(collectionName).drop();
      } catch (e) {
        // Collection may not exist
      }
      
      // Insert data
      const collection = db.collection(collectionName);
      const result = await collection.insertMany(transformedData);
      
      // Create indexes
      const indexes = INDEXES_CONFIG[collectionName];
      if (indexes) {
        for (const index of indexes) {
          try {
            await collection.createIndex(index);
          } catch (e) {
            // Index may already exist
          }
        }
      }
      
      console.log(`  ✓ ${collectionName}: ${result.insertedCount} documents imported`);
      stats.success++;
      stats.total += result.insertedCount;
      
    } catch (err) {
      console.error(`  ✗ ${collectionName}: ${err.message}`);
      stats.failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total documents imported: ${stats.total}`);
  console.log(`Collections successful: ${stats.success}`);
  console.log(`Collections failed: ${stats.failed}`);
  
  await mongoClient.close();
  console.log('\nImport complete!');
}

importToMongoDB().catch(console.error);
