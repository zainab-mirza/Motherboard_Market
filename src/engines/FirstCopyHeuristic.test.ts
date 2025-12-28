// First Copy Heuristic Tests - Unit and Property-based tests

import { FirstCopyHeuristic } from './FirstCopyHeuristic';
import { Component, ComponentCategory, AuthenticityLevel, AvailabilityStatus } from '../models';
import * as fc from 'fast-check';

describe('FirstCopyHeuristic', () => {
  let heuristic: FirstCopyHeuristic;

  beforeEach(() => {
    heuristic = new FirstCopyHeuristic();
  });

  const createTestComponent = (overrides: Partial<Component> = {}): Component => {
    return {
      id: 'test-001',
      partNumber: 'TEST-COMPONENT',
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
          socketType: 'LGA1700'
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
        marketPrice: 23000,
        bulkPricing: [],
        currency: 'INR',
        lastUpdated: new Date()
      },
      location: {
        sectionId: 'test-zone',
        shopNumber: 'T-001',
        floor: 1,
        coordinates: { x: 0, y: 0 }
      },
      ...overrides
    };
  };

  describe('Unit Tests', () => {
    test('should analyze weight correctly for OEM component', () => {
      const component = createTestComponent({
        specifications: {
          ...createTestComponent().specifications,
          physical: {
            ...createTestComponent().specifications.physical,
            weight: 85 // Expected OEM weight
          }
        }
      });

      const weightAnalysis = heuristic.analyzeWeight(component);

      expect(weightAnalysis.measuredWeight).toBe(85);
      expect(weightAnalysis.withinTolerance).toBe(true);
      expect(Math.abs(weightAnalysis.variance)).toBeLessThan(15); // Within 15% tolerance
    });

    test('should detect weight variance in first-copy components', () => {
      const component = createTestComponent({
        specifications: {
          ...createTestComponent().specifications,
          physical: {
            ...createTestComponent().specifications.physical,
            weight: 70 // Significantly lighter than OEM
          }
        },
        authenticity: AuthenticityLevel.FIRST_COPY
      });

      const weightAnalysis = heuristic.analyzeWeight(component);

      expect(weightAnalysis.measuredWeight).toBe(70);
      expect(weightAnalysis.withinTolerance).toBe(false);
      expect(Math.abs(weightAnalysis.variance)).toBeGreaterThan(15);
    });

    test('should assess thermal properties', () => {
      const component = createTestComponent();
      const thermalAnalysis = heuristic.assessHeatSync(component);

      expect(thermalAnalysis.heatSyncQuality).toBeGreaterThan(0);
      expect(thermalAnalysis.heatSyncQuality).toBeLessThanOrEqual(1);
      expect(thermalAnalysis.thermalConductivity).toBeGreaterThan(0);
      expect(thermalAnalysis.coolingEfficiency).toBeGreaterThan(0);
      expect(thermalAnalysis.materialQuality).toBeGreaterThan(0);
    });

    test('should calculate authenticity score for OEM component', () => {
      const component = createTestComponent({
        authenticity: AuthenticityLevel.OEM
      });

      const assessment = heuristic.calculateAuthenticityScore(component);

      expect(assessment.confidenceScore).toBeGreaterThan(70); // OEM should have high confidence
      expect(assessment.confidenceScore).toBeLessThanOrEqual(100);
      expect(assessment.weightAnalysis).toBeDefined();
      expect(assessment.thermalAnalysis).toBeDefined();
      expect(assessment.qualityIndicators).toBeDefined();
    });

    test('should calculate lower authenticity score for unknown components', () => {
      const component = createTestComponent({
        authenticity: AuthenticityLevel.UNKNOWN,
        specifications: {
          ...createTestComponent().specifications,
          physical: {
            ...createTestComponent().specifications.physical,
            weight: 60 // Much lighter than expected
          }
        }
      });

      const assessment = heuristic.calculateAuthenticityScore(component);

      expect(assessment.confidenceScore).toBeLessThan(70); // Unknown with poor weight should have low confidence
      expect(assessment.weightAnalysis.withinTolerance).toBe(false);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * **Feature: lamington-road-market, Property 4: Authenticity assessment completeness**
     * For any component analysis, the First_Copy_Heuristic should evaluate weight against OEM standards, 
     * assess thermal properties, and provide an authenticity confidence score
     */
    test('Property 4: Authenticity assessment completeness', () => {
      fc.assert(fc.property(
        fc.record({
          weight: fc.float({ min: 10, max: 2000 }),
          voltage: fc.float({ min: 0.5, max: 24.0 }),
          powerConsumption: fc.integer({ min: 5, max: 500 }),
          frequency: fc.integer({ min: 100, max: 8000 }),
          authenticity: fc.constantFrom(
            AuthenticityLevel.OEM,
            AuthenticityLevel.FIRST_COPY,
            AuthenticityLevel.GENERIC,
            AuthenticityLevel.UNKNOWN
          ),
          category: fc.constantFrom(
            ComponentCategory.PROCESSOR,
            ComponentCategory.MEMORY,
            ComponentCategory.GRAPHICS
          )
        }),
        (testData) => {
          const component = createTestComponent({
            category: testData.category,
            authenticity: testData.authenticity,
            specifications: {
              ...createTestComponent().specifications,
              electrical: {
                voltage: testData.voltage,
                current: testData.powerConsumption / testData.voltage,
                frequency: testData.frequency,
                powerConsumption: testData.powerConsumption
              },
              physical: {
                ...createTestComponent().specifications.physical,
                weight: testData.weight
              }
            }
          });

          const assessment = heuristic.calculateAuthenticityScore(component);

          // Should always provide complete assessment
          expect(assessment).toHaveProperty('confidenceScore');
          expect(assessment).toHaveProperty('weightAnalysis');
          expect(assessment).toHaveProperty('thermalAnalysis');
          expect(assessment).toHaveProperty('qualityIndicators');

          // Weight analysis should be complete
          expect(assessment.weightAnalysis).toHaveProperty('measuredWeight');
          expect(assessment.weightAnalysis).toHaveProperty('oemStandardWeight');
          expect(assessment.weightAnalysis).toHaveProperty('variance');
          expect(assessment.weightAnalysis).toHaveProperty('withinTolerance');
          expect(assessment.weightAnalysis.measuredWeight).toBe(testData.weight);

          // Thermal analysis should be complete
          expect(assessment.thermalAnalysis).toHaveProperty('heatSyncQuality');
          expect(assessment.thermalAnalysis).toHaveProperty('thermalConductivity');
          expect(assessment.thermalAnalysis).toHaveProperty('coolingEfficiency');
          expect(assessment.thermalAnalysis).toHaveProperty('materialQuality');

          // All thermal metrics should be valid
          expect(assessment.thermalAnalysis.heatSyncQuality).toBeGreaterThanOrEqual(0);
          expect(assessment.thermalAnalysis.heatSyncQuality).toBeLessThanOrEqual(1);
          expect(assessment.thermalAnalysis.thermalConductivity).toBeGreaterThanOrEqual(0);
          expect(assessment.thermalAnalysis.coolingEfficiency).toBeGreaterThanOrEqual(0);
          expect(assessment.thermalAnalysis.materialQuality).toBeGreaterThanOrEqual(0);

          // Confidence score should be valid
          expect(assessment.confidenceScore).toBeGreaterThanOrEqual(0);
          expect(assessment.confidenceScore).toBeLessThanOrEqual(100);

          // Quality indicators should be complete
          expect(assessment.qualityIndicators).toHaveProperty('buildQuality');
          expect(assessment.qualityIndicators).toHaveProperty('materialGrade');
          expect(assessment.qualityIndicators).toHaveProperty('finishQuality');
          expect(assessment.qualityIndicators).toHaveProperty('overallScore');
        }
      ), { numRuns: 100 });
    });

    test('Property: OEM components should have higher confidence than non-OEM', () => {
      fc.assert(fc.property(
        fc.record({
          weight: fc.float({ min: 50, max: 200 }),
          powerConsumption: fc.integer({ min: 50, max: 300 })
        }),
        (testData) => {
          const oemComponent = createTestComponent({
            authenticity: AuthenticityLevel.OEM,
            specifications: {
              ...createTestComponent().specifications,
              physical: {
                ...createTestComponent().specifications.physical,
                weight: testData.weight
              },
              electrical: {
                ...createTestComponent().specifications.electrical,
                powerConsumption: testData.powerConsumption
              }
            }
          });

          const genericComponent = createTestComponent({
            authenticity: AuthenticityLevel.GENERIC,
            specifications: {
              ...createTestComponent().specifications,
              physical: {
                ...createTestComponent().specifications.physical,
                weight: testData.weight
              },
              electrical: {
                ...createTestComponent().specifications.electrical,
                powerConsumption: testData.powerConsumption
              }
            }
          });

          const oemAssessment = heuristic.calculateAuthenticityScore(oemComponent);
          const genericAssessment = heuristic.calculateAuthenticityScore(genericComponent);

          // OEM should generally have higher confidence than generic
          expect(oemAssessment.confidenceScore).toBeGreaterThanOrEqual(genericAssessment.confidenceScore);
        }
      ), { numRuns: 50 });
    });

    test('Property: Weight analysis consistency', () => {
      fc.assert(fc.property(
        fc.record({
          baseWeight: fc.float({ min: 50, max: 150 }),
          weightVariation: fc.float({ min: -30, max: 30 })
        }),
        (testData) => {
          const component = createTestComponent({
            specifications: {
              ...createTestComponent().specifications,
              physical: {
                ...createTestComponent().specifications.physical,
                weight: testData.baseWeight + testData.weightVariation
              }
            }
          });

          const weightAnalysis = heuristic.analyzeWeight(component);

          // Weight analysis should be consistent
          expect(weightAnalysis.measuredWeight).toBe(testData.baseWeight + testData.weightVariation);
          expect(weightAnalysis.oemStandardWeight).toBeGreaterThan(0);
          
          // Variance calculation should be mathematically correct
          const expectedVariance = ((weightAnalysis.measuredWeight - weightAnalysis.oemStandardWeight) / weightAnalysis.oemStandardWeight) * 100;
          expect(weightAnalysis.variance).toBeCloseTo(expectedVariance, 2);

          // Tolerance should be consistent with variance
          const withinTolerance = Math.abs(weightAnalysis.variance) <= 15; // 15% tolerance
          expect(weightAnalysis.withinTolerance).toBe(withinTolerance);
        }
      ), { numRuns: 100 });
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero weight components', () => {
      const component = createTestComponent({
        specifications: {
          ...createTestComponent().specifications,
          physical: {
            ...createTestComponent().specifications.physical,
            weight: 0
          }
        }
      });

      const weightAnalysis = heuristic.analyzeWeight(component);
      expect(weightAnalysis.measuredWeight).toBe(0);
      expect(weightAnalysis.withinTolerance).toBe(false);
    });

    test('should handle components with unknown category', () => {
      const component = createTestComponent({
        category: ComponentCategory.PERIPHERALS // Unknown category for weight standards
      });

      const assessment = heuristic.calculateAuthenticityScore(component);
      expect(assessment.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(assessment.confidenceScore).toBeLessThanOrEqual(100);
    });

    test('should handle extreme power consumption values', () => {
      const component = createTestComponent({
        specifications: {
          ...createTestComponent().specifications,
          electrical: {
            ...createTestComponent().specifications.electrical,
            powerConsumption: 1000 // Very high power
          }
        }
      });

      const thermalAnalysis = heuristic.assessHeatSync(component);
      expect(thermalAnalysis.heatSyncQuality).toBeGreaterThanOrEqual(0);
      expect(thermalAnalysis.heatSyncQuality).toBeLessThanOrEqual(1);
    });
  });
});