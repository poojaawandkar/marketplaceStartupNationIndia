const supabase = require('../supabaseClient');

// CREATE Company
exports.createCompany = async (req, res) => {
  try {
    const {
      company_name,
      product_name,
      type,
      status,
      domain,
      short_desc,
      about,
      youtube,
      buy_link,
      logo_url,
      image_urls, // should be an array of image URLs
    } = req.body;

    const { data, error } = await supabase
      .from('companies')
      .insert([{
        company_name,
        product_name,
        type,
        status,
        domain,
        short_desc,
        about,
        youtube,
        buy_link,
        logo_url,
        image_urls,
        likes: 0,
        views: 0,
        bought: 0,
        approved: false
      }]);

    if (error) throw error;

    res.status(201).json({ message: 'Company created successfully', data });
  } catch (err) {
    res.status(500).json({ message: 'Error creating company', error: err.message });
  }
};

// GET All Companies
exports.getAllCompanies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
  }
};

// GET Company by ID
exports.getCompanyById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching company', error: err.message });
  }
};

// ADD Comment to Company
exports.addComment = async (req, res) => {
  const { companyId } = req.params;
  const { user_id, name, text } = req.body;

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        company_id: companyId,
        user_id,
        name: name || 'Anonymous',
        text,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.status(201).json({ message: 'Comment added', data });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};

// GET Comments for a Company
exports.getComments = async (req, res) => {
  const { companyId } = req.params;

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};
