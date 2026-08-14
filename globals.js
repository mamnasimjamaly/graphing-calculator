import $ from 'jquery';
import _ from 'underscore';
import { create, all } from 'mathjs';

// Create the math.js instance to get all methods (including math.import, math.parse, etc.)
const math = create(all);

// Expose legacy globals (globalThis is window in the browser)
globalThis.$ = globalThis.jQuery = $;
globalThis._ = _;
globalThis.math = math;

export { $, _, math };
