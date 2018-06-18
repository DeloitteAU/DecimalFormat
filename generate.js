/*
 * decimalformat 0.1.0-beta.1
 * Copyright (c) 2018
 * https://github.com/node-htl/DecimalFormat/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const peg = require('pegjs');

const grammar = fs.readFileSync(path.join('src', 'decimalformat.pegjs'), 'utf8');
const parserSource = peg.generate(grammar, {
	cache: false,
	format: 'commonjs',
	optimize: 'speed',
	output: 'source'
});

fs.writeFileSync(path.join('dist', 'parser.js'), parserSource);
