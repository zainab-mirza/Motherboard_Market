# Design Document: Lamington Road Market - Hardware Sourcing Engine

## Overview

The Lamington Road Market system is a sophisticated Hardware Sourcing Engine that transforms Mumbai's electronics hub into a real-time component discovery and procurement platform. The system combines intelligent parsing algorithms, authenticity detection heuristics, and compatibility matching to provide users with a BIOS-style interface for navigating the complex electronics marketplace.

The architecture follows a modular design with specialized engines for component parsing, jugaad detection, gray-market analysis, and negotiation optimization. The user interface mimics a computer BIOS with circuit board aesthetics, using silicon green backgrounds and solder silver accents to create an authentic technical experience.

## Architecture

The system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    BIOS Interface Layer                     │
│  (Circuit Board UI, Silicon Green/Solder Silver Theme)     │
├─────────────────────────────────────────────────────────────┤
│                   Application Services                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Component   │ │ Negotiation │ │    Market Navigation    ││
│  │ Search      │ │ Service     │ │       Service           ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     Core Engines                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Component   │ │ First Copy  │ │    Component Bridge     ││
│  │ Parser      │ │ Heuristic   │ │       Engine            ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Jugaad      │ │ Gray Market │ │    Negotiation Delta    ││
│  │ Detector    │ │ Analyzer    │ │       Calculator        ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Component   │ │ Market      │ │    Vendor Database      ││
│  │ Database    │ │ Sections    │ │                         ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Engines

#### Component Parser
- **Purpose**: Processes component specifications and extracts technical parameters
- **Input**: Component search queries, specifications, part numbers
- **Output**: Structured component data with validated specifications
- **Key Methods**: `parseSpecification()`, `validateParameters()`, `extractTechnicalData()`

#### First Copy Heuristic Engine
- **Purpose**: Distinguishes between OEM and first-copy components using weight and thermal analysis
- **Input**: Component physical specifications, thermal data, weight measurements
- **Output**: Authenticity confidence score and quality assessment
- **Key Methods**: `analyzeWeight()`, `assessHeatSync()`, `calculateAuthenticityScore()`

#### Component Bridge Engine
- **Purpose**: Matches legacy ports with modern components through adapter identification
- **Input**: Legacy port specifications, modern component requirements
- **Output**: Adapter recommendations with compatibility validation
- **Key Methods**: `identifyAdapters()`, `validateCompatibility()`, `generateWiringDiagrams()`

#### Jugaad Detector
- **Purpose**: Identifies creative workaround solutions using available components
- **Input**: Unavailable component specifications, available inventory
- **Output**: Alternative component combinations with assembly instructions
- **Key Methods**: `findAlternatives()`, `validateSafety()`, `generateInstructions()`

#### Gray Market Analyzer
- **Purpose**: Calculates pricing trends and availability timelines for non-OEM components
- **Input**: Component demand data, supply chain information, market conditions
- **Output**: Price predictions, delivery estimates, risk assessments
- **Key Methods**: `analyzePricing()`, `predictAvailability()`, `assessRisks()`

#### Negotiation Delta Calculator
- **Purpose**: Optimizes pricing based on bulk quantities and market conditions
- **Input**: Quantity requirements, current market rates, vendor relationships
- **Output**: Negotiation strategies and expected price ranges
- **Key Methods**: `calculateDiscount()`, `optimizeQuantity()`, `generateStrategy()`

### Interface Definitions

```typescript
interface ComponentSpecification {
  partNumber: string;
  category: ComponentCategory;
  electricalSpecs: ElectricalParameters;
  physicalSpecs: PhysicalParameters;
  compatibility: CompatibilityRequirements;
}

interface AuthenticityAssessment {
  confidenceScore: number;
  weightAnalysis: WeightComparison;
  thermalAnalysis: ThermalAssessment;
  qualityIndicators: QualityMetrics;
}

interface AdapterSolution {
  adapterType: string;
  compatibility: CompatibilityLevel;
  wiringDiagram: WiringInstructions;
  reliabilityScore: number;
}

interface NegotiationResult {
  recommendedPrice: number;
  discountPercentage: number;
  quantityThresholds: QuantityTier[];
  marketConditions: MarketFactors;
}
```

## Data Models

### Component Model
```typescript
class Component {
  id: string;
  partNumber: string;
  category: ComponentCategory;
  specifications: TechnicalSpecs;
  authenticity: AuthenticityLevel;
  availability: AvailabilityStatus;
  pricing: PricingInfo;
  location: MarketLocation;
}
```

### Market Section Model
```typescript
class MarketSection {
  sectionId: string;
  name: string;
  specialization: ComponentCategory[];
  vendors: Vendor[];
  location: PhysicalLocation;
  operatingHours: TimeRange;
}
```

### Vendor Model
```typescript
class Vendor {
  vendorId: string;
  name: string;
  reputation: ReputationScore;
  specialties: ComponentCategory[];
  negotiationProfile: NegotiationPreferences;
  inventory: Component[];
}
```

### Jugaad Solution Model
```typescript
class JugaadSolution {
  solutionId: string;
  targetComponent: Component;
  alternativeComponents: Component[];
  assemblyInstructions: AssemblyStep[];
  safetyWarnings: SafetyNote[];
  reliabilityScore: number;
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Component parsing and validation properties (8.1, 8.2, 8.3, 8.4) can be combined into comprehensive parsing correctness
- Search result properties (1.2, 1.3) can be unified into search result completeness and ranking
- Authentication analysis properties (2.1, 2.2, 2.3) can be consolidated into comprehensive authenticity assessment
- UI feedback properties (6.2, 6.5) can be combined into consistent UI behavior

### Core Properties

**Property 1: Component specification parsing completeness**
*For any* valid component specification input, the Component_Parser should extract all required technical parameters (voltage, current, frequency) and provide structured output with industry standard validation
**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

**Property 2: Search result completeness and ranking**
*For any* component search query, results should include availability status and location information, and when multiple variants exist, they should be ranked by compatibility and quality metrics
**Validates: Requirements 1.2, 1.3**

**Property 3: Fallback behavior consistency**
*For any* search query that yields no exact matches, the system should suggest alternative compatible components, and for unavailable components, the Jugaad_Detector should identify alternative combinations
**Validates: Requirements 1.4, 5.1**

**Property 4: Authenticity assessment completeness**
*For any* component analysis, the First_Copy_Heuristic should evaluate weight against OEM standards, assess thermal properties, and provide an authenticity confidence score
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 5: Component bridge adapter identification**
*For any* legacy port specification, the Component_Bridge should identify required adapter types and provide wiring diagrams with connection instructions
**Validates: Requirements 3.1, 3.3**

**Property 6: Compatibility validation consistency**
*For any* component compatibility check, the system should validate electrical and physical compatibility, including pin configurations and form factors
**Validates: Requirements 3.2, 8.3**

**Property 7: Ranking algorithm consistency**
*For any* set of multiple options (component variants, adapter solutions, or jugaad workarounds), the system should rank them by appropriate criteria (compatibility/quality, reliability/cost, or reliability/complexity respectively)
**Validates: Requirements 1.3, 3.4, 5.4**

**Property 8: Negotiation pricing calculations**
*For any* bulk quantity specification, the Negotiation_Delta should calculate price reduction percentages, factor in market conditions, and show savings compared to retail rates
**Validates: Requirements 4.1, 4.2, 4.4**

**Property 9: Safety and validation requirements**
*For any* workaround solution or jugaad option, the system should validate electrical compatibility and safety, providing appropriate warnings when safety concerns are identified
**Validates: Requirements 5.2, 5.5**

**Property 10: Information completeness guarantee**
*For any* system output (search results, adapter solutions, jugaad options, negotiation results), all required information fields should be populated (assembly instructions, tools, pricing recommendations, etc.)
**Validates: Requirements 3.3, 4.3, 5.3**

**Property 11: Gray market analysis completeness**
*For any* component availability check, the Gray_Market_Analyzer should calculate delivery timeframes, compare pricing with official rates, and highlight quality or warranty concerns
**Validates: Requirements 7.1, 7.2, 7.5**

**Property 12: UI consistency and responsiveness**
*For any* user interaction with the BIOS_Interface, the system should provide immediate visual feedback using consistent BIOS aesthetics with solder silver accents for interactive elements
**Validates: Requirements 6.2, 6.5**

**Property 13: Error handling completeness**
*For any* parsing error or ambiguous specification, the system should provide detailed error messages with correction suggestions or request clarification through structured prompts
**Validates: Requirements 1.5, 8.5**

## Error Handling

The system implements comprehensive error handling across all components:

### Input Validation Errors
- **Component Specification Errors**: Invalid part numbers, missing parameters, or malformed specifications trigger detailed error messages with correction suggestions
- **Search Query Errors**: Ambiguous or incomplete search terms prompt structured clarification requests
- **Compatibility Errors**: Incompatible component combinations generate safety warnings and alternative suggestions

### System Processing Errors
- **Parser Failures**: Graceful degradation with partial parsing results and error reporting
- **Database Connection Issues**: Cached data fallback with availability status indicators
- **Analysis Engine Failures**: Fallback to basic heuristics with confidence score adjustments

### User Interface Errors
- **Navigation Errors**: Invalid menu selections redirect to valid options with visual feedback
- **Display Errors**: Fallback to text-based information when graphical elements fail
- **Input Errors**: Real-time validation with immediate correction prompts

### Recovery Mechanisms
- **Automatic Retry**: Transient failures trigger automatic retry with exponential backoff
- **Graceful Degradation**: Partial functionality maintained when subsystems fail
- **User Notification**: Clear error messages with actionable recovery steps

## Testing Strategy

The system employs a dual testing approach combining unit tests for specific scenarios and property-based tests for universal correctness guarantees.

### Property-Based Testing Framework
- **Library**: QuickCheck for JavaScript/TypeScript will be used for property-based testing
- **Test Configuration**: Each property-based test will run a minimum of 100 iterations to ensure statistical confidence
- **Test Tagging**: Each property-based test will include a comment with the format: `**Feature: lamington-road-market, Property {number}: {property_text}**`
- **Property Implementation**: Each correctness property will be implemented by a single property-based test

### Unit Testing Approach
Unit tests will focus on:
- Specific component parsing examples with known inputs and expected outputs
- Edge cases for authenticity detection (borderline weight/thermal measurements)
- Integration points between engines (parser → heuristic → bridge workflows)
- UI component rendering with specific market data scenarios
- Error handling with malformed or invalid inputs

### Property-Based Testing Approach
Property tests will verify:
- Universal parsing behavior across all valid component specifications
- Ranking consistency across all possible component sets
- Authenticity assessment reliability across component variations
- Compatibility validation accuracy across all component combinations
- UI responsiveness across all possible user interactions
- Error handling completeness across all invalid input types

### Test Data Generation
- **Component Specifications**: Random generation of valid electrical parameters, part numbers, and physical dimensions
- **Market Conditions**: Simulated supply/demand scenarios with varying volatility
- **Legacy Hardware**: Generated vintage component specifications with known compatibility requirements
- **Vendor Data**: Synthetic vendor profiles with reputation scores and inventory variations

### Integration Testing
- **End-to-End Workflows**: Complete user journeys from component search to purchase negotiation
- **Cross-Engine Communication**: Validation of data flow between parsing, analysis, and recommendation engines
- **UI Integration**: BIOS interface behavior with real backend data
- **Performance Testing**: Response time validation under various load conditions

The testing strategy ensures both concrete correctness through unit tests and universal correctness through property-based verification, providing comprehensive coverage of the system's complex domain logic.