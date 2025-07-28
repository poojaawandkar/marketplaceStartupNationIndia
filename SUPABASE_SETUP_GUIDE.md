# Complete Supabase Setup Guide

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `marketplace-app` (or any name you prefer)
   - Enter database password (save this!)
   - Choose region closest to your users
   - Click "Create new project"

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll see "Project is ready" when done

## Step 2: Get Your API Keys

1. **Go to Settings**
   - In your project dashboard, click "Settings" (gear icon) in left sidebar
   - Click "API" in the settings menu

2. **Copy Your Keys**
   - **Project URL**: Copy the URL (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key**: Copy the long key starting with `eyJ...`

3. **Update Your Code**
   - Open `src/supabaseClient.js`
   - Replace the placeholder values with your actual keys:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## Step 3: Create Database Table

1. **Go to Table Editor**
   - In left sidebar, click "Table Editor"
   - Click "New table"

2. **Create Companies Table**
   - **Name**: `companies`
   - **Enable Row Level Security (RLS)**: ✅ Check this
   - Click "Save"

3. **Add Columns**
   Click "Add column" for each of these:

   | Column Name | Type | Default Value | Primary Key | Required |
   |-------------|------|---------------|-------------|----------|
   | `id` | `int8` | `gen_random_uuid()` | ✅ Yes | ✅ Yes |
   | `company_name` | `text` | - | ❌ No | ✅ Yes |
   | `product_name` | `text` | - | ❌ No | ✅ Yes |
   | `type` | `text` | - | ❌ No | ✅ Yes |
   | `status` | `text` | - | ❌ No | ✅ Yes |
   | `domain` | `text` | - | ❌ No | ✅ Yes |
   | `short_desc` | `text` | - | ❌ No | ✅ Yes |
   | `about` | `text` | - | ❌ No | ✅ Yes |
   | `youtube` | `text` | - | ❌ No | ✅ Yes |
   | `buy_link` | `text` | - | ❌ No | ✅ Yes |
   | `logo_url` | `text` | - | ❌ No | ✅ Yes |
   | `image_urls` | `text[]` | - | ❌ No | ✅ Yes |
   | `approved` | `bool` | `false` | ❌ No | ✅ Yes |
   | `likes` | `int8` | `0` | ❌ No | ✅ Yes |
   | `views` | `int8` | `0` | ❌ No | ✅ Yes |
   | `bought` | `int8` | `0` | ❌ No | ✅ Yes |
   | `created_at` | `timestamptz` | `now()` | ❌ No | ✅ Yes |

4. **Save Table**
   - Click "Save" to create the table

## Step 4: Create Storage Bucket

1. **Go to Storage**
   - In left sidebar, click "Storage"
   - Click "New bucket"

2. **Create Bucket**
   - **Name**: `marketplacedata`
   - **Public bucket**: ✅ Check this (so images can be accessed publicly)
   - Click "Create bucket"

3. **Set Up Bucket Policies**
   - Click on your `marketplacedata` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   - Choose "Create a policy from template"
   - Select "Allow public access to any file"
   - Click "Review"
   - Click "Save policy"

## Step 5: Create Comments Table (Optional)

1. **Create Comments Table**
   - Go to "Table Editor" → "New table"
   - **Name**: `comments`
   - **Enable RLS**: ✅ Check this
   - Click "Save"

2. **Add Columns**

   | Column Name | Type | Default Value | Primary Key | Required |
   |-------------|------|---------------|-------------|----------|
   | `id` | `int8` | `gen_random_uuid()` | ✅ Yes | ✅ Yes |
   | `company_id` | `int8` | - | ❌ No | ✅ Yes |
   | `user_id` | `uuid` | - | ❌ No | ❌ No |
   | `name` | `text` | - | ❌ No | ✅ Yes |
   | `text` | `text` | - | ❌ No | ✅ Yes |
   | `created_at` | `timestamptz` | `now()` | ❌ No | ✅ Yes |

3. **Add Foreign Key**
   - Click "Add column"
   - **Name**: `company_id`
   - **Type**: `int8`
   - **Foreign Key**: ✅ Check this
   - **References**: `companies(id)`
   - Click "Save"

## Step 6: Set Up Row Level Security (RLS)

1. **For Companies Table**
   - Go to "Table Editor" → "companies" → "Policies"
   - Click "New Policy"
   - Choose "Create a policy from template"
   - Select "Enable read access to everyone"
   - Click "Review" → "Save policy"
   - Click "New Policy" again
   - Choose "Create a policy from template"
   - Select "Enable insert for authenticated users only"
   - Click "Review" → "Save policy"

2. **For Comments Table** (if created)
   - Go to "Table Editor" → "comments" → "Policies"
   - Click "New Policy"
   - Choose "Create a policy from template"
   - Select "Enable read access to everyone"
   - Click "Review" → "Save policy"
   - Click "New Policy" again
   - Choose "Create a policy from template"
   - Select "Enable insert for authenticated users only"
   - Click "Review" → "Save policy"

## Step 7: Test Your Setup

1. **Test Database Connection**
   - Go to "Table Editor" → "companies"
   - Click "Insert row"
   - Add a test record:
     ```json
     {
       "company_name": "Test Company",
       "product_name": "Test Product",
       "type": "Product-based",
       "status": "Developed",
       "domain": "AgriTech",
       "short_desc": "Test description",
       "about": "Test about",
       "youtube": "https://youtube.com/watch?v=test",
       "buy_link": "https://example.com",
       "logo_url": "https://example.com/logo.jpg",
       "image_urls": ["https://example.com/image1.jpg"],
       "approved": false
     }
     ```
   - Click "Save" - if it works, your table is set up correctly

2. **Test Storage**
   - Go to "Storage" → "marketplacedata"
   - Click "Upload file"
   - Upload a test image
   - If it uploads successfully, storage is working

## Step 8: Update Your Backend (Optional)

If you want to use the backend server, create a `.env` file in your `backend` folder:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=5000
```

## Step 9: Verify Everything Works

1. **Start your frontend**
   ```bash
   npm run dev
   ```

2. **Test the registration form**
   - Go to your registration page
   - Fill out the form with test data
   - Upload a logo and some images
   - Submit the form
   - Check the browser console for any errors
   - Check your Supabase dashboard to see if data was saved

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your API keys in `supabaseClient.js`
   - Make sure you copied the `anon` key, not the `service_role` key

2. **"Bucket not found" error**
   - Make sure you created the bucket named exactly `marketplacedata`
   - Check that the bucket is public

3. **"Table not found" error**
   - Make sure you created the `companies` table
   - Check the table name spelling

4. **"Permission denied" error**
   - Check your RLS policies
   - Make sure you have the correct policies set up

5. **Images not uploading**
   - Check storage bucket policies
   - Make sure bucket is public
   - Check file size limits (5MB max)

### Need Help?

- Check the browser console for error messages
- Look at the Network tab in browser dev tools
- Check your Supabase dashboard logs
- Verify all API keys and URLs are correct

## Final Checklist

- ✅ Supabase project created
- ✅ API keys copied to `supabaseClient.js`
- ✅ `companies` table created with all columns
- ✅ `marketplacedata` storage bucket created
- ✅ Storage bucket is public
- ✅ RLS policies configured
- ✅ Test data inserted successfully
- ✅ Registration form working
- ✅ Images uploading to storage
- ✅ Company data saving to database 