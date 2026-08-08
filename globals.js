import $ from 'jquery';
import _ from 'underscore';
import { create, all } from 'mathjs';

// Create the math.js instance to get all methods (including math.import, math.parse, etc.)
const math = create(all);

// Expose legacy globals to window
window.$ = window.jQuery = $;
window._ = _;
window.math = math;
