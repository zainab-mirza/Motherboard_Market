// Hardware Sourcing Engine - Core service integrating all engines for component search and sourcing

import {
  Component,
  ComponentCategory,
  AvailabilityStatus,
  AuthenticityLevel,
  MarketLocation
} from '../models';
import {
  HardwareSourcingEngineInterface,
  SearchResult,
  SearchQuery,
  AlternativeSuggestion
} from './interfaces';
import { ComponentParser } from './ComponentParser';
import { FirstCopyHeuristic } from './FirstCopyHeuristic';
import { ComponentBridge } from './ComponentBridge';

export class HardwareSourcingEngine implements HardwareSourcingEngineInterface {
  private componentParser: ComponentParser;
  private firstCopyHeuristic: FirstCopyHeuristic;
  private componentBridge: ComponentBridge;
  private componentDatabase: Map<string, Component[]>;
  private marketSections: Map<ComponentCategory, MarketLocation[]>;

  constructor() {
    this.componentParser = new ComponentParser();
    this.firstCopyHeuristic = new FirstCopyHeuristic();
    this.componentBridge = new ComponentBridge();
    this.componentDatabase = this.initializeComponentDatabase();
    this.marketSections = this.initializeMarketSections();
  }

  searchComponents(query: SearchQuery): SearchResult[] {
    // Parse the search specification
    const parsedSpec = this.componentParser.parseSpecification(query.specification);
    
    if (parsedSpec.ambiguities.length > 0) {
      // Return clarification request for ambiguous queries
      return [{
        component: this.createPlaceholderComponent(query.specification),
        availabilityStatus: AvailabilityStatus.UNKNOWN,
        location: this.getDefaultLocation(),
        compatibilityScore: 0,
        qualityScore: 0,
        requiresClarification: true,
        clarificationPrompts: parsedSpec.ambiguities,
        alternatives: []
      }];
    }

    // Search for matching components
    const matches = this.findMatchingComponents(parsedSpec.extractedSpecs);
    
    if (matches.length === 0) {
      // No exact matches found, suggest alternatives
      const alternatives = this.findAlternativeComponents(parsedSpec.extractedSpecs);
      return [{
        component: this.createPlaceholderComponent(query.specification),
        availabilityStatus: AvailabilityStatus.OUT_OF_STOCK,
        location: this.getDefaultLocation(),
        compatibilityScore: 0,
        qualityScore: 0,
        requiresClarification: false,
        clarificationPrompts: [],
        alternatives
      }];
    }

    // Process and rank the matches
    const results: SearchResult[] = [];
    
    for (const component of matches) {
      const availabilityStatus = this.checkAvailability(component);
      const location = this.getComponentLocation(component);
      const compatibilityScore = this.calculateCompatibilityScore(component, parsedSpec.extractedSpecs);
      const qualityScore = this.calculateQualityScore(component);
      const alternatives = this.findAlternativeComponents(parsedSpec.extractedSpecs, component);

      results.push({
        component,
        availabilityStatus,
        location,
        compatibilityScore,
        qualityScore,
        requiresClarification: false,
        clarificationPrompts: [],
        alternatives
      });
    }

    // Sort results by compatibility and quality
    return this.rankSearchResults(results);
  }

  private initializeComponentDatabase(): Map<string, Component[]> {
    const database = new Map();
    
    // Sample processors
    const processors: Component[] = [
      {
        id: 'cpu-001',
        partNumber: 'i7-12700K',
        category: ComponentCategory.PROCESSOR,
        specifications: {
          electrical: {
            voltage: 1.2,
            current: 125,
            frequency: 3600,
            powerConsumption: 125
          },
          physical: {
            length: 37.5,
            width: 37.5,
            height: 7.5,
            weight: 85,
            formFactor: 'LGA1700'
          },
          compatibility: {
            socketType: 'LGA1700',
            pinConfiguration: ['1700 pin'],
            interfaceType: 'PCIe 5.0',
            protocolVersion: '5.0'
          },
          operatingConditions: {
            temperatureRange: { min: 0, max: 85 },
            humidityRange: { min: 10, max: 90 }
          }
        },
        authenticity: AuthenticityLevel.OEM,
        availability: AvailabilityStatus.IN_STOCK,
        pricing: {
          retailPrice: 25000,
          marketPrice: 22000,
          bulkPricing: [],
          currency: 'INR',
          lastUpdated: new Date()
        },
        location: {
          sectionId: 'proc-zone',
          shopNumber: 'A-101',
          floor: 1,
          coordinates: { x: 10, y: 15 }
        }
      },
      {
        id: 'cpu-002',
        partNumber: 'R7-5800X',
        category: ComponentCategory.PROCESSOR,
        specifications: {
          electrical: {
            voltage: 1.35,
            current: 105,
            frequency: 3800,
            powerConsumption: 105
          },
          physical: {
            length: 40,
            width: 40,
            height: 8,
            weight: 90,
            formFactor: 'AM4'
          },
          compatibility: {
            socketType: 'AM4',
            pinConfiguration: ['1331 pin'],
            interfaceType: 'PCIe 4.0',
            protocolVersion: '4.0'
          },
          operatingConditions: {
            temperatureRange: { min: 0, max: 95 },
            humidityRange: { min: 10, max: 90 }
          }
        },
        authenticity: AuthenticityLevel.OEM,
        availability: AvailabilityStatus.IN_STOCK,
        pricing: {
          retailPrice: 28000,
          marketPrice: 25000,
          bulkPricing: [],
          currency: 'INR',
          lastUpdated: new Date()
        },
        location: {
          sectionId: 'proc-zone',
          shopNumber: 'A-102',
          floor: 1,
          coordinates: { x: 20, y: 15 }
        }
      }
    ];

    // Sample memory modules
    const memory: Component[] = [
      {
        id: 'mem-001',
        partNumber: 'CMK16GX4M2D3200C16',
        category: ComponentCategory.MEMORY,
        specifications: {
          electrical: {
            voltage: 1.35,
            current: 2,
            frequency: 3200,
            powerConsumption: 5
          },
          physical: {
            length: 133.35,
            width: 7,
            height: 31,
            weight: 45,
            formFactor: 'DIMM'
          },
          compatibility: {
            socketType: 'DDR4',
            pinConfiguration: ['288 pin'],
            interfaceType: 'DDR4',
            protocolVersion: '4.0'
          },
          operatingConditions: {
            temperatureRange: { min: 0, max: 85 },
            humidityRange: { min: 10, max: 90 }
          }
        },
        authenticity: AuthenticityLevel.OEM,
        availability: AvailabilityStatus.IN_STOCK,
        pricing: {
          retailPrice: 6500,
          marketPrice: 5800,
          bulkPricing: [],
          currency: 'INR',
          lastUpdated: new Date()
        },
        location: {
          sectionId: 'mem-zone',
          shopNumber: 'B-201',
          floor: 2,
          coordinates: { x: 5, y: 25 }
        }
      }
    ];

    database.set('processors', processors);
    database.set('memory', memory);
    
    return database;
  }

  private initializeMarketSections(): Map<ComponentCategory, MarketLocation[]> {
    const sections = new Map();
    
    sections.set(ComponentCategory.PROCESSOR, [
      {
        sectionId: 'proc-zone',
        shopNumber: 'A-101',
        floor: 1,
        coordinates: { x: 10, y: 15 }
      },
      {
        sectionId: 'proc-zone',
        shopNumber: 'A-102',
        floor: 1,
        coordinates: { x: 20, y: 15 }
      }
    ]);

    sections.set(ComponentCategory.MEMORY, [
      {
        sectionId: 'mem-zone',
        shopNumber: 'B-201',
        floor: 2,
        coordinates: { x: 5, y: 25 }
      },
      {
        sectionId: 'mem-zone',
        shopNumber: 'B-202',
        floor: 2,
        coordinates: { x: 15, y: 25 }
      }
    ]);

    sections.set(ComponentCategory.GRAPHICS, [
      {
        sectionId: 'gpu-zone',
        shopNumber: 'C-301',
        floor: 3,
        coordinates: { x: 30, y: 10 }
      },
      {
        sectionId: 'gpu-zone',
        shopNumber: 'C-302',
        floor: 3,
        coordinates: { x: 40, y: 10 }
      }
    ]);

    return sections;
  }

  private findMatchingComponents(specs: any): Component[] {
    const matches: Component[] = [];
    
    // Search through all component categories
    for (const [category, components] of this.componentDatabase.entries()) {
      for (const component of components) {
        if (this.isComponentMatch(component, specs)) {
          matches.push(component);
        }
      }
    }
    
    return matches;
  }

  private isComponentMatch(component: Component, specs: any): boolean {
    // Check category match
    if (component.category !== specs.category) {
      return false;
    }

    // Check part number match (if specified)
    if (specs.partNumber && specs.partNumber !== 'UNKNOWN') {
      if (component.partNumber.toLowerCase().includes(specs.partNumber.toLowerCase())) {
        return true;
      }
    }

    // Check electrical specifications match
    if (specs.electricalSpecs) {
      const tolerance = 0.1; // 10% tolerance
      
      if (specs.electricalSpecs.voltage > 0) {
        const voltageDiff = Math.abs(component.specifications.electrical.voltage - specs.electricalSpecs.voltage);
        if (voltageDiff > component.specifications.electrical.voltage * tolerance) {
          return false;
        }
      }

      if (specs.electricalSpecs.frequency > 0) {
        const freqDiff = Math.abs(component.specifications.electrical.frequency - specs.electricalSpecs.frequency);
        if (freqDiff > component.specifications.electrical.frequency * tolerance) {
          return false;
        }
      }
    }

    // Check compatibility requirements
    if (specs.compatibility) {
      if (specs.compatibility.socketType && 
          component.specifications.compatibility.socketType !== specs.compatibility.socketType) {
        return false;
      }

      if (specs.compatibility.interfaceType && 
          component.specifications.compatibility.interfaceType !== specs.compatibility.interfaceType) {
        return false;
      }
    }

    return true;
  }

  private findAlternativeComponents(specs: any, excludeComponent?: Component): AlternativeSuggestion[] {
    const alternatives: AlternativeSuggestion[] = [];
    
    // Find components in the same category with similar specifications
    for (const [category, components] of this.componentDatabase.entries()) {
      for (const component of components) {
        if (excludeComponent && component.id === excludeComponent.id) {
          continue;
        }

        if (component.category === specs.category) {
          const compatibilityScore = this.calculateCompatibilityScore(component, specs);
          
          if (compatibilityScore > 0.5) { // At least 50% compatible
            alternatives.push({
              component,
              compatibilityScore,
              reason: this.generateAlternativeReason(component, specs),
              tradeoffs: this.identifyTradeoffs(component, specs)
            });
          }
        }
      }
    }

    // Sort by compatibility score
    return alternatives.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 5);
  }

  private calculateCompatibilityScore(component: Component, specs: any): number {
    let score = 0;
    let maxScore = 0;

    // Category match (25%)
    maxScore += 25;
    if (component.category === specs.category) {
      score += 25;
    }

    // Electrical specifications (35%)
    maxScore += 35;
    if (specs.electricalSpecs) {
      let electricalScore = 0;
      let electricalMax = 0;

      if (specs.electricalSpecs.voltage > 0) {
        electricalMax += 10;
        const voltageDiff = Math.abs(component.specifications.electrical.voltage - specs.electricalSpecs.voltage);
        const voltageScore = Math.max(0, 10 - (voltageDiff / specs.electricalSpecs.voltage * 100));
        electricalScore += voltageScore;
      }

      if (specs.electricalSpecs.frequency > 0) {
        electricalMax += 15;
        const freqDiff = Math.abs(component.specifications.electrical.frequency - specs.electricalSpecs.frequency);
        const freqScore = Math.max(0, 15 - (freqDiff / specs.electricalSpecs.frequency * 100));
        electricalScore += freqScore;
      }

      if (specs.electricalSpecs.powerConsumption > 0) {
        electricalMax += 10;
        const powerDiff = Math.abs(component.specifications.electrical.powerConsumption - specs.electricalSpecs.powerConsumption);
        const powerScore = Math.max(0, 10 - (powerDiff / specs.electricalSpecs.powerConsumption * 100));
        electricalScore += powerScore;
      }

      if (electricalMax > 0) {
        score += (electricalScore / electricalMax) * 35;
      }
    }

    // Compatibility requirements (40%)
    maxScore += 40;
    if (specs.compatibility) {
      let compatScore = 0;
      let compatMax = 0;

      if (specs.compatibility.socketType) {
        compatMax += 20;
        if (component.specifications.compatibility.socketType === specs.compatibility.socketType) {
          compatScore += 20;
        }
      }

      if (specs.compatibility.interfaceType) {
        compatMax += 20;
        if (component.specifications.compatibility.interfaceType === specs.compatibility.interfaceType) {
          compatScore += 20;
        }
      }

      if (compatMax > 0) {
        score += (compatScore / compatMax) * 40;
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  private calculateQualityScore(component: Component): number {
    // Use the First Copy Heuristic to assess quality
    const authenticityAssessment = this.firstCopyHeuristic.calculateAuthenticityScore(component);
    return authenticityAssessment.confidenceScore / 100;
  }

  private checkAvailability(component: Component): AvailabilityStatus {
    // Simulate availability check
    return component.availability;
  }

  private getComponentLocation(component: Component): MarketLocation {
    return component.location;
  }

  private getDefaultLocation(): MarketLocation {
    return {
      sectionId: 'general',
      shopNumber: 'INFO-01',
      floor: 1,
      coordinates: { x: 0, y: 0 }
    };
  }

  private rankSearchResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
      // Primary sort: Compatibility score
      if (a.compatibilityScore !== b.compatibilityScore) {
        return b.compatibilityScore - a.compatibilityScore;
      }
      
      // Secondary sort: Quality score
      if (a.qualityScore !== b.qualityScore) {
        return b.qualityScore - a.qualityScore;
      }
      
      // Tertiary sort: Availability (in stock first)
      const availabilityOrder: Record<string, number> = {
        [AvailabilityStatus.IN_STOCK]: 3,
        [AvailabilityStatus.LIMITED_STOCK]: 2,
        [AvailabilityStatus.OUT_OF_STOCK]: 1,
        [AvailabilityStatus.UNKNOWN]: 0
      };
      
      return availabilityOrder[b.availabilityStatus] - availabilityOrder[a.availabilityStatus];
    });
  }

  private createPlaceholderComponent(specification: string): Component {
    return {
      id: 'placeholder',
      partNumber: 'UNKNOWN',
      category: ComponentCategory.PERIPHERALS,
      specifications: {
        electrical: { voltage: 0, current: 0, frequency: 0, powerConsumption: 0 },
        physical: { length: 0, width: 0, height: 0, weight: 0, formFactor: 'UNKNOWN' },
        compatibility: {},
        operatingConditions: {
          temperatureRange: { min: 0, max: 85 },
          humidityRange: { min: 10, max: 90 }
        }
      },
      authenticity: AuthenticityLevel.UNKNOWN,
      availability: AvailabilityStatus.OUT_OF_STOCK,
      pricing: {
        retailPrice: 0,
        marketPrice: 0,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      location: this.getDefaultLocation()
    };
  }

  private generateAlternativeReason(component: Component, specs: any): string {
    const reasons: string[] = [];
    
    if (component.category === specs.category) {
      reasons.push('Same component category');
    }
    
    if (component.specifications.compatibility.socketType === specs.compatibility?.socketType) {
      reasons.push('Compatible socket type');
    }
    
    if (component.specifications.compatibility.interfaceType === specs.compatibility?.interfaceType) {
      reasons.push('Compatible interface');
    }
    
    return reasons.join(', ') || 'Similar specifications';
  }

  private identifyTradeoffs(component: Component, specs: any): string[] {
    const tradeoffs: string[] = [];
    
    if (specs.electricalSpecs?.frequency && 
        component.specifications.electrical.frequency < specs.electricalSpecs.frequency) {
      tradeoffs.push('Lower frequency than requested');
    }
    
    if (specs.electricalSpecs?.powerConsumption && 
        component.specifications.electrical.powerConsumption > specs.electricalSpecs.powerConsumption) {
      tradeoffs.push('Higher power consumption');
    }
    
    return tradeoffs;
  }
}