import { describe, expect, test } from 'vitest';
import { Calc } from './calc.js';
import {
	evaluateLines,
	formatReadout,
	jumpLimit,
	normalizeWindow,
	renderStrokes,
	sampleY,
	traceEquation,
} from './graph-math.js';

function maxJump(stroke) {
	let max = 0;
	for (let i = 1; i < stroke.length; i++) {
		max = Math.max(max, Math.abs(stroke[i].y - stroke[i - 1].y));
	}
	return max;
}

function view(x1, x2, y1, y2) {
	const width = 600;
	return {
		x1,
		x2,
		y1,
		y2,
		width,
		quality: 1,
		scaleX: width / (x2 - x1),
	};
}

describe('traceEquation', () => {
	test('keeps a continuous curve in one stroke', () => {
		const strokes = traceEquation(Calc.makeFunction('sin(x)'), view(-Math.PI, Math.PI, -2, 2));

		expect(strokes).toHaveLength(1);
		expect(maxJump(strokes[0])).toBeLessThan(jumpLimit(4));
	});

	test('does not connect across the asymptotes of tan(x)', () => {
		const bounds = view(-6, 6, -5, 5);
		const strokes = traceEquation(Calc.makeFunction('tan(x)'), bounds);
		const limit = jumpLimit(10);

		expect(strokes.length).toBeGreaterThan(1);
		expect(Math.max(...strokes.map(maxJump))).toBeLessThanOrEqual(limit);
	});

	test('splits 1/x at zero', () => {
		const strokes = traceEquation(Calc.makeFunction('1/x'), view(-2, 2, -5, 5));

		expect(strokes.length).toBeGreaterThan(1);
		expect(strokes.some(stroke => stroke.every(point => point.x < 0))).toBe(true);
		expect(strokes.some(stroke => stroke.every(point => point.x > 0))).toBe(true);
	});

	test('keeps a steep continuous line in one stroke', () => {
		const strokes = traceEquation(x => 50 * x, view(-5, 5, -5, 5));

		expect(strokes).toHaveLength(1);
	});

	test('plots log(x) only where it is defined', () => {
		const f = Calc.makeFunction('log(x)');
		const strokes = traceEquation(f, view(-1, 4, -2, 2));

		expect(sampleY(f, -1)).toBeNaN();
		expect(sampleY(f, 1)).toBeCloseTo(0);
		expect(strokes.length).toBeGreaterThan(0);
		expect(strokes.every(stroke => stroke.every(point => point.x > 0))).toBe(true);
	});
});

describe('renderStrokes', () => {
	test('strokes the curve at the requested width and restores the previous width', () => {
		const calls = [];
		const ctx = {
			lineWidth: 1,
			beginPath() { calls.push('begin'); },
			moveTo() { calls.push('move'); },
			lineTo() { calls.push('line'); },
			stroke() { calls.push('stroke:' + this.lineWidth); },
		};
		const strokes = [
			[{ i: 0, x: 0, y: 0 }, { i: 1, x: 1, y: 1 }],
			[{ i: 2, x: 2, y: -1 }, { i: 3, x: 3, y: -2 }],
		];

		renderStrokes(ctx, strokes, {
			y1: -5,
			scaleY: 10,
			height: 100,
			color: '#FF0000',
			thickness: 2.5,
		});

		expect(ctx.strokeStyle).toBe('#FF0000');
		expect(ctx.lineWidth).toBe(1);
		expect(calls.filter(call => call === 'begin')).toHaveLength(2);
		expect(calls.filter(call => call === 'stroke:2.5')).toHaveLength(2);
	});
});

describe('evaluateLines', () => {
	test('reports a bad expression and still draws the next equation', () => {
		const lines = [{ equation: 'sin(' }, { equation: 'x^2' }];
		const drawn = [];

		const results = evaluateLines(lines, (line) => {
			drawn.push(line.equation);
			Calc.makeFunction(line.equation);
		});

		expect(drawn).toEqual(['sin(', 'x^2']);
		expect(results[0].error).toMatch(/end of expression/i);
		expect(results[1].error).toBe('');
		expect(Calc.makeFunction('x^2')(3)).toBe(9);
	});
});

describe('normalizeWindow', () => {
	test('parses numeric text and orders the corners', () => {
		expect(normalizeWindow('5', '-5', '2', '-2')).toEqual({
			x1: -5,
			x2: 5,
			y1: -2,
			y2: 2,
		});
	});

	test('rejects an empty or collapsed window', () => {
		expect(normalizeWindow('', '5', '-1', '1')).toBeNull();
		expect(normalizeWindow('1', '1', '-1', '1')).toBeNull();
		expect(normalizeWindow('0', '1', '2', '2')).toBeNull();
	});
});

describe('formatReadout', () => {
	test('formats graph coordinates', () => {
		expect(formatReadout(1.23456789, -2, Calc.roundToSignificantFigures)).toBe(
			'x = 1.23457    y = -2'
		);
	});

	test('returns an empty string for a non-numeric coordinate', () => {
		expect(formatReadout(NaN, 1, Calc.roundToSignificantFigures)).toBe('');
	});
});
