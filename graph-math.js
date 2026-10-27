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
