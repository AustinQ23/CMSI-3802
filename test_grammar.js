import fs from 'fs';
import * as ohm from 'ohm-js';

// Run this in the console with:
// node test_grammar.js

const grammarText = fs.readFileSync('src/TEMP_JS.ohm', 'utf-8');

const TEMP_JSGrammar = ohm.grammar(grammarText);

const sampleCode = `
fn check_even(num: int) -> bool {
    if num % 2 == 0 {
        return true;
    } else {
        return false;
    }
}
`;

const match = TEMP_JSGrammar.match(sampleCode);

if (match.succeeded()) {
    console.log("Parsing successful");
} else {
    console.error("Parsing failed:\n");
    console.error(match.message); 
}