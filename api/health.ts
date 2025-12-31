export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    success: true,
    message: 'Lamington Road Market Hardware Sourcing Engine is running',
    timestamp: new Date().toISOString(),
    engines: {
      hardwareSourcing: 'active',
      componentParser: 'active',
      firstCopyHeuristic: 'active',
      componentBridge: 'active',
      jugaadDetector: 'active',
      negotiationDelta: 'active',
      grayMarketAnalyzer: 'active'
    }
  });
}