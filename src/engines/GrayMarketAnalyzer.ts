// Gray Market Analyzer - Calculates pricing trends and availability timelines for non-OEM components

import {
  Component,
  ComponentCategory,
  AvailabilityStatus,
  AuthenticityLevel
} from '../models';
import {
  GrayMarketAnalyzerInterface,
  PriceAnalysis,
  AvailabilityPrediction,
  RiskAssessment
} from './interfaces';

export class GrayMarketAnalyzer implements GrayMarketAnalyzerInterface {
  private priceHistory: Map<string, PriceHistoryEntry[]>;
  private supplyChainData: Map<ComponentCategory, SupplyChainInfo>;
  private riskFactors: Map<ComponentCategory, RiskFactor[]>;

  constructor() {
    this.priceHistory = this.initializePriceHistory();
    this.supplyChainData = this.initializeSupplyChainData();
    this.riskFactors = this.initializeRiskFactors();
  }

  analyzePricing(component: Component): PriceAnalysis {
    const componentHistory = this.priceHistory.get(component.id) || [];
    const officialPrice = component.pricing?.retailPrice || 0;
    
    // Calculate gray market price (typically 15-30% lower than official)
    const grayMarketDiscount = this.calculateGrayMarketDiscount(component);
    const grayMarketPrice = officialPrice * (1 - grayMarketDiscount);
    
    const priceDifference = officialPrice - grayMarketPrice;
    const trendPrediction = this.predictPriceTrend(componentHistory);
    
    return {
      grayMarketPrice,
      officialPrice,
      priceDifference,
      priceHistory: componentHistory.map(entry => ({
        date: entry.date,
        price: entry.grayMarketPrice
      })),
      trendPrediction
    };
  }

  predictAvailability(component: Component): AvailabilityPrediction {
    const supplyChainInfo = this.supplyChainData.get(component.category);
    const baseDeliveryDays = this.calculateBaseDeliveryTime(component);
    
    // Adjust delivery time based on supply chain conditions
    let adjustedDeliveryDays = baseDeliveryDays;
    if (supplyChainInfo) {
      adjustedDeliveryDays *= supplyChainInfo.deliveryMultiplier;
    }
    
    const stockLevel = this.assessStockLevel(component);
    const supplyChainRisk = this.calculateSupplyChainRisk(component);
    const alternativeAvailability = this.checkAlternativeAvailability(component);
    
    return {
      expectedDeliveryDays: Math.round(adjustedDeliveryDays),
      stockLevel,
      supplyChainRisk,
      alternativeAvailability
    };
  }

  assessRisks(component: Component): RiskAssessment {
    const categoryRisks = this.riskFactors.get(component.category) || [];
    
    let qualityRisk = 0.3; // Base gray market quality risk
    let warrantyRisk = 0.8; // High warranty risk for gray market
    let compatibilityRisk = 0.2; // Base compatibility risk
    
    // Adjust risks based on component category
    for (const risk of categoryRisks) {
      qualityRisk += risk.qualityImpact;
      warrantyRisk += risk.warrantyImpact;
      compatibilityRisk += risk.compatibilityImpact;
    }
    
    // Normalize risks to 0-1 range
    qualityRisk = Math.min(1, Math.max(0, qualityRisk));
    warrantyRisk = Math.min(1, Math.max(0, warrantyRisk));
    compatibilityRisk = Math.min(1, Math.max(0, compatibilityRisk));
    
    const overallRisk = (qualityRisk + warrantyRisk + compatibilityRisk) / 3;
    
    const riskFactors = this.identifyRiskFactors(component, qualityRisk, warrantyRisk, compatibilityRisk);
    const mitigationSuggestions = this.generateMitigationSuggestions(component, riskFactors);
    
    return {
      qualityRisk,
      warrantyRisk,
      compatibilityRisk,
      overallRisk,
      riskFactors,
      mitigationSuggestions
    };
  }

  private initializePriceHistory(): Map<string, PriceHistoryEntry[]> {
    const history = new Map();
    
    // Sample price history for demonstration
    const sampleHistory: PriceHistoryEntry[] = [
      { date: new Date('2024-01-01'), officialPrice: 25000, grayMarketPrice: 20000 },
      { date: new Date('2024-02-01'), officialPrice: 25000, grayMarketPrice: 19500 },
      { date: new Date('2024-03-01'), officialPrice: 24500, grayMarketPrice: 19000 },
      { date: new Date('2024-04-01'), officialPrice: 24000, grayMarketPrice: 18800 }
    ];
    
    history.set('cpu-001', sampleHistory);
    
    return history;
  }

  private initializeSupplyChainData(): Map<ComponentCategory, SupplyChainInfo> {
    const data = new Map();
    
    data.set(ComponentCategory.PROCESSOR, {
      averageDeliveryDays: 7,
      deliveryMultiplier: 1.2,
      stockVolatility: 0.3,
      seasonalVariation: 0.15
    });
    
    data.set(ComponentCategory.GRAPHICS, {
      averageDeliveryDays: 10,
      deliveryMultiplier: 1.5,
      stockVolatility: 0.5,
      seasonalVariation: 0.25
    });
    
    data.set(ComponentCategory.MEMORY, {
      averageDeliveryDays: 5,
      deliveryMultiplier: 1.1,
      stockVolatility: 0.2,
      seasonalVariation: 0.1
    });
    
    return data;
  }

  private initializeRiskFactors(): Map<ComponentCategory, RiskFactor[]> {
    const factors = new Map();
    
    factors.set(ComponentCategory.PROCESSOR, [
      {
        factor: 'Counterfeit risk',
        qualityImpact: 0.2,
        warrantyImpact: 0.1,
        compatibilityImpact: 0.05
      },
      {
        factor: 'Overclocking limitations',
        qualityImpact: 0.1,
        warrantyImpact: 0.05,
        compatibilityImpact: 0.1
      }
    ]);
    
    factors.set(ComponentCategory.GRAPHICS, [
      {
        factor: 'Mining card risk',
        qualityImpact: 0.3,
        warrantyImpact: 0.2,
        compatibilityImpact: 0.05
      },
      {
        factor: 'BIOS modification',
        qualityImpact: 0.15,
        warrantyImpact: 0.25,
        compatibilityImpact: 0.15
      }
    ]);
    
    return factors;
  }

  private calculateGrayMarketDiscount(component: Component): number {
    let discount = 0.2; // Base 20% discount
    
    // Adjust based on component category
    switch (component.category) {
      case ComponentCategory.PROCESSOR:
        discount = 0.15; // Lower discount for processors
        break;
      case ComponentCategory.GRAPHICS:
        discount = 0.25; // Higher discount for graphics cards
        break;
      case ComponentCategory.MEMORY:
        discount = 0.18; // Moderate discount for memory
        break;
      default:
        discount = 0.2;
    }
    
    // Adjust based on availability
    if (component.availability === AvailabilityStatus.OUT_OF_STOCK) {
      discount -= 0.05; // Less discount when scarce
    }
    
    return Math.max(0.1, Math.min(0.4, discount));
  }

  private calculateBaseDeliveryTime(component: Component): number {
    const supplyChainInfo = this.supplyChainData.get(component.category);
    let baseTime = supplyChainInfo?.averageDeliveryDays || 7;
    
    // Adjust based on availability
    switch (component.availability) {
      case AvailabilityStatus.IN_STOCK:
        baseTime *= 0.8;
        break;
      case AvailabilityStatus.LIMITED_STOCK:
        baseTime *= 1.2;
        break;
      case AvailabilityStatus.OUT_OF_STOCK:
        baseTime *= 2.0;
        break;
      case AvailabilityStatus.DISCONTINUED:
        baseTime *= 3.0;
        break;
    }
    
    return baseTime;
  }

  private assessStockLevel(component: Component): 'high' | 'medium' | 'low' | 'critical' {
    switch (component.availability) {
      case AvailabilityStatus.IN_STOCK:
        return 'high';
      case AvailabilityStatus.LIMITED_STOCK:
        return 'medium';
      case AvailabilityStatus.OUT_OF_STOCK:
        return 'low';
      case AvailabilityStatus.DISCONTINUED:
        return 'critical';
      default:
        return 'medium';
    }
  }

  private calculateSupplyChainRisk(component: Component): number {
    const supplyChainInfo = this.supplyChainData.get(component.category);
    let risk = supplyChainInfo?.stockVolatility || 0.3;
    
    // Adjust based on component authenticity
    if (component.authenticity === AuthenticityLevel.UNKNOWN) {
      risk += 0.2;
    }
    
    return Math.min(1, Math.max(0, risk));
  }

  private checkAlternativeAvailability(component: Component): boolean {
    // Simplified check - in real implementation, this would check actual alternatives
    return component.category !== ComponentCategory.PROCESSOR; // Processors have fewer alternatives
  }

  private predictPriceTrend(history: PriceHistoryEntry[]): 'rising' | 'falling' | 'stable' {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-3);
    const prices = recent.map(entry => entry.grayMarketPrice);
    
    const trend = prices[prices.length - 1] - prices[0];
    const threshold = prices[0] * 0.05; // 5% threshold
    
    if (trend > threshold) return 'rising';
    if (trend < -threshold) return 'falling';
    return 'stable';
  }

  private identifyRiskFactors(component: Component, qualityRisk: number, warrantyRisk: number, compatibilityRisk: number): string[] {
    const factors: string[] = [];
    
    if (qualityRisk > 0.5) {
      factors.push('High quality risk due to gray market sourcing');
    }
    
    if (warrantyRisk > 0.7) {
      factors.push('Limited or no manufacturer warranty');
    }
    
    if (compatibilityRisk > 0.3) {
      factors.push('Potential compatibility issues with system components');
    }
    
    if (component.authenticity === AuthenticityLevel.UNKNOWN) {
      factors.push('Unknown authenticity level');
    }
    
    return factors;
  }

  private generateMitigationSuggestions(component: Component, riskFactors: string[]): string[] {
    const suggestions: string[] = [];
    
    if (riskFactors.some(factor => factor.includes('quality'))) {
      suggestions.push('Request detailed photos and specifications before purchase');
      suggestions.push('Consider purchasing from reputable gray market vendors');
    }
    
    if (riskFactors.some(factor => factor.includes('warranty'))) {
      suggestions.push('Negotiate for vendor warranty or return policy');
      suggestions.push('Consider extended warranty from third-party providers');
    }
    
    if (riskFactors.some(factor => factor.includes('compatibility'))) {
      suggestions.push('Verify compatibility with existing system components');
      suggestions.push('Test component thoroughly upon receipt');
    }
    
    suggestions.push('Compare prices with multiple gray market sources');
    suggestions.push('Factor in potential replacement costs when budgeting');
    
    return suggestions;
  }
}

// Supporting interfaces
interface PriceHistoryEntry {
  date: Date;
  officialPrice: number;
  grayMarketPrice: number;
}

interface SupplyChainInfo {
  averageDeliveryDays: number;
  deliveryMultiplier: number;
  stockVolatility: number;
  seasonalVariation: number;
}

interface RiskFactor {
  factor: string;
  qualityImpact: number;
  warrantyImpact: number;
  compatibilityImpact: number;
}