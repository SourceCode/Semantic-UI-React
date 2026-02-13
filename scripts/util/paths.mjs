import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const base = (...args) => path.resolve(__dirname, '..', '..', ...args)

export const paths = {
  base,
  src: base.bind(null, 'src'),
  dist: base.bind(null, 'dist'),
  docsDist: base.bind(null, 'docs', 'dist'),
  docsPublic: base.bind(null, 'docs', 'public'),
  docsSrc: base.bind(null, 'docs', 'src'),
}
