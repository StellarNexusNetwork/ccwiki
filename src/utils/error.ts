function parseStack(stack) {
  if (!stack) return []

  return stack
    .split('\n')
    .slice(1)
    .map(line => {
      const m = line.match(/\s*at (.+?) \((.+?):(\d+):(\d+)\)/)
      if (!m) return {raw: line.trim()}

      return {
        fn: m[1],
        file: m[2],
        line: Number(m[3]),
        col: Number(m[4])
      }
    })
}

export function printErrorTree(err) {
  let level = 0

  while (err) {
    const indent = '  '.repeat(level)

    console.error(`${indent}✖ ${err.message}`)

    const frames = parseStack(err.stack)
    if (frames[0]) {
      const f = frames[0]
      console.error(
        `${indent}  ↳ at ${f.fn} (${f.file}:${f.line}:${f.col})`
      )
    }

    err = err.cause
    level++
  }
}

