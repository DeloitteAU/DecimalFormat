{
    const flatten = (a) => {
        const temp = [];

        a.forEach(j => {
            if (Array.isArray(j)) {
                temp.push(...flatten(j));
            } else {
                temp.push(j);
            }
        });

        return temp;
    };

    const formatBase = () => {
        return {
            decimalSeparatorAlwaysShown: false,
            mantissa: false,
            minimumExponentDigits: 0,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            minimumIntegerDigits: 0,
            maximumIntegerDigits: 0,
            groupingSize: 0
        };
    };

    const handleFormat = (integer, fraction, mantissa) => {
        const k = Object.assign(formatBase(), handeInteger(integer), fraction, mantissa);
        return k;
    };

    const handeInteger = (d) => {
        d = (d || "");
        const parts = d.split(',');
        const requiredDigits = d.split('0').length - 1;
        const optionalDigits = d.split('#').length - 1;
        let groupingSize = 0;

        if (parts.length > 1) {
            groupingSize = parts[parts.length - 1].length;
        }

        return {
            groupingSize: groupingSize,
            minimumIntegerDigits: requiredDigits,
            maximumIntegerDigits: requiredDigits + optionalDigits
        };
    };

    const parseFraction = (r, o) => {
        const rd = (r ? r.length : 0);
        const od = (o ? o.length : 0);

        return {
            decimalSeparatorAlwaysShown: true,
            minimumFractionDigits: rd,
            maximumFractionDigits: rd + od
        }
    };
}

Expression = positive:Pattern negative:(PatternSep Pattern)? {
    return {
        positive: positive,
        negative: (negative ? negative[1] : null)
    };
}

Pattern = prefix:Text* format:Format suffix:Text* {
    return Object.assign(format, {
        prefix: prefix.join(''),
        suffix: suffix.join('')
    });
}

Format 'Format'
    = i:Integer? f:Fraction m:Mantissa? {
        return handleFormat(i, f, m);
    }
    / i:Integer f:Fraction? m:Mantissa? {
        return handleFormat(i, f, m);
    }

Fraction 'Fraction'
    = FractionSep r:ReqDigit+ o:OptDigit* { return parseFraction(r, o); }
    / FractionSep o:OptDigit+             { return parseFraction(null, o); }
    / FractionSep                         { return parseFraction(null, null); }

Mantissa 'Mantissa'
    = MantissaSep d:ReqDigit+ { return {
        mantissa: true,
        minimumExponentDigits: d.length
    }; }

Integer 'Integer'
    = $(ThousandSep? MixThousand)
    / $(ThousandSep? OptThousand* MixThousand)
    / $(ThousandSep? OptThousand* ReqThousand* ReqDigit+)
    / $(ThousandSep? OptThousand+ OptDigit* ReqDigit+)
    / $(ThousandSep? OptThousand+ OptDigit+)
    / $(ThousandSep? OptDigit* ReqDigit+)
    / $(ThousandSep? OptDigit+ ReqDigit*)

MixThousand = OptDigit+ ReqDigit+ ThousandSep ReqThousand* ReqDigit+
OptThousand = o:OptDigit+ ThousandSep
ReqThousand = r:ReqDigit+ ThousandSep

Text 'Text'
    = String
    / !Special char:. { return char; }

String 'String'
    = '"' x:DoubleStringCharacter* '"' { return x.join(''); }
    / "'" x:SingleStringCharacter* "'" { return x.join(''); }

DoubleStringCharacter
    = !('"' / '\\') x:. { return x; }
    / '\\' x:Escape     { return x; }

SingleStringCharacter
    = !("'" / '\\') x:. { return x; }
    / '\\' x:Escape     { return x; }

Escape
    = "'"
    / '"'
    / '\\'

W 'Whitespace'
    = ' '

Special
    = OptDigit
    / ReqDigit
    / FractionSep
    / ThousandSep
    / MantissaSep
    / PatternSep

MantissaSep 'Mantissa Separator (E)'
    = 'E'
OptDigit 'Optional Digit (#)'
    = '#'
ReqDigit 'Required Digit (0)'
    = '0'
FractionSep 'Fraction Separator (.)'
    = '.'
ThousandSep 'Thousand Separator (,)'
    = ','
PatternSep 'Pattern Separator (;)'
    = ';'
