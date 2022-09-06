import { execWithIo, parse1, sanitize, sDeoptimize, sOptimize, stringify } from "./main.js"

const examples = [
  [`identity(TALLATLAS)`, `LTTALLATLAS`, `TALLATLAS`],
  ['self-interpreter running identity(TALLATLAS)', `A
self-interpreter:
ALATTLALLLATSLAAAATSASTLASTLLASSTLAATSTSSTSASTLASS
TLASSTLAASSTTASTTSASTLASTLASTATLLTSATLATLLSTATT

continuation:
LLT

input program:
LT

input for the program:
TALLATLAS`, `TALLATLAS`],
]



for (const [, input, expected] of examples) {
  const actual = execWithIo(sanitize(input))
  console.assert(actual === expected, '\nexpected', expected, '\nactual  ', actual)
}

// lastbButton.onclick = () => {
//   setTimeout(() => {
//     const inp = sanitize(inputArea.value)
//     const bininp = toBin(inp)
//     const binout = toBin(execWithIo(inp))
//     outputArea.innerHTML = `input as binary:<br/>${bininp}<br/>output as binary:<br/>${binout}`
//   }, 150)
// }

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
