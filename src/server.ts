// Express server for the Lamington Road Market Hardware Sourcing Engine

import express from 'express';
import cors from 'cors';
import path from 'path';
import { HardwareSourcingEngine } from './engines/HardwareSourcingEngine';
import { ComponentParser } from './engines/ComponentParser';
import { FirstCopyHeuristic } from './engines/FirstCopyHeuristic';
import { ComponentBridge } from './engines/ComponentBridge';
import { JugaadDetector } from './engines/JugaadDetector';
import { NegotiationDelta } from './engines/NegotiationDelta';
import { GrayMarketAnalyzer } from './engines/GrayMarketAnalyzer';
import { Component, ComponentCategory, AvailabilityStatus, AuthenticityLevel } from './models';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize engines
const hardwareSourcingEngine = new HardwareSourcingEngine();
const componentParser = new ComponentParser();
const firstCopyHeuristic = new FirstCopyHeuristic();
const componentBridge = new ComponentBridge();
const jugaadDetector = new JugaadDetector();
const negotiationDelta = new NegotiationDelta();
const grayMarketAnalyzer = new GrayMarketAnalyzer();

// API Routes

// Component search endpoint
app.post('/api/search', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = {
      specification: query,
      category: ComponentCategory.PERIPHERALS, // Default category
      maxResults: 10
    };

    const results = hardwareSourcingEngine.searchComponents(searchQuery);
    
    res.json({
      success: true,
      results,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error during search' });
  }
});

// Component parsing endpoint
app.post('/api/parse', (req, res) => {
  try {
    const { specification } = req.body;
    
    if (!specification) {
      return res.status(400).json({ error: 'Component specification is required' });
    }

    const parsed = componentParser.parseSpecification(specification);
    
    res.json({
      success: true,
      parsed
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: 'Internal server error during parsing' });
  }
});

// Authenticity analysis endpoint
app.post('/api/authenticity', (req, res) => {
  try {
    const { componentId } = req.body;
    
    if (!componentId) {
      return res.status(400).json({ error: 'Component ID is required' });
    }

    // Create a sample component for demonstration
    const sampleComponent = new Component(
      componentId,
      'Sample-Component',
      ComponentCategory.PROCESSOR,
      {
        electrical: { voltage: 1.2, current: 125, frequency: 3600, powerConsumption: 125 },
        physical: { length: 37.5, width: 37.5, height: 7.5, weight: 85, formFactor: 'LGA1700' },
        compatibility: { socketType: 'LGA1700' },
        operatingConditions: {
          temperatureRange: { min: 0, max: 85 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      AuthenticityLevel.OEM,
      AvailabilityStatus.IN_STOCK,
      {
        retailPrice: 25000,
        marketPrice: 23000,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      {
        sectionId: 'proc-zone',
        shopNumber: 'A-101',
        floor: 1,
        coordinates: { x: 10, y: 15 }
      }
    );

    const analysis = firstCopyHeuristic.calculateAuthenticityScore(sampleComponent);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Authenticity analysis error:', error);
    res.status(500).json({ error: 'Internal server error during authenticity analysis' });
  }
});

// Adapter identification endpoint
app.post('/api/adapters', (req, res) => {
  try {
    const { legacyPort, modernComponent } = req.body;
    
    if (!legacyPort) {
      return res.status(400).json({ error: 'Legacy port specification is required' });
    }

    // Create a sample modern component for demonstration
    const sampleComponent = new Component(
      'modern-001',
      'Modern-Component',
      ComponentCategory.GRAPHICS,
      {
        electrical: { voltage: 12, current: 25, frequency: 1800, powerConsumption: 300 },
        physical: { length: 280, width: 120, height: 50, weight: 1200, formFactor: 'PCIe' },
        compatibility: { socketType: 'PCIe x16', interfaceType: 'PCIe 4.0' },
        operatingConditions: {
          temperatureRange: { min: 0, max: 95 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      AuthenticityLevel.OEM,
      AvailabilityStatus.IN_STOCK,
      {
        retailPrice: 45000,
        marketPrice: 42000,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      {
        sectionId: 'gpu-zone',
        shopNumber: 'B-205',
        floor: 2,
        coordinates: { x: 30, y: 10 }
      }
    );

    const adapters = componentBridge.identifyAdapters(legacyPort, sampleComponent);
    
    res.json({
      success: true,
      adapters
    });
  } catch (error) {
    console.error('Adapter identification error:', error);
    res.status(500).json({ error: 'Internal server error during adapter identification' });
  }
});

// Jugaad solutions endpoint
app.post('/api/jugaad', (req, res) => {
  try {
    const { targetComponentId, availableComponents } = req.body;
    
    if (!targetComponentId) {
      return res.status(400).json({ error: 'Target component ID is required' });
    }

    // Create sample components for demonstration
    const targetComponent = new Component(
      targetComponentId,
      'Target-Component',
      ComponentCategory.POWER_SUPPLY,
      {
        electrical: { voltage: 12, current: 50, frequency: 0, powerConsumption: 600 },
        physical: { length: 150, width: 86, height: 160, weight: 2000, formFactor: 'ATX' },
        compatibility: { socketType: 'ATX', interfaceType: '24-pin' },
        operatingConditions: {
          temperatureRange: { min: 0, max: 50 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      AuthenticityLevel.OEM,
      AvailabilityStatus.OUT_OF_STOCK,
      {
        retailPrice: 8000,
        marketPrice: 7500,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      {
        sectionId: 'psu-zone',
        shopNumber: 'C-301',
        floor: 3,
        coordinates: { x: 15, y: 20 }
      }
    );

    const availableInventory = [
      new Component(
        'alt-001',
        'Alternative-PSU-1',
        ComponentCategory.POWER_SUPPLY,
        {
          electrical: { voltage: 12, current: 30, frequency: 0, powerConsumption: 350 },
          physical: { length: 140, width: 80, height: 150, weight: 1500, formFactor: 'SFX' },
          compatibility: { socketType: 'SFX', interfaceType: '24-pin' },
          operatingConditions: {
            temperatureRange: { min: 0, max: 50 },
            humidityRange: { min: 10, max: 90 }
          }
        },
        AuthenticityLevel.FIRST_COPY,
        AvailabilityStatus.IN_STOCK,
        {
          retailPrice: 4000,
          marketPrice: 3500,
          bulkPricing: [],
          currency: 'INR',
          lastUpdated: new Date()
        },
        {
          sectionId: 'psu-zone',
          shopNumber: 'C-302',
          floor: 3,
          coordinates: { x: 16, y: 20 }
        }
      )
    ];

    const solutions = jugaadDetector.findAlternatives(targetComponent, availableInventory);
    
    res.json({
      success: true,
      solutions
    });
  } catch (error) {
    console.error('Jugaad solutions error:', error);
    res.status(500).json({ error: 'Internal server error during jugaad analysis' });
  }
});

// Negotiation calculation endpoint
app.post('/api/negotiate', (req, res) => {
  try {
    const { componentId, quantity, vendorId } = req.body;
    
    if (!componentId || !quantity) {
      return res.status(400).json({ error: 'Component ID and quantity are required' });
    }

    // Create a sample component for demonstration
    const sampleComponent = new Component(
      componentId,
      'Negotiation-Component',
      ComponentCategory.MEMORY,
      {
        electrical: { voltage: 1.35, current: 2, frequency: 3200, powerConsumption: 5 },
        physical: { length: 133, width: 7, height: 31, weight: 45, formFactor: 'DIMM' },
        compatibility: { socketType: 'DDR4', interfaceType: 'DDR4' },
        operatingConditions: {
          temperatureRange: { min: 0, max: 85 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      AuthenticityLevel.OEM,
      AvailabilityStatus.IN_STOCK,
      {
        retailPrice: 6500,
        marketPrice: 6000,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      {
        sectionId: 'mem-zone',
        shopNumber: 'D-401',
        floor: 4,
        coordinates: { x: 5, y: 25 }
      }
    );

    const negotiation = negotiationDelta.calculateDiscount(sampleComponent, quantity, vendorId);
    
    res.json({
      success: true,
      negotiation
    });
  } catch (error) {
    console.error('Negotiation calculation error:', error);
    res.status(500).json({ error: 'Internal server error during negotiation calculation' });
  }
});

// Gray market analysis endpoint
app.post('/api/gray-market', (req, res) => {
  try {
    const { componentId } = req.body;
    
    if (!componentId) {
      return res.status(400).json({ error: 'Component ID is required' });
    }

    // Create a sample component for demonstration
    const sampleComponent = new Component(
      componentId,
      'Gray-Market-Component',
      ComponentCategory.GRAPHICS,
      {
        electrical: { voltage: 12, current: 25, frequency: 1800, powerConsumption: 300 },
        physical: { length: 280, width: 120, height: 50, weight: 1200, formFactor: 'PCIe' },
        compatibility: { socketType: 'PCIe x16', interfaceType: 'PCIe 4.0' },
        operatingConditions: {
          temperatureRange: { min: 0, max: 95 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      AuthenticityLevel.UNKNOWN,
      AvailabilityStatus.LIMITED_STOCK,
      {
        retailPrice: 45000,
        marketPrice: 42000,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      {
        sectionId: 'gpu-zone',
        shopNumber: 'B-205',
        floor: 2,
        coordinates: { x: 30, y: 10 }
      }
    );

    const priceAnalysis = grayMarketAnalyzer.analyzePricing(sampleComponent);
    const availabilityPrediction = grayMarketAnalyzer.predictAvailability(sampleComponent);
    const riskAssessment = grayMarketAnalyzer.assessRisks(sampleComponent);
    
    res.json({
      success: true,
      analysis: {
        pricing: priceAnalysis,
        availability: availabilityPrediction,
        risks: riskAssessment
      }
    });
  } catch (error) {
    console.error('Gray market analysis error:', error);
    res.status(500).json({ error: 'Internal server error during gray market analysis' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
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
});

// Serve the main application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lamington Road Market Hardware Sourcing Engine`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📊 BIOS Interface available at http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`⚡ All engines initialized and ready`);
});

export default app;