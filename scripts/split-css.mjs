import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const stylesDir = path.join(__dirname, '..', 'src', 'styles')
const src = fs.readFileSync(path.join(stylesDir, 'global.css'), 'utf8')
const lines = src.split(/\r?\n/)

const isDebriefLine = (line) =>
  /\.debrief-|debrief-section|debrief-reference|debrief-overlay/.test(line)

/** Remove debrief rule blocks more reliably */
function stripDebrief(chunk) {
  const out = []
  let skipping = false
  let braceDepth = 0

  for (const line of chunk) {
    if (!skipping && isDebriefLine(line)) {
      skipping = true
      braceDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length
      if (braceDepth <= 0 && line.includes('}')) skipping = false
      continue
    }
    if (skipping) {
      braceDepth += (line.match(/{/g) || []).length
      braceDepth -= (line.match(/}/g) || []).length
      if (braceDepth <= 0) skipping = false
      continue
    }
    out.push(line)
  }
  return out
}

function write(name, content) {
  const text = content.join('\n').trimEnd() + '\n'
  fs.writeFileSync(path.join(stylesDir, name), text)
}

write('tokens.css', lines.slice(0, 127))
write('core.css', stripDebrief(lines.slice(127, 1720)))
write('workbench.css', lines.slice(1720, 4493))
write('features.css', lines.slice(4493))

write('global.css', [
  '/* Aggregator — split for maintainability; edit section files, not duplicate rules here */',
  "@import './tokens.css';",
  "@import './core.css';",
  "@import './debrief.css';",
  "@import './workbench.css';",
  "@import './features.css';",
  '',
])

console.log('Split complete:')
for (const f of [
  'tokens.css',
  'core.css',
  'debrief.css',
  'workbench.css',
  'features.css',
  'global.css',
]) {
  const n = fs.readFileSync(path.join(stylesDir, f), 'utf8').split(/\r?\n/).length
  console.log(`  ${f}: ${n} lines`)
}
