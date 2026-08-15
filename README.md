# GraphN - The JavaScript Graphing Calculator

An elegant, client-side, interactive 2D graphing calculator built with HTML5 Canvas, CSS3, jQuery, Underscore.js, and Math.js. GraphN allows users to plot multiple mathematical functions simultaneously, explore them using robust tools, and customize various viewing options.

![GraphN Interface](graph.png)

## 🚀 Getting Started

GraphN is a client-side Vite app. You need Node.js 22+ and npm.

1. Clone the repository:
   ```bash
   git clone https://github.com/mamnasimjamaly/graphing-calculator.git
   cd graphing-calculator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the URL Vite prints (usually `http://localhost:5173`) in a modern browser.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest unit tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## ✨ Features

### 📈 Interactive Graph Canvas
* **Dynamic Panning & Dragging:** Click and drag the canvas using the Pointer tool to explore different regions of the graph.
* **Smooth Zooming:** Zoom in and out using dedicated zoom tools, or define exact coordinate bounds using the custom window options.
* **Smart Gridlines:** Supports varying levels of gridline density (Normal, Less, Off) with automated tick marks that adapt as you pan and zoom.

### 🛠️ Powerful Mathematical Analysis Tools
Select these tools directly from the top toolbar to interactively analyze your plotted equations:
* 🖲️ **Pointer:** Default tool for panning around and examining coordinates.
* 📈 **Trace:** Evaluate any plotted function dynamically. Input/select an $x$-coordinate to instantly compute and view the corresponding $y$-value.
* ⛰️ **Local Minima/Maxima (Vertex):** Automatically locate local peaks (maxima) and valleys (minima) in a selected interval on your curve.
* 🎯 **Root Finder:** Locate the precise roots ($x$-intercepts) of any selected equation using an optimized implementation of Newton's Method.
* ❌ **Intersection Finder:** Find the intersection point between any two plotted curves.
* 📐 **Derivative ($\frac{dy}{dx}$):** Approximates the derivative of a function at any given point on the canvas using a highly accurate 100-point stencil for the difference quotient.

### ⚙️ Customizable Settings
Access the settings drawer to modify:
* **Angle Modes:** Easily toggle trigonometric operations between **Radians (RAD)**, **Degrees (DEG)**, and **Gradians (GRAD)**.
* **Gridline Modes:** Adjust grid visibility between **Normal**, **Less**, and **Off**.
* **Precision/Quality Levels:** Control rendering quality by setting graph precision to **Low**, **Medium**, **High**, or **Ultra** to balance performance and visual fidelity.

---

## 🛠️ Tech Stack & Architecture

GraphN is built on standard web technologies and leverages highly reliable third-party mathematical libraries:
* **Vite:** Development server, ES module bundling, and production builds.
* **Vitest:** Unit tests for the calculation engine.
* **HTML5 Canvas API:** Provides high-performance 2D rendering of gridlines, axes, text labels, and custom functions.
* **Math.js:** Serves as the math engine, parsing math expressions into abstract syntax trees (AST) and evaluating them efficiently.
* **jQuery:** Handles UI updates, tool actions, and settings drawer animations.
* **Underscore.js:** Offers functional programming helpers for collections and arrays.
* **CSS3:** Delivers a modern, semi-transparent responsive sidebar design.

---

## 📂 Project Structure

* `index.html` - The main application webpage containing the sidebar layout, canvas, toolbar, and settings configurations.
* `main.js` - Vite entry point that loads the application modules.
* `globals.js` - Shared jQuery, Underscore, and Math.js instances used by the rest of the app.
* `calc.js` - Contains the math engine logic, including machine epsilon calculation, angle conversions, root finding (Newton's Method), local extrema search, intersection calculations, and derivative stencil approximations.
* `calc.test.js` - Vitest unit tests for the calculation engine.
* `jsgcalc.js` - Controls the graphing canvas logic (drawing functions, rendering gridlines, handling pan/drag/zoom operations, and mouse actions).
* `jsgui.js` - Manages sidebar interactions, addition of input rows, toolbar selections, evaluation events, and menu toggles.
* `BigInt.js` - A comprehensive library for handling arbitrary-precision integers and mathematical operations on big numbers.
* `jsgcalc.css` - Custom styles defining the modern interface layout, toolbar icons, fancy buttons, and responsive grid panels.
* `images/` - Icon assets representing tools like root, minmax, intersect, trace, and settings.
* `.github/workflows/ci.yml` - GitHub Actions workflow that installs dependencies, builds the app, and runs tests on every push and pull request to `main`.

---

## 📝 Syntax Guide

The calculator supports standard mathematical syntax, variable usage (typically using $x$), and functions provided by Math.js:
* **Operators:** `+`, `-`, `*`, `/`, `^` (exponentiation)
* **Constants:** `pi`, `e`
* **Functions:**
  * Trigonometric: `sin(x)`, `cos(x)`, `tan(x)`, `csc(x)`, `sec(x)`, `cot(x)`
  * Inverse Trig: `asin(x)`, `acos(x)`, `atan(x)`
  * Logarithmic: `log(x)`, `log10(x)`, `ln(x)`
  * Exponential & Radicals: `exp(x)`, `sqrt(x)`
  * Absolute value: `abs(x)`

*Example Inputs:*
* `sin(x)`
* `x^2 - 4`
* `exp(-x^2) * cos(3*x)`
* `abs(x) / (x + 2)`

---

## 🤝 Contribution & License

Contributions are welcome! Please feel free to open an issue or submit a pull request if you have ideas for new features, performance enhancements, or UI improvements.
