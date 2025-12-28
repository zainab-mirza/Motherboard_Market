// First Copy Heuristic Engine - Distinguishes between OEM and first-copy components

import {
  Component,
  ComponentCategory,
  AuthenticityLevel
} from '../models';
import {
  FirstCopyHeuristicInterface,
  WeightComparison,
  ThermalAssessment
} from './interfaces';
import { AuthenticityAssessment, QualityMetrics } from '../models';

export class FirstCopyHeuristic implements FirstCopyHeuristicInterface {
  private oemStandards: Map<ComponentCategory, OEMStandard>;
  private thermalProfiles: Map<ComponentCategory, ThermalProfile>;
  private qualityIndicators: Map<ComponentCategory, QualityIndicator[]>;

  constructor() {
    this.oemStandards = this.initializeOEMStandards();
    this.thermalProfiles = this.initializeThermalProfiles();
    this.qualityIndicators = this.initializeQualityIndicators();
  }

  analyzeWeight(component: Component): WeightComparison {
    const standard = this.oemStandards.get(component.category);
    const measuredWeight = component.specifications.physical.weight;
    
    if (!standard) {
      return {
        measuredWeight,
        oemStandardWeight: measuredWeight,
        variance: 0,
        withinTolerance: true
      };
    }

    const oemStandardWeight = this.calculateExpectedWeight(component, standard);
    const variance = ((measuredWeight - oemStandardWeight) / oemStandardWeight) * 100;
    const withinTolerance = Math.abs(variance) <= standard.weightTolerance;

    return {
      measuredWeight,
      oemStandardWeight,
      variance,
      withinTolerance
    };
  }

  assessHeatSync(component: Component): ThermalAssessment {
    const thermalProfile = this.thermalProfiles.get(component.category);
    
    if (!thermalProfile) {
      return {
        heatSyncQuality: 0.5,
        thermalConductivity: 0.5,
        coolingEfficiency: 0.5,
        materialQuality: 0.5
      };
    }

    // Simulate thermal analysis based on component specifications
    const powerDensity = component.specifications.electrical.powerConsumption / 
                        (component.specifications.physical.length * component.specifications.physical.width);
    
    const heatSyncQuality = this.calculateHeatSyncQuality(component, thermalProfile, powerDensity);
    const thermalConductivity = this.calculateThermalConductivity(component, thermalProfile);
    const coolingEfficiency = this.calculateCoolingEfficiency(component, thermalProfile);
    const materialQuality = this.calculateMaterialQuality(component, thermalProfile);

    return {
      heatSyncQuality,
      thermalConductivity,
      coolingEfficiency,
      materialQuality
    };
  }

  calculateAuthenticityScore(component: Component): AuthenticityAssessment {
    const weightAnalysis = this.analyzeWeight(component);
    const thermalAnalysis = this.assessHeatSync(component);
    const qualityIndicators = this.assessQualityMetrics(component);

    // Calculate overall confidence score
    let confidenceScore = 50; // Base score

    // Weight analysis contribution (30%)
    if (weightAnalysis.withinTolerance) {
      confidenceScore += 30;
    } else {
      const weightPenalty = Math.min(30, Math.abs(weightAnalysis.variance) * 2);
      confidenceScore -= weightPenalty;
    }

    // Thermal analysis contribution (25%)
    const thermalScore = (thermalAnalysis.heatSyncQuality + 
                         thermalAnalysis.thermalConductivity + 
                         thermalAnalysis.coolingEfficiency + 
                         thermalAnalysis.materialQuality) / 4;
    confidenceScore += thermalScore * 25;

    // Quality indicators contribution (25%)
    confidenceScore += qualityIndicators.overallScore * 25;

    // Authenticity level adjustment (20%)
    switch (component.authenticity) {
      case AuthenticityLevel.OEM:
        confidenceScore += 20;
        break;
      case AuthenticityLevel.FIRST_COPY:
        confidenceScore += 10;
        break;
      case AuthenticityLevel.GENERIC:
        confidenceScore -= 10;
        break;
      case AuthenticityLevel.UNKNOWN:
        confidenceScore -= 20;
        break;
    }

    // Ensure score is within bounds
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      confidenceScore,
      weightAnalysis,
      thermalAnalysis,
      qualityIndicators
    };
  }

  private initializeOEMStandards(): Map<ComponentCategory, OEMStandard> {
    const standards = new Map();

    standards.set(ComponentCategory.PROCESSOR, {
      baseWeight: 80, // grams
      weightPerCore: 5,
      weightPerGHz: 2,
      weightTolerance: 15, // percentage
      densityRange: { min: 2.5, max: 3.2 }, // g/cm³
      materialComposition: {
        silicon: 0.7,
        copper: 0.15,
        aluminum: 0.1,
        other: 0.05
      }
    });

    standards.set(ComponentCategory.MEMORY, {
      baseWeight: 40, // grams
      weightPerGB: 2,
      weightPerModule: 5,
      weightTolerance: 10,
      densityRange: { min: 1.8, max: 2.4 },
      materialComposition: {
        silicon: 0.6,
        copper: 0.2,
        plastic: 0.15,
        other: 0.05
      }
    });

    standards.set(ComponentCategory.GRAPHICS, {
      baseWeight: 500, // grams
      weightPerCUDA: 0.5,
      weightPerWatt: 3,
      weightTolerance: 20,
      densityRange: { min: 3.0, max: 4.5 },
      materialComposition: {
        aluminum: 0.4,
        copper: 0.25,
        silicon: 0.2,
        plastic: 0.15
      }
    });

    return standards;
  }

  private initializeThermalProfiles(): Map<ComponentCategory, ThermalProfile> {
    const profiles = new Map();

    profiles.set(ComponentCategory.PROCESSOR, {
      baseThermalResistance: 0.3, // °C/W
      heatSyncEfficiency: 0.85,
      thermalConductivity: 150, // W/mK for copper
      operatingTempRange: { min: 0, max: 85 },
      thermalMass: 0.02, // J/°C
      coolingRequirement: 1.5 // W/°C
    });

    profiles.set(ComponentCategory.GRAPHICS, {
      baseThermalResistance: 0.2,
      heatSyncEfficiency: 0.9,
      thermalConductivity: 200,
      operatingTempRange: { min: 0, max: 95 },
      thermalMass: 0.1,
      coolingRequirement: 2.0
    });

    profiles.set(ComponentCategory.MEMORY, {
      baseThermalResistance: 1.0,
      heatSyncEfficiency: 0.6,
      thermalConductivity: 50,
      operatingTempRange: { min: 0, max: 85 },
      thermalMass: 0.005,
      coolingRequirement: 0.5
    });

    return profiles;
  }

  private initializeQualityIndicators(): Map<ComponentCategory, QualityIndicator[]> {
    const indicators = new Map();

    indicators.set(ComponentCategory.PROCESSOR, [
      {
        name: 'Die Quality',
        weight: 0.3,
        assessmentFunction: (component: Component) => {
          // Simulate die quality assessment based on frequency and power efficiency
          const efficiency = component.specifications.electrical.frequency / 
                            component.specifications.electrical.powerConsumption;
          return Math.min(1.0, efficiency / 30); // Normalize to 0-1
        }
      },
      {
        name: 'Package Quality',
        weight: 0.25,
        assessmentFunction: (component: Component) => {
          // Assess package quality based on physical specifications
          const volume = component.specifications.physical.length * 
                        component.specifications.physical.width * 
                        component.specifications.physical.height;
          const density = component.specifications.physical.weight / volume;
          return density > 2.0 ? 0.9 : 0.6; // Higher density indicates better packaging
        }
      },
      {
        name: 'Thermal Interface',
        weight: 0.25,
        assessmentFunction: (component: Component) => {
          // Simulate thermal interface quality
          return component.authenticity === AuthenticityLevel.OEM ? 0.95 : 0.7;
        }
      },
      {
        name: 'Manufacturing Precision',
        weight: 0.2,
        assessmentFunction: (component: Component) => {
          // Assess manufacturing precision
          const weightAnalysis = this.analyzeWeight(component);
          return weightAnalysis.withinTolerance ? 0.9 : 0.6;
        }
      }
    ]);

    return indicators;
  }

  private calculateExpectedWeight(component: Component, standard: OEMStandard): number {
    let expectedWeight = standard.baseWeight;

    // Adjust based on component-specific factors
    switch (component.category) {
      case ComponentCategory.PROCESSOR:
        // Estimate cores from part number or use frequency as proxy
        const estimatedCores = this.estimateCoreCount(component);
        const frequencyGHz = component.specifications.electrical.frequency / 1000;
        expectedWeight += (estimatedCores * standard.weightPerCore!) + 
                         (frequencyGHz * standard.weightPerGHz!);
        break;

      case ComponentCategory.MEMORY:
        // Estimate capacity from part number
        const estimatedCapacity = this.estimateMemoryCapacity(component);
        expectedWeight += estimatedCapacity * standard.weightPerGB!;
        break;

      case ComponentCategory.GRAPHICS:
        const powerWatts = component.specifications.electrical.powerConsumption;
        expectedWeight += powerWatts * standard.weightPerWatt!;
        break;
    }

    return expectedWeight;
  }

  private calculateHeatSyncQuality(component: Component, profile: ThermalProfile, powerDensity: number): number {
    // Higher power density requires better heat sync
    const requiredEfficiency = Math.min(1.0, powerDensity / 100);
    const actualEfficiency = profile.heatSyncEfficiency;
    
    if (actualEfficiency >= requiredEfficiency) {
      return 0.9; // Good heat sync
    } else {
      return actualEfficiency / requiredEfficiency; // Proportional quality
    }
  }

  private calculateThermalConductivity(component: Component, profile: ThermalProfile): number {
    // Simulate thermal conductivity assessment
    const expectedConductivity = profile.thermalConductivity;
    const powerConsumption = component.specifications.electrical.powerConsumption;
    
    // Higher power components need better thermal conductivity
    const requiredConductivity = powerConsumption * 0.5; // Simplified calculation
    
    return Math.min(1.0, expectedConductivity / Math.max(requiredConductivity, 50));
  }

  private calculateCoolingEfficiency(component: Component, profile: ThermalProfile): number {
    const thermalMass = profile.thermalMass;
    const coolingReq = profile.coolingRequirement;
    const powerConsumption = component.specifications.electrical.powerConsumption;
    
    // Calculate cooling efficiency based on thermal mass and power
    const efficiency = (thermalMass * coolingReq) / (powerConsumption * 0.01);
    
    return Math.min(1.0, efficiency);
  }

  private calculateMaterialQuality(component: Component, profile: ThermalProfile): number {
    // Simulate material quality assessment
    const weightAnalysis = this.analyzeWeight(component);
    
    if (weightAnalysis.withinTolerance) {
      return 0.9; // Good material quality
    } else {
      // Penalize based on weight variance
      const penalty = Math.abs(weightAnalysis.variance) / 100;
      return Math.max(0.3, 0.9 - penalty);
    }
  }

  private assessQualityMetrics(component: Component): QualityMetrics {
    const indicators = this.qualityIndicators.get(component.category) || [];
    
    let buildQuality = 0;
    let materialGrade = 0;
    let finishQuality = 0;
    
    // Calculate weighted scores from indicators
    for (const indicator of indicators) {
      const score = indicator.assessmentFunction(component);
      
      if (indicator.name.includes('Die') || indicator.name.includes('Package')) {
        buildQuality += score * indicator.weight;
      } else if (indicator.name.includes('Material') || indicator.name.includes('Thermal')) {
        materialGrade += score * indicator.weight;
      } else {
        finishQuality += score * indicator.weight;
      }
    }
    
    // Normalize scores
    buildQuality = Math.min(10, buildQuality * 10);
    materialGrade = Math.min(10, materialGrade * 10);
    finishQuality = Math.min(10, finishQuality * 10);
    
    const overallScore = (buildQuality + materialGrade + finishQuality) / 30; // Normalize to 0-1

    return {
      buildQuality,
      materialGrade,
      finishQuality,
      overallScore
    };
  }

  private estimateCoreCount(component: Component): number {
    // Simple heuristic based on part number patterns
    const partNumber = component.partNumber.toLowerCase();
    
    if (partNumber.includes('i3')) return 4;
    if (partNumber.includes('i5')) return 6;
    if (partNumber.includes('i7')) return 8;
    if (partNumber.includes('i9')) return 12;
    if (partNumber.includes('ryzen 3')) return 4;
    if (partNumber.includes('ryzen 5')) return 6;
    if (partNumber.includes('ryzen 7')) return 8;
    if (partNumber.includes('ryzen 9')) return 12;
    
    // Default estimate based on frequency
    const frequencyGHz = component.specifications.electrical.frequency / 1000;
    return Math.max(2, Math.min(16, Math.round(frequencyGHz * 2)));
  }

  private estimateMemoryCapacity(component: Component): number {
    // Extract capacity from part number
    const partNumber = component.partNumber.toLowerCase();
    
    const capacityMatch = partNumber.match(/(\d+)gb/);
    if (capacityMatch) {
      return parseInt(capacityMatch[1]);
    }
    
    // Default estimate based on frequency (higher frequency often means higher capacity)
    const frequency = component.specifications.electrical.frequency;
    if (frequency >= 3200) return 16;
    if (frequency >= 2400) return 8;
    return 4;
  }
}

// Supporting interfaces
interface OEMStandard {
  baseWeight: number;
  weightPerCore?: number;
  weightPerGB?: number;
  weightPerModule?: number;
  weightPerCUDA?: number;
  weightPerWatt?: number;
  weightPerGHz?: number;
  weightTolerance: number;
  densityRange: { min: number; max: number };
  materialComposition: { [material: string]: number };
}

interface ThermalProfile {
  baseThermalResistance: number;
  heatSyncEfficiency: number;
  thermalConductivity: number;
  operatingTempRange: { min: number; max: number };
  thermalMass: number;
  coolingRequirement: number;
}

interface QualityIndicator {
  name: string;
  weight: number;
  assessmentFunction: (component: Component) => number;
}