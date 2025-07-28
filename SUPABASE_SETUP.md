# Supabase Integration Setup

## Overview
This marketplace application is now fully integrated with Supabase for storing company registration data and images.

## Features
- ✅ Company registration form with image uploads
- ✅ Logo and product images stored in Supabase Storage
- ✅ Company data stored in Supabase Database
- ✅ File validation (JPG, PNG, WebP, GIF, max 5MB)
- ✅ Progress tracking for multiple image uploads
- ✅ Error handling and user feedback
- ✅ Fallback to direct Supabase if backend is unavailable

## Database Schema
The `companies` table should have the following columns:
- `id` (auto-generated)
- `company_name` (text)
- `product_name` (text)
- `type` (text) - "Product-based" or "Service-based"
- `status` (text) - "Developed" or "Under Development"
- `domain` (text) - from predefined options
- `short_desc` (text)
- `about` (text)
- `youtube` (text) - YouTube link
- `buy_link` (text) - Product/marketplace link
- `logo_url` (text) - Supabase Storage URL
- `image_urls` (array) - Array of Supabase Storage URLs
- `approved` (boolean) - default false
- `likes` (integer) - default 0
- `views` (integer) - default 0
- `bought` (integer) - default 0
- `created_at` (timestamp)

## Storage Bucket
Create a storage bucket named `marketplacedata` with the following structure:
- `logos/` - for company logos
- `products/` - for product/service images

## Environment Variables
Make sure your Supabase credentials are properly configured in `src/supabaseClient.js`:
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

## Usage
1. Users can fill out the registration form at `/register`
2. Upload company logo and product images
3. Form data is validated and uploaded to Supabase
4. Images are stored in Supabase Storage
5. Company data is stored in the database
6. New submissions require admin approval before appearing on the marketplace

## Error Handling
- File type validation
- File size limits (5MB)
- Upload progress tracking
- Detailed error messages
- Fallback to direct Supabase if backend is down

## Security
- File type restrictions
- File size limits
- Anonymous key used for public submissions
- Admin approval required for listings 