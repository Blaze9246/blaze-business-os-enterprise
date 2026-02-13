module.exports = function(req, res) {
  res.json([
    { id: '1', name: 'Yes Friends', company: 'Ethical Clothing', email: 'contact@yesfriends.com', score: 30, tier: 'COLD', source: 'Daily Lead Gen', date: 'Feb 13, 2026' },
    { id: '2', name: 'Glow Skincare', company: 'Glow Skincare Co', email: 'hello@glowskincare.com', score: 85, tier: 'HOT', source: 'Shopify Scraper', date: 'Feb 12, 2026' },
    { id: '3', name: 'Urban Threads', company: 'Urban Threads SA', email: 'info@urbanthreads.co.za', score: 72, tier: 'WARM', source: 'Google Search', date: 'Feb 11, 2026' }
  ]);
};
