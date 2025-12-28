// Component Bridge Engine - Matches legacy ports with modern components through adapter identification

import {
  Component,
  ComponentCategory,
  CompatibilityLevel,
  AvailabilityStatus,
  AuthenticityLevel
} from '../models';
import {
  ComponentBridgeInterface,
  WiringInstructions
} from './interfaces';
import { AdapterSolution } from '../models';

export class ComponentBridge implements ComponentBridgeInterface {
  private adapterDatabase: Map<string, AdapterTemplate[]>;
  private compatibilityMatrix: Map<string, CompatibilityRule[]>;
  private wiringTemplates: Map<string, WiringTemplate>;

  constructor() {
    this.adapterDatabase = this.initializeAdapterDatabase();
    this.compatibilityMatrix = this.initializeCompatibilityMatrix();
    this.wiringTemplates = this.initializeWiringTemplates();
  }

  identifyAdapters(legacyPort: string, modernComponent: Component): AdapterSolution[] {
    const normalizedPort = legacyPort.toLowerCase().trim();
    const adapters = this.adapterDatabase.get(normalizedPort) || [];
    const solutions: AdapterSolution[] = [];

    for (const adapter of adapters) {
      if (this.isAdapterCompatible(adapter, modernComponent)) {
        const compatibility = this.assessCompatibility(adapter, modernComponent);
        const wiringDiagram = this.generateWiringInstructions(adapter);
        const reliabilityScore = this.calculateReliabilityScore(adapter, modernComponent);
        const cost = this.estimateAdapterCost(adapter);
        const availability = this.checkAdapterAvailability(adapter);

        solutions.push({
          adapterType: adapter.name,
          compatibility,
          wiringDiagram,
          reliabilityScore,
          cost,
          availability
        });
      }
    }

    // Sort by compatibility and reliability
    return solutions.sort((a, b) => {
      if (a.compatibility !== b.compatibility) {
        const compatOrder: Record<CompatibilityLevel, number> = {
          [CompatibilityLevel.PERFECT]: 5,
          [CompatibilityLevel.GOOD]: 4,
          [CompatibilityLevel.PARTIAL]: 3,
          [CompatibilityLevel.POOR]: 2,
          [CompatibilityLevel.INCOMPATIBLE]: 1
        };
        return compatOrder[b.compatibility as CompatibilityLevel] - compatOrder[a.compatibility as CompatibilityLevel];
      }
      return b.reliabilityScore - a.reliabilityScore;
    });
  }

  validateCompatibility(component1: Component, component2: Component): boolean {
    const key = `${component1.category}_${component2.category}`;
    const rules = this.compatibilityMatrix.get(key) || [];

    for (const rule of rules) {
      if (!rule.checkFunction(component1, component2)) {
        return false;
      }
    }

    return true;
  }

  generateWiringDiagrams(adapter: AdapterSolution): WiringInstructions {
    return this.generateWiringInstructions(adapter);
  }

  private initializeAdapterDatabase(): Map<string, AdapterTemplate[]> {
    const database = new Map();

    // VGA adapters
    database.set('vga', [
      {
        id: 'vga_to_hdmi',
        name: 'VGA to HDMI Adapter',
        description: 'Converts VGA analog signal to HDMI digital',
        inputPort: 'VGA',
        outputPort: 'HDMI',
        signalType: 'analog_to_digital',
        maxResolution: '1920x1080',
        requiresPower: true,
        compatibility: {
          categories: [ComponentCategory.GRAPHICS, ComponentCategory.MOTHERBOARD],
          minVoltage: 5.0,
          maxVoltage: 12.0
        },
        physicalSpecs: {
          length: 80,
          width: 45,
          height: 15,
          weight: 50
        },
        reliabilityFactor: 0.85,
        costRange: { min: 500, max: 1200 }
      },
      {
        id: 'vga_to_dvi',
        name: 'VGA to DVI-I Adapter',
        description: 'Passive VGA to DVI-I analog conversion',
        inputPort: 'VGA',
        outputPort: 'DVI-I',
        signalType: 'analog_to_analog',
        maxResolution: '1920x1200',
        requiresPower: false,
        compatibility: {
          categories: [ComponentCategory.GRAPHICS, ComponentCategory.MOTHERBOARD],
          minVoltage: 0,
          maxVoltage: 0
        },
        physicalSpecs: {
          length: 60,
          width: 35,
          height: 12,
          weight: 30
        },
        reliabilityFactor: 0.95,
        costRange: { min: 200, max: 500 }
      }
    ]);

    // DVI adapters
    database.set('dvi', [
      {
        id: 'dvi_to_hdmi',
        name: 'DVI to HDMI Adapter',
        description: 'DVI-D to HDMI digital conversion',
        inputPort: 'DVI-D',
        outputPort: 'HDMI',
        signalType: 'digital_to_digital',
        maxResolution: '2560x1600',
        requiresPower: false,
        compatibility: {
          categories: [ComponentCategory.GRAPHICS],
          minVoltage: 0,
          maxVoltage: 0
        },
        physicalSpecs: {
          length: 50,
          width: 30,
          height: 10,
          weight: 25
        },
        reliabilityFactor: 0.98,
        costRange: { min: 300, max: 800 }
      },
      {
        id: 'dvi_to_displayport',
        name: 'DVI to DisplayPort Adapter',
        description: 'Active DVI to DisplayPort conversion',
        inputPort: 'DVI-D',
        outputPort: 'DisplayPort',
        signalType: 'digital_to_digital',
        maxResolution: '3840x2160',
        requiresPower: true,
        compatibility: {
          categories: [ComponentCategory.GRAPHICS],
          minVoltage: 5.0,
          maxVoltage: 5.0
        },
        physicalSpecs: {
          length: 90,
          width: 40,
          height: 18,
          weight: 75
        },
        reliabilityFactor: 0.88,
        costRange: { min: 1500, max: 3000 }
      }
    ]);

    // PS/2 adapters
    database.set('ps2', [
      {
        id: 'ps2_to_usb',
        name: 'PS/2 to USB Adapter',
        description: 'PS/2 keyboard/mouse to USB conversion',
        inputPort: 'PS/2',
        outputPort: 'USB-A',
        signalType: 'serial_to_usb',
        maxResolution: 'N/A',
        requiresPower: false,
        compatibility: {
          categories: [ComponentCategory.PERIPHERALS, ComponentCategory.MOTHERBOARD],
          minVoltage: 5.0,
          maxVoltage: 5.0
        },
        physicalSpecs: {
          length: 40,
          width: 20,
          height: 8,
          weight: 15
        },
        reliabilityFactor: 0.92,
        costRange: { min: 150, max: 400 }
      }
    ]);

    // Serial port adapters
    database.set('serial', [
      {
        id: 'serial_to_usb',
        name: 'Serial to USB Adapter',
        description: 'RS-232 serial to USB conversion',
        inputPort: 'RS-232',
        outputPort: 'USB-A',
        signalType: 'serial_to_usb',
        maxResolution: 'N/A',
        requiresPower: false,
        compatibility: {
          categories: [ComponentCategory.PERIPHERALS, ComponentCategory.MOTHERBOARD],
          minVoltage: 5.0,
          maxVoltage: 5.0
        },
        physicalSpecs: {
          length: 70,
          width: 25,
          height: 12,
          weight: 35
        },
        reliabilityFactor: 0.90,
        costRange: { min: 400, max: 1000 }
      }
    ]);

    // Parallel port adapters
    database.set('parallel', [
      {
        id: 'parallel_to_usb',
        name: 'Parallel to USB Adapter',
        description: 'LPT parallel port to USB conversion',
        inputPort: 'LPT',
        outputPort: 'USB-A',
        signalType: 'parallel_to_usb',
        maxResolution: 'N/A',
        requiresPower: false,
        compatibility: {
          categories: [ComponentCategory.PERIPHERALS],
          minVoltage: 5.0,
          maxVoltage: 5.0
        },
        physicalSpecs: {
          length: 85,
          width: 35,
          height: 15,
          weight: 60
        },
        reliabilityFactor: 0.85,
        costRange: { min: 600, max: 1500 }
      }
    ]);

    // IDE/PATA adapters
    database.set('ide', [
      {
        id: 'ide_to_sata',
        name: 'IDE to SATA Adapter',
        description: 'IDE/PATA to SATA conversion',
        inputPort: 'IDE',
        outputPort: 'SATA',
        signalType: 'parallel_to_serial',
        maxResolution: 'N/A',
        requiresPower: true,
        compatibility: {
          categories: [ComponentCategory.STORAGE, ComponentCategory.MOTHERBOARD],
          minVoltage: 5.0,
          maxVoltage: 12.0
        },
        physicalSpecs: {
          length: 100,
          width: 60,
          height: 20,
          weight: 120
        },
        reliabilityFactor: 0.88,
        costRange: { min: 800, max: 2000 }
      },
      {
        id: 'ide_to_usb',
        name: 'IDE to USB Adapter',
        description: 'IDE/PATA to USB 3.0 conversion',
        inputPort: 'IDE',
        outputPort: 'USB-A',
        signalType: 'parallel_to_usb',
        maxResolution: 'N/A',
        requiresPower: true,
        compatibility: {
          categories: [ComponentCategory.STORAGE],
          minVoltage: 5.0,
          maxVoltage: 12.0
        },
        physicalSpecs: {
          length: 120,
          width: 50,
          height: 25,
          weight: 150
        },
        reliabilityFactor: 0.82,
        costRange: { min: 1200, max: 2500 }
      }
    ]);

    return database;
  }

  private initializeCompatibilityMatrix(): Map<string, CompatibilityRule[]> {
    const matrix = new Map();

    // Graphics card compatibility rules
    matrix.set(`${ComponentCategory.GRAPHICS}_${ComponentCategory.MOTHERBOARD}`, [
      {
        name: 'Power Supply Check',
        checkFunction: (gpu: Component, mobo: Component) => {
          return gpu.specifications.electrical.powerConsumption <= 300; // Reasonable limit
        }
      },
      {
        name: 'Interface Compatibility',
        checkFunction: (gpu: Component, mobo: Component) => {
          const gpuInterface = gpu.specifications.compatibility.interfaceType;
          const moboInterface = mobo.specifications.compatibility.interfaceType;
          return gpuInterface === moboInterface || 
                 (gpuInterface?.includes('PCIe') && moboInterface?.includes('PCIe'));
        }
      }
    ]);

    // Memory compatibility rules
    matrix.set(`${ComponentCategory.MEMORY}_${ComponentCategory.MOTHERBOARD}`, [
      {
        name: 'Socket Type Match',
        checkFunction: (memory: Component, mobo: Component) => {
          return memory.specifications.compatibility.socketType === 
                 mobo.specifications.compatibility.socketType;
        }
      },
      {
        name: 'Voltage Compatibility',
        checkFunction: (memory: Component, mobo: Component) => {
          const memVoltage = memory.specifications.electrical.voltage;
          const moboVoltage = mobo.specifications.electrical.voltage;
          return Math.abs(memVoltage - moboVoltage) <= 0.2; // 0.2V tolerance
        }
      }
    ]);

    return matrix;
  }

  private initializeWiringTemplates(): Map<string, WiringTemplate> {
    const templates = new Map();

    templates.set('vga_to_hdmi', {
      diagramUrl: '/diagrams/vga_to_hdmi.svg',
      pinMappings: [
        { source: 'VGA Pin 1 (Red)', target: 'HDMI Red Channel' },
        { source: 'VGA Pin 2 (Green)', target: 'HDMI Green Channel' },
        { source: 'VGA Pin 3 (Blue)', target: 'HDMI Blue Channel' },
        { source: 'VGA Pin 13 (H-Sync)', target: 'HDMI H-Sync' },
        { source: 'VGA Pin 14 (V-Sync)', target: 'HDMI V-Sync' },
        { source: 'Power Input', target: 'USB 5V Power' }
      ],
      requiredTools: ['Screwdriver', 'Cable tester'],
      difficulty: 'medium',
      estimatedTime: 15,
      safetyNotes: [
        'Ensure all devices are powered off before connection',
        'Check power requirements before connecting'
      ]
    });

    templates.set('ps2_to_usb', {
      diagramUrl: '/diagrams/ps2_to_usb.svg',
      pinMappings: [
        { source: 'PS/2 Pin 1 (Data)', target: 'USB Data+' },
        { source: 'PS/2 Pin 3 (Ground)', target: 'USB Ground' },
        { source: 'PS/2 Pin 4 (VCC)', target: 'USB 5V' },
        { source: 'PS/2 Pin 5 (Clock)', target: 'USB Data-' }
      ],
      requiredTools: ['None'],
      difficulty: 'easy',
      estimatedTime: 5,
      safetyNotes: [
        'Hot-plugging may not be supported',
        'Some legacy devices may require driver installation'
      ]
    });

    return templates;
  }

  private isAdapterCompatible(adapter: AdapterTemplate, component: Component): boolean {
    // Check if component category is supported
    if (!adapter.compatibility.categories.includes(component.category)) {
      return false;
    }

    // Check voltage requirements
    const componentVoltage = component.specifications.electrical.voltage;
    if (adapter.compatibility.minVoltage > 0 && 
        (componentVoltage < adapter.compatibility.minVoltage || 
         componentVoltage > adapter.compatibility.maxVoltage)) {
      return false;
    }

    // Check power requirements
    if (adapter.requiresPower && component.specifications.electrical.powerConsumption === 0) {
      return false; // Component doesn't provide power info
    }

    return true;
  }

  private assessCompatibility(adapter: AdapterTemplate, component: Component): CompatibilityLevel {
    let score = 0;
    let maxScore = 0;

    // Category compatibility (40%)
    maxScore += 40;
    if (adapter.compatibility.categories.includes(component.category)) {
      score += 40;
    }

    // Voltage compatibility (30%)
    maxScore += 30;
    const componentVoltage = component.specifications.electrical.voltage;
    if (adapter.compatibility.minVoltage === 0 && adapter.compatibility.maxVoltage === 0) {
      score += 30; // No voltage requirements
    } else if (componentVoltage >= adapter.compatibility.minVoltage && 
               componentVoltage <= adapter.compatibility.maxVoltage) {
      score += 30;
    } else {
      const voltageDiff = Math.min(
        Math.abs(componentVoltage - adapter.compatibility.minVoltage),
        Math.abs(componentVoltage - adapter.compatibility.maxVoltage)
      );
      score += Math.max(0, 30 - (voltageDiff * 10));
    }

    // Power compatibility (20%)
    maxScore += 20;
    if (!adapter.requiresPower) {
      score += 20; // No power required
    } else if (component.specifications.electrical.powerConsumption > 0) {
      score += 20; // Component can provide power
    }

    // Interface compatibility (10%)
    maxScore += 10;
    const componentInterface = component.specifications.compatibility.interfaceType;
    if (componentInterface && 
        (componentInterface.includes(adapter.outputPort) || 
         adapter.outputPort.includes(componentInterface))) {
      score += 10;
    }

    const compatibilityPercentage = (score / maxScore) * 100;

    if (compatibilityPercentage >= 90) return CompatibilityLevel.PERFECT;
    if (compatibilityPercentage >= 75) return CompatibilityLevel.GOOD;
    if (compatibilityPercentage >= 50) return CompatibilityLevel.PARTIAL;
    if (compatibilityPercentage >= 25) return CompatibilityLevel.POOR;
    return CompatibilityLevel.INCOMPATIBLE;
  }

  private calculateReliabilityScore(adapter: AdapterTemplate, component: Component): number {
    let score = adapter.reliabilityFactor;

    // Adjust based on component authenticity
    switch (component.authenticity) {
      case AuthenticityLevel.OEM:
        score *= 1.0;
        break;
      case AuthenticityLevel.FIRST_COPY:
        score *= 0.9;
        break;
      case AuthenticityLevel.GENERIC:
        score *= 0.8;
        break;
      default:
        score *= 0.7;
    }

    // Adjust based on power requirements
    if (adapter.requiresPower && component.specifications.electrical.powerConsumption < 10) {
      score *= 0.9; // Lower reliability if power is uncertain
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  private estimateAdapterCost(adapter: AdapterTemplate): number {
    const basePrice = (adapter.costRange.min + adapter.costRange.max) / 2;
    
    // Add markup for complexity
    let markup = 1.0;
    if (adapter.requiresPower) markup += 0.2;
    if (adapter.signalType.includes('analog_to_digital')) markup += 0.3;
    if (adapter.difficulty === 'hard' || adapter.difficulty === 'expert') markup += 0.1;

    return Math.round(basePrice * markup);
  }

  private checkAdapterAvailability(adapter: AdapterTemplate): AvailabilityStatus {
    // Simulate availability based on adapter complexity and popularity
    if (adapter.reliabilityFactor > 0.9 && !adapter.requiresPower) {
      return AvailabilityStatus.IN_STOCK;
    } else if (adapter.reliabilityFactor > 0.8) {
      return AvailabilityStatus.LIMITED_STOCK;
    } else {
      return AvailabilityStatus.OUT_OF_STOCK;
    }
  }

  private generateWiringInstructions(adapter: AdapterTemplate | AdapterSolution): WiringInstructions {
    const adapterId = typeof adapter === 'object' && 'adapterType' in adapter 
      ? adapter.adapterType.toLowerCase().replace(/\s+/g, '_')
      : adapter.id;
    
    const template = this.wiringTemplates.get(adapterId);
    
    if (template) {
      return {
        diagramUrl: template.diagramUrl,
        pinMapping: template.pinMappings.map(mapping => ({
          source: mapping.source,
          target: mapping.target
        })),
        requiredTools: template.requiredTools,
        difficulty: template.difficulty as 'easy' | 'medium' | 'hard' | 'expert'
      };
    }

    // Default wiring instructions
    return {
      diagramUrl: '/diagrams/generic_adapter.svg',
      pinMapping: [
        { source: 'Input Port', target: 'Output Port' }
      ],
      requiredTools: ['Basic tools'],
      difficulty: 'medium'
    };
  }
}

// Supporting interfaces
interface AdapterTemplate {
  id: string;
  name: string;
  description: string;
  inputPort: string;
  outputPort: string;
  signalType: string;
  maxResolution: string;
  requiresPower: boolean;
  compatibility: {
    categories: ComponentCategory[];
    minVoltage: number;
    maxVoltage: number;
  };
  physicalSpecs: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  reliabilityFactor: number;
  costRange: { min: number; max: number };
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
}

interface CompatibilityRule {
  name: string;
  checkFunction: (component1: Component, component2: Component) => boolean;
}

interface WiringTemplate {
  diagramUrl: string;
  pinMappings: { source: string; target: string }[];
  requiredTools: string[];
  difficulty: string;
  estimatedTime: number;
  safetyNotes: string[];
}