// Interface definitions for all core engines

import {
  Component,
  ComponentSpecification,
  AuthenticityAssessment,
  AdapterSolution,
  JugaadSolution,
  NegotiationResult,
  ComponentCategory,
  MarketLocation,
  WeightComparison,
  ThermalAssessment,
  WiringInstructions,
  AssemblyStep,
  Vendor,
  QuantityTier,
  MarketFactors,
  SafetyNote
} from '../models';

export interface ParsedSpecification {
  originalInput: string;
  extractedSpecs: ComponentSpecification;
  confidence: number;
  ambiguities: string[];
  validationErrors: string[];
}

export interface ComponentParserInterface {
  parseSpecification(input: string): ParsedSpecification;
  validateParameters(specs: ComponentSpecification): boolean;
  extractTechnicalData(input: string): ComponentSpecification;
}

export interface FirstCopyHeuristicInterface {
  analyzeWeight(component: Component): WeightComparison;
  assessHeatSync(component: Component): ThermalAssessment;
  calculateAuthenticityScore(component: Component): AuthenticityAssessment;
}

export interface ComponentBridgeInterface {
  identifyAdapters(legacyPort: string, modernComponent: Component): AdapterSolution[];
  validateCompatibility(component1: Component, component2: Component): boolean;
  generateWiringDiagrams(adapter: AdapterSolution): WiringInstructions;
}

export interface JugaadDetectorInterface {
  findAlternatives(unavailableComponent: Component, availableInventory: Component[]): JugaadSolution[];
  validateSafety(solution: JugaadSolution): boolean;
  generateInstructions(solution: JugaadSolution): AssemblyStep[];
}

export interface GrayMarketAnalyzerInterface {
  analyzePricing(component: Component): PriceAnalysis;
  predictAvailability(component: Component): AvailabilityPrediction;
  assessRisks(component: Component): RiskAssessment;
}

export interface NegotiationDeltaInterface {
  calculateDiscount(component: Component, quantity: number, vendorId?: string): NegotiationResult;
  optimizeQuantity(component: Component, budget: number): QuantityOptimization;
  generateStrategy(component: Component, quantity: number, targetPrice?: number): NegotiationStrategy;
}

export interface SearchQuery {
  specification: string;
  category: ComponentCategory;
  maxResults?: number;
}

export interface AlternativeSuggestion {
  component: Component;
  compatibilityScore: number;
  reason: string;
  tradeoffs: string[];
}

export interface SearchResult {
  component: Component;
  availabilityStatus: string;
  location: MarketLocation;
  compatibilityScore: number;
  qualityScore: number;
  requiresClarification: boolean;
  clarificationPrompts: string[];
  alternatives: AlternativeSuggestion[];
}

export interface HardwareSourcingEngineInterface {
  searchComponents(query: SearchQuery): SearchResult[];
}

// Additional interfaces not in models
export interface PriceAnalysis {
  grayMarketPrice: number;
  officialPrice: number;
  priceDifference: number;
  priceHistory: { date: Date; price: number }[];
  trendPrediction: 'rising' | 'falling' | 'stable';
}

export interface AvailabilityPrediction {
  expectedDeliveryDays: number;
  stockLevel: 'high' | 'medium' | 'low' | 'critical';
  supplyChainRisk: number;
  alternativeAvailability: boolean;
}

export interface RiskAssessment {
  qualityRisk: number;
  warrantyRisk: number;
  compatibilityRisk: number;
  overallRisk: number;
  riskFactors: string[];
  mitigationSuggestions: string[];
}

export interface QuantityOptimization {
  recommendedQuantity: number;
  totalCost: number;
  costPerUnit: number;
  savingsPercentage: number;
  breakEvenPoint: number;
}

export interface PurchaseRequirements {
  budget: number;
  quantity: number;
  urgency: 'low' | 'medium' | 'high';
  qualityPreference: 'oem_only' | 'first_copy_ok' | 'any';
  paymentTerms: string;
}

export interface ClarificationPrompt {
  question: string;
  options: string[];
  category: ComponentCategory;
  required: boolean;
}

export interface NegotiationStrategy {
  openingOffer: number;
  fallbackPositions: number[];
  leveragePoints: string[];
  timingAdvice: string;
  negotiationTactics: string[];
}