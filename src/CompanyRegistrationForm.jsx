import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CompanyRegistrationForm.css';
import { supabase } from './supabaseClient'; // adjust path if needed



const DOMAIN_OPTIONS = [
  'AgriTech',
  'Artificial Intelligence',
  'CleanTech & Sustainability',
  'Cybersecurity',
  'E-Commerce',
  'EdTech',
  'FinTech & SaaS',
  'Food',
  'Gaming & Media',
  'HealthTech',
  'Mobility & Transport',
  'Startup Support',
  'Textile & Fashion',
  'Other',
];

function CompanyRegistrationForm() {
  const navigate = useNavigate();
  const MIN_IMAGES = 1;
  const MAX_IMAGES = 5;
  const [form, setForm] = useState({
    companyName: '',
    productName: '',
    type: '',
    status: '',
    domain: '',
    shortDesc: '',
    about: '',
    youtubelink: '',
    buyLink: '',
    images: [], // for product/service images
    logo: null, // for company logo
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (name === 'images') {
      let arr = Array.from(files).slice(0, MAX_IMAGES);
      
      // Validate each file
      for (let file of arr) {
        if (!allowedTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Please upload only JPG, PNG, WebP, or GIF images.`);
          return;
        }
        if (file.size > maxSize) {
          alert(`File too large: ${file.name}. Please upload files smaller than 5MB.`);
          return;
        }
      }
      
      setForm(f => ({ ...f, images: arr }));
    } else if (name === 'logo') {
      const file = files[0];
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid logo file type: ${file.name}. Please upload only JPG, PNG, WebP, or GIF images.`);
        return;
      }
      if (file.size > maxSize) {
        alert(`Logo file too large: ${file.name}. Please upload files smaller than 5MB.`);
        return;
      }
      setForm(f => ({ ...f, logo: file }));
    }
  };

  // Remove all testimonial handlers and validation

  const validate = () => {
    const newErrors = {};
    if (!form.companyName) newErrors.companyName = 'Required';
    if (!form.logo) newErrors.logo = 'Required';
    if (!form.productName) newErrors.productName = 'Required';
    if (!form.type) newErrors.type = 'Required';
    if (!form.status) newErrors.status = 'Required';
    if (!form.domain) newErrors.domain = 'Required';
    if (!form.shortDesc) newErrors.shortDesc = 'Required';
    if (!form.about) newErrors.about = 'Required';
    if (!form.youtubelink) newErrors.youtubelink = 'Required';
    if (!form.buyLink) newErrors.buyLink = 'Required';
    if (form.images.length < MIN_IMAGES) newErrors.images = `At least ${MIN_IMAGES} image(s) required`;
    if (form.images.length > MAX_IMAGES) newErrors.images = `No more than ${MAX_IMAGES} images allowed`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');
    console.log('Starting form submission...');

    try {
      // STEP 1: Upload LOGO
      const logoFile = form.logo;
      const logoFileName = `logos/${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Uploading logo:', logoFileName);
      
      // Try upload with different options
      let { data: logoData, error: logoError } = await supabase.storage
        .from('marketplacedata')
        .upload(logoFileName, logoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (logoError) {
        console.error('Logo upload error:', logoError);
        
        // If it's a policy error, provide specific instructions
        if (logoError.message.includes('row-level security') || logoError.statusCode === '403') {
          throw new Error('Storage bucket needs policies. Go to Supabase Dashboard → Storage → marketplacedata → Policies → Click "New policy" → Choose "Allow public access to any file" → Save.');
        }
        
        throw new Error(`Logo upload failed: ${logoError.message}. Please check your storage bucket permissions.`);
      }
      
      console.log('Logo uploaded successfully:', logoFileName);
      
      const { data: logoUrlData } = supabase.storage
        .from('marketplacedata')
        .getPublicUrl(logoFileName);
      const logoUrl = logoUrlData.publicUrl;
      console.log('Logo URL:', logoUrl);

      // STEP 2: Upload IMAGES
      const imageUrls = [];
      const totalImages = form.images.length;
      
      for (let i = 0; i < totalImages; i++) {
        const imgFile = form.images[i];
        const imageFileName = `products/${Date.now()}_${i}_${imgFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        console.log(`Uploading image ${i + 1}:`, imageFileName);
        
        const { data: imgData, error: imgError } = await supabase.storage
          .from('marketplacedata')
          .upload(imageFileName, imgFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (imgError) {
          console.error(`Image ${i + 1} upload error:`, imgError);
          throw new Error(`Image ${i + 1} upload failed: ${imgError.message}. Please check your storage bucket permissions.`);
        }
        
        console.log(`Image ${i + 1} uploaded successfully:`, imageFileName);
        
        const { data: imgUrlData } = supabase.storage
          .from('marketplacedata')
          .getPublicUrl(imageFileName);
        imageUrls.push(imgUrlData.publicUrl);
        
        // Update progress
        setUploadProgress(((i + 1) / totalImages) * 100);
      }

      // STEP 3: Prepare data for database
      const payload = {
        company_name: form.companyName,
        product_name: form.productName,
        type: form.type,
        status: form.status,
        domain: form.domain,
        short_desc: form.shortDesc,
        about: form.about,
        youtube: form.youtubelink,
        buy_link: form.buyLink,
        logo_url: logoUrl,
        image_urls: imageUrls,
        approved: false, // New submissions need approval
        likes: 0,
        views: 0,
        bought: 0,
        created_at: new Date().toISOString()
      };

      // STEP 4: Save data directly to Supabase (bypassing backend)
      try {
        console.log('Saving data directly to Supabase...');
        console.log('Payload:', payload);
        
        const { data, error } = await supabase
          .from('companies')
          .insert([payload])
          .select();
        
        if (error) {
          console.error('Supabase error:', error);
          
          // If RLS is blocking, provide specific instructions
          if (error.message.includes('row-level security')) {
            throw new Error('RLS policy is blocking the insert. Please go to Supabase Dashboard → Table Editor → companies → Turn OFF "Row Level Security (RLS)" and save the table.');
          }
          
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Data saved successfully:', data);
        setSubmitted(true);
      } catch (error) {
        console.error('All save attempts failed:', error);
        throw error;
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="company-form-bg">
      <div className="company-form-container">
        <button
          onClick={() => navigate('/')}
          className="company-form-back-btn"
        >
          ← Back to Marketplace
        </button>
        <div className="company-form-card">
          <h1 className="company-form-title">Product Registration</h1>
          {submitted ? (
            <div className="company-form-success">
              <h2>✅ Registration Successful!</h2>
              <p>Thank you for registering your company! Your product will be listed in 24 to 48 hours after an internal review.</p>
              <button 
                onClick={() => navigate('/')} 
                className="company-form-submit-btn"
                style={{ marginTop: '20px' }}
              >
                Back to Marketplace
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="company-form-group">
              <label>Company Name<span className="company-form-required"> *</span></label><br />
              <input name="companyName" value={form.companyName} onChange={handleChange} className="company-form-input" />
              {errors.companyName && <div className="company-form-error">{errors.companyName}</div>}
            </div>
            <div className="company-form-group">
              <label>Company Logo <span className="company-form-required"> *</span>
                <span className="company-form-hint">
                  (Logo will only be shown on the company detail page)
                </span>
              </label><br />
              <input
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="company-form-input"
              />
              {errors.logo && <div className="company-form-error">{errors.logo}</div>}
            </div>
            <div className="company-form-group">
              <label>Product/Service Name<span className="company-form-required"> *</span></label><br />
              <input name="productName" value={form.productName} onChange={handleChange} className="company-form-input" />
              {errors.productName && <div className="company-form-error">{errors.productName}</div>}
            </div>
            <div className="company-form-group">
              <label>Is your offering product based or service based ?<span className="company-form-required"> *</span></label><br />
              <select name="type" value={form.type} onChange={handleChange} className="company-form-input">
                <option value="">Select Type</option>
                <option value="Product-based">Product-based</option>
                <option value="Service-based">Service-based</option>
              </select>
              {errors.type && <div className="company-form-error">{errors.type}</div>}
            </div>
            <div className="company-form-group">
              <label>Development Status<span className="company-form-required"> *</span></label><br />
              <select name="status" value={form.status} onChange={handleChange} className="company-form-input">
                <option value="">Select Status</option>
                <option value="Developed">Developed</option>
                <option value="Under Development">Under Development</option>
              </select>
              {errors.status && <div className="company-form-error">{errors.status}</div>}
            </div>
            <div className="company-form-group">
              <label>Select Domain<span className="company-form-required"> *</span></label><br />
              <select name="domain" value={form.domain} onChange={handleChange} className="company-form-input">
                <option value="">Select Domain</option>
                {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.domain && <div className="company-form-error">{errors.domain}</div>}
            </div>
            <div className="company-form-group">
              <label>Short Description<span className="company-form-required"> *</span></label><br />
              <input name="shortDesc" value={form.shortDesc} onChange={handleChange} className="company-form-input" />
              {errors.shortDesc && <div className="company-form-error">{errors.shortDesc}</div>}
            </div>
            <div className="company-form-group">
              <label>About Product/Services<span className="company-form-required"> *</span></label><br />
              <textarea name="about" value={form.about} onChange={handleChange} className="company-form-input company-form-textarea" />
              {errors.about && <div className="company-form-error">{errors.about}</div>}
            </div>
            <div className="company-form-group">
              <label>YouTube link(Containing video-explaning the Product/Services that Company provides)<span className="company-form-required"> *</span></label><br />
              <input name="youtubelink" value={form.youtubelink} onChange={handleChange} className="company-form-input" />
              {errors.youtubelink && <div className="company-form-error">{errors.youtubelink}</div>}
            </div>
            <div className="company-form-group">
              <label>Product Link on Company / Marketplace website (Company Website Prefered)<span className="company-form-required"> *</span></label><br />
              <input name="buyLink" value={form.buyLink} onChange={handleChange} className="company-form-input" />
              {errors.buyLink && <div className="company-form-error">{errors.buyLink}</div>}
            </div>
            <div className="company-form-group">
              <label>
                Images that best describe your product/services
                <span className="company-form-required"> *</span>
                <span className="company-form-hint">
                  (Min: {MIN_IMAGES}, Max: {MAX_IMAGES})
                </span>
                <span className="company-form-hint company-form-hint-block">
                  The <b>first image</b> you upload will be displayed on the Startup Nation Marketplace.
                </span>
              </label><br />
              <input name="images" type="file" accept="image/*" multiple onChange={handleFileChange} className="company-form-input" />
              {errors.images && <div className="company-form-error">{errors.images}</div>}
            </div>
            {/* REMOVE testimonials section */}
            
            {submitError && (
              <div className="company-form-error" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ff4d4d20', border: '1px solid #ff4d4d', borderRadius: '8px' }}>
                <strong>Error:</strong> {submitError}
              </div>
            )}
            
            {isSubmitting && uploadProgress > 0 && (
              <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5c13b20', border: '1px solid #f5c13b', borderRadius: '8px' }}>
                <div style={{ marginBottom: '5px', color: '#f5c13b', fontWeight: 'bold' }}>
                  Uploading images... {Math.round(uploadProgress)}%
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${uploadProgress}%`, 
                      height: '100%', 
                      backgroundColor: '#f5c13b', 
                      transition: 'width 0.3s ease' 
                    }}
                  />
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="company-form-submit-btn" 
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#181818',
  color: '#f5c13b',
  border: '2px solid #444',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 16,
  marginTop: 4,
  marginBottom: 2,
  outline: 'none',
  fontWeight: 600,
};
const errStyle = {
  color: '#ff4d4d',
  fontSize: 13,
  marginTop: 2,
};

export default CompanyRegistrationForm; 