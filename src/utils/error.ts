type StackFrame =
  | {
      fn: string
      file: string
      line: number
      col: number
    }
  | {
      raw: string
    }

function parseStack(stack?: string): StackFrame[] {
  if (!stack) return []

  return stack
    .split('\n')
    .slice(1)
    .map((line: string) => {
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

function isErrorWithCause(err: unknown): err is Error & { cause?: unknown } {
  return err instanceof Error
}

export function printErrorTree(err: unknown): void {
  let level = 0

  while (isErrorWithCause(err)) {
    const indent = '  '.repeat(level)

    console.error(`${indent}✖ ${err.message}`)

    const frames = parseStack(err.stack)
    if (frames[0]) {
      const f = frames[0]
      if ('raw' in f) {
        console.error(`${indent}  ↳ ${f.raw}`)
      } else {
        console.error(
          `${indent}  ↳ at ${f.fn} (${f.file}:${f.line}:${f.col})`
        )
      }
    }

    err = err.cause
    level++
  }
}
