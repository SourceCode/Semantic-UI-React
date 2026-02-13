import { renderToString } from 'react-dom/server'
import React from 'react'

// Note: This benchmark requires the dist/es build to exist.
// Run `yarn build:dist` first.

async function run() {
  let SUI
  try {
    SUI = await import('../dist/es/index.js')
  } catch (e) {
    console.log('dist/es/index.js not found. Run yarn build:dist first.')
    console.log('Skipping benchmark.')
    process.exit(0)
  }

  const components = {
    Button: () => React.createElement(SUI.Button, { primary: true }, 'Click'),
    Dropdown: () =>
      React.createElement(SUI.Dropdown, {
        options: Array.from({ length: 100 }, (_, i) => ({
          key: i,
          text: `Option ${i}`,
          value: i,
        })),
        placeholder: 'Select',
      }),
    Table: () =>
      React.createElement(
        SUI.Table,
        null,
        React.createElement(
          SUI.Table.Body,
          null,
          Array.from({ length: 100 }, (_, i) =>
            React.createElement(
              SUI.Table.Row,
              { key: i },
              React.createElement(SUI.Table.Cell, null, `Cell ${i}`),
            ),
          ),
        ),
      ),
    Form: () =>
      React.createElement(
        SUI.Form,
        null,
        Array.from({ length: 20 }, (_, i) =>
          React.createElement(SUI.Form.Input, { key: i, label: `Field ${i}` }),
        ),
      ),
  }

  console.log('Mount Time Benchmark (renderToString)')
  console.log('======================================')

  for (const [name, factory] of Object.entries(components)) {
    const iterations = 1000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      renderToString(factory())
    }

    const elapsed = performance.now() - start
    console.log(
      `${name}: ${(elapsed / iterations).toFixed(3)}ms avg (${iterations} iterations, ${elapsed.toFixed(0)}ms total)`,
    )
  }
}

run().catch(console.error)
