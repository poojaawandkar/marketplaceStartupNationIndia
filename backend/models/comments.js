// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST: Add a comment to a company
router.post('/add', async (req, res) => {
  const { company_id, user_id, name, text } = req.body;

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      company_id,
      user_id,
      name: name || 'Anonymous',
      text
    }]);

  if (error) return res.status(500).json({ error });
  return res.status(200).json({ message: 'Comment added', data });
});
