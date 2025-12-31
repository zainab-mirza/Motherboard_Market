import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle different API routes
  const { url } = req;
  
  if (url?.includes('/health')) {
    return res.json({
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
  
  // Default API response
  return res.json({
    success: true,
    message: 'Lamington Road Market API',
    endpoints: [
      '/api/health',
      '/api/search',
      '/api/authenticity',
      '/api/adapters',
      '/api/jugaad',
      '/api/negotiate',
      '/api/gray-market'
    ]
  });
}