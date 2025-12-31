export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Mock search results
    const mockResults = [
      {
        component: {
          partNumber: 'INTEL-i7-12700K',
          category: 'processor',
          pricing: { retailPrice: 25000 }
        },
        availabilityStatus: 'in_stock',
        location: { shopNumber: 'A-101' },
        compatibilityScore: 0.95,
        qualityScore: 0.92
      },
      {
        component: {
          partNumber: 'AMD-RX-7700XT',
          category: 'graphics',
          pricing: { retailPrice: 42000 }
        },
        availabilityStatus: 'limited_stock',
        location: { shopNumber: 'B-205' },
        compatibilityScore: 0.88,
        qualityScore: 0.90
      }
    ];
    
    return res.status(200).json({
      success: true,
      results: mockResults,
      totalResults: mockResults.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error during search' });
  }
}