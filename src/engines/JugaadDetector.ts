// Jugaad Detector Engine - Identifies creative workaround solutions using available components

import {
  Component,
  ComponentCategory,
  AuthenticityLevel
} from '../models';
import {
  JugaadDetectorInterface,
  AssemblyStep,
  SafetyNote
} from './interfaces';
import { JugaadSolution } from '../models';

export class JugaadDetector implements JugaadDetectorInterface {
  private workaroundDatabase: Map<string, JugaadTemplate[]>;
  private safetyRules: Map<ComponentCategory, SafetyRule[]>;
  private complexityFactors: Map<string, number>;

  constructor() {
    this.workaroundDatabase = this.initializeWorkaroundDatabase();
    this.safetyRules = this.initializeSafetyRules();
    this.complexityFactors = this.initializeComplexityFactors();
  }

  findAlternatives(targetComponent: Component, availableInventory: Component[]): JugaadSolution[] {
    const solutions: JugaadSolution[] = [];
    
    // Get workaround templates for the target component category
    const templates = this.getWorkaroundTemplates(targetComponent);
    
    for (const template of templates) {
      const alternativeComponents = this.findMatchingComponents(template, availableInventory);
      
      if (alternativeComponents.length >= template.minimumComponents) {
        const assemblyInstructions = this.generateAssemblyInstructions(template, alternativeComponents);
        const safetyWarnings = this.generateSafetyWarnings(template, alternativeComponents);
        const reliabilityScore = this.calculateReliabilityScore(template, alternativeComponents);
        const complexityScore = this.calculateComplexityScore(template, alternativeComponents);

        solutions.push(new JugaadSolution(
          this.generateSolutionId(targetComponent, template),
          targetComponent,
          alternativeComponents,
          assemblyInstructions,
          safetyWarnings,
          reliabilityScore,
          complexityScore,
          template,
          this.calculateEstimatedCost(alternativeComponents),
          this.calculateEstimatedTime(template, alternativeComponents)
        ));
      }
    }

    // Sort by reliability and complexity
    return this.rankSolutions(solutions);
  }

  validateSafety(solution: JugaadSolution): boolean {
    const safetyChecks: boolean[] = [];
    
    // Check electrical safety
    safetyChecks.push(this.checkElectricalSafety(solution));
    
    // Check thermal safety
    safetyChecks.push(this.checkThermalSafety(solution));
    
    // Check mechanical safety
    safetyChecks.push(this.checkMechanicalSafety(solution));
    
    // Check compatibility safety
    safetyChecks.push(this.checkCompatibilitySafety(solution));
    
    // All safety checks must pass
    return safetyChecks.every(check => check);
  }

  generateInstructions(solution: JugaadSolution): AssemblyStep[] {
    const steps: AssemblyStep[] = [];
    const template = solution.template;
    
    // Pre-assembly steps
    steps.push({
      stepNumber: 1,
      title: 'Preparation',
      description: 'Gather all required components and tools',
      requiredTools: template.requiredTools,
      estimatedTime: 10,
      difficulty: 'Easy',
      safetyNotes: ['Ensure all devices are powered off', 'Work in a static-free environment'],
      safetyWarnings: ['Ensure all devices are powered off', 'Work in a static-free environment']
    });

    // Component-specific assembly steps
    let stepNumber = 2;
    for (const instruction of template.assemblySteps) {
      steps.push({
        stepNumber: stepNumber++,
        title: instruction.title,
        description: this.customizeInstruction(instruction.description, solution.alternativeComponents),
        requiredTools: instruction.requiredTools,
        estimatedTime: instruction.estimatedTime,
        difficulty: instruction.difficulty,
        safetyNotes: instruction.safetyNotes,
        safetyWarnings: instruction.safetyNotes || []
      });
    }

    // Testing and validation steps
    steps.push({
      stepNumber: stepNumber++,
      title: 'Testing',
      description: 'Test the assembled solution before final installation',
      requiredTools: ['Multimeter', 'Power supply'],
      estimatedTime: 15,
      difficulty: 'Medium',
      safetyNotes: ['Test with low power first', 'Monitor for unusual heat or sounds'],
      safetyWarnings: ['Test with low power first', 'Monitor for unusual heat or sounds']
    });

    steps.push({
      stepNumber: stepNumber,
      title: 'Final Installation',
      description: 'Install the completed jugaad solution in the target system',
      requiredTools: ['Screwdrivers', 'Cable ties'],
      estimatedTime: 20,
      difficulty: 'Medium',
      safetyNotes: ['Secure all connections', 'Ensure proper ventilation'],
      safetyWarnings: ['Secure all connections', 'Ensure proper ventilation']
    });

    return steps;
  }

  private initializeWorkaroundDatabase(): Map<string, JugaadTemplate[]> {
    const database = new Map();
    
    // Power supply workarounds
    database.set('POWER_SUPPLY', [
      {
        id: 'psu_dual_supply',
        name: 'Dual Power Supply Solution',
        description: 'Use two smaller PSUs to replace one large PSU',
        targetCategory: ComponentCategory.POWER_SUPPLY,
        minimumComponents: 2,
        requiredTools: ['Wire strippers', 'Electrical tape', 'Multimeter', 'Soldering iron'],
        assemblySteps: [
          {
            title: 'Wire Preparation',
            description: 'Prepare power distribution wires for dual PSU setup',
            requiredTools: ['Wire strippers', 'Electrical tape'],
            estimatedTime: 30,
            difficulty: 'Medium',
            safetyNotes: ['Use proper gauge wires', 'Insulate all connections']
          },
          {
            title: 'PSU Synchronization',
            description: 'Connect PSU enable signals for synchronized startup',
            requiredTools: ['Soldering iron', 'Multimeter'],
            estimatedTime: 45,
            difficulty: 'Hard',
            safetyNotes: ['Test continuity before powering on', 'Use proper flux and solder']
          }
        ],
        reliabilityFactor: 0.7,
        complexityFactor: 0.8,
        safetyRisk: 'Medium'
      }
    ]);

    // Graphics card workarounds
    database.set('GRAPHICS', [
      {
        id: 'gpu_external_power',
        name: 'External GPU Power Mod',
        description: 'Add external power connector to underpowered GPU',
        targetCategory: ComponentCategory.GRAPHICS,
        minimumComponents: 1,
        requiredTools: ['Soldering iron', 'Power connectors', 'Multimeter', 'Heat gun'],
        assemblySteps: [
          {
            title: 'Power Analysis',
            description: 'Analyze GPU power requirements and available power rails',
            requiredTools: ['Multimeter', 'Schematic'],
            estimatedTime: 20,
            difficulty: 'Hard',
            safetyNotes: ['Identify correct voltage rails', 'Check current capacity']
          },
          {
            title: 'Connector Installation',
            description: 'Install additional power connector on GPU PCB',
            requiredTools: ['Soldering iron', 'Power connectors', 'Heat gun'],
            estimatedTime: 60,
            difficulty: 'Expert',
            safetyNotes: ['Use proper temperature control', 'Avoid damaging nearby components']
          }
        ],
        reliabilityFactor: 0.6,
        complexityFactor: 0.9,
        safetyRisk: 'High'
      }
    ]);

    // Memory workarounds
    database.set('MEMORY', [
      {
        id: 'mem_voltage_mod',
        name: 'Memory Voltage Modification',
        description: 'Modify memory voltage for compatibility with older systems',
        targetCategory: ComponentCategory.MEMORY,
        minimumComponents: 1,
        requiredTools: ['Precision screwdrivers', 'Resistors', 'Soldering iron'],
        assemblySteps: [
          {
            title: 'Voltage Rail Identification',
            description: 'Identify memory voltage regulation circuit',
            requiredTools: ['Multimeter', 'Magnifying glass'],
            estimatedTime: 25,
            difficulty: 'Hard',
            safetyNotes: ['Work with powered-off system', 'Use anti-static precautions']
          },
          {
            title: 'Resistor Modification',
            description: 'Replace voltage divider resistors for correct voltage',
            requiredTools: ['Soldering iron', 'Resistors', 'Flux'],
            estimatedTime: 40,
            difficulty: 'Expert',
            safetyNotes: ['Use correct resistor values', 'Test voltage before installation']
          }
        ],
        reliabilityFactor: 0.5,
        complexityFactor: 0.85,
        safetyRisk: 'High'
      }
    ]);

    // Cooling workarounds
    database.set('COOLING', [
      {
        id: 'custom_cooling_loop',
        name: 'DIY Liquid Cooling Loop',
        description: 'Create custom cooling solution using available pumps and radiators',
        targetCategory: ComponentCategory.COOLING,
        minimumComponents: 3,
        requiredTools: ['Tubing', 'Fittings', 'Coolant', 'Leak tester'],
        assemblySteps: [
          {
            title: 'Loop Planning',
            description: 'Plan cooling loop layout and component placement',
            requiredTools: ['Measuring tape', 'Marker'],
            estimatedTime: 30,
            difficulty: 'Medium',
            safetyNotes: ['Plan for easy maintenance access', 'Consider gravity effects']
          },
          {
            title: 'Component Installation',
            description: 'Install pump, radiator, and water blocks',
            requiredTools: ['Screwdrivers', 'Thermal paste', 'Fittings'],
            estimatedTime: 90,
            difficulty: 'Hard',
            safetyNotes: ['Ensure proper mounting pressure', 'Check all fittings for tightness']
          },
          {
            title: 'Loop Testing',
            description: 'Fill and test the cooling loop for leaks',
            requiredTools: ['Coolant', 'Leak tester', 'Paper towels'],
            estimatedTime: 45,
            difficulty: 'Medium',
            safetyNotes: ['Test outside of case first', 'Monitor for 24 hours minimum']
          }
        ],
        reliabilityFactor: 0.8,
        complexityFactor: 0.7,
        safetyRisk: 'Medium'
      }
    ]);

    return database;
  }

  private initializeSafetyRules(): Map<ComponentCategory, SafetyRule[]> {
    const rules = new Map();
    
    rules.set(ComponentCategory.POWER_SUPPLY, [
      {
        rule: 'Never exceed rated current capacity',
        severity: 'Critical',
        checkFunction: (components: Component[]) => {
          return components.every(c => c.specifications.electrical.current <= c.specifications.electrical.powerConsumption / c.specifications.electrical.voltage);
        }
      },
      {
        rule: 'Ensure proper grounding',
        severity: 'High',
        checkFunction: (components: Component[]) => true // Simplified check
      }
    ]);

    rules.set(ComponentCategory.GRAPHICS, [
      {
        rule: 'Verify power connector ratings',
        severity: 'Critical',
        checkFunction: (components: Component[]) => {
          return components.every(c => c.specifications.electrical.powerConsumption <= 300); // Max safe power
        }
      },
      {
        rule: 'Check thermal limits',
        severity: 'High',
        checkFunction: (components: Component[]) => true // Simplified check
      }
    ]);

    return rules;
  }

  private initializeComplexityFactors(): Map<string, number> {
    const factors = new Map();
    
    factors.set('soldering_required', 0.3);
    factors.set('precision_work', 0.2);
    factors.set('multiple_components', 0.1);
    factors.set('custom_fabrication', 0.4);
    factors.set('electrical_modification', 0.35);
    
    return factors;
  }

  private getWorkaroundTemplates(targetComponent: Component): JugaadTemplate[] {
    const categoryKey = targetComponent.category.toString();
    return this.workaroundDatabase.get(categoryKey) || [];
  }

  private findMatchingComponents(template: JugaadTemplate, inventory: Component[]): Component[] {
    const matches: Component[] = [];
    
    for (const component of inventory) {
      if (this.isComponentSuitableForTemplate(component, template)) {
        matches.push(component);
      }
    }
    
    return matches.slice(0, template.minimumComponents + 2); // Take a few extra for options
  }

  private isComponentSuitableForTemplate(component: Component, template: JugaadTemplate): boolean {
    // Check if component category is compatible with template
    if (template.targetCategory === ComponentCategory.POWER_SUPPLY) {
      return component.category === ComponentCategory.POWER_SUPPLY;
    }
    
    if (template.targetCategory === ComponentCategory.GRAPHICS) {
      return component.category === ComponentCategory.GRAPHICS || 
             component.category === ComponentCategory.POWER_SUPPLY; // For power mods
    }
    
    if (template.targetCategory === ComponentCategory.MEMORY) {
      return component.category === ComponentCategory.MEMORY;
    }
    
    if (template.targetCategory === ComponentCategory.COOLING) {
      return component.category === ComponentCategory.COOLING ||
             component.category === ComponentCategory.PERIPHERALS; // For pumps, fans
    }
    
    return false;
  }

  private generateAssemblyInstructions(template: JugaadTemplate, components: Component[]): AssemblyStep[] {
    // This would be called by generateInstructions method
    return template.assemblySteps.map((step, index) => ({
      stepNumber: index + 2, // Start from 2 (after preparation)
      title: step.title,
      description: this.customizeInstruction(step.description, components),
      requiredTools: step.requiredTools,
      estimatedTime: step.estimatedTime,
      difficulty: step.difficulty,
      safetyNotes: step.safetyNotes,
      safetyWarnings: step.safetyNotes || []
    }));
  }

  private generateSafetyWarnings(template: JugaadTemplate, components: Component[]): SafetyNote[] {
    const warnings: SafetyNote[] = [];
    
    // Template-specific warnings
    warnings.push({
      severity: template.safetyRisk.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
      message: `This modification has ${template.safetyRisk.toLowerCase()} safety risk`,
      category: 'General',
      description: `This modification has ${template.safetyRisk.toLowerCase()} safety risk`,
      precautions: ['Follow all safety guidelines', 'Use proper tools and equipment']
    });
    
    // Component-specific warnings
    for (const component of components) {
      const categoryRules = this.safetyRules.get(component.category) || [];
      
      for (const rule of categoryRules) {
        if (!rule.checkFunction(components)) {
          warnings.push({
            severity: rule.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
            message: rule.rule,
            category: component.category.toString(),
            description: rule.rule,
            precautions: ['Verify all connections', 'Test thoroughly before use']
          });
        }
      }
    }
    
    // Power-related warnings
    const totalPower = components.reduce((sum, c) => sum + c.specifications.electrical.powerConsumption, 0);
    if (totalPower > 500) {
      warnings.push({
        severity: 'high',
        message: 'High power consumption - ensure adequate cooling and power supply',
        category: 'Power',
        description: 'High power consumption - ensure adequate cooling and power supply',
        precautions: ['Use adequate power supply', 'Ensure proper cooling', 'Monitor temperatures']
      });
    }
    
    return warnings;
  }

  private calculateReliabilityScore(template: JugaadTemplate, components: Component[]): number {
    let score = template.reliabilityFactor;
    
    // Adjust based on component quality
    const avgQuality = components.reduce((sum, c) => {
      return sum + (c.authenticity === AuthenticityLevel.OEM ? 1 : 0.7);
    }, 0) / components.length;
    
    score *= avgQuality;
    
    // Adjust based on component age/condition (simulated)
    score *= 0.9; // Assume some degradation
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  private calculateComplexityScore(template: JugaadTemplate, components: Component[]): number {
    let complexity = template.complexityFactor;
    
    // Adjust based on number of components
    complexity += (components.length - template.minimumComponents) * 0.1;
    
    // Adjust based on component types
    const uniqueCategories = new Set(components.map(c => c.category)).size;
    complexity += (uniqueCategories - 1) * 0.05;
    
    return Math.min(1.0, Math.max(0.0, complexity));
  }

  private calculateEstimatedCost(components: Component[]): number {
    const componentCost = components.reduce((sum, c) => sum + (c.pricing?.retailPrice || 0), 0);
    const toolsCost = 500; // Estimated tools cost
    const materialsCost = 200; // Estimated materials cost
    
    return componentCost + toolsCost + materialsCost;
  }

  private calculateEstimatedTime(template: JugaadTemplate, components: Component[]): number {
    const baseTime = template.assemblySteps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const complexityMultiplier = 1 + (components.length - template.minimumComponents) * 0.2;
    
    return Math.round(baseTime * complexityMultiplier);
  }

  private rankSolutions(solutions: JugaadSolution[]): JugaadSolution[] {
    return solutions.sort((a, b) => {
      // Primary sort: Reliability (higher is better)
      if (a.reliabilityScore !== b.reliabilityScore) {
        return b.reliabilityScore - a.reliabilityScore;
      }
      
      // Secondary sort: Complexity (lower is better)
      if (a.complexityScore !== b.complexityScore) {
        return a.complexityScore - b.complexityScore;
      }
      
      // Tertiary sort: Cost (lower is better)
      return a.estimatedCost - b.estimatedCost;
    });
  }

  private generateSolutionId(targetComponent: Component, template: JugaadTemplate): string {
    return `jugaad_${targetComponent.category}_${template.id}_${Date.now()}`;
  }

  private customizeInstruction(instruction: string, components: Component[]): string {
    // Replace placeholders with actual component information
    let customized = instruction;
    
    components.forEach((component, index) => {
      customized = customized.replace(`{component${index + 1}}`, component.partNumber);
      customized = customized.replace(`{category${index + 1}}`, component.category.toString());
    });
    
    return customized;
  }

  private checkElectricalSafety(solution: JugaadSolution): boolean {
    const components = solution.alternativeComponents;
    
    // Check voltage compatibility
    const voltages = components.map(c => c.specifications.electrical.voltage);
    const maxVoltage = Math.max(...voltages);
    const minVoltage = Math.min(...voltages);
    
    if (maxVoltage / minVoltage > 2) {
      return false; // Too much voltage difference
    }
    
    // Check current capacity
    const totalCurrent = components.reduce((sum, c) => sum + c.specifications.electrical.current, 0);
    if (totalCurrent > 50) { // Arbitrary safe limit
      return false;
    }
    
    return true;
  }

  private checkThermalSafety(solution: JugaadSolution): boolean {
    const components = solution.alternativeComponents;
    
    // Check total power dissipation
    const totalPower = components.reduce((sum, c) => sum + c.specifications.electrical.powerConsumption, 0);
    
    // Ensure adequate cooling for power level
    const coolingComponents = components.filter(c => c.category === ComponentCategory.COOLING);
    const coolingCapacity = coolingComponents.length * 100; // Simplified calculation
    
    return totalPower <= coolingCapacity;
  }

  private checkMechanicalSafety(solution: JugaadSolution): boolean {
    // Check for mechanical stress points
    const components = solution.alternativeComponents;
    
    // Ensure components can physically fit together
    const totalWeight = components.reduce((sum, c) => sum + c.specifications.physical.weight, 0);
    
    return totalWeight < 5000; // 5kg limit for safety
  }

  private checkCompatibilitySafety(solution: JugaadSolution): boolean {
    // Check for incompatible interfaces
    const components = solution.alternativeComponents;
    
    // Simplified compatibility check
    return components.every(c => c.specifications.compatibility.interfaceType !== undefined);
  }
}

// Supporting interfaces and types
interface JugaadTemplate {
  id: string;
  name: string;
  description: string;
  targetCategory: ComponentCategory;
  minimumComponents: number;
  requiredTools: string[];
  assemblySteps: TemplateStep[];
  reliabilityFactor: number;
  complexityFactor: number;
  safetyRisk: string;
}

interface TemplateStep {
  title: string;
  description: string;
  requiredTools: string[];
  estimatedTime: number;
  difficulty: string;
  safetyNotes: string[];
}

interface SafetyRule {
  rule: string;
  severity: string;
  checkFunction: (components: Component[]) => boolean;
}