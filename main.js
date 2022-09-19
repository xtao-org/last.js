//
// LAST parse, stringify, sanitize
//

export const parse = (str) => {
  if (str.length === 0) throw Error('error while parsing an empty string')
  const first = str[0]
  const rest = str.slice(1)
  if (first === 'T') return [['T', []], rest]
  if (first === 'S' || first === 'L') {
    const [bo, r] = parse(rest)
    return [[first, bo], r]
  }
  // if (first === 'A') {}
  const [fne, r] = parse(rest)
  const [arge, r2] = parse(r)
  return [[first, [fne, arge]], r2]
}

export const parse1 = (str) => parse(str)[0]
export const sanitize = str => [...str].filter(c => 'LAST'.includes(c)).join('')

export const stringify = (exp) => {
  const [first, second] = exp

  if (first === 'L') {
    return first + stringify(second)
  }
  else if (first === 'A') {
    const [a, b] = second
    return first + stringify(a) + stringify(b)
  }
  else if (first === 'S') {
    return first + stringify(second)
  }
  else if (first === 'T') {
    return first
  }
}

//
// LAST machine
//

const exec = (exp, args = [], env = []) => {
  while (true) {
    const first = exp[0]
    const second = exp[1]
    if (first === 'T') {
      if (env.length === 0) throw Error('environment empty');
      [exp, env] = env[0]
    }
    else if (first === 'S') {
      if (env.length === 0) throw Error('environment empty');
      exp = second
      env = env[1]
    }
    else if (first === 'L') {
      if (args.length === 0) return [exp, env]
      env = [args[0], env]
      args = args[1]
      exp = second
    }
    else if (first === 'A') {
      exp = second[0]
      args = [[second[1], env], args]
    } else throw Error('exp' + exp)
  }
}

//
// LAST I/O
//

const tofn = (c) => {
  if (c === 'L') return 'LLLLSSST'
  if (c === 'A') return 'LLLLSST'
  if (c === 'S') return 'LLLLST'
  if (c === 'T') return 'LLLLT'
  throw Error('boom')
}

const tolist = (str) => {
  let ret = ''
  for (const c of str) {
    ret += 'LAAT' + tofn(c)
  }
  return ret + 'LLT'
}

const prepareOutput = (retexp, retenv) => {
  let ret = ''

  let expStr = stringify(retexp)
  let env = retenv
  while (expStr !== 'LLT') {
    const selectFirst = 'A' + expStr + 'LLST'
    const selectSecond = 'A' + expStr + 'LLT'

    const [firstExp, firstEnv] = exec(parse1(selectFirst), [], env)

    const firstStr = stringify(firstExp)

    if (firstStr === 'LLLLT') ret += 'T'
    else if (firstStr === 'LLLLST') ret += 'S'
    else if (firstStr === 'LLLLSST') ret += 'A'
    else if (firstStr === 'LLLLSSST') ret += 'L'
    else {
      console.error(firstStr, firstEnv)
      throw Error('oops' + firstStr)
    }

    const [secondExp, secondEnv] = exec(parse1(selectSecond), [], env)
    expStr = stringify(secondExp)
    env = secondEnv
  }

  return ret
}

export const execWithIo = (str) => {
  const [exp, rest] = parse(str)

  const list = parse(tolist(rest))[0]

  const args = [[list, []], []]

  const [retexp, retenv] = exec(exp, args, [])

  return prepareOutput(retexp, retenv)
}

//
// S-optimize
//

const getPrefix = (exp, n = 0) => {
  const [first, second] = exp

  if (first === 'L' || first === 'A' || first === 'T') {
    return n
  }
  else if (first === 'S') {
    return getPrefix(second, n + 1)
  }
  throw Error('boom')
}

const getRefs = (exp, l = 0, s = 0) => {
  const [first, second] = exp

  if (first === 'L') {
    return getRefs(second, l + 1, s)
  }
  else if (first === 'A') {
    const [a, b] = second

    const ma = getRefs(a, l, s)
    const mb = getRefs(b, l, s)

    return [...ma, ...mb]
  }
  else if (first === 'S') {
    return getRefs(second, l, s + 1)
  }
  else if (first === 'T') {
    if (s >= l) return [s - l]
    return []
  }
  throw Error('boom')
}

const unwrap = (exp, n, l = 0, s = 0) => {
  if (n === 0) return exp

  const [first, second] = exp

  if (first === 'L') {
    return [first, unwrap(second, n, l + 1, s)]
  }
  else if (first === 'A') {
    const [a, b] = second
    return [first, [unwrap(a, n, l, s), unwrap(b, n, l, s)]]
  }
  else if (first === 'S') {
    if (s >= l) return unwrap(second, n - 1, l, s + 1)
    return [first, unwrap(second, n, l, s + 1)]
  }
  else if (first === 'T') {
    return exp
  }
  throw Error('boom')
}

const prefixOptimize = exp => {
  const refs = getRefs(exp)
  if (refs.length === 0 || refs.includes(0)) return sOptimize(exp)
  const pre = Math.min(...refs)
  return wrap(sOptimize(unwrap(exp, pre)), pre)
}

export const sOptimize = exp => {
  const [first, second] = exp

  if (first === 'L') {
    const refs = getRefs(second)
    if (refs.length === 0 || refs.includes(0)) return [first, sOptimize(second)]

    return [first, (wrap(sOptimize(unwrap(second, 1)), 1))]
  }
  else if (first === 'A') {
    const [a, b] = second

    const xa = prefixOptimize(a)
    const xb = prefixOptimize(b)

    const pa = getPrefix(xa)
    const pb = getPrefix(xb)

    const pre = Math.min(pa, pb)

    return wrap([first, [unwrap(xa, pre), unwrap(xb, pre)]], pre)
  }
  else if (first === 'S') {
    return [first, sOptimize(second)]
  }
  else if (first === 'T') {
    return exp
  }
  throw Error('boom')
}

const wrap = (exp, n) => {
  if (n === 0) return exp
  return ['S', wrap(exp, n - 1)]
}

const splitPrefix = (exp, n = 0) => {
  const [first, second] = exp

  if (first === 'L' || first === 'A' || first === 'T') {
    return [n, exp]
  }
  else if (first === 'S') {
    return splitPrefix(second, n + 1)
  }
  throw Error('boom')
}

const rewrap = (exp, n, l = 0, s = 0) => {
  if (n === 0) return exp

  const [first, second] = exp

  if (first === 'L') {
    return [first, rewrap(second, n, l + 1, s)]
  }
  else if (first === 'A') {
    const [a, b] = second
    return [first, [rewrap(a, n, l, s), rewrap(b, n, l, s)]]
  }
  else if (first === 'S') {
    return [first, rewrap(second, n, l, s + 1)]
  }
  else if (first === 'T') {
    if (s > l) return wrap(exp, n)
    return exp
  }
  throw Error('boom')
}

export const sDeoptimize = (exp) => {
  const [pre, rest] = splitPrefix(exp)

  const [first, second] = rest

  if (first === 'L') {
    return [first, rewrap(sDeoptimize(second), pre)]
  }
  else if (first === 'A') {
    const [a, b] = second

    return [first, [sDeoptimize(wrap(a, pre)), sDeoptimize(wrap(b, pre))]]
  }
  // else if (first === 'S') {
  //   return getRefs(second, l, s + 1)
  // }
  else if (first === 'T') {
    return exp
  }
  throw Error('boom')
}

//
// LAST-B
//

export const toBin = str => {
  let ret = ''

  for (const c of str) {
    if (c === 'L') ret += '00'
    else if (c === 'A') ret += '01'
    else if (c === 'S') ret += '10'
    else if (c === 'T') ret += '11'
  }

  return ret
}