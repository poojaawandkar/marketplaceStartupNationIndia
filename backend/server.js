// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();
const app = express();

// CORS and middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://wragnkdnvhyguszznvjw.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWdua2Rudmh5Z3Vzenpudmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTk5MjksImV4cCI6MjA2OTE5NTkyOX0.bTHq6C3qHUIs2pfjWbUnmCWk0gudh6ke7Z9X57AIRwU'
);

// Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is live!');
});

// Register Company
app.post('/api/company', async (req, res) => {
  try {
    const companyData = req.body;
    const { data, error } = await supabase.from('companies').insert([companyData]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Company (alternative endpoint)
app.post('/api/register-company', async (req, res) => {
  try {
    console.log('Received company data:', req.body);
    
    const companyData = req.body;
    
    // Validate required fields
    const requiredFields = ['company_name', 'product_name', 'type', 'status', 'domain', 'short_desc', 'about', 'youtube', 'buy_link', 'logo_url', 'image_urls'];
    for (const field of requiredFields) {
      if (!companyData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    console.log('Attempting to insert into Supabase...');
    const { data, error } = await supabase.from('companies').insert([companyData]);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log('Successfully inserted:', data);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Get Approved Companies
app.get('/api/company', async (req, res) => {
  try {
    const { data, error } = await supabase.from('companies').select('*').eq('approved', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Approved Companies (alternative endpoint)
app.get('/api/approved-companies', async (req, res) => {
  try {
    const { data, error } = await supabase.from('companies').select('*').eq('approved', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Comment
app.post('/api/company/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, text } = req.body;

    const comment = {
      company_id: id,
      user_id: userId || null,
      name: name || 'Anonymous',
      text,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('comments').insert([comment]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Comments
app.get('/api/company/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('company_id', id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Comment
app.delete('/api/company/:id/comments/:commentId', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;

    // First check if the comment exists and belongs to the user
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('company_id', id)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the comment belongs to the user
    if (comment.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    // Delete the comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like Company
app.post('/api/company/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ likes: (company.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like Company (PATCH endpoint)
app.patch('/api/company/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ likes: (company.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlike Company (PATCH endpoint)
app.patch('/api/company/:id/unlike', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ likes: Math.max(0, (company.likes || 0) - 1) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View Count
app.post('/api/company/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('views')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ views: (company.views || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View Count (PATCH endpoint)
app.patch('/api/company/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('views')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ views: (company.views || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bought Count
app.post('/api/company/:id/bought', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('bought')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ bought: (company.bought || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bought Count (PATCH endpoint)
app.patch('/api/company/:id/bought', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('bought')
      .eq('id', id)
      .single();

    if (fetchError || !company) throw fetchError;

    const { data, error } = await supabase
      .from('companies')
      .update({ bought: (company.bought || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
