// Core data models for the Lamington Road Market system

export enum ComponentCategory {
  PROCESSOR = 'processor',
  MEMORY = 'memory',
  STORAGE = 'storage',
  GRAPHICS = 'graphics',
  MOTHERBOARD = 'motherboard',
  POWER_SUPPLY = 'power_supply',
  COOLING = 'cooling',
  NETWORKING = 'networking',
  AUDIO = 'audio',
  PERIPHERALS = 'peripherals',
  CABLES = 'cables',
  ADAPTERS = 'adapters'
}

export enum AuthenticityLevel {
  OEM = 'oem',
  FIRST_COPY = 'first_copy',
  GENERIC = 'generic',
  UNKNOWN = 'unknown'
}

export enum AvailabilityStatus {
  IN_STOCK = 'in_stock',
  LIMITED_STOCK = 'limited_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  PRE_ORDER = 'pre_order',
  UNKNOWN = 'unknown'
}

export enum CompatibilityLevel {
  PERFECT = 'perfect',
  GOOD = 'good',
  PARTIAL = 'partial',
  POOR = 'poor',
  INCOMPATIBLE = 'incompatible'
}

export interface ElectricalParameters {
  voltage: number;
  current: number;
  frequency: number;
  powerConsumption: number;
}

export interface PhysicalParameters {
  length: number;
  width: number;
  height: number;
  weight: number;
  formFactor: string;
}

export interface CompatibilityRequirements {
  socketType?: string;
  pinConfiguration?: string[];
  interfaceType?: string;
  protocolVersion?: string;
}

export interface TechnicalSpecs {
  electrical: ElectricalParameters;
  physical: PhysicalParameters;
  compatibility: CompatibilityRequirements;
  operatingConditions: {
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
  };
}

export interface ComponentSpecification {
  partNumber: string;
  category: ComponentCategory;
  electricalSpecs: ElectricalParameters;
  physicalSpecs: PhysicalParameters;
  compatibility: CompatibilityRequirements;
}

export interface PricingInfo {
  retailPrice: number;
  marketPrice: number;
  wholesalePrice?: number;
  bulkPricing: { quantity: number; pricePerUnit: number }[];
  currency: string;
  lastUpdated?: Date;
}

export interface MarketLocation {
  sectionId: string;
  section?: string;
  shopNumber: string;
  shop?: string;
  floor: number;
  coordinates: { x: number; y: number };
}

export interface PhysicalLocation {
  address: string;
  landmark: string;
  coordinates: { latitude: number; longitude: number };
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface ReputationScore {
  overall: number;
  authenticity: number;
  pricing: number;
  service: number;
  reviewCount: number;
}

export interface NegotiationPreferences {
  minQuantityForDiscount: number;
  maxDiscountPercentage: number;
  preferredPaymentTerms: string[];
  bulkOrderIncentives: boolean;
}

export class Component {
  constructor(
    public id: string,
    public partNumber: string,
    public category: ComponentCategory,
    public specifications: TechnicalSpecs,
    public authenticity: AuthenticityLevel,
    public availability: AvailabilityStatus,
    public pricing: PricingInfo,
    public location: MarketLocation
  ) {}
}

export class MarketSection {
  constructor(
    public sectionId: string,
    public name: string,
    public specialization: ComponentCategory[],
    public vendors: Vendor[],
    public location: PhysicalLocation,
    public operatingHours: TimeRange
  ) {}
}

export class Vendor {
  constructor(
    public vendorId: string,
    public name: string,
    public reputation: ReputationScore,
    public specialties: ComponentCategory[],
    public negotiationProfile: NegotiationPreferences,
    public inventory: Component[]
  ) {}
}

export interface AssemblyStep {
  stepNumber: number;
  title: string;
  description: string;
  requiredTools: string[];
  safetyWarnings: string[];
  estimatedTime: number;
  difficulty: string;
  safetyNotes: string[];
}

export interface SafetyNote {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  precautions: string[];
}

export class JugaadSolution {
  constructor(
    public solutionId: string,
    public targetComponent: Component,
    public alternativeComponents: Component[],
    public assemblyInstructions: AssemblyStep[],
    public safetyWarnings: SafetyNote[],
    public reliabilityScore: number,
    public complexityScore: number = 0,
    public template: any = null,
    public estimatedCost: number = 0,
    public estimatedTime: number = 0
  ) {}
}

export interface WeightComparison {
  measuredWeight: number;
  oemStandardWeight: number;
  variance: number;
  withinTolerance: boolean;
}

export interface ThermalAssessment {
  heatSyncQuality: number;
  thermalConductivity: number;
  coolingEfficiency: number;
  materialQuality: number;
}

export interface QualityMetrics {
  buildQuality: number;
  materialGrade: number;
  finishQuality: number;
  overallScore: number;
}

export interface AuthenticityAssessment {
  confidenceScore: number;
  weightAnalysis: WeightComparison;
  thermalAnalysis: ThermalAssessment;
  qualityIndicators: QualityMetrics;
}

export interface WiringInstructions {
  diagramUrl: string;
  pinMapping: { source: string; target: string }[];
  requiredTools: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface AdapterSolution {
  adapterType: string;
  compatibility: CompatibilityLevel;
  wiringDiagram: WiringInstructions;
  reliabilityScore: number;
  cost: number;
  availability: AvailabilityStatus;
}

export interface QuantityTier {
  minQuantity: number;
  maxQuantity: number;
  discountPercentage: number;
  pricePerUnit: number;
}

export interface MarketFactors {
  supplyLevel: number;
  demandLevel: number;
  volatilityIndex: number;
  seasonalFactor: number;
}

export interface NegotiationResult {
  recommendedPrice: number;
  discountPercentage: number;
  quantityThresholds: QuantityTier[];
  marketConditions: MarketFactors;
  basePrice: number;
  savings: number;
  negotiationStrategy: string[];
  priceBreakdown: {
    quantityDiscount: number;
    marketAdjustment: number;
    vendorBonus: number;
    seasonalAdjustment: number;
  };
}