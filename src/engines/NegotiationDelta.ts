// Negotiation Delta Calculator - Optimizes pricing based on bulk quantities and market conditions

import {
  Component,
  ComponentCategory,
  NegotiationResult,
  QuantityTier,
  MarketFactors
} from '../models';
import {
  NegotiationDeltaInterface,
  NegotiationStrategy,
  QuantityOptimization
} from './interfaces';

export class NegotiationDelta implements NegotiationDeltaInterface {
  private quantityTiers: Map<ComponentCategory, QuantityTier[]>;
  private marketConditions: Map<ComponentCategory, MarketCondition>;
  private vendorProfiles: Map<string, VendorProfile>;
  private seasonalFactors: Map<string, number>;

  constructor() {
    this.quantityTiers = this.initializeQuantityTiers();
    this.marketConditions = this.initializeMarketConditions();
    this.vendorProfiles = this.initializeVendorProfiles();
    this.seasonalFactors = this.initializeSeasonalFactors();
  }

  calculateDiscount(component: Component, quantity: number, vendorId?: string): NegotiationResult {
    const basePrice = component.pricing?.retailPrice || 0;
    const category = component.category;
    
    // Get quantity-based discount
    const quantityDiscount = this.getQuantityDiscount(category, quantity);
    
    // Get market condition adjustments
    const marketAdjustment = this.getMarketAdjustment(category);
    
    // Get vendor-specific adjustments
    const vendorAdjustment = this.getVendorAdjustment(vendorId);
    
    // Get seasonal adjustments
    const seasonalAdjustment = this.getSeasonalAdjustment(category);
    
    // Calculate final discount percentage
    const totalDiscountPercentage = Math.min(50, // Max 50% discount
      quantityDiscount.discountPercentage +
      marketAdjustment.discountAdjustment +
      vendorAdjustment.discountBonus +
      seasonalAdjustment
    );
    
    const discountAmount = (basePrice * totalDiscountPercentage) / 100;
    const recommendedPrice = basePrice - discountAmount;
    const savings = basePrice - recommendedPrice;
    
    // Get applicable quantity thresholds
    const applicableThresholds = this.getApplicableThresholds(category, quantity);
    
    // Compile market factors
    const marketFactors: MarketFactors = {
      supplyLevel: this.convertSupplyLevelToNumber(marketAdjustment.supplyLevel),
      demandLevel: this.convertDemandLevelToNumber(marketAdjustment.demandLevel),
      volatilityIndex: this.convertVolatilityToNumber(marketAdjustment.volatility),
      seasonalFactor: seasonalAdjustment
    };

    return {
      recommendedPrice,
      discountPercentage: totalDiscountPercentage,
      quantityThresholds: applicableThresholds,
      marketConditions: marketFactors,
      basePrice,
      savings,
      negotiationStrategy: this.generateNegotiationStrategy(component, quantity, totalDiscountPercentage),
      priceBreakdown: {
        quantityDiscount: quantityDiscount.discountPercentage,
        marketAdjustment: marketAdjustment.discountAdjustment,
        vendorBonus: vendorAdjustment.discountBonus,
        seasonalAdjustment
      }
    };
  }

  optimizeQuantity(component: Component, budget: number): QuantityOptimization {
    const basePrice = component.pricing?.retailPrice || 0;
    if (basePrice === 0) {
      return {
        recommendedQuantity: 0,
        totalCost: 0,
        costPerUnit: 0,
        savingsPercentage: 0,
        breakEvenPoint: 0
      };
    }

    const category = component.category;
    const tiers = this.quantityTiers.get(category) || [];
    
    let bestQuantity = Math.floor(budget / basePrice);
    let bestUnitPrice = basePrice;
    let bestSavings = 0;
    
    // Test each quantity tier to find optimal quantity within budget
    for (const tier of tiers) {
      if (tier.minQuantity <= bestQuantity) {
        const negotiationResult = this.calculateDiscount(component, tier.minQuantity);
        const totalCost = negotiationResult.recommendedPrice * tier.minQuantity;
        
        if (totalCost <= budget) {
          const maxQuantityAtThisTier = Math.floor(budget / negotiationResult.recommendedPrice);
          if (maxQuantityAtThisTier > bestQuantity || 
              (maxQuantityAtThisTier === bestQuantity && negotiationResult.recommendedPrice < bestUnitPrice)) {
            bestQuantity = maxQuantityAtThisTier;
            bestUnitPrice = negotiationResult.recommendedPrice;
            bestSavings = negotiationResult.discountPercentage;
          }
        }
      }
    }

    // Find next threshold
    const nextThreshold = tiers.find(tier => tier.minQuantity > bestQuantity);

    return {
      recommendedQuantity: bestQuantity,
      totalCost: bestQuantity * bestUnitPrice,
      costPerUnit: bestUnitPrice,
      savingsPercentage: bestSavings,
      breakEvenPoint: bestQuantity
    };
  }

  generateStrategy(component: Component, quantity: number, targetPrice?: number): NegotiationStrategy {
    const negotiationResult = this.calculateDiscount(component, quantity);
    const category = component.category;
    const marketConditions = this.marketConditions.get(category);
    
    const strategy: NegotiationStrategy = {
      openingOffer: this.calculateOpeningOffer(negotiationResult, targetPrice),
      fallbackPositions: this.generateFallbackPositions(negotiationResult),
      leveragePoints: this.identifyLeveragePoints(component, quantity, marketConditions),
      timingAdvice: this.getTimingAdvice(category, marketConditions),
      negotiationTactics: this.recommendTactics(component, quantity, negotiationResult)
    };

    return strategy;
  }

  private initializeQuantityTiers(): Map<ComponentCategory, QuantityTier[]> {
    const tiers = new Map();
    
    // Processor quantity tiers
    tiers.set(ComponentCategory.PROCESSOR, [
      { minQuantity: 1, maxQuantity: 4, discountPercentage: 0, pricePerUnit: 25000 },
      { minQuantity: 5, maxQuantity: 9, discountPercentage: 8, pricePerUnit: 23000 },
      { minQuantity: 10, maxQuantity: 24, discountPercentage: 15, pricePerUnit: 21250 },
      { minQuantity: 25, maxQuantity: 49, discountPercentage: 22, pricePerUnit: 19500 },
      { minQuantity: 50, maxQuantity: 999, discountPercentage: 30, pricePerUnit: 17500 }
    ]);

    // Memory quantity tiers
    tiers.set(ComponentCategory.MEMORY, [
      { minQuantity: 1, maxQuantity: 3, discountPercentage: 0, pricePerUnit: 6500 },
      { minQuantity: 4, maxQuantity: 9, discountPercentage: 10, pricePerUnit: 5850 },
      { minQuantity: 10, maxQuantity: 19, discountPercentage: 18, pricePerUnit: 5330 },
      { minQuantity: 20, maxQuantity: 49, discountPercentage: 25, pricePerUnit: 4875 },
      { minQuantity: 50, maxQuantity: 999, discountPercentage: 35, pricePerUnit: 4225 }
    ]);

    return tiers;
  }

  private initializeMarketConditions(): Map<ComponentCategory, MarketCondition> {
    const conditions = new Map();
    
    conditions.set(ComponentCategory.PROCESSOR, {
      supplyLevel: 'Normal',
      demandLevel: 'High',
      competitionLevel: 'Medium',
      volatility: 'Low',
      discountAdjustment: -2,
      priceStability: 0.95
    });

    conditions.set(ComponentCategory.MEMORY, {
      supplyLevel: 'High',
      demandLevel: 'Medium',
      competitionLevel: 'High',
      volatility: 'Medium',
      discountAdjustment: 3,
      priceStability: 0.85
    });

    return conditions;
  }

  private initializeVendorProfiles(): Map<string, VendorProfile> {
    const profiles = new Map();
    
    profiles.set('vendor_001', {
      name: 'Tech Bazaar',
      negotiationFlexibility: 0.8,
      volumePreference: 'High',
      discountBonus: 2,
      relationshipLevel: 'Good',
      paymentTermsFlexibility: 0.7
    });

    return profiles;
  }

  private initializeSeasonalFactors(): Map<string, number> {
    const factors = new Map();
    
    factors.set('0', 2);   // January
    factors.set('1', 1);   // February
    factors.set('2', 0);   // March
    factors.set('3', -1);  // April
    factors.set('4', 0);   // May
    factors.set('5', 1);   // June
    factors.set('6', -2);  // July
    factors.set('7', -1);  // August
    factors.set('8', 0);   // September
    factors.set('9', -2);  // October
    factors.set('10', -3); // November
    factors.set('11', -2); // December

    return factors;
  }

  private getQuantityDiscount(category: ComponentCategory, quantity: number): QuantityTier {
    const tiers = this.quantityTiers.get(category) || [];
    
    let applicableTier = tiers[0] || { 
      minQuantity: 1, 
      discountPercentage: 0, 
      tierName: 'Retail',
      maxQuantity: 999,
      pricePerUnit: 0
    };
    
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        applicableTier = tier;
      } else {
        break;
      }
    }
    
    return applicableTier;
  }

  private getMarketAdjustment(category: ComponentCategory): MarketCondition {
    return this.marketConditions.get(category) || {
      supplyLevel: 'Normal',
      demandLevel: 'Medium',
      competitionLevel: 'Medium',
      volatility: 'Low',
      discountAdjustment: 0,
      priceStability: 1.0
    };
  }

  private getVendorAdjustment(vendorId?: string): VendorProfile {
    if (!vendorId) {
      return {
        name: 'Default',
        negotiationFlexibility: 0.5,
        volumePreference: 'Medium',
        discountBonus: 0,
        relationshipLevel: 'New',
        paymentTermsFlexibility: 0.5
      };
    }
    
    return this.vendorProfiles.get(vendorId) || {
      name: 'Unknown',
      negotiationFlexibility: 0.5,
      volumePreference: 'Medium',
      discountBonus: 0,
      relationshipLevel: 'New',
      paymentTermsFlexibility: 0.5
    };
  }

  private getSeasonalAdjustment(category: ComponentCategory): number {
    const currentMonth = new Date().getMonth().toString();
    return this.seasonalFactors.get(currentMonth) || 0;
  }

  private getApplicableThresholds(category: ComponentCategory, currentQuantity: number): QuantityTier[] {
    const tiers = this.quantityTiers.get(category) || [];
    return tiers.filter(tier => tier.minQuantity > currentQuantity).slice(0, 3);
  }

  private generateNegotiationStrategy(component: Component, quantity: number, discountPercentage: number): string[] {
    const strategies: string[] = [];
    
    if (quantity >= 10) {
      strategies.push('Emphasize bulk purchase benefits');
    }
    
    if (discountPercentage < 15) {
      strategies.push('Negotiate for better pricing based on market conditions');
    }
    
    strategies.push('Consider payment terms as negotiation leverage');
    strategies.push('Bundle with other components for better deals');
    
    return strategies;
  }

  private calculateOpeningOffer(negotiationResult: NegotiationResult, targetPrice?: number): number {
    if (targetPrice) {
      return Math.min(targetPrice, negotiationResult.recommendedPrice * 0.85);
    }
    return negotiationResult.recommendedPrice * 0.8;
  }

  private generateFallbackPositions(negotiationResult: NegotiationResult): number[] {
    const recommended = negotiationResult.recommendedPrice;
    return [
      recommended * 0.85,
      recommended * 0.9,
      recommended * 0.95,
      recommended
    ];
  }

  private identifyLeveragePoints(component: Component, quantity: number, marketConditions?: MarketCondition): string[] {
    const points: string[] = [];
    
    if (quantity >= 20) {
      points.push('Large quantity order');
    }
    
    if (marketConditions?.supplyLevel === 'High') {
      points.push('High supply market conditions');
    }
    
    points.push('Cash payment terms');
    points.push('Repeat customer potential');
    
    return points;
  }

  private getTimingAdvice(category: ComponentCategory, marketConditions?: MarketCondition): string {
    if (marketConditions?.volatility === 'High') {
      return 'Consider waiting for market stabilization';
    }
    
    const currentMonth = new Date().getMonth();
    if (currentMonth === 10 || currentMonth === 11) { // Nov-Dec
      return 'Good time to negotiate due to year-end clearance';
    }
    
    return 'Current timing is neutral for negotiations';
  }

  private recommendTactics(component: Component, quantity: number, negotiationResult: NegotiationResult): string[] {
    const tactics: string[] = [];
    
    tactics.push('Start with bulk quantity emphasis');
    tactics.push('Mention competitive quotes');
    tactics.push('Offer quick payment terms');
    
    if (negotiationResult.discountPercentage < 10) {
      tactics.push('Request additional services or warranties');
    }
    
    return tactics;
  }

  private convertSupplyLevelToNumber(level: 'Low' | 'Normal' | 'High'): number {
    switch (level) {
      case 'Low': return 0.3;
      case 'Normal': return 0.6;
      case 'High': return 0.9;
      default: return 0.6;
    }
  }

  private convertDemandLevelToNumber(level: 'Low' | 'Medium' | 'High'): number {
    switch (level) {
      case 'Low': return 0.3;
      case 'Medium': return 0.6;
      case 'High': return 0.9;
      default: return 0.6;
    }
  }

  private convertVolatilityToNumber(volatility: 'Low' | 'Medium' | 'High'): number {
    switch (volatility) {
      case 'Low': return 0.2;
      case 'Medium': return 0.5;
      case 'High': return 0.8;
      default: return 0.5;
    }
  }
}

// Supporting interfaces for internal use
interface MarketCondition {
  supplyLevel: 'Low' | 'Normal' | 'High';
  demandLevel: 'Low' | 'Medium' | 'High';
  competitionLevel: 'Low' | 'Medium' | 'High';
  volatility: 'Low' | 'Medium' | 'High';
  discountAdjustment: number;
  priceStability: number;
}

interface VendorProfile {
  name: string;
  negotiationFlexibility: number;
  volumePreference: 'Low' | 'Medium' | 'High';
  discountBonus: number;
  relationshipLevel: 'New' | 'Good' | 'Excellent';
  paymentTermsFlexibility: number;
}