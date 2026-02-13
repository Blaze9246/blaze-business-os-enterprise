// Simple API for Vercel
module.exports = (req, res) => {
  const { pathname } = new URL(req.url, `https://${req.headers.host}`);
  
  if (pathname === '/api/leads') {
    return res.json([
      { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
      { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' }
    ]);
  }
  
  if (pathname === '/api/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
  
  res.status(404).json({ error: 'Not found' });
};
