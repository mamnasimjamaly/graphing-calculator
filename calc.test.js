import { describe, expect, test, beforeEach } from 'vitest';
import { math } from './globals.js';
import { Calc } from './calc.js';

describe('Calc', () => {
    beforeEach(() => {
        Calc.angles = 'radians';
        Calc.loopcounter = 0;
    });

    describe('angle conversion', () => {
        test('returns radians unchanged when angle mode is radians', () => {
            Calc.angles = 'radians';

            expect(Calc.convAngles(Math.PI)).toBe(Math.PI);
        });

        test('converts degrees to radians', () => {
            Calc.angles = 'degrees';

            expect(Calc.convAngles(180)).toBeCloseTo(Math.PI);
            expect(Calc.convAngles(90)).toBeCloseTo(Math.PI / 2);
            expect(Calc.convAngles(0)).toBe(0);
        });

        test('converts gradians to radians', () => {
            Calc.angles = 'gradians';

            expect(Calc.convAngles(200)).toBeCloseTo(Math.PI);
            expect(Calc.convAngles(100)).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('radian conversion', () => {
        test('returns radians unchanged in radians mode', () => {
            Calc.angles = 'radians';

            expect(Calc.convRadians(Math.PI)).toBe(Math.PI);
        });

        test('converts radians to degrees', () => {
            Calc.angles = 'degrees';

            expect(Calc.convRadians(Math.PI)).toBeCloseTo(180);
            expect(Calc.convRadians(Math.PI / 2)).toBeCloseTo(90);
        });

        test('converts radians to gradians', () => {
            Calc.angles = 'gradians';

            expect(Calc.convRadians(Math.PI)).toBeCloseTo(200);
            expect(Calc.convRadians(Math.PI / 2)).toBeCloseTo(100);
        });
    });

    describe('trig in the current angle mode', () => {
        test('sin and asin use degrees', () => {
            Calc.angles = 'degrees';

            expect(math.sin(90)).toBeCloseTo(1);
            expect(math.sin(180)).toBeCloseTo(0, 10);
            expect(math.asin(1)).toBeCloseTo(90);
            expect(math.asin(0)).toBeCloseTo(0);
        });

        test('sin and asin use gradians', () => {
            Calc.angles = 'gradians';

            expect(math.sin(100)).toBeCloseTo(1);
            expect(math.asin(1)).toBeCloseTo(100);
        });

        test('atan2 returns degrees', () => {
            Calc.angles = 'degrees';

            expect(math.atan2(1, 1)).toBeCloseTo(45);
        });

        test('sin stays in radians by default', () => {
            expect(math.sin(Math.PI / 2)).toBeCloseTo(1);
            expect(math.asin(1)).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('getDerivative', () => {
        test('calculates derivative of a linear function', () => {
            const derivative = Calc.getDerivative(x => 2 * x + 3, 5);

            expect(derivative).toBeCloseTo(2, 8);
        });

        test('calculates derivative of x squared', () => {
            const derivative = Calc.getDerivative(x => x * x, 3);

            expect(derivative).toBeCloseTo(6, 6);
        });

        test('calculates derivative of sin(x)', () => {
            const derivative = Calc.getDerivative(Math.sin, 0);

            expect(derivative).toBeCloseTo(1, 6);
        });
    });

    describe('variablesInExpression', () => {
        test('finds variables in an expression', () => {
            const expr = math.parse('x^2 + y + 2');

            expect(Calc.variablesInExpression(expr)).toEqual(['x', 'y']);
        });

        test('returns variables in sorted order', () => {
            const expr = math.parse('z + x + y');

            expect(Calc.variablesInExpression(expr)).toEqual(['x', 'y', 'z']);
        });

        test('does not treat math functions as variables', () => {
            const expr = math.parse('sin(x) + cos(y)');

            expect(Calc.variablesInExpression(expr)).toEqual(['x', 'y']);
        });

        test('returns an empty array when there are no variables', () => {
            const expr = math.parse('2 + 3 * 4');

            expect(Calc.variablesInExpression(expr)).toEqual([]);
        });
    });

    describe('makeFunction', () => {
        test('creates a function from an expression', () => {
            const fn = Calc.makeFunction('x^2');

            expect(fn(3)).toBe(9);
            expect(fn(5)).toBe(25);
        });

        test('supports expressions with multiple variables', () => {
            const fn = Calc.makeFunction('x + y');

            // makeFunction assigns the same supplied value to all variables.
            expect(fn(5)).toBe(10);
        });

        test('supports math functions', () => {
            const fn = Calc.makeFunction('sin(x)');

            expect(fn(0)).toBeCloseTo(0);
            expect(fn(Math.PI / 2)).toBeCloseTo(1);
        });
    });

    describe('roundToSignificantFigures', () => {
        test('returns zero for zero', () => {
            expect(Calc.roundToSignificantFigures(0, 3)).toBe(0);
        });

        test('rounds positive numbers', () => {
            expect(
                Calc.roundToSignificantFigures(123.456, 3)
            ).toBe(123);
        });

        test('rounds numbers with decimals', () => {
            expect(
                Calc.roundToSignificantFigures(12.3456, 3)
            ).toBe(12.3);
        });

        test('rounds negative numbers', () => {
            expect(
                Calc.roundToSignificantFigures(-123.456, 3)
            ).toBe(-123);
        });
    });

    describe('roundFloat', () => {
        test('rounds floating point imprecision', () => {
            expect(Calc.roundFloat(0.1 + 0.2)).toBe(0.3);
        });

        test('preserves normal decimal values', () => {
            expect(Calc.roundFloat(1.23456789)).toBe(1.23456789);
        });
    });

    describe('getRoot', () => {
        test('finds the root of x - 5', () => {
            const root = Calc.getRoot('x - 5', 4);

            expect(root).toBeCloseTo(5, 8);
        });

        test('finds the root of x^2 - 4', () => {
            const root = Calc.getRoot('x^2 - 4', 3);

            expect(root).toBeCloseTo(2, 8);
        });

        test('finds a negative root', () => {
            const root = Calc.getRoot('x^2 - 4', -3);

            expect(root).toBeCloseTo(-2, 8);
        });
    });

    describe('getIntersection', () => {
        test('finds the intersection of two lines', () => {
            const root = Calc.getIntersection(
                'x',
                '10 - x',
                4
            );

            expect(root).toBeCloseTo(5, 8);
        });

        test('finds the intersection of two equations', () => {
            const root = Calc.getIntersection(
                'x^2',
                '4',
                3
            );

            expect(root).toBeCloseTo(2, 8);
        });
    });

    describe('getVertex', () => {
        test('finds a minimum near the vertex', () => {
            const vertex = Calc.getVertex(
                x => (x - 3) ** 2,
                0,
                6,
                0.0001
            );

            expect(vertex).toBeCloseTo(3, 3);
        });

        test('finds a maximum near the vertex', () => {
            const vertex = Calc.getVertex(
                x => -((x - 2) ** 2),
                0,
                4,
                0.0001
            );

            expect(vertex).toBeCloseTo(2, 3);
        });

        test('returns false when no vertex is found', () => {
            const vertex = Calc.getVertex(
                x => x,
                0,
                10,
                0.0001
            );

            expect(vertex).toBe(false);
        });
    });
});