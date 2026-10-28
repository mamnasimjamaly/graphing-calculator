// Sampling and window math shared by the canvas and the unit tests.

export function sampleY(f, x) {
	var y;
	try {
		y = f(x);
	} catch (e) {
		return NaN;
	}
	if (typeof y === "object" && y !== null)
		return NaN;
	return y;
}

// Break the stroke when the jump is far larger than the visible y range.
export function jumpLimit(yrange) {
	return Math.max(Math.abs(yrange) * 20, 1);
}

export function traceEquation(f, view) {
	var x1 = view.x1;
	var y1 = view.y1;
	var y2 = view.y2;
	var yrange = Math.abs(y2 - y1);
	var limit = jumpLimit(yrange);
	var step = 1 / view.quality;
	var inverseScaleX = 1 / view.scaleX;
	var maxxval = view.width + step;
	var strokes = [];
	var current = [];
	var prevY = null;

	for (var i = 0; i < maxxval; i += step) {
		var xval = i * inverseScaleX + x1;
		var yval = sampleY(f, xval);
		var discontinuous = !isFinite(yval) || (prevY !== null && Math.abs(yval - prevY) > limit);

		if (discontinuous) {
			if (current.length)
				strokes.push(current);
			current = [];
			prevY = isFinite(yval) ? yval : null;
			if (isFinite(yval))
				current.push({ i: i, x: xval, y: yval });
		}
		else {
			current.push({ i: i, x: xval, y: yval });
			prevY = yval;
		}
	}

	if (current.length)
		strokes.push(current);
	return strokes;
}

export function renderStrokes(ctx, strokes, view) {
	ctx.strokeStyle = view.color;
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	var oldWidth = ctx.lineWidth;
	ctx.lineWidth = view.thickness || 2;

	strokes.forEach(function(stroke) {
		if (!stroke.length)
			return;
		ctx.beginPath();
		stroke.forEach(function(point, index) {
			var ypos = view.height - ((point.y - view.y1) * view.scaleY);
			if (index === 0)
				ctx.moveTo(point.i, ypos);
			else
				ctx.lineTo(point.i, ypos);
		});
		ctx.stroke();
	});

	ctx.lineWidth = oldWidth;
}

// One bad equation must not stop the equations after it.
export function evaluateLines(lines, drawOne) {
	return lines.map(function(line, index) {
		try {
			drawOne(line, index);
			return { index: index, error: "" };
		} catch (e) {
			return {
				index: index,
				error: (e && e.message) ? e.message : "Invalid expression"
			};
		}
	});
}

export function normalizeWindow(x1, x2, y1, y2) {
	x1 = parseFloat(x1);
	x2 = parseFloat(x2);
	y1 = parseFloat(y1);
	y2 = parseFloat(y2);
	if (![x1, x2, y1, y2].every(Number.isFinite) || x1 === x2 || y1 === y2)
		return null;
	if (x1 > x2) {
		var swapX = x1;
		x1 = x2;
		x2 = swapX;
	}
	if (y1 > y2) {
		var swapY = y1;
		y1 = y2;
		y2 = swapY;
	}
	return { x1: x1, x2: x2, y1: y1, y2: y2 };
}

export function formatReadout(x, y, round) {
	if (!isFinite(x) || !isFinite(y))
		return "";
	return "x = " + round(x, 6) + "    y = " + round(y, 6);
}

function shownCoordinate(value, round) {
	// A root at the origin is often only exact to 1e-10. Show that as 0.
	if (!isFinite(value) || Math.abs(value) < 1e-9)
		return 0;
	var rounded = round(value, 6);
	if (!isFinite(rounded) || Math.abs(rounded) < 1e-9)
		return 0;
	return rounded;
}

export function formatPoint(x, y, round) {
	if (!isFinite(x) || !isFinite(y))
		return "";
	return "(" + shownCoordinate(x, round) + ", " + shownCoordinate(y, round) + ")";
}

function differenceAt(f, g, x) {
	var a = sampleY(f, x);
	var b = sampleY(g, x);
	if (!isFinite(a) || !isFinite(b))
		return NaN;
	return a - b;
}

function refineCrossing(f, g, left, right) {
	var a = left;
	var b = right;
	var fa = differenceAt(f, g, a);
	var k, mid, fm;

	// Keep narrowing the bracket. Stopping when f-g is merely small
	// leaves a flat crossing, such as sin(x) and x, far from the origin.
	for (k = 0; k < 60; k++) {
		if (Math.abs(b - a) < 1e-12)
			break;
		mid = (a + b) / 2;
		fm = differenceAt(f, g, mid);
		if (!isFinite(fm))
			return null;
		if (fm === 0)
			return mid;
		if (fa * fm <= 0)
			b = mid;
		else {
			a = mid;
			fa = fm;
		}
	}

	mid = (a + b) / 2;
	fm = differenceAt(f, g, mid);
	if (!isFinite(fm) || Math.abs(fm) > 1e-6)
		return null;
	return mid;
}

function snapOrigin(x, y) {
	if (Math.abs(x) < 1e-8 && Math.abs(y) < 1e-8)
		return { x: 0, y: 0 };
	return { x: x, y: y };
}

function dedupePoints(points, tolerance) {
	var kept = [];
	points.forEach(function(point) {
		var duplicate = kept.some(function(existing) {
			return Math.hypot(existing.x - point.x, existing.y - point.y) <= tolerance;
		});
		if (!duplicate)
			kept.push(point);
	});
	return kept;
}

function coversXAxis(f, x1, x2) {
	var samples = 8;
	var i, y;
	for (i = 0; i <= samples; i++) {
		y = sampleY(f, x1 + (x2 - x1) * (i / samples));
		if (!isFinite(y) || Math.abs(y) > 1e-8)
			return false;
	}
	return true;
}

function includesZero(a, b) {
	return Math.min(a, b) <= 0 && Math.max(a, b) >= 0;
}

// Roots f(x) = 0, and the single point where the curve meets x = 0.
function axisIntersections(fns, x1, x2, y1, y2, n) {
	var points = [];
	var xAxisVisible = y1 === undefined || y2 === undefined || includesZero(y1, y2);
	var yAxisVisible = includesZero(x1, x2);
	var yLo = y1 === undefined || y2 === undefined ? -Infinity : Math.min(y1, y2);
	var yHi = y1 === undefined || y2 === undefined ? Infinity : Math.max(y1, y2);
	var zero = function() { return 0; };

	fns.forEach(function(f) {
		var dx, prevX, prev, s, x, y, root, yAt;

		if (xAxisVisible && !coversXAxis(f, x1, x2)) {
			if (x1 < 0 && x2 > 0) {
				y = sampleY(f, 0);
				if (isFinite(y) && Math.abs(y) < 1e-8)
					points.push({ x: 0, y: 0 });
			}
			dx = (x2 - x1) / n;
			prevX = x1;
			prev = sampleY(f, x1);
			for (s = 1; s <= n; s++) {
				x = x1 + dx * s;
				y = sampleY(f, x);
				root = null;
				if (isFinite(prev) && prev === 0)
					root = prevX;
				else if (isFinite(prev) && isFinite(y) && prev * y < 0)
					root = refineCrossing(f, zero, prevX, x);
				if (root !== null) {
					yAt = sampleY(f, root);
					if (isFinite(yAt) && Math.abs(yAt) < 1e-4)
						points.push(snapOrigin(root, 0));
				}
				prevX = x;
				prev = y;
			}
		}

		if (yAxisVisible) {
			y = sampleY(f, 0);
			if (isFinite(y) && y >= yLo && y <= yHi)
				points.push(snapOrigin(0, y));
		}
	});

	return points;
}

// Crossings of every pair, plus where each curve meets an axis.
export function findIntersections(fns, x1, x2, stepsOrOptions) {
	var points = [];
	var steps = 480;
	var y1, y2;
	var n, dx, i, j, s, prevX, prev, x, diff, root, y1Sample, y2Sample;

	if (typeof stepsOrOptions === "number")
		steps = stepsOrOptions;
	else if (stepsOrOptions) {
		steps = stepsOrOptions.steps || 480;
		y1 = stepsOrOptions.y1;
		y2 = stepsOrOptions.y2;
	}

	if (!(x2 > x1) || !fns || fns.length < 1)
		return points;

	n = steps;
	dx = (x2 - x1) / n;
	for (i = 0; i < fns.length; i++) {
		for (j = i + 1; j < fns.length; j++) {
			// A touch at the origin, such as x^2 and y = 0, never changes sign.
			if (x1 < 0 && x2 > 0) {
				y1Sample = sampleY(fns[i], 0);
				y2Sample = sampleY(fns[j], 0);
				if (isFinite(y1Sample) && isFinite(y2Sample) && Math.abs(y1Sample - y2Sample) < 1e-8)
					points.push(snapOrigin(0, (y1Sample + y2Sample) / 2));
			}

			prevX = x1;
			prev = differenceAt(fns[i], fns[j], x1);
			for (s = 1; s <= n; s++) {
				x = x1 + dx * s;
				diff = differenceAt(fns[i], fns[j], x);
				root = null;
				if (isFinite(prev) && prev === 0)
					root = prevX;
				else if (isFinite(prev) && isFinite(diff) && prev * diff < 0)
					root = refineCrossing(fns[i], fns[j], prevX, x);
				if (root !== null) {
					y1Sample = sampleY(fns[i], root);
					y2Sample = sampleY(fns[j], root);
					if (isFinite(y1Sample) && isFinite(y2Sample) && Math.abs(y1Sample - y2Sample) < 1e-4)
						points.push(snapOrigin(root, (y1Sample + y2Sample) / 2));
				}
				prevX = x;
				prev = diff;
			}
		}
	}

	points = points.concat(axisIntersections(fns, x1, x2, y1, y2, n));
	return dedupePoints(points, Math.max(Math.abs(x2 - x1) * 1e-5, 1e-7));
}

export function nearestIntersection(points, mouseX, mouseY, toPixel, maxPixels) {
	var best = null;
	var bestDist = maxPixels;
	(points || []).forEach(function(point) {
		var pixel = toPixel(point.x, point.y);
		var dist = Math.hypot(pixel.x - mouseX, pixel.y - mouseY);
		if (dist <= bestDist) {
			bestDist = dist;
			best = point;
		}
	});
	return best;
}
