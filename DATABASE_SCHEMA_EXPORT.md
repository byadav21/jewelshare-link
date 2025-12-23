# Cataleon Database Schema Export
## For MongoDB Migration

Generated: 2025-12-09

---

## Tables Overview (35 tables)

1. audit_logs
2. blog_comments
3. blog_posts
4. brands
5. catalog_inquiries
6. custom_orders
7. diamond_price_history
8. diamond_prices
9. guest_calculator_usage
10. invoice_templates
11. manufacturing_cost_estimates
12. newsletter_subscribers
13. permission_templates
14. points_history
15. press_releases
16. product_interests
17. products
18. purchase_inquiries
19. redemptions
20. rewards_catalog
21. scratch_leads
22. scratch_rewards
23. settings
24. share_link_product_views
25. share_links
26. user_approval_status
27. user_roles
28. user_sessions
29. vendor_milestones
30. vendor_permissions
31. vendor_points
32. vendor_profiles
33. video_requests
34. wishlist_items
35. wishlists

---

## Detailed Schema

### 1. audit_logs
```javascript
// MongoDB Schema
{
  _id: ObjectId, // replaces uuid id
  user_id: ObjectId, // reference to auth.users
  action: String, // required
  entity_type: String, // required
  entity_id: ObjectId, // nullable
  details: Object, // JSONB -> Object
  ip_address: String,
  user_agent: String,
  created_at: Date // default: now()
}

// Indexes
db.audit_logs.createIndex({ user_id: 1 })
db.audit_logs.createIndex({ entity_type: 1 })
db.audit_logs.createIndex({ action: 1 })
db.audit_logs.createIndex({ created_at: -1 })
```

### 2. blog_comments
```javascript
{
  _id: ObjectId,
  blog_post_id: ObjectId, // required, reference to blog_posts
  author_name: String, // required
  author_email: String, // required
  content: String, // required
  status: String, // default: 'pending'
  created_at: Date,
  moderated_at: Date,
  moderated_by: ObjectId
}

// Indexes
db.blog_comments.createIndex({ blog_post_id: 1 })
db.blog_comments.createIndex({ status: 1 })
db.blog_comments.createIndex({ created_at: -1 })
```

### 3. blog_posts
```javascript
{
  _id: ObjectId,
  slug: String, // required, unique
  title: String, // required
  excerpt: String,
  content: String, // required
  author_name: String, // required
  author_role: String,
  author_avatar: String,
  cover_image: String,
  tags: [String], // Array
  category: String,
  read_time: Number, // default: 5
  published: Boolean, // default: false
  published_at: Date,
  created_at: Date,
  updated_at: Date,
  created_by: ObjectId
}

// Indexes
db.blog_posts.createIndex({ slug: 1 }, { unique: true })
```

### 4. brands
```javascript
{
  _id: ObjectId,
  name: String, // required
  logo_url: String, // required
  display_order: Number, // default: 0
  active: Boolean, // default: true
  created_at: Date,
  updated_at: Date
}
```

### 5. catalog_inquiries
```javascript
{
  _id: ObjectId,
  share_link_id: ObjectId, // required, reference to share_links
  customer_name: String, // required
  customer_email: String, // required
  customer_phone: String,
  message: String, // required
  created_at: Date
}

// Indexes
db.catalog_inquiries.createIndex({ share_link_id: 1 })
```

### 6. custom_orders
```javascript
{
  _id: ObjectId,
  share_link_id: ObjectId, // reference to share_links
  customer_name: String, // required
  customer_email: String, // required
  customer_phone: String,
  metal_type: String,
  gemstone_preference: String,
  design_description: String, // required
  budget_range: String,
  reference_images: [String], // Array
  status: String, // default: 'pending'
  admin_notes: String,
  created_at: Date,
  updated_at: Date
}
```

### 7. diamond_price_history
```javascript
{
  _id: ObjectId,
  price_id: ObjectId, // reference to diamond_prices
  shape: String, // required
  carat_range_min: Number, // required (Decimal)
  carat_range_max: Number, // required (Decimal)
  color_grade: String, // required
  clarity_grade: String, // required
  cut_grade: String, // required
  old_price_per_carat: Number, // Decimal
  new_price_per_carat: Number, // required (Decimal)
  currency: String, // default: 'USD'
  change_type: String, // required ('insert', 'update', 'delete')
  changed_by: ObjectId,
  changed_at: Date,
  notes: String
}

// Indexes
db.diamond_price_history.createIndex({ price_id: 1 })
db.diamond_price_history.createIndex({ shape: 1 })
db.diamond_price_history.createIndex({ changed_at: -1 })
```

### 8. diamond_prices
```javascript
{
  _id: ObjectId,
  shape: String, // required
  carat_range_min: Number, // required (Decimal)
  carat_range_max: Number, // required (Decimal)
  color_grade: String, // required
  clarity_grade: String, // required
  cut_grade: String, // required
  price_per_carat: Number, // required (Decimal)
  currency: String, // default: 'USD'
  notes: String,
  created_at: Date,
  updated_at: Date,
  updated_by: ObjectId
}

// Compound Index for lookups
db.diamond_prices.createIndex({ 
  shape: 1, 
  color_grade: 1, 
  clarity_grade: 1, 
  cut_grade: 1, 
  carat_range_min: 1, 
  carat_range_max: 1 
})
```

### 9. guest_calculator_usage
```javascript
{
  _id: ObjectId,
  ip_address: String, // required
  calculator_type: String, // required
  user_agent: String,
  country: String,
  country_code: String,
  region: String,
  city: String,
  latitude: Number,
  longitude: Number,
  used_at: Date
}

// Indexes
db.guest_calculator_usage.createIndex({ ip_address: 1, calculator_type: 1, used_at: 1 })
db.guest_calculator_usage.createIndex({ country: 1, region: 1, calculator_type: 1 })
```

### 10. invoice_templates
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  name: String, // required
  description: String,
  template_data: Object, // JSONB -> Object
  is_default: Boolean, // default: false
  created_at: Date,
  updated_at: Date
}

// Indexes
db.invoice_templates.createIndex({ user_id: 1 })
db.invoice_templates.createIndex({ user_id: 1, is_default: 1 })
```

### 11. manufacturing_cost_estimates
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  estimate_name: String, // required
  estimate_category: String, // 'jewelry', 'loose_diamond', 'gemstone'
  customer_name: String,
  customer_phone: String,
  customer_email: String,
  customer_address: String,
  net_weight: Number,
  purity_fraction: Number,
  gold_rate_24k: Number,
  making_charges: Number,
  cad_design_charges: Number,
  camming_charges: Number,
  certification_cost: Number,
  diamond_cost: Number,
  gemstone_cost: Number,
  gold_cost: Number,
  total_cost: Number,
  profit_margin_percentage: Number,
  final_selling_price: Number,
  notes: String,
  status: String, // default: 'draft'
  estimated_completion_date: Date,
  is_customer_visible: Boolean, // default: false
  share_token: String,
  reference_images: [String],
  line_items: Object, // JSONB -> Object (contains items array and meta)
  invoice_number: String,
  invoice_date: Date,
  invoice_status: String,
  invoice_notes: String,
  payment_terms: String,
  payment_due_date: Date,
  payment_date: Date,
  is_invoice_generated: Boolean,
  last_reminder_sent_at: Date,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.manufacturing_cost_estimates.createIndex({ user_id: 1 })
db.manufacturing_cost_estimates.createIndex({ share_token: 1 })
db.manufacturing_cost_estimates.createIndex({ customer_name: 1 })
db.manufacturing_cost_estimates.createIndex({ status: 1 })
db.manufacturing_cost_estimates.createIndex({ invoice_status: 1 })
```

### 12. newsletter_subscribers
```javascript
{
  _id: ObjectId,
  email: String, // required, unique
  is_active: Boolean, // default: true
  subscribed_at: Date,
  unsubscribe_token: String,
  created_at: Date
}

// Indexes
db.newsletter_subscribers.createIndex({ email: 1 }, { unique: true })
```

### 13. permission_templates
```javascript
{
  _id: ObjectId,
  name: String, // required
  description: String,
  template_config: Object, // required, JSONB
  created_by: ObjectId,
  created_at: Date,
  updated_at: Date
}
```

### 14. points_history
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  points: Number, // required
  action_type: String, // required
  action_details: Object, // JSONB
  expires_at: Date,
  expired: Boolean, // default: false
  created_at: Date
}

// Indexes
db.points_history.createIndex({ user_id: 1 })
db.points_history.createIndex({ expires_at: 1 })
```

### 15. press_releases
```javascript
{
  _id: ObjectId,
  title: String, // required
  subtitle: String,
  content: String, // required
  published_date: Date, // required
  publication: String,
  publication_logo: String,
  external_url: String,
  featured: Boolean, // default: false
  created_at: Date,
  updated_at: Date
}
```

### 16. product_interests
```javascript
{
  _id: ObjectId,
  product_id: ObjectId, // required, reference to products
  share_link_id: ObjectId, // required, reference to share_links
  customer_name: String, // required
  customer_email: String,
  customer_phone: String,
  notes: String,
  created_at: Date
}

// Indexes
db.product_interests.createIndex({ product_id: 1 })
db.product_interests.createIndex({ share_link_id: 1 })
```

### 17. products (MAIN TABLE)
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  name: String, // required
  description: String,
  sku: String,
  category: String, // 'Jewellery', 'Gemstones', 'Loose Diamonds'
  product_type: String,
  
  // Pricing
  cost_price: Number, // required
  retail_price: Number, // required
  price_inr: Number,
  price_usd: Number,
  total_usd: Number,
  per_carat_price: Number,
  gold_per_gram_price: Number,
  
  // Weights
  weight_grams: Number,
  net_weight: Number,
  carat_weight: Number,
  carat: Number,
  
  // Metal
  metal_type: String,
  purity_fraction_used: Number,
  
  // Diamond Details
  diamond_weight: Number,
  diamond_type: String,
  diamond_color: String,
  d_wt_1: Number,
  d_wt_2: Number,
  d_rate_1: Number,
  d_value: Number,
  pointer_diamond: Number,
  
  // Diamond 4Cs
  shape: String,
  color: String,
  clarity: String,
  cut: String,
  polish: String,
  symmetry: String,
  fluorescence: String,
  measurement: String,
  ratio: String,
  lab: String,
  certification: String,
  
  // Gemstone
  gemstone: String,
  gemstone_name: String,
  gemstone_type: String,
  gemstone_cost: Number,
  
  // Charges
  mkg: Number, // making charges
  certification_cost: Number,
  
  // Other
  color_shade_amount: String,
  stock_quantity: Number, // default: 0
  status: String,
  delivery_type: String, // 'immediate' or 'scheduled'
  dispatches_in_days: Number,
  
  // Images
  image_url: String,
  image_url_2: String,
  image_url_3: String,
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  deleted_at: Date // for soft delete
}

// Indexes
db.products.createIndex({ user_id: 1 })
db.products.createIndex({ category: 1 })
db.products.createIndex({ deleted_at: 1 })
db.products.createIndex({ sku: 1 })
```

### 18. purchase_inquiries
```javascript
{
  _id: ObjectId,
  product_id: ObjectId, // required
  share_link_id: ObjectId, // required
  customer_name: String, // required
  customer_email: String, // required
  customer_phone: String,
  message: String,
  quantity: Number,
  status: String, // default: 'pending'
  created_at: Date
}

// Indexes
db.purchase_inquiries.createIndex({ product_id: 1 })
db.purchase_inquiries.createIndex({ share_link_id: 1 })
db.purchase_inquiries.createIndex({ status: 1 })
```

### 19. redemptions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  reward_id: ObjectId, // required, reference to rewards_catalog
  points_spent: Number, // required
  reward_details: Object, // JSONB
  status: String, // default: 'pending'
  redeemed_at: Date,
  expires_at: Date,
  applied_at: Date
}

// Indexes
db.redemptions.createIndex({ user_id: 1 })
db.redemptions.createIndex({ reward_id: 1 })
```

### 20. rewards_catalog
```javascript
{
  _id: ObjectId,
  name: String, // required
  description: String,
  reward_type: String, // required
  reward_value: Object, // required, JSONB
  points_cost: Number, // required
  is_active: Boolean, // default: true
  created_at: Date,
  updated_at: Date
}
```

### 21. scratch_leads
```javascript
{
  _id: ObjectId,
  session_id: String, // required
  name: String, // required
  email: String, // required
  phone: String,
  business_name: String,
  interest: String,
  created_at: Date
}

// Indexes
db.scratch_leads.createIndex({ session_id: 1 })
db.scratch_leads.createIndex({ email: 1 })
```

### 22. scratch_rewards
```javascript
{
  _id: ObjectId,
  session_id: String, // required
  reward_type: String, // required
  reward_value: String, // required
  claimed: Boolean, // default: false
  claimed_at: Date,
  created_at: Date
}

// Indexes
db.scratch_rewards.createIndex({ session_id: 1 })
```

### 23. settings
```javascript
{
  _id: ObjectId,
  key: String, // required, unique
  value: Object, // required, JSONB
  updated_at: Date,
  updated_by: ObjectId
}

// Indexes
db.settings.createIndex({ key: 1 }, { unique: true })
```

### 24. share_link_product_views
```javascript
{
  _id: ObjectId,
  share_link_id: ObjectId, // required
  product_id: ObjectId, // required
  viewer_ip: String,
  viewer_user_agent: String,
  viewed_at: Date
}

// Indexes
db.share_link_product_views.createIndex({ share_link_id: 1 })
db.share_link_product_views.createIndex({ product_id: 1 })
db.share_link_product_views.createIndex({ viewed_at: -1 })
```

### 25. share_links
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  share_token: String, // required, unique
  shared_categories: [String], // default: ['Jewellery', 'Gemstones', 'Loose Diamonds']
  markup_percentage: Number, // default: 0
  markdown_percentage: Number, // default: 0
  show_vendor_details: Boolean, // default: true
  expires_at: Date, // required
  is_active: Boolean, // default: true
  view_count: Number, // default: 0
  created_at: Date
}

// Indexes
db.share_links.createIndex({ user_id: 1 })
db.share_links.createIndex({ share_token: 1 }, { unique: true })
db.share_links.createIndex({ expires_at: 1 })
```

### 26. user_approval_status
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required, unique
  status: String, // required, enum: 'pending', 'approved', 'rejected'
  business_name: String,
  email: String,
  phone: String,
  notes: String,
  rejection_reason: String,
  approved_categories: [String],
  is_enabled: Boolean, // default: true
  requested_at: Date,
  reviewed_at: Date,
  reviewed_by: ObjectId
}

// Indexes
db.user_approval_status.createIndex({ user_id: 1 }, { unique: true })
db.user_approval_status.createIndex({ status: 1 })
```

### 27. user_roles
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  role: String, // required, enum: 'admin', 'team_member'
  created_at: Date
}

// Indexes
db.user_roles.createIndex({ user_id: 1 })
db.user_roles.createIndex({ user_id: 1, role: 1 }, { unique: true })
```

### 28. user_sessions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  session_id: String, // required
  device_info: String,
  ip_address: String,
  last_activity: Date,
  created_at: Date
}

// Indexes
db.user_sessions.createIndex({ user_id: 1 })
db.user_sessions.createIndex({ session_id: 1 })
```

### 29. vendor_milestones
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required
  milestone_type: String, // required
  milestone_value: Number, // required
  points_awarded: Number, // default: 0
  achieved_at: Date
}

// Indexes
db.vendor_milestones.createIndex({ user_id: 1 })
db.vendor_milestones.createIndex({ user_id: 1, milestone_type: 1, milestone_value: 1 }, { unique: true })
```

### 30. vendor_permissions
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required, unique
  subscription_plan: String, // enum: 'starter', 'professional', 'enterprise', 'essentials'
  
  // Limits
  max_products: Number,
  max_share_links: Number,
  max_team_members: Number,
  max_product_images: Number,
  max_active_sessions: Number,
  
  // Boolean Permissions
  can_add_products: Boolean,
  can_edit_products: Boolean,
  can_delete_products: Boolean,
  can_view_catalog: Boolean,
  can_share_catalog: Boolean,
  can_view_share_links: Boolean,
  can_manage_share_links: Boolean,
  can_view_interests: Boolean,
  can_add_vendor_details: Boolean,
  can_edit_profile: Boolean,
  can_view_custom_orders: Boolean,
  can_manage_custom_orders: Boolean,
  can_import_data: Boolean,
  can_manage_team: Boolean,
  can_view_sessions: Boolean,
  can_manage_sessions: Boolean,
  
  // Override
  override_plan_limits: Boolean,
  trial_ends_at: Date,
  plan_updated_at: Date,
  plan_updated_by: ObjectId,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.vendor_permissions.createIndex({ user_id: 1 }, { unique: true })
db.vendor_permissions.createIndex({ subscription_plan: 1 })
```

### 31. vendor_points
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required, unique
  total_points: Number, // default: 0
  current_tier: String, // default: 'bronze'
  created_at: Date,
  updated_at: Date
}

// Indexes
db.vendor_points.createIndex({ user_id: 1 }, { unique: true })
```

### 32. vendor_profiles
```javascript
{
  _id: ObjectId,
  user_id: ObjectId, // required, unique
  business_name: String,
  
  // Address
  address_line1: String,
  address_line2: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
  
  // Contact
  email: String,
  phone: String,
  whatsapp_number: String,
  
  // Branding
  logo_url: String,
  primary_brand_color: String,
  secondary_brand_color: String,
  brand_tagline: String,
  brand_theme: String,
  business_story: String,
  certifications: [String],
  awards: [String],
  
  // QR Codes
  instagram_qr_url: String,
  whatsapp_qr_url: String,
  
  // Pricing Config
  gold_rate_24k_per_gram: Number,
  making_charges_per_gram: Number,
  usd_exchange_rate: Number,
  gold_rate_updated_at: Date,
  
  // Categories
  seller_categories: [String],
  
  created_at: Date,
  updated_at: Date
}

// Indexes
db.vendor_profiles.createIndex({ user_id: 1 }, { unique: true })
```

### 33. video_requests
```javascript
{
  _id: ObjectId,
  product_id: ObjectId, // reference to products
  share_link_id: ObjectId, // reference to share_links
  customer_name: String, // required
  customer_email: String, // required
  customer_phone: String,
  requested_products: String, // required
  status: String, // default: 'pending'
  created_at: Date,
  updated_at: Date
}

// Indexes
db.video_requests.createIndex({ share_link_id: 1 })
db.video_requests.createIndex({ status: 1 })
```

### 34. wishlist_items
```javascript
{
  _id: ObjectId,
  wishlist_id: ObjectId, // required, reference to wishlists
  product_id: ObjectId, // required, reference to products
  share_link_id: ObjectId,
  notes: String,
  added_at: Date
}

// Indexes
db.wishlist_items.createIndex({ wishlist_id: 1 })
db.wishlist_items.createIndex({ product_id: 1 })
```

### 35. wishlists
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  session_id: String, // for anonymous users
  name: String, // default: 'My Wishlist'
  share_token: String, // unique
  is_public: Boolean, // default: false
  created_at: Date,
  updated_at: Date
}

// Indexes
db.wishlists.createIndex({ user_id: 1 })
db.wishlists.createIndex({ session_id: 1 })
db.wishlists.createIndex({ share_token: 1 }, { unique: true })
```

---

## Enums (Custom Types)

```javascript
// app_role
const AppRole = {
  ADMIN: 'admin',
  TEAM_MEMBER: 'team_member'
};

// approval_status
const ApprovalStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// subscription_plan
const SubscriptionPlan = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
  ESSENTIALS: 'essentials'
};
```

---

## Relationships Summary

```
Products -> User (user_id)
Share Links -> User (user_id)
Manufacturing Estimates -> User (user_id)
Vendor Profiles -> User (user_id)
Vendor Permissions -> User (user_id)

Blog Comments -> Blog Posts (blog_post_id)
Product Interests -> Products, Share Links
Purchase Inquiries -> Products, Share Links
Wishlist Items -> Wishlists, Products
Share Link Views -> Share Links, Products
Custom Orders -> Share Links
Video Requests -> Products, Share Links

Diamond Price History -> Diamond Prices (price_id)
Redemptions -> Rewards Catalog (reward_id)
Points History -> User (user_id)
Vendor Milestones -> User (user_id)
```

---

## Data Export Commands

To export actual data, run these queries:

```sql
-- Export all tables as JSON
SELECT row_to_json(t) FROM audit_logs t;
SELECT row_to_json(t) FROM blog_posts t;
SELECT row_to_json(t) FROM products t;
-- ... repeat for each table
```

Or use pg_dump:
```bash
pg_dump -h YOUR_HOST -U postgres -d postgres --data-only --format=plain > data_export.sql
```
