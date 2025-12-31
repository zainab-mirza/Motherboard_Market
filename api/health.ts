import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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