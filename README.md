# DecimalFormat

> `DecimalFormat` is an Node implementation of Java's [`DecimalFormat`](https://docs.oracle.com/javase/7/docs/api/java/text/DecimalFormat.html)class.

🌱 **This is a beta release. Use at your own risk.**

## Usage

#### Grammar

The grammar is contained in `src/DecimalFormat.pegjs`

#### Generating the parser

This repository comes with a pre-compiled parser. However, you can re-generate the parser with:

```bash
npm run grammar:build
```

The parser will be output to `dist/parser.js`.

#### Using the `DecimalFormat` class

```js
const { DecimalFormat }  = require('DecimalFormat');
const df = new DecimalFormat('#.000');
const result = df.format(1.234);
```

#### Using the parser

If you only require the internals of a pattern, you can parse an expression with the `DecimalFormat` class, with:

```js
const { parser } = require('DecimalFormat');
const result = parser.parse('#.000');
```

# `DecimalFormat` class

The `DecimalFormatter` class wraps the PEG.js parser and provides behaviour in alignment with the Java class of the same name.

#### `constructor` ( *pattern* )

Constructs a new `DecimalFormat` class with the provided pattern.  
**Throws:** When the pattern is invalid.

#### `parse` ( *pattern* )

Parses a new pattern. Replaces the pattern provided with the constructor.  
**Throws:** When the pattern is invalid.

#### `format` ( *number*, *locale* = `null` )

Formats a `number` with the provided `locale`. 

`locale` must be an object with the following structure:

```js
{
	currencySymbol: '',
	decimalSeparator: '',
	digit: '',
	exponentSeparator: '',
	groupingSeparator: '',
	minusSign: '',
	percent: '',
	perMill: ''
}
```

**Note:** `currencySymbol`, `digit`, `exponentSeparator`, `minusSign` and `perMill` are provided for future-proofing but are not currently in use.

#### `.isDecimalSeparatorAlwaysShown`

Whether the decimal separator is always shown in the pattern output.

#### `.groupingSize`

Grouping size, or zero if no grouping is specified.

#### `.minimumFractionDigits`

Minimum number of fractional digits.

#### `.maximumFractionDigits`

Maximum number of fractional digits. Any additional significance will be rounded.

#### `.minimumIntegerDigits`

Minimum number of integer digits.

#### `.maximumIntegerDigits`

Maximum number of integer digits. 

#### `.multiplierSymbol`

The multiplier symbol used in the pattern, or `null` if no symbol is present.

#### `.multiplier`

The multiplier, as a number, or `1` if no multiplier symbol is present.

#### `.negativePrefix`

The prefix (text before the pattern) of the negative pattern.

#### `.negativeSuffix`

The suffix (text after the pattern) of the negative pattern.

#### `.positivePrefix`

The prefix (text before the pattern) of the positive pattern.

#### `.positiveSuffix`

The suffix (text after the pattern) of the positive pattern.

#### `.hasMantissa`

Whether the pattern includes an exponent format.

# Parser results

The parser will return the following object when a pattern is parsed successfully:

```js
{
   positive: {},
   negative: {}
}
```

**Where:**

- `negative` will be `null` if an negative pattern was not included explicitly
- `positive` and `negative` will be the following object:

```js
{
	mantissa: "",
	decimalSeparatorAlwaysShown: "",
	minimumExponentDigits: "",
	minimumFractionDigits: "",
	maximumFractionDigits: "",
	minimumIntegerDigits: "",
	maximumIntegerDigits: "",
	groupingSize: "",
	prefix: "",
	suffix: ""
}
```

# Caveats

Please note the following caveats or differences between this implementation and Java's [`DecimalFormat`](https://docs.oracle.com/javase/7/docs/api/java/text/DecimalFormat.html):

1. This implementation does not support patterns that include an exponent, such as `0.#E0`.
2. This implementation does not parse a pattern where special characters appear more than once. For example, `# 0` will not parse. Where as Java matches the first pattern, and ignores all subsequent patterns.
3. Similar to Java, this implementation picks the grouping size based on the last grouping to appear in the integer pattern. i.e. `#,##,###` will have a grouping size of 3. As such, it is not possible to use the [thousand, lakh, crore grouping](https://en.wikipedia.org/wiki/Indian_numbering_system).

# Tests

#### Generating tests

Tests are included in `tests/tests.json`. This file is prepared by the `ParityTests` Java class, located under `src/ParityTests.java`.

`tests/tests.json` has already been generated. However, you can re-generate with the following commands:

```bash
npm run java
```

The above steps assumes that `javac` and `java` are both available in your your PATH environmental variables.

#### Running tests

Tests can be run with:

```bash
npm run test
```

## License

**BSD 3-Clause License**

> Copyright (C) 2018. All rights reserved.
> 
> DecimalFormat can be downloaded from: https://github.com/node-htl/DecimalFormat
> 
> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
> 
> - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
> - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
> - Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
> 
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
> 
> IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
