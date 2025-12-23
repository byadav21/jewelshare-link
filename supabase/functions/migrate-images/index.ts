import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationResult {
  productId: string;
  sku: string;
  success: boolean;
  migratedImages: number;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Starting image migration for user: ${user.id}`);

    // Get all products for this user with external image URLs
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, name, user_id, image_url, image_url_2, image_url_3')
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No products found to migrate', results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${products.length} products to check`);

    const results: MigrationResult[] = [];
    const storageBasePath = `${supabaseUrl}/storage/v1/object/public/product-images/`;

    for (const product of products) {
      console.log(`Processing product: ${product.sku} (${product.id})`);
      
      let migratedCount = 0;
      const updates: Record<string, string | null> = {};
      
      try {
        // Check and migrate each image URL
        for (const imageField of ['image_url', 'image_url_2', 'image_url_3']) {
          const imageUrl = product[imageField as keyof typeof product] as string | null;
          
          // Skip if no URL or already in our storage
          if (!imageUrl || imageUrl.includes('product-images')) {
            console.log(`Skipping ${imageField} for ${product.sku}: ${!imageUrl ? 'empty' : 'already migrated'}`);
            continue;
          }

          console.log(`Migrating ${imageField} for ${product.sku}: ${imageUrl}`);

          try {
            // Download the image
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
              throw new Error(`Failed to download image: ${imageResponse.statusText}`);
            }

            const imageBlob = await imageResponse.blob();
            
            // Validate file size (5MB limit)
            if (imageBlob.size > 5 * 1024 * 1024) {
              console.warn(`Image too large for ${product.sku} ${imageField}: ${imageBlob.size} bytes`);
              continue;
            }

            // Determine file extension
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            const extension = contentType.split('/')[1] || 'jpg';
            
            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const fileName = `${user.id}/${product.sku}_${imageField}_${timestamp}_${randomString}.${extension}`;

            // Upload to storage
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(fileName, imageBlob, {
                contentType,
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error(`Upload error for ${product.sku} ${imageField}:`, uploadError);
              throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);

            updates[imageField] = publicUrl;
            migratedCount++;
            
            console.log(`Successfully migrated ${imageField} for ${product.sku} to: ${publicUrl}`);
            
          } catch (imageError) {
            console.error(`Error migrating ${imageField} for ${product.sku}:`, imageError);
            // Continue with other images even if one fails
          }
        }

        // Update product if any images were migrated
        if (migratedCount > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);

          if (updateError) {
            console.error(`Error updating product ${product.sku}:`, updateError);
            throw updateError;
          }

          console.log(`Updated product ${product.sku} with ${migratedCount} new image URLs`);
        }

        results.push({
          productId: product.id,
          sku: product.sku,
          success: true,
          migratedImages: migratedCount
        });

      } catch (error) {
        console.error(`Failed to migrate images for product ${product.sku}:`, error);
        results.push({
          productId: product.id,
          sku: product.sku,
          success: false,
          migratedImages: migratedCount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalMigrated = results.reduce((sum, r) => sum + r.migratedImages, 0);

    console.log(`Migration complete: ${successCount}/${results.length} products processed, ${totalMigrated} images migrated`);

    return new Response(
      JSON.stringify({
        message: 'Migration completed',
        summary: {
          totalProducts: results.length,
          successfulProducts: successCount,
          totalImagesMigrated: totalMigrated
        },
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
