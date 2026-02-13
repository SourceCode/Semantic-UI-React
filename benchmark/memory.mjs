import React from 'react'
import { renderToString } from 'react-dom/server'

async function run() {
  let SUI
  try {
    SUI = await import('../dist/es/index.js')
  } catch (e) {
    console.log('dist/es/index.js not found. Run yarn build:dist first.')
    process.exit(0)
  }

  console.log('Memory Benchmark')
  console.log('=================')

  const iterations = 1000

  // Force GC if available
  const gc = globalThis.gc || (() => {})

  gc()
  const before = process.memoryUsage()

  for (let i = 0; i < iterations; i++) {
    renderToString(
      React.createElement(
        SUI.Container,
        null,
        React.createElement(SUI.Header, null, 'Test'),
        React.createElement(SUI.Button, { primary: true }, 'Click'),
        React.createElement(SUI.Input, { placeholder: 'Type...' }),
        React.createElement(SUI.Dropdown, {
          options: [{ key: 1, text: 'A', value: 1 }],
        }),
      ),
    )
  }

  gc()
  const after = process.memoryUsage()

  const heapDiff = after.heapUsed - before.heapUsed
  console.log(`Heap before: ${(before.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Heap after:  ${(after.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Heap diff:   ${(heapDiff / 1024 / 1024).toFixed(2)} MB over ${iterations} iterations`)
  console.log(`Per render:  ${(heapDiff / iterations / 1024).toFixed(2)} KB`)
}

run().catch(console.error)
