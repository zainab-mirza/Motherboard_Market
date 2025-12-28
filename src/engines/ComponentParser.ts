// Component Parser Engine - Intelligent parsing of component specifications

import {
  ComponentSpecification,
  ComponentCategory,
  ElectricalParameters,
  PhysicalParameters,
  CompatibilityRequirements
} from '../models';
import {
  ComponentParserInterface,
  ParsedSpecification
} from './interfaces';

export class ComponentParser implements ComponentParserInterface {
  private componentPatterns: Map<ComponentCategory, RegExp[]>;
  private electricalPatterns: Map<string, RegExp>;
  private physicalPatterns: Map<string, RegExp>;
  private compatibilityPatterns: Map<string, RegExp>;

  constructor() {
    this.componentPatterns = this.initializeComponentPatterns();
    this.electricalPatterns = this.initializeElectricalPatterns();
    this.physicalPatterns = this.initializePhysicalPatterns();
    this.compatibilityPatterns = this.initializeCompatibilityPatterns();
  }

  parseSpecification(input: string): ParsedSpecification {
    const normalizedInput = input.toLowerCase().trim();
    const ambiguities: string[] = [];
    const validationErrors: string[] = [];
    
    // Determine component category
    const category = this.identifyCategory(normalizedInput);
    
    // Extract part number
    const partNumber = this.extractPartNumber(normalizedInput);
    
    // Extract electrical specifications
    const electricalSpecs = this.extractElectricalSpecs(normalizedInput);
    
    // Extract physical specifications
    const physicalSpecs = this.extractPhysicalSpecs(normalizedInput);
    
    // Extract compatibility requirements
    const compatibility = this.extractCompatibility(normalizedInput);
    
    // Check for ambiguities
    if (category === ComponentCategory.PERIPHERALS && !partNumber) {
      ambiguities.push('Component category unclear - please specify processor, memory, graphics, etc.');
    }
    
    if (electricalSpecs.voltage === 0 && electricalSpecs.frequency === 0) {
      ambiguities.push('No electrical specifications found - please provide voltage, frequency, or power requirements');
    }
    
    // Calculate confidence score
    let confidence = 0.5; // Base confidence
    
    if (partNumber && partNumber !== 'UNKNOWN') confidence += 0.3;
    if (category !== ComponentCategory.PERIPHERALS) confidence += 0.2;
    if (electricalSpecs.voltage > 0 || electricalSpecs.frequency > 0) confidence += 0.2;
    if (compatibility.socketType || compatibility.interfaceType) confidence += 0.1;
    
    confidence = Math.min(1.0, confidence);
    
    const extractedSpecs: ComponentSpecification = {
      partNumber: partNumber || 'UNKNOWN',
      category,
      electricalSpecs,
      physicalSpecs,
      compatibility
    };
    
    return {
      originalInput: input,
      extractedSpecs,
      confidence,
      ambiguities,
      validationErrors
    };
  }

  validateParameters(specs: ComponentSpecification): boolean {
    const errors: string[] = [];
    
    // Validate electrical parameters
    if (specs.electricalSpecs.voltage < 0) {
      errors.push('Voltage cannot be negative');
    }
    
    if (specs.electricalSpecs.frequency < 0) {
      errors.push('Frequency cannot be negative');
    }
    
    if (specs.electricalSpecs.powerConsumption < 0) {
      errors.push('Power consumption cannot be negative');
    }
    
    // Validate physical parameters
    if (specs.physicalSpecs.weight < 0) {
      errors.push('Weight cannot be negative');
    }
    
    // Category-specific validations
    switch (specs.category) {
      case ComponentCategory.PROCESSOR:
        if (specs.electricalSpecs.frequency === 0) {
          errors.push('Processor must have a frequency specification');
        }
        break;
      case ComponentCategory.MEMORY:
        if (!specs.compatibility.socketType) {
          errors.push('Memory must specify socket type (DDR3, DDR4, DDR5)');
        }
        break;
      case ComponentCategory.GRAPHICS:
        if (specs.electricalSpecs.powerConsumption === 0) {
          errors.push('Graphics card should specify power consumption');
        }
        break;
    }
    
    return errors.length === 0;
  }

  extractTechnicalData(input: string): ComponentSpecification {
    return this.parseSpecification(input).extractedSpecs;
  }

  private initializeComponentPatterns(): Map<ComponentCategory, RegExp[]> {
    const patterns = new Map();
    
    patterns.set(ComponentCategory.PROCESSOR, [
      /\b(cpu|processor|intel|amd|i[3579]|ryzen|core)\b/i,
      /\b(i[3579]-\d+[a-z]*|ryzen\s*[3579]|xeon|threadripper)\b/i
    ]);
    
    patterns.set(ComponentCategory.MEMORY, [
      /\b(ram|memory|ddr[345]|dimm|sodimm)\b/i,
      /\b(\d+gb|\d+mb)\b/i,
      /\b(pc\d+-\d+|ddr[345]-\d+)\b/i
    ]);
    
    patterns.set(ComponentCategory.GRAPHICS, [
      /\b(gpu|graphics|video|rtx|gtx|radeon|rx|vega)\b/i,
      /\b(rtx\s*\d+|gtx\s*\d+|rx\s*\d+|vega\s*\d+)\b/i
    ]);
    
    patterns.set(ComponentCategory.STORAGE, [
      /\b(ssd|hdd|nvme|sata|storage|drive)\b/i,
      /\b(\d+tb|\d+gb)\s*(ssd|hdd)\b/i
    ]);
    
    patterns.set(ComponentCategory.MOTHERBOARD, [
      /\b(motherboard|mobo|mainboard|mb)\b/i,
      /\b(lga\d+|am[45]|socket)\b/i
    ]);
    
    return patterns;
  }

  private initializeElectricalPatterns(): Map<string, RegExp> {
    const patterns = new Map();
    
    patterns.set('voltage', /(\d+(?:\.\d+)?)\s*v(?:olt)?s?\b/i);
    patterns.set('frequency', /(\d+(?:\.\d+)?)\s*(?:mhz|ghz)\b/i);
    patterns.set('power', /(\d+(?:\.\d+)?)\s*w(?:att)?s?\b/i);
    patterns.set('current', /(\d+(?:\.\d+)?)\s*a(?:mp)?s?\b/i);
    
    return patterns;
  }

  private initializePhysicalPatterns(): Map<string, RegExp> {
    const patterns = new Map();
    
    patterns.set('weight', /(\d+(?:\.\d+)?)\s*(?:g|kg|gram|kilogram)s?\b/i);
    patterns.set('length', /(\d+(?:\.\d+)?)\s*(?:mm|cm|inch)(?:es)?\s*(?:long|length)\b/i);
    patterns.set('width', /(\d+(?:\.\d+)?)\s*(?:mm|cm|inch)(?:es)?\s*(?:wide|width)\b/i);
    patterns.set('height', /(\d+(?:\.\d+)?)\s*(?:mm|cm|inch)(?:es)?\s*(?:high|height|tall)\b/i);
    
    return patterns;
  }

  private initializeCompatibilityPatterns(): Map<string, RegExp> {
    const patterns = new Map();
    
    patterns.set('socket', /\b(lga\d+|am[45]|fm[12]|socket\s*\w+)\b/i);
    patterns.set('interface', /\b(pcie?\s*[x\d]*|sata[23]?|nvme|usb[23]?|ddr[345])\b/i);
    patterns.set('formFactor', /\b(atx|micro-?atx|mini-?itx|e-?atx|dimm|sodimm)\b/i);
    
    return patterns;
  }

  private identifyCategory(input: string): ComponentCategory {
    let bestMatch = ComponentCategory.PERIPHERALS;
    let maxMatches = 0;
    
    for (const [category, patterns] of this.componentPatterns.entries()) {
      let matches = 0;
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          matches++;
        }
      }
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    }
    
    return bestMatch;
  }

  private extractPartNumber(input: string): string {
    // Common part number patterns
    const patterns = [
      /\b([a-z]+\d+[a-z]*(?:-\d+[a-z]*)*)\b/i,
      /\b(i[3579]-\d+[a-z]*)\b/i,
      /\b(ryzen\s*[3579]\s*\d+[a-z]*)\b/i,
      /\b([rg]tx?\s*\d+[a-z]*)\b/i,
      /\b(rx\s*\d+[a-z]*)\b/i
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].replace(/\s+/g, '');
      }
    }
    
    return 'UNKNOWN';
  }

  private extractElectricalSpecs(input: string): ElectricalParameters {
    const specs: ElectricalParameters = {
      voltage: 0,
      current: 0,
      frequency: 0,
      powerConsumption: 0
    };
    
    // Extract voltage
    const voltageMatch = input.match(this.electricalPatterns.get('voltage')!);
    if (voltageMatch) {
      specs.voltage = parseFloat(voltageMatch[1]);
    }
    
    // Extract frequency (convert GHz to MHz)
    const freqMatch = input.match(this.electricalPatterns.get('frequency')!);
    if (freqMatch) {
      let freq = parseFloat(freqMatch[1]);
      if (input.toLowerCase().includes('ghz')) {
        freq *= 1000; // Convert GHz to MHz
      }
      specs.frequency = freq;
    }
    
    // Extract power consumption
    const powerMatch = input.match(this.electricalPatterns.get('power')!);
    if (powerMatch) {
      specs.powerConsumption = parseFloat(powerMatch[1]);
    }
    
    // Extract current
    const currentMatch = input.match(this.electricalPatterns.get('current')!);
    if (currentMatch) {
      specs.current = parseFloat(currentMatch[1]);
    }
    
    return specs;
  }

  private extractPhysicalSpecs(input: string): PhysicalParameters {
    const specs: PhysicalParameters = {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      formFactor: 'UNKNOWN'
    };
    
    // Extract weight (convert kg to grams)
    const weightMatch = input.match(this.physicalPatterns.get('weight')!);
    if (weightMatch) {
      let weight = parseFloat(weightMatch[1]);
      if (input.toLowerCase().includes('kg')) {
        weight *= 1000; // Convert kg to grams
      }
      specs.weight = weight;
    }
    
    // Extract dimensions
    const lengthMatch = input.match(this.physicalPatterns.get('length')!);
    if (lengthMatch) {
      specs.length = parseFloat(lengthMatch[1]);
    }
    
    const widthMatch = input.match(this.physicalPatterns.get('width')!);
    if (widthMatch) {
      specs.width = parseFloat(widthMatch[1]);
    }
    
    const heightMatch = input.match(this.physicalPatterns.get('height')!);
    if (heightMatch) {
      specs.height = parseFloat(heightMatch[1]);
    }
    
    // Extract form factor
    const formFactorMatch = input.match(this.compatibilityPatterns.get('formFactor')!);
    if (formFactorMatch) {
      specs.formFactor = formFactorMatch[1].toUpperCase();
    }
    
    return specs;
  }

  private extractCompatibility(input: string): CompatibilityRequirements {
    const compatibility: CompatibilityRequirements = {};
    
    // Extract socket type
    const socketMatch = input.match(this.compatibilityPatterns.get('socket')!);
    if (socketMatch) {
      compatibility.socketType = socketMatch[1].toUpperCase();
    }
    
    // Extract interface type
    const interfaceMatch = input.match(this.compatibilityPatterns.get('interface')!);
    if (interfaceMatch) {
      compatibility.interfaceType = interfaceMatch[1].toUpperCase();
    }
    
    // Extract pin configuration (simplified)
    if (compatibility.socketType) {
      const pinMatch = compatibility.socketType.match(/(\d+)/);
      if (pinMatch) {
        compatibility.pinConfiguration = [`${pinMatch[1]} pin`];
      }
    }
    
    return compatibility;
  }
}