import { execWithIo, parse1, sanitize, sDeoptimize, sOptimize, stringify } from "./main.js"

const examples = [
  [`identity(TALLATLAS)`, `LTTALLATLAS`, `TALLATLAS`],
  ['self-interpreter running identity(TALLATLAS)', `A
self-interpreter:
ALATTLALLLATSLAAAATSASTLASTLLASSTLAATSTSSTSASTLASS
TLASSTLAASSTTASTTSASTLASTLASTATLLTSATLATLLSTATT

continuation*:
LAT ALATTLATT

input program:
LT

input for the program:
TALLATLAS

* note: the continuation starts the input program, 
providing it with the initial environment;
here we provide an infinite loop as the initial environment;
this is so that if the input program ever tries to reference a free variable,
the self-interpreter will loop forever and crash the browser tab;
this is a crude way of indicating an error
`, `TALLATLAS`],
]

for (const [, input, expected] of examples) {
  const actual = execWithIo(sanitize(input))
  console.assert(actual === expected, '\nexpected', expected, '\nactual  ', actual)
}

const cases = [
  [`LLLASSTT`, `LLSLASTT`],
  // [`LLLASSTT`, `LLSLASTT`],
  [`ALATTLALLLATLAAAATASSSTLASSSTLLASSTLAATSTSSTASSSTLASSSSTLASSSSTLAASSTTASTTASSSTLASSSTLASTATLLTASSTLATLLSTATT`, `ALATTLALLLATSLAAAATSASTLASTLLASSTLAATSTSSTSASTLASSTLASSTLAASSTTASTTSASTLASTLASTATLLTSATLATLLSTATT`],
  [`LLLAAASSTSSTSSTSST`, `LLSLSAAATTTT`],
  [`LLASTST`, `LLSATT`],
  [`LLLAASSTTLT`, `LLSLAASTTLT`],
  [`LLASTLT`, `LLSATLT`],
  [`LLLLASSSTSSST`, `LLSLSLSATT`],
  // [`AALATTLLLAAATLLLLASSTLAASSSSTASSTLAASTASSTLLASSTLAATSTSSTASSSTLASSSTLAASSTTASTTAATASTLATSTLAASSSTLASSSTLASTATSSSTSSSSTASSTSSTSTLATALATTLATT`, `T`],
  // [`ALATTLALLLATLLALAASSSSSTLAASTASSSSSTLLASSTTSTASSSSSSTLASSSSSSTLAASSTTASTTAATASSSSTLATSTLAASSSSSSTLASSSSSSTLASTATSSSTSSTATT`, `T`],
  [`LLALSSTST`, `LLSALSTT`],
  [`LLALSSTLSST`, `LLSALSTLST`],
  [`LATLSST`, `LATSLST`],
  // [`LLATLASSTSST`, `LLATSLASTST`],
]

for (const [input, expected] of cases) {
  const actual = stringify(sOptimize(parse1(input)))
  console.assert(actual === expected, '\nexpected', expected, '\nactual  ', actual)
}

for (const [expected, input] of cases) {
  const actual = stringify(sDeoptimize(parse1(input)))
  console.assert(actual === expected, '\nexpected', expected, '\nactual  ', actual)
}


const makeOutput = `L A A LALASTATTLASTATT LL AA T L LAAT LLLLT A SSST ST LLT A LLLASTSST LLT`

console.assert(execWithIo(sanitize(makeOutput)) === 'T')