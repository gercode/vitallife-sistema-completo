/**
 * controllers/authController.js
 */
const { generateToken, ADMIN_USER, ADMIN_PASS } = require('../middleware/auth');
const supabase = require('../config/db');

exports.login = (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = generateToken();
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: 'Credenciales incorrectas' });
};

exports.logout = (req, res) => {
  res.json({ ok: true });
};

exports.getSettingsPublic = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({
      whatsappNumber: data.whatsapp_number,
      facebookUrl:    data.facebook_url,
      siteName:       data.site_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    res.json({
      whatsappNumber: data.whatsapp_number,
      facebookUrl:    data.facebook_url,
      siteName:       data.site_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { whatsappNumber, facebookUrl, siteName } = req.body;
    const row = {};
    if (whatsappNumber) row.whatsapp_number = whatsappNumber;
    if (facebookUrl)    row.facebook_url    = facebookUrl;
    if (siteName)       row.site_name       = siteName;

    const { data, error } = await supabase
      .from('settings')
      .update(row)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json({
      whatsappNumber: data.whatsapp_number,
      facebookUrl:    data.facebook_url,
      siteName:       data.site_name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
