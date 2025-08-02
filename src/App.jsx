// src/App.jsx
import './App.css';
import footerLogo from './assets/logo_result.webp';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaEye, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom';
import CompanyRegistrationForm from './CompanyRegistrationForm';
import { supabase } from './supabaseClient';

const DOMAIN_OPTIONS = [
  'All',
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

function Marketplace() {
  const [type, setType] = useState('All');
  const [status, setStatus] = useState('All');
  const [domain, setDomain] = useState('All');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Function to fetch and map companies
  const fetchAndMapCompanies = async () => {
    setLoading(true);
    try {
      // Try to fetch from backend first
      const res = await axios.get('http://localhost:5000/api/approved-companies');
      const mapped = res.data.map((c, idx) => ({
        id: c.id || (typeof c._id === 'object' && c._id.$oid ? c._id.$oid : c._id) || idx,
        companyName: c.company_name,
        productName: c.product_name,
        type: c.type,
        status: c.status,
        domain: c.domain,
        shortDesc: c.short_desc,
        logo: c.logo_url,
        about: c.about,
        youtube: c.youtube,
        buyLink: c.buy_link,
        image_urls: c.image_urls, // Add the original image_urls field
        gallery: c.image_urls, // Use image_urls from registration form
        gallery_urls: c.image_urls, // Use image_urls from registration form
        testimonials: c.testimonials,
      }));
      setProducts(mapped);
    } catch (err) {
      console.log('Backend not available, using Supabase directly');
      // Fallback to Supabase directly if backend is not available
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('approved', true);
        
        if (error) throw error;
        
        console.log('Raw Supabase data:', data);
        console.log('Sample company image_urls:', data[0]?.image_urls);
        console.log('Sample company image_urls type:', typeof data[0]?.image_urls);
        console.log('Sample company image_urls isArray:', Array.isArray(data[0]?.image_urls));
        console.log('Sample company image_urls length:', data[0]?.image_urls?.length);
        console.log('Sample company gallery_urls:', data[0]?.gallery_urls);
        console.log('Sample company gallery_urls type:', typeof data[0]?.gallery_urls);
        console.log('Sample company gallery field:', data[0]?.gallery);
        console.log('Sample company gallery type:', typeof data[0]?.gallery);
        
        const mapped = data.map((c) => ({
          id: c.id || c.uuid || c._id || `temp-${Date.now()}-${Math.random()}`, // Use the actual Supabase UUID with fallbacks
          companyName: c.company_name,
          productName: c.product_name,
          type: c.type,
          status: c.status,
          domain: c.domain,
          shortDesc: c.short_desc,
          logo: c.logo_url,
          about: c.about,
          youtube: c.youtube,
          buyLink: c.buy_link,
          image_urls: c.image_urls, // Add the original image_urls field
          gallery: c.image_urls, // Use image_urls from registration form
          gallery_urls: c.image_urls, // Use image_urls from registration form
          testimonials: c.testimonials,
        }));
        console.log('Mapped companies with IDs:', mapped.map(c => ({ id: c.id, name: c.companyName })));
        setProducts(mapped);
      } catch (supabaseErr) {
        console.error('Supabase error:', supabaseErr);
        setProducts([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAndMapCompanies();

    // Set up real-time subscription for companies table
    const channel = supabase
      .channel('companies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // New company added - check if it's approved
            const newCompany = payload.new;
            if (newCompany.approved === true) {
              const mappedCompany = {
                id: newCompany.id, // Use the actual Supabase UUID
                companyName: newCompany.company_name,
                productName: newCompany.product_name,
                type: newCompany.type,
                status: newCompany.status,
                domain: newCompany.domain,
                shortDesc: newCompany.short_desc,
                logo: newCompany.logo_url,
                about: newCompany.about,
                youtube: newCompany.youtube,
                buyLink: newCompany.buy_link,
                image_urls: newCompany.image_urls, // Add the original image_urls field
                gallery: newCompany.image_urls, // Use image_urls from registration form
                gallery_urls: newCompany.image_urls, // Use image_urls from registration form
                testimonials: newCompany.testimonials,
              };
              setProducts(prev => [...prev, mappedCompany]);
              showNotification('New company added!', 'info');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Company updated - check if approval status changed
            const oldCompany = payload.old;
            const newCompany = payload.new;
            
            if (oldCompany.approved === false && newCompany.approved === true) {
              // Company was just approved - add to the list
              const mappedCompany = {
                id: newCompany.id, // Use the actual Supabase UUID
                companyName: newCompany.company_name,
                productName: newCompany.product_name,
                type: newCompany.type,
                status: newCompany.status,
                domain: newCompany.domain,
                shortDesc: newCompany.short_desc,
                logo: newCompany.logo_url,
                about: newCompany.about,
                youtube: newCompany.youtube,
                buyLink: newCompany.buy_link,
                image_urls: newCompany.image_urls, // Add the original image_urls field
                gallery: newCompany.image_urls, // Use image_urls from registration form
                gallery_urls: newCompany.image_urls, // Use image_urls from registration form
                testimonials: newCompany.testimonials,
              };
              setProducts(prev => [...prev, mappedCompany]);
              showNotification('Company approved!', 'success');
            } else if (oldCompany.approved === true && newCompany.approved === false) {
              // Company was unapproved - remove from the list
              setProducts(prev => prev.filter(p => p.id !== newCompany.id));
              showNotification('Company unapproved!', 'warning');
            } else if (oldCompany.approved === true && newCompany.approved === true) {
              // Company was updated but still approved - refresh the entire list to ensure consistency
              fetchAndMapCompanies();
              showNotification('Company updated!', 'info');
            }
          } else if (payload.eventType === 'DELETE') {
            // Company deleted - remove from the list
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
            showNotification('Company deleted!', 'error');
          }
        }
      )
      .on('error', (error) => {
        console.error('Real-time subscription error:', error);
        showNotification('Connection error. Trying to reconnect...', 'error');
      })
      .on('disconnect', () => {
        console.log('Real-time connection disconnected');
        showNotification('Connection lost. Reconnecting...', 'warning');
      })
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        // if (status === 'SUBSCRIBED') {
        //   showNotification('');
        //}
         if (status === 'CLOSED') {
          console.log('Real-time subscription closed, attempting to reconnect...');
          // Try to reconnect after a short delay
          setTimeout(() => {
            fetchAndMapCompanies();
          }, 2000);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const typeMatch = type === 'All' || (p.type || '').toLowerCase() === type.toLowerCase();
    const statusMatch = status === 'All' || (p.status || '').toLowerCase() === status.toLowerCase();
    const domainMatch = domain === 'All' || (p.domain || '').toLowerCase() === domain.toLowerCase();
    const searchMatch =
      (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.companyName || '').toLowerCase().includes(search.toLowerCase());
    return typeMatch && statusMatch && domainMatch && searchMatch;
  });

  // Responsive: show filters as drawer on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 700;

  return (
    <div>
      {/* Notification Component */}
      {notification && (
        <div 
          className={`marketplace-notification ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.3s ease-out',
            background: notification.type === 'success' ? '#4CAF50' : 
                       notification.type === 'error' ? '#f44336' : 
                       notification.type === 'warning' ? '#ff9800' : '#2196F3'
          }}
        >
          {notification.message}
        </div>
      )}
      
      <header className="main-heading">
                <div className="main-heading-row">
          <h1>Startup Nation Marketplace</h1>
          <button 
            className="marketplace-filters-toggle"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            aria-label="Toggle filters"
          >
            <div className="marketplace-filters-hamburger"></div>
          </button>
        </div>
        <p>Discover innovative products and services from startups.</p>
      </header>
      <div className="marketplace-header-row">
        <button
          onClick={() => navigate('/register')}
          className="marketplace-register-btn"
        >
          Register Your Product/Services
        </button>
        <button
          className="marketplace-count-btn"
          style={{
            background: '#333',
            color: '#f5c13b',
            border: '2px solid #f5c13b',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>📊</span>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
        </button>
        {/* <div className="marketplace-search-col">
          <label htmlFor="type-filter" className="marketplace-search-label">Find Services</label>
          <input
            type="text"
            placeholder="Search by product or company name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="marketplace-search-input"
          />
        </div> */}
        {/* Removed duplicate filter toggle button */}
      </div>
      <div className={`marketplace-filters-sticky${mobileFiltersOpen ? ' open' : ''}`}> 
        {mobileFiltersOpen && (
          <button
            className="marketplace-filters-close"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters"
          >
            &times;
          </button>
        )}
        <div className="marketplace-filters-responsive">
          <div className="marketplace-filters-left">
            <div className="marketplace-filter-group">
              <label className="marketplace-filter-title">Offering type</label>
              <div className="marketplace-filter-options">
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="type-filter"
                    value="All"
                    checked={type === "All"}
                    onChange={(e) => setType(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>All Types</span>
                </label>
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="type-filter"
                    value="Product-based"
                    checked={type === "Product-based"}
                    onChange={(e) => setType(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>Product-based</span>
                </label>
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="type-filter"
                    value="Service-based"
                    checked={type === "Service-based"}
                    onChange={(e) => setType(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>Service-based</span>
                </label>
              </div>
            </div>
            <div className="marketplace-filter-group">
              <label className="marketplace-filter-title">Product Status</label>
              <div className="marketplace-filter-options">
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="status-filter"
                    value="All"
                    checked={status === "All"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>All Statuses</span>
                </label>
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="status-filter"
                    value="Developed"
                    checked={status === "Developed"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>Developed</span>
                </label>
                <label className="marketplace-filter-label">
                  <input
                    type="radio"
                    name="status-filter"
                    value="Under Development"
                    checked={status === "Under Development"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="marketplace-filter-radio"
                  />
                  <span>Under Development</span>
                </label>
              </div>
            </div>
          </div>
          <div className="marketplace-filters-right">
            <span className="marketplace-filter-title">Domain</span>
            <div className="domain-pill-row marketplace-domain-row">
              {DOMAIN_OPTIONS.map(opt => (
                <button
                  key={opt}
                  className={`domain-pill${domain === opt ? ' selected' : ''}`}
                  onClick={() => setDomain(opt)}
                  type="button"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <main className="main-content">
        {loading ? (
          <div className="marketplace-loading">Loading companies...</div>
        ) : (
          <div className="marketplace-grid">
            {filteredProducts.length === 0 ? (
              <div className="marketplace-no-results">Launching Soon....</div>
            ) : (
              filteredProducts.map(product => {
                console.log('Card product data:', { 
                  id: product.id,
                  companyName: product.companyName, 
                  image_urls: product.image_urls, 
                  image_urls_type: typeof product.image_urls,
                  image_urls_isArray: Array.isArray(product.image_urls),
                  image_urls_length: product.image_urls ? product.image_urls.length : 'N/A',
                  image_urls_first: product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : 'N/A',
                  gallery: product.gallery,
                  gallery_type: typeof product.gallery,
                  gallery_isArray: Array.isArray(product.gallery),
                  gallery_length: product.gallery ? product.gallery.length : 'N/A',
                  gallery_first: product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0 ? product.gallery[0] : 'N/A',
                  gallery_urls: product.gallery_urls,
                  gallery_urls_type: typeof product.gallery_urls,
                  gallery_urls_isArray: Array.isArray(product.gallery_urls),
                  gallery_urls_length: product.gallery_urls ? product.gallery_urls.length : 'N/A',
                  gallery_urls_first: product.gallery_urls && Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0 ? product.gallery_urls[0] : 'N/A',
                  logo: product.logo
                });
                                return (
                  <div
                    key={product.id}
                    className="marketplace-card"
                    onClick={() => {
                      console.log('Card clicked - navigating to product ID:', product.id);
                      if (product.id && product.id !== '0' && product.id !== 0) {
                        navigate(`/product/${product.id}`);
                      } else {
                        console.error('Invalid product ID:', product.id);
                        showNotification('Error: Invalid product ID', 'error');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      src={(() => {
                        let imageUrl = '';
                        if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
                          imageUrl = product.image_urls[0];
                        } else if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
                          imageUrl = product.gallery[0];
                        } else if (product.gallery_urls && Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0) {
                          imageUrl = product.gallery_urls[0];
                        } else {
                          imageUrl = `data:image/svg+xml;base64,${btoa(`<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="#1a1a1a"/><text x="90" y="90" font-family="Arial" font-size="24" fill="#f5c13b" text-anchor="middle" dy=".3em">${product.companyName.charAt(0).toUpperCase()}</text></svg>`)}`;
                        }
                        console.log(`Card ${product.id} - Using image URL:`, imageUrl);
                        return imageUrl;
                      })()} 
                      alt={product.companyName + ' product image'} 
                      className="marketplace-card-logo" 
                      onError={(e) => {
                        console.log(`Card ${product.id} - Image failed to load, using placeholder`);
                        e.target.src = `data:image/svg+xml;base64,${btoa(`<svg width="180" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="180" fill="#1a1a1a"/><text x="90" y="90" font-family="Arial" font-size="24" fill="#f5c13b" text-anchor="middle" dy=".3em">${product.companyName.charAt(0).toUpperCase()}</text></svg>`)}`;
                      }}
                    />
                    <h4 className="marketplace-card-product"><strong></strong> {product.productName}</h4>
                    <p className="marketplace-card-company"><strong>Company Name:</strong> {product.companyName}</p>
                    
                    <span className={`marketplace-status ${product.status === 'Developed' ? 'ready' : 'inprocess'}`}>{product.status}</span>
                  </div>
                                 );
               })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to convert 
// URLs to embed format
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const longMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
  if (url.includes('/embed/')) return url;
  return '';
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  console.log('ProductDetail - ID from URL:', id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [bought, setBought] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeError, setLikeError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  if (!localStorage.getItem('userId')) {
    // Generate a proper UUID for user ID
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    localStorage.setItem('userId', generateUUID());
  }
  const userId = localStorage.getItem('userId');
  
  // Ensure userId is a valid UUID format
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  // If userId is not a valid UUID, regenerate it
  if (!isValidUUID(userId)) {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    const newUserId = generateUUID();
    localStorage.setItem('userId', newUserId);
    console.log('Regenerated userId to valid UUID:', newUserId);
  }

  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      
      // Check if ID is valid
      if (!id || id === '0' || id === 0) {
        console.error('Invalid product ID:', id);
        setProduct(null);
        setLoading(false);
        return;
      }
      
      try {
        // Try backend first
        const res = await axios.get('http://localhost:5000/api/approved-companies');
        const found = res.data.find(c => (c.id === id || c._id === id));
        if (found) {
          console.log('Backend product data:', found);
          console.log('Image URLs from backend:', found.image_urls);
          console.log('Gallery URLs from backend:', found.gallery_urls);
          console.log('Gallery field from backend:', found.gallery);
          setProduct({
            id: found.id || found._id,
            companyName: found.company_name,
            productName: found.product_name,
            type: found.type,
            status: found.status,
            domain: found.domain,
            shortDesc: found.short_desc,
            logo: found.logo_url,
            about: found.about,
            youtube: found.youtube,
            buyLink: found.buy_link,
            gallery: found.image_urls, // Use image_urls from registration form
            gallery_urls: found.image_urls, // Use image_urls from registration form
          });
          setLikes(found.likes || 0);
          setViews(found.views || 0);
          setBought(found.bought || 0);
          setLiked(localStorage.getItem(`liked_${id}`) === 'true');
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.log('Backend not available, using Supabase directly');
        // Fallback to Supabase directly
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('approved', true)
            .eq('id', id)
            .single();
          
          if (error || !data) {
            setProduct(null);
          } else {
            console.log('Supabase product data:', data);
            console.log('Image URLs from Supabase:', data.image_urls);
            console.log('Gallery URLs from Supabase:', data.gallery_urls);
            console.log('Gallery field from Supabase:', data.gallery);
            setProduct({
              id: data.id,
              companyName: data.company_name,
              productName: data.product_name,
              type: data.type,
              status: data.status,
              domain: data.domain,
              shortDesc: data.short_desc,
              logo: data.logo_url,
              about: data.about,
              youtube: data.youtube,
              buyLink: data.buy_link,
              gallery: data.image_urls, // Use image_urls from registration form
              gallery_urls: data.image_urls, // Use image_urls from registration form
            });
            setLikes(data.likes || 0);
            setViews(data.views || 0);
            setBought(data.bought || 0);
            setLiked(localStorage.getItem(`liked_${id}`) === 'true');
          }
        } catch (supabaseErr) {
          console.error('Supabase error:', supabaseErr);
          setProduct(null);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  useEffect(() => {
    async function incView() {
      // Check if this browser has already viewed this product in this session
      const hasViewed = sessionStorage.getItem(`viewed_${id}`);
      
      if (hasViewed) {
        // Already viewed in this session, don't increment
        return;
      }
      
      try {
        // Try backend first, fallback to Supabase
        try {
          const res = await axios.patch(`http://localhost:5000/api/company/${id}/view`);
          setViews(res.data.views);
          sessionStorage.setItem(`viewed_${id}`, 'true');
          return;
        } catch (backendError) {
          console.log('Backend not available, using Supabase directly');
        }

        // Fallback to Supabase
        const { data: currentCompany, error: fetchError } = await supabase
          .from('companies')
          .select('views')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
          .from('companies')
          .update({ views: (currentCompany.views || 0) + 1 })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setViews(data.views);
        sessionStorage.setItem(`viewed_${id}`, 'true');
      } catch (error) {
        console.error('View increment error:', error);
      }
    }
    incView();
  }, [id]);

  const handleLikeToggle = async () => {
    // Check if this browser has already liked this product
    const hasLiked = localStorage.getItem(`liked_${id}`) === 'true';
    
    if (hasLiked) {
      // Unlike
      try {
        // Try backend first, fallback to Supabase
        try {
          const res = await axios.patch(`http://localhost:5000/api/company/${id}/unlike`);
          if (res.data && typeof res.data.likes === 'number') {
            setLikes(res.data.likes);
            setLiked(false);
            localStorage.removeItem(`liked_${id}`);
            showNotification('Unliked!', 'info');
            return;
          }
        } catch (backendError) {
          console.log('Backend not available, using Supabase directly');
        }

        // Fallback to Supabase
        const { data: currentCompany, error: fetchError } = await supabase
          .from('companies')
          .select('likes')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const newLikes = Math.max(0, (currentCompany.likes || 0) - 1);
        const { data, error } = await supabase
          .from('companies')
          .update({ likes: newLikes })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        setLikes(data.likes);
        setLiked(false);
        localStorage.removeItem(`liked_${id}`);
        showNotification('Unliked!', 'info');
      } catch (error) {
        console.error('Unlike error:', error);
        showNotification('Failed to unlike', 'error');
      }
    } else {
      // Like
      try {
        // Try backend first, fallback to Supabase
        try {
          const res = await axios.patch(`http://localhost:5000/api/company/${id}/like`);
          if (res.data && typeof res.data.likes === 'number') {
            setLikes(res.data.likes);
            setLiked(true);
            localStorage.setItem(`liked_${id}`, 'true');
            showNotification('Liked!', 'success');
            return;
          }
        } catch (backendError) {
          console.log('Backend not available, using Supabase directly');
        }

        // Fallback to Supabase
        const { data: currentCompany, error: fetchError } = await supabase
          .from('companies')
          .select('likes')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
          .from('companies')
          .update({ likes: (currentCompany.likes || 0) + 1 })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        
        setLikes(data.likes);
        setLiked(true);
        localStorage.setItem(`liked_${id}`, 'true');
        showNotification('Liked!', 'success');
      } catch (error) {
        console.error('Like error:', error);
        showNotification('Failed to like', 'error');
      }
    }
  };

  const handleBought = async (e) => {
    e.preventDefault();
    
    // Check if this browser has already recorded a purchase for this product
    const hasBought = localStorage.getItem(`bought_${id}`);
    
    if (hasBought) {
      showNotification('You have already recorded a purchase for this product', 'info');
      window.open(product.buyLink, '_blank', 'noopener noreferrer');
      return;
    }
    
    try {
      // Try backend first, fallback to Supabase
      try {
        const res = await axios.patch(`http://localhost:5000/api/company/${id}/bought`);
        setBought(res.data.bought);
        localStorage.setItem(`bought_${id}`, 'true');
        showNotification('Purchase recorded!', 'success');
      } catch (backendError) {
        console.log('Backend not available, using Supabase directly');
        
        // Fallback to Supabase
        const { data: currentCompany, error: fetchError } = await supabase
          .from('companies')
          .select('bought')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
          .from('companies')
          .update({ bought: (currentCompany.bought || 0) + 1 })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        setBought(data.bought);
        localStorage.setItem(`bought_${id}`, 'true');
        showNotification('Purchase recorded!', 'success');
      }
    } catch (error) {
      console.error('Bought increment error:', error);
      showNotification('Failed to record purchase', 'error');
    }
    window.open(product.buyLink, '_blank', 'noopener noreferrer');
  };

  useEffect(() => {
    async function fetchComments() {
      try {
        // Try backend first, fallback to Supabase
        try {
          const res = await axios.get(`http://localhost:5000/api/company/${id}/comments`);
          setComments(res.data);
        } catch (backendError) {
          console.log('Backend not available, using Supabase directly');
          
          // Fallback to Supabase
          const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('company_id', id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching comments:', error);
            
            // If comments table doesn't exist, use localStorage
            if (error.message.includes('relation "comments" does not exist') || error.code === '42P01') {
              const localComments = JSON.parse(localStorage.getItem(`comments_${id}`) || '[]');
              setComments(localComments);
              return;
            }
            
            throw error;
          }
          setComments(data);
        }
      } catch (error) {
        console.error('Fetch comments error:', error);
        setComments([]);
      }
    }
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      // Try backend first, fallback to Supabase
      try {
        await axios.post(`http://localhost:5000/api/company/${id}/comments`, {
          name: commentName,
          text: commentText,
          userId
        });
        setCommentText('');
        setCommentName('');
        const res = await axios.get(`http://localhost:5000/api/company/${id}/comments`);
        setComments(res.data);
        showNotification('Comment posted!', 'success');
      } catch (backendError) {
        console.log('Backend not available, using Supabase directly');
        
        // Fallback to Supabase
        const comment = {
          company_id: id,
          user_id: userId,
          name: commentName || 'Anonymous',
          text: commentText
        };

        console.log('Submitting comment to Supabase:', comment);
        console.log('Using userId:', userId);
        console.log('UserId type:', typeof userId);
        console.log('UserId length:', userId.length);
        
        // Try to insert comment into Supabase
        const { data: commentData, error } = await supabase.from('comments').insert(comment);
        if (error) {
          console.error('Supabase insert error:', error);
          
          // If comments table doesn't exist, use localStorage as fallback
          if (error.message.includes('relation "comments" does not exist') || error.code === '42P01') {
            console.log('Comments table not found, using localStorage fallback');
            
            // Store comment in localStorage
            const existingComments = JSON.parse(localStorage.getItem(`comments_${id}`) || '[]');
            const newComment = {
              id: Date.now().toString(),
              company_id: id,
              user_id: userId,
              name: commentName || 'Anonymous',
              text: commentText,
              created_at: new Date().toISOString()
            };
            existingComments.unshift(newComment);
            localStorage.setItem(`comments_${id}`, JSON.stringify(existingComments));
            
            setComments(existingComments);
            setCommentText('');
            setCommentName('');
            showNotification('Comment posted! (stored locally)', 'success');
            return;
          }
          
          throw error;
        }

        setCommentText('');
        setCommentName('');
        
        // Refresh comments
        const { data, error: fetchError } = await supabase
          .from('comments')
          .select('*')
          .eq('company_id', id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching comments:', fetchError);
          
          // If comments table doesn't exist, use localStorage
          if (fetchError.message.includes('relation "comments" does not exist') || fetchError.code === '42P01') {
            const localComments = JSON.parse(localStorage.getItem(`comments_${id}`) || '[]');
            setComments(localComments);
            showNotification('Comment posted! (stored locally)', 'success');
            return;
          }
          
          throw fetchError;
        }
        setComments(data);
        showNotification('Comment posted!', 'success');
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      showNotification('Failed to post comment', 'error');
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = (commentId) => {
    // Find the comment to check if it belongs to the current user
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      showNotification('Comment not found', 'error');
      return;
    }
    
    // Check if the comment belongs to the current user
    if (comment.user_id !== userId) {
      showNotification('You can only delete your own comments', 'error');
      return;
    }
    
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      // Try backend first, fallback to Supabase
      try {
        await axios.delete(`http://localhost:5000/api/company/${id}/comments/${commentToDelete}`, {
          data: { userId }
        });
        const res = await axios.get(`http://localhost:5000/api/company/${id}/comments`);
        setComments(res.data);
        showNotification('Comment deleted!', 'success');
      } catch (backendError) {
        console.log('Backend not available, using Supabase directly');
        
        // Fallback to Supabase
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentToDelete)
          .eq('user_id', userId);

        if (error) {
          console.error('Error deleting comment:', error);
          
          // If comments table doesn't exist, use localStorage
          if (error.message.includes('relation "comments" does not exist') || error.code === '42P01') {
            const localComments = JSON.parse(localStorage.getItem(`comments_${id}`) || '[]');
            const updatedComments = localComments.filter(c => c.id !== commentToDelete);
            localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
            setComments(updatedComments);
            showNotification('Comment deleted! (stored locally)', 'success');
            return;
          }
          
          throw error;
        }

        // Refresh comments
        const { data, error: fetchError } = await supabase
          .from('comments')
          .select('*')
          .eq('company_id', id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching comments after delete:', fetchError);
          
          // If comments table doesn't exist, use localStorage
          if (fetchError.message.includes('relation "comments" does not exist') || fetchError.code === '42P01') {
            const localComments = JSON.parse(localStorage.getItem(`comments_${id}`) || '[]');
            setComments(localComments);
            showNotification('Comment deleted! (stored locally)', 'success');
            return;
          }
          
          throw fetchError;
        }
        setComments(data);
        showNotification('Comment deleted!', 'success');
      }
    } catch (error) {
      console.error('Comment deletion error:', error);
      showNotification('Failed to delete comment', 'error');
    }
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const cancelDeleteComment = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#f5c13b', fontSize: 22 }}>Loading product...</div>;
  }
  if (!product) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 24, color: '#f5c13b', marginBottom: 16 }}>Product not found</div>
        <div style={{ fontSize: 16, color: '#aaa', marginBottom: 24 }}>The product you're looking for doesn't exist or has been removed.</div>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            padding: '10px 22px', 
            borderRadius: 8, 
            border: 'none', 
            background: '#f5c13b', 
            color: '#181818', 
            fontWeight: 700, 
            fontSize: 16, 
            cursor: 'pointer' 
          }}
        >
          ← Back to Marketplace
        </button>
      </div>
    );
  }
  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  ];

  // Handle gallery images - if it's a string, try to parse it as JSON
  const getGalleryImages = () => {
    console.log('Product gallery data:', product.gallery);
    
    // Check if gallery_urls exists (from registration form)
    if (product.gallery_urls) {
      if (typeof product.gallery_urls === 'string') {
        try {
          const parsed = JSON.parse(product.gallery_urls);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Parsed gallery_urls:', parsed);
            return parsed;
          }
        } catch (error) {
          console.log('Failed to parse gallery_urls as JSON:', error);
          // If it's a single URL string, wrap it in an array
          if (product.gallery_urls.trim()) {
            return [product.gallery_urls];
          }
        }
      } else if (Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0) {
        console.log('Gallery_urls is already an array:', product.gallery_urls);
        return product.gallery_urls;
      }
    }
    
    // Fallback to gallery field
    if (product.gallery) {
      if (typeof product.gallery === 'string') {
        try {
          const parsed = JSON.parse(product.gallery);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log('Parsed gallery:', parsed);
            return parsed;
          }
        } catch {
          // If it's a single URL string, wrap it in an array
          if (product.gallery.trim()) {
            return [product.gallery];
          }
        }
      }
      
      if (Array.isArray(product.gallery) && product.gallery.length > 0) {
        console.log('Gallery is already an array:', product.gallery);
        return product.gallery;
      }
    }
    
    console.log('Using default gallery images');
    return galleryImages;
  };

  return (
    <div className="product-detail-container">
      {/* Notification Component */}
      {notification && (
        <div 
          className={`product-notification ${notification.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '600',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            background: notification.type === 'success' ? '#4CAF50' : 
                       notification.type === 'error' ? '#f44336' : 
                       notification.type === 'warning' ? '#ff9800' : '#2196F3'
          }}
        >
          {notification.message}
        </div>
      )}
      
      <div className="product-detail-content">
        <button
          onClick={() => navigate('/')}
          className="product-detail-back-btn"
        >
          ← Back to Marketplace
        </button>
        <div className="product-detail-header">
          <div className="product-detail-logo-section">
            <img 
              src={product.logo} 
              alt={product.companyName + ' logo'} 
              className="product-detail-logo"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/140x140/f5c13b/181818?text=' + encodeURIComponent(product.companyName.charAt(0));
              }}
            />
            <div className="product-detail-company-name">{product.companyName}</div>
          </div>
          <div className="product-detail-info">
            <h1 className="product-detail-title">{product.productName}</h1>
            <div className="product-detail-meta">{product.type} | {product.status} | {product.domain}</div>
            <button onClick={handleBought} className="product-detail-buy-btn">Buy Now</button>
            <div className="product-detail-stats">
              <button
                onClick={handleLikeToggle}
                className="product-detail-like-btn"
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                {liked ? (
                  <FaHeart style={{ color: 'red', marginRight: 6 }} />
                ) : (
                  <FaRegHeart style={{ color: 'white', marginRight: 6 }} />
                )}
                <span style={{ color: 'white' }}>{likes}</span>
              </button>
              {likeError && <span style={{ color: 'red', marginLeft: 10 }}>{likeError}</span>}
              <span className="product-detail-stat">
                <FaEye style={{ marginRight: 6 }} /> {views} views
              </span>
              <span className="product-detail-stat">
                <svg style={{ marginRight: 6 }} width="22" height="22" fill="#f5c13b" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg> <span style={{ color: 'white' }}>{bought}</span> bought
              </span>
            </div>
          </div>
        </div>
        <div className="product-detail-section">
          <h2 className="product-detail-section-title">Short Description</h2>
          <div className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.shortDesc?.replace(/\n/g, '<br/>') || '' }}></div>
        </div>
        <div className="product-detail-section">
          <h2 className="product-detail-section-title">About Company</h2>
          <div className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.about?.replace(/\n/g, '<br/>') || '' }}></div>
        </div>
        <div className="product-detail-section">
          <h2 className="product-detail-section-title">Gallery</h2>
          <div className="product-detail-gallery">
            {getGalleryImages().map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Gallery ${i + 1}`}
                className="product-detail-gallery-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                }}
              />
            ))}
          </div>
        </div>
        <div className="product-detail-section">
          <h2 className="product-detail-section-title">Product Demo</h2>
          {product.youtube ? (
            <div className="product-detail-video-container">
              <iframe 
                width="100%" 
                height="340" 
                src={getYouTubeEmbedUrl(product.youtube)} 
                title="YouTube video" 
                frameBorder="0" 
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
          ) : (
            <div className="product-detail-video-placeholder">
              <div style={{ fontSize: 18, marginBottom: 8 }}>No demo video available</div>
              <div style={{ fontSize: 14 }}>This company hasn't uploaded a demo video yet.</div>
            </div>
          )}
        </div>
        <div className="product-detail-section">
          <h2 className="product-detail-section-title">Comments</h2>
          <div className="product-detail-comments">
            {comments.length === 0 ? (
              <div style={{ color: '#aaa', fontStyle: 'italic' }}>No comments yet. Be the first to comment!</div>
            ) : (
              comments.slice().reverse().map((c, i) => (
                <div key={c._id || i} className="product-detail-comment">
                  <div className="product-detail-comment-content">
                    <div className="product-detail-comment-author">{c.name || 'Anonymous'}</div>
                    <div className="product-detail-comment-text">{c.text}</div>
                    <div className="product-detail-comment-time">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                  </div>
                  {c.user_id === userId && (
                    <button onClick={() => handleDeleteComment(c.id || c._id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 10, display: 'flex', alignItems: 'center', height: 32 }} title="Delete comment">
                      <FaTrash style={{ pointerEvents: 'none' }} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="product-detail-comment-form">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={commentName}
              onChange={e => setCommentName(e.target.value)}
              className="product-detail-comment-input"
            />
            <textarea
              placeholder="Write your comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="product-detail-comment-textarea"
              required
            />
            <button type="submit" disabled={commentLoading || !commentText.trim()} className="product-detail-comment-submit">
              {commentLoading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
      {showDeleteModal && (
        <div className="product-detail-delete-modal">
          <div className="product-detail-delete-content">
            <div className="product-detail-delete-title">Delete Comment?</div>
            <div className="product-detail-delete-message">Are you sure you want to delete this comment? This action cannot be undone.</div>
            <div className="product-detail-delete-buttons">
              <button onClick={confirmDeleteComment} className="product-detail-delete-confirm">Delete</button>
              <button onClick={cancelDeleteComment} className="product-detail-delete-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/register" element={<CompanyRegistrationForm />} />
        </Routes>
        {/* <footer className="footer">
          <div className="footer-left">
            <img src={footerLogo} alt="Footer Logo" className="footer-logo" />
            <p>Startup Nation India, Balewadi Highstreet, Pune. 411045</p>
            <p>
              <span className="contact-label">Contact Us:</span>{' '}
              <a href="mailto:Relationship.Officer@Startupnationindia.Com" className="contact-email">
                Relationship.Officer@Startupnationindia.Com
              </a>
            </p>
          </div>
          <div className="footer-right">
            <a href="https://twitter.com" className="footer-icon with-bg" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="24" height="24" fill="black">
                <path d="M682.3 530.3 1145.6 0h-259.5L575.5 397.7 284.6 0H0l491.3 699.9L0 1227h259.5l347.2-424.3L915.4 1227H1200L682.3 530.3Z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/startup-nation-hub/" className="footer-icon with-bg" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" />
            </a>
            <a href="https://instagram.com" className="footer-icon with-bg" target="_blank" rel="noopener noreferrer">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
            </a>
          </div>
        </footer> */}
      </div>
    </Router>
  );
}

export default App;