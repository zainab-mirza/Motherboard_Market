const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for local development
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
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
});

// Component search endpoint
app.post('/api/search', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Mock search results for demo
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
    
    return res.json({
      success: true,
      results: mockResults,
      totalResults: mockResults.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error during search' });
  }
});

// Authenticity analysis endpoint
app.post('/api/authenticity', (req, res) => {
  try {
    const { componentId } = req.body;
    
    if (!componentId) {
      return res.status(400).json({ error: 'Component ID is required' });
    }

    // Mock authenticity analysis
    const mockAnalysis = {
      confidenceScore: 87,
      weightAnalysis: {
        measuredWeight: 85,
        oemStandardWeight: 87,
        variance: -2.3,
        withinTolerance: true
      },
      thermalAnalysis: {
        heatSyncQuality: 8.5,
        thermalConductivity: 7.8,
        coolingEfficiency: 8.2
      },
      qualityIndicators: {
        overallScore: 8.4
      }
    };
    
    return res.json({
      success: true,
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Authenticity analysis error:', error);
    return res.status(500).json({ error: 'Internal server error during authenticity analysis' });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lamington Road Market Hardware Sourcing Engine`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📊 BIOS Interface available at http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`⚡ All engines initialized and ready`);
});

module.exports = app;