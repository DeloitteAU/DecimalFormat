/*
 * decimalformat 0.1.0
 * Copyright (c) 2018
 * https://github.com/DeloitteDigitalAPAC/DecimalFormat/
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const { DecimalFormat } = require('./index');
const TESTS = require('./tests/tests.json');
const LOCALE = require('./tests/locale.json');

expect.extend({
	toFormatWith(testCase, formatter) {
		const result = formatter.format(testCase.input, LOCALE);
		const pass = (result === testCase.output);

		const message = (pass) => {
			return () => {
				let value = testCase.input.toString();

				if (DecimalFormat.isNegative(testCase.input)) {
					value = '-' + value;
				}

				const hint = this.utils.matcherHint((pass ? '.not' : '') + '.toFormatWith');
				const summary = `Expected value (${value}) to ${pass ? 'not be' : 'be'}:`;
				const receivedString = this.utils.printReceived(result);
				const expectedString = this.utils.printExpected(testCase.output);

				return `${hint}\n\n${summary}\n  ${expectedString}\nReceived:\n  ${receivedString}`;
			};
		};

		return {
			message: message(pass),
			pass: pass
		};
	}
});


describe('DecimalFormat', () => {
	test('count()', () => {
		expect(DecimalFormat.count('aaaa', 'a')).toEqual(4);
		expect(DecimalFormat.count('aaaa', 'aa')).toEqual(2);
		expect(DecimalFormat.count('aaaa', 'aaa')).toEqual(1);
	});

	test('reverseString()', () => {
		expect(DecimalFormat.reverseString('  abc ')).toEqual(' cba  ');
		expect(DecimalFormat.reverseString('abc')).toEqual('cba');
		expect(DecimalFormat.reverseString('')).toEqual('');
	});

	test('isNegative()', () => {
		expect(DecimalFormat.isNegative(0)).toEqual(false);
		expect(DecimalFormat.isNegative(+0)).toEqual(false);
		expect(DecimalFormat.isNegative(-0)).toEqual(true);
		expect(DecimalFormat.isNegative(1)).toEqual(false);
		expect(DecimalFormat.isNegative(-1)).toEqual(true);
	});

	test('applyGrouping()', () => {
		expect(DecimalFormat.applyGrouping('123456', 2, ',')).toEqual('12,34,56');
		expect(DecimalFormat.applyGrouping('123456', 4, ',')).toEqual('12,3456');
		expect(DecimalFormat.applyGrouping('123456', 6, ',')).toEqual('123456');
	});
});

describe('Testing parity with Java', () => {
	const testData = TESTS.reduce((accum, j) => {
		if (typeof j.input === 'number') {
			if (accum.hasOwnProperty(j.pattern) === false) {
				accum[j.pattern] = [];
			}

			accum[j.pattern].push(j);
			delete j.pattern;
		}
		return accum;
	}, {});

	Object.keys(testData).forEach(pattern => {
		test(`With pattern: ${pattern}`, () => {
			const formatter = new DecimalFormat(pattern);

			testData[pattern].forEach(testCase => {
				expect(testCase).toFormatWith(formatter);
			});
		});
	});
});
