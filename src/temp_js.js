#!/usr/bin/env node

import * as fs from "node:fs/promises"
import stringify from "graph-stringify"
import { compile } from "./compiler.js"

const help = `TEMP_JS compiler

Syntax: temp_js <filename> <outputType>

Prints to stdout according to <outputType>, which must be one of:

  parsed     a message that the program was matched ok by the grammar
  analyzed   the statically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
`

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    const { result, diagnostics } = compile(buffer.toString(), outputType)
    if (diagnostics.length > 0) {
      for (const diag of diagnostics) {
        console.error(`\u001b[31m${diag.message}\u001b[39m`)
      }
      process.exitCode = 1
      return
    }
    console.log(stringify(result, "type") || result)
  } catch (e) {
    console.error(`\u001b[31m${e}\u001b[39m`)
    process.exitCode = 1
  }
}

if (process.argv.length === 4) {
  await compileFromFile(process.argv[2], process.argv[3])
} else {
  console.log(help)
  process.exitCode = 2
}