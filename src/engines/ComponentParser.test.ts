// Component Parser Tests - Unit and Property-based tests

import { ComponentParser } from './ComponentParser';
import { ComponentCategory } from '../models';
import * as fc from 'fast-check';

describe('ComponentParser', () => {
  let parser: ComponentParser;

  beforeEach(() => {
    parser = new ComponentParser();
  });

  describe('Unit Tests', () => {
    test('should parse Intel processor specification correctly', () => {
      const input = 'Intel i7-12700K 3.6GHz LGA1700';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.category).toBe(ComponentCategory.PROCESSOR);
      expect(result.extractedSpecs.partNumber).toBe('i7-12700K');
      expect(result.extractedSpecs.electricalSpecs.frequency).toBe(3600); // MHz
      expect(result.extractedSpecs.compatibility.socketType).toBe('LGA1700');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('should parse DDR4 memory specification correctly', () => {
      const input = 'DDR4 16GB 3200MHz DIMM';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.category).toBe(ComponentCategory.MEMORY);
      expect(result.extractedSpecs.electricalSpecs.frequency).toBe(3200);
      expect(result.extractedSpecs.compatibility.socketType).toBe('DDR4');
      expect(result.extractedSpecs.physicalSpecs.formFactor).toBe('DIMM');
    });

    test('should parse RTX graphics card specification correctly', () => {
      const input = 'RTX 4070 300W PCIe 4.0';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.category).toBe(ComponentCategory.GRAPHICS);
      expect(result.extractedSpecs.partNumber).toBe('RTX4070');
      expect(result.extractedSpecs.electricalSpecs.powerConsumption).toBe(300);
      expect(result.extractedSpecs.compatibility.interfaceType).toBe('PCIE 4.0');
    });

    test('should handle ambiguous specifications', () => {
      const input = 'some random component';
      const result = parser.parseSpecification(input);

      expect(result.ambiguities.length).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThan(0.7);
    });

    test('should validate component parameters correctly', () => {
      const validSpec = {
        partNumber: 'i7-12700K',
        category: ComponentCategory.PROCESSOR,
        electricalSpecs: {
          voltage: 1.2,
          current: 125,
          frequency: 3600,
          powerConsumption: 125
        },
        physicalSpecs: {
          length: 37.5,
          width: 37.5,
          height: 7.5,
          weight: 85,
          formFactor: 'LGA1700'
        },
        compatibility: {
          socketType: 'LGA1700'
        }
      };

      expect(parser.validateParameters(validSpec)).toBe(true);
    });

    test('should reject invalid parameters', () => {
      const invalidSpec = {
        partNumber: 'test',
        category: ComponentCategory.PROCESSOR,
        electricalSpecs: {
          voltage: -1.2, // Invalid negative voltage
          current: 125,
          frequency: 0, // Invalid zero frequency for processor
          powerConsumption: 125
        },
        physicalSpecs: {
          length: 37.5,
          width: 37.5,
          height: 7.5,
          weight: -10, // Invalid negative weight
          formFactor: 'LGA1700'
        },
        compatibility: {}
      };

      expect(parser.validateParameters(invalidSpec)).toBe(false);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * **Feature: lamington-road-market, Property 1: Component specification parsing completeness**
     * For any valid component specification input, the Component_Parser should extract all required 
     * technical parameters (voltage, current, frequency) and provide structured output with industry standard validation
     */
    test('Property 1: Component specification parsing completeness', () => {
      fc.assert(fc.property(
        fc.record({
          partNumber: fc.stringOf(fc.char(), { minLength: 3, maxLength: 20 }),
          voltage: fc.float({ min: 0.1, max: 24.0 }),
          frequency: fc.integer({ min: 100, max: 10000 }),
          powerConsumption: fc.integer({ min: 1, max: 1000 }),
          socketType: fc.constantFrom('LGA1700', 'AM4', 'DDR4', 'PCIe')
        }),
        (testData) => {
          const input = `${testData.partNumber} ${testData.voltage}V ${testData.frequency}MHz ${testData.powerConsumption}W ${testData.socketType}`;
          const result = parser.parseSpecification(input);

          // Should always return a structured result
          expect(result).toHaveProperty('extractedSpecs');
          expect(result).toHaveProperty('confidence');
          expect(result).toHaveProperty('ambiguities');
          expect(result).toHaveProperty('validationErrors');

          // Should extract electrical specifications when present
          if (result.extractedSpecs.electricalSpecs.voltage > 0) {
            expect(result.extractedSpecs.electricalSpecs.voltage).toBeCloseTo(testData.voltage, 1);
          }
          if (result.extractedSpecs.electricalSpecs.frequency > 0) {
            expect(result.extractedSpecs.electricalSpecs.frequency).toBeCloseTo(testData.frequency, 0);
          }
          if (result.extractedSpecs.electricalSpecs.powerConsumption > 0) {
            expect(result.extractedSpecs.electricalSpecs.powerConsumption).toBeCloseTo(testData.powerConsumption, 0);
          }

          // Should provide valid confidence score
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
        }
      ), { numRuns: 100 });
    });

    /**
     * **Feature: lamington-road-market, Property 13: Error handling completeness**
     * For any parsing error or ambiguous specification, the system should provide detailed error messages 
     * with correction suggestions or request clarification through structured prompts
     */
    test('Property 13: Error handling completeness', () => {
      fc.assert(fc.property(
        fc.oneof(
          fc.constant(''), // Empty string
          fc.stringOf(fc.char(), { maxLength: 5 }), // Very short strings
          fc.stringOf(fc.constantFrom('!@#$%^&*()'), { minLength: 1, maxLength: 10 }), // Special characters only
          fc.stringOf(fc.integer({ min: 0, max: 9 }).map(n => n.toString()), { minLength: 1, maxLength: 20 }) // Numbers only
        ),
        (invalidInput) => {
          const result = parser.parseSpecification(invalidInput);

          // Should always handle invalid input gracefully
          expect(result).toHaveProperty('extractedSpecs');
          expect(result).toHaveProperty('ambiguities');
          expect(result).toHaveProperty('validationErrors');

          // Should provide feedback for problematic inputs
          if (invalidInput.trim().length === 0 || result.confidence < 0.3) {
            expect(result.ambiguities.length + result.validationErrors.length).toBeGreaterThan(0);
          }

          // Should never throw exceptions
          expect(() => parser.validateParameters(result.extractedSpecs)).not.toThrow();
        }
      ), { numRuns: 100 });
    });

    test('Property: Parsing consistency across similar inputs', () => {
      fc.assert(fc.property(
        fc.record({
          baseSpec: fc.constantFrom('i7-12700K', 'RTX4070', 'DDR4'),
          variation1: fc.constantFrom(' ', '-', '_'),
          variation2: fc.constantFrom('3.6GHz', '3600MHz', '3.6 GHz'),
          socketType: fc.constantFrom('LGA1700', 'AM4', 'PCIe')
        }),
        (testData) => {
          const input1 = `${testData.baseSpec}${testData.variation1}${testData.variation2} ${testData.socketType}`;
          const input2 = `${testData.baseSpec} ${testData.variation2} ${testData.socketType}`;

          const result1 = parser.parseSpecification(input1);
          const result2 = parser.parseSpecification(input2);

          // Similar inputs should produce similar categories
          expect(result1.extractedSpecs.category).toBe(result2.extractedSpecs.category);

          // Both should have reasonable confidence scores
          expect(result1.confidence).toBeGreaterThan(0);
          expect(result2.confidence).toBeGreaterThan(0);
        }
      ), { numRuns: 50 });
    });
  });

  describe('Edge Cases', () => {
    test('should handle mixed case input', () => {
      const input = 'intel I7-12700k 3.6ghz lga1700';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.category).toBe(ComponentCategory.PROCESSOR);
      expect(result.extractedSpecs.partNumber.toLowerCase()).toContain('i7-12700k');
    });

    test('should handle specifications with extra whitespace', () => {
      const input = '  DDR4   16GB   3200MHz   DIMM  ';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.category).toBe(ComponentCategory.MEMORY);
      expect(result.extractedSpecs.electricalSpecs.frequency).toBe(3200);
    });

    test('should handle GHz to MHz conversion', () => {
      const input = 'Intel i7 3.6GHz';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.electricalSpecs.frequency).toBe(3600); // Should convert to MHz
    });

    test('should handle kg to grams conversion', () => {
      const input = 'Graphics card 1.2kg';
      const result = parser.parseSpecification(input);

      expect(result.extractedSpecs.physicalSpecs.weight).toBe(1200); // Should convert to grams
    });
  });
});