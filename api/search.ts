import { VercelRequest, VercelResponse } from '@vercel/node';
import { HardwareSourcingEngine } from '../src/engines/HardwareSourcingEngine';
import { ComponentCategory } from '../src/models';

const hardwareSourcingEngine = new HardwareSourcingEngine();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = {
      specification: query,
      category: ComponentCategory.PERIPHERALS,
      maxResults: 10
    };

    const results = hardwareSourcingEngine.searchComponents(searchQuery);
    
    return res.json({
      success: true,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error during search' });
  }
}