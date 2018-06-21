/*
 * decimalformat 0.1.0
 * Copyright (c) 2018
 * https://github.com/DeloitteDigitalAPAC/DecimalFormat/
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const parser = require('./dist/parser');

class DecimalFormat {
	/**
		@constructor
		@param {string} pattern - Passed directly to the parse() method
	*/
	constructor(pattern) {
		this.parse(pattern);
	}

	/*
		Pads a string to the provided length
		@param {string} str
		@param {number} length
		@param {string} pad
	*/
	static padStart(str, length, pad = ' ') {
		if (str.length > length) {
            return str
        } else {
            length = length - str.length;

            if (length > pad.length) {
                pad += pad.repeat(length / pad.length);
            }

            return pad.slice(0, length) + str;
        }
    };

	/**
		Counts the number of occurances of a string within another string.
		@param {string} str - String to search within
		@param {string} search - String to search for
	*/
	static count(str, search) {
		return str.split(search).length - 1;
	}

	/**
		Reverses a string
		@param {string} str
	*/
	static reverseString(str) {
		return str.split('').reverse().join('');
	}

	/**
		Returns whether a number is negative; specifically testing for negative zero.
		@param {number} n
	*/
	static isNegative(n) {
		return n === 0 ? (1 / n < 0) : (n < 0);
	}

	/**
		Parses a pattern.
		@throws Will throw when the pattern cannot be parsed.
		@param {string} pattern
	*/
	parse(pattern) {
		this.pattern = pattern;
		this.parsed = parser.parse(pattern);

		const percentageInPrefix = DecimalFormat.count(this.parsed.positive.prefix, '%');
		const percentageInSuffix = DecimalFormat.count(this.parsed.positive.suffix, '%');

		if ((percentageInPrefix + percentageInSuffix) > 1) {
			throw new Error('Too many percent/per mille characters in pattern');
		}

		// Explicitly check for the pattern '.E0'
		if (this.minimumIntegerDigits === 0 && this.minimumFractionDigits === 0 && this.hasMantissa) {
			throw new Error('At least one integer or fraction digit is required for exponential patterns');
		}

		// If a negative pattern is not explicitly provided, use a copy of the
		// positive pattern.
		if (this.parsed.negative === null) {
			this.parsed.negative = Object.assign({}, this.parsed.positive);
		}

		// Java adds a '-' character to the negative prefix, when the prefix
		// is identical to the positive prefix.
		if (this.parsed.negative.prefix === this.parsed.positive.prefix) {
			this.parsed.negative.prefix = '-' + this.parsed.negative.prefix;
		}
	}

	/**
		Applies grouping separators to a string.
		@param {string} str - String
		@param {number} size - Number of characters between each separator
		@param {string} separator - Separator
	*/
	static applyGrouping(str, size, separator) {
		const groupingMatch = new RegExp('(.{' + size + '})(?=.)', 'g');

		str = DecimalFormat.reverseString(str).replace(groupingMatch, (match) => {
			return match + separator;
		});

		return DecimalFormat.reverseString(str);
	}

	/**
		Formats a number with the pattern.
		@param {number} number - Number to format
		@param {object} Locale - Locale
	*/
	format(number, locale = {}) {
		const formatLocale = Object.assign({}, this.defaultLocale, locale);

		if (typeof number !== 'number') {
			throw new TypeError(`Argument must be a number, received: ${typeof number}`);
		} else if (this.hasMantissa) {
			return number.toExponential();
		} else {
			const isNegative = DecimalFormat.isNegative(number);
			let [integerString, fractionString] = Math.abs(number * this.multiplier).toFixed(this.maximumFractionDigits).split('.');

			if (this.isDecimalSeparatorAlwaysShown) {
				const optionalFractionalDigits = this.maximumFractionDigits - this.minimumFractionDigits;

				// Remove optional zeroes in fraction
				if (optionalFractionalDigits > 0) {
					const re = new RegExp('0{0,' + optionalFractionalDigits + '}$');
					fractionString = fractionString.replace(re, '');
				}

				// Remove the zero for matters like '#.0' with values like 0.5
				if (this.minimumFractionDigits > 0) {
					if (this.minimumIntegerDigits === 0 && integerString === '0') {
						integerString = '';
					}
				}

				// Add decimal separator if necessary
				if (fractionString && fractionString.length > 0) {
					fractionString = formatLocale.decimalSeparator + fractionString;
				} else if (optionalFractionalDigits === 0 && this.minimumFractionDigits === 0) {
					fractionString = formatLocale.decimalSeparator;
				} else {
					fractionString = '';
				}
			} else {
				fractionString = '';
			}

			// Minimum integer digits
			integerString = DecimalFormat.padStart(integerString, this.minimumIntegerDigits, '0');

			// Grouping
			if (this.hasMantissa === false && this.groupingSize > 0) {
				integerString = DecimalFormat.applyGrouping(integerString, this.groupingSize, formatLocale.groupingSeparator);
			}

			// Prefix and suffix for positive and negative numbers, respectively.
			let prefix, suffix;

			// This function is used to specifically check for negative zero (-0),
			// which returns the negative pattern in Java.
			if (isNegative) {
				prefix = this.negativePrefix;
				suffix = this.negativeSuffix;
			} else {
				prefix = this.positivePrefix;
				suffix = this.positiveSuffix;
			}

			return prefix + integerString + fractionString + suffix;
		}
	}

	get defaultLocale() {
		return {
			currencySymbol: '',
			decimalSeparator: '',
			digit: '',
			exponentSeparator: '',
			groupingSeparator: '',
			minusSign: '',
			percent: '',
			perMill: ''
		};
	}

	/**
		Whether the pattern forces a decimal separator to always be shown.
	*/
	get isDecimalSeparatorAlwaysShown() {
		return this.parsed.positive.decimalSeparatorAlwaysShown;
	}

	/**
		Whether the pattern includes an mantissa and exponent.
	*/
	get hasMantissa() {
		return this.parsed.positive.mantissa;
	}

	/**
		Grouping size, or zero if no grouping was specified in the pattern.
	*/
	get groupingSize() {
		return this.parsed.positive.groupingSize;
	}

	/**
		Minimum number of fractional digits specified in the pattern.
	*/
	get minimumFractionDigits() {
		return this.parsed.positive.minimumFractionDigits;
	}

	/**
		Maximum number of fractional digits specified in the pattern.
	*/
	get maximumFractionDigits() {
		return this.parsed.positive.maximumFractionDigits;
	}

	/**
		Minimum number of integer digits specified in the pattern.
	*/
	get minimumIntegerDigits() {
		return this.parsed.positive.minimumIntegerDigits;
	}

	/**
		Maximum number of integer digits specified in the pattern.
	*/
	get maximumIntegerDigits() {
		return this.parsed.positive.maximumIntegerDigits;
	}

	/**
		Symbol used in the pattern which affects the multiplier, or null if a modifier
		was not specified in the pattern.
	*/
	get multiplierSymbol() {
		const p = this.parsed.positive;

		if (p.prefix.indexOf('%') > -1) {
			return '%';
		} else if (p.suffix.indexOf('%') > -1) {
			return '%';
		} else {
			return null;
		}

		return null;
	}

	/**
		Multiplier (as an number) specified in the pattern, or 1 if no multiplier was specified.
	*/
	get multiplier() {
		const multiplierSymbol = this.multiplierSymbol;

		if (multiplierSymbol === '%') {
			return 100;
		} else {
			return 1;
		}
	}

	/**
		Text preceeding the negative pattern.
	*/
	get negativePrefix() {
		return this.parsed.negative.prefix;
	}

	/**
		Text proceeding the negative pattern.
	*/
	get negativeSuffix() {
		return this.parsed.negative.suffix;
	}

	/**
		Text preceeding the positive pattern.
	*/
	get positivePrefix() {
		return this.parsed.positive.prefix;
	}

	/**
		Text proceeding the positive pattern.
	*/
	get positiveSuffix() {
		return this.parsed.positive.suffix;
	}
}

module.exports = {
	DecimalFormat,
	parser
};
