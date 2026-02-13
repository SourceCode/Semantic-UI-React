import { build } from 'esbuild'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outdir = path.resolve(__dirname, 'dist')

const fixtures = readdirSync(path.resolve(__dirname, 'fixtures'))
  .filter((f) => f.endsWith('.size.js'))
  .map((f) => `fixtures/${f}`)

console.log('Building bundle-size fixtures with esbuild...')
console.log(fixtures.map((f) => `  - ${f}`).join('\n'))

for (const fixture of fixtures) {
  const entry = path.resolve(__dirname, fixture)

  await build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    outdir,
    format: 'esm',
    platform: 'browser',
    external: ['react', 'react-dom'],
    alias: {
      'semantic-ui-react': path.resolve(__dirname, '..', 'dist', 'es', 'index.js'),
    },
  })

  console.log(`  Done: ${fixture}`)
}

console.log('All fixtures built successfully.')
