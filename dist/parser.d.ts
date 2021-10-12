declare module "@deloitte-digital-au/decimalformat/dist/parser" {
    export function parse(input: string): GrammarParsed;

    export interface GrammarParsed {
        positive : Pattern,
        negative : Pattern,
    }

    export interface Pattern {
        prefix : string, 
        suffix : string, 
        decimalSeparatorAlwaysShown : boolean,
        mantissa : boolean,
        groupingSize : number,
        minimumFractionDigits : number,
        maximumFractionDigits : number,
        minimumIntegerDigits : number,
        maximumIntegerDigits : number,
    }
}