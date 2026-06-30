import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const stylesDir = path.join(__dirname, '..', 'src', 'styles')
const lines = fs.readFileSync(path.join(stylesDir, 'workbench.css'), 'utf8').split(/\r?\n/)

/** @param {number} start 1-based inclusive @param {number} end 1-based inclusive */
function slice(start, end) {
  return lines.slice(start - 1, end)
}

function write(name, chunks) {
  const text = chunks.flat().join('\n').trimEnd() + '\n'
  fs.writeFileSync(path.join(stylesDir, name), text)
}

// Skip debrief duplicates already in debrief.css (lines 887–962)
const chunks = {
  'workbench-shell.css': [slice(1, 228)],
  'project-map.css': [
    ['/* ===== Project timelines & home projects ===== */'],
    slice(229, 469),
    slice(717, 735),
  ],
  'context-panel.css': [slice(470, 607)],
  'sim-workspace.css': [
    ['/* ===== Simulators workspace (forms, feed, previews) ===== */'],
    slice(608, 716),
    slice(1510, 1965),
    slice(2285, 2604),
  ],
  'handbook.css': [slice(964, 1269)],
  'side-hub.css': [slice(1271, 1453)],
  'app-mocks.css': [
    ['/* ===== In-level app mocks (login, pay, order, on-call) ===== */'],
    slice(1966, 2284),
    slice(2386, lines.length),
  ],
}

for (const [file, content] of Object.entries(chunks)) {
  write(file, content)
}

write('workbench.css', [
  '/* Aggregator — edit section files below */',
  "@import './workbench-shell.css';",
  "@import './project-map.css';",
  "@import './context-panel.css';",
  "@import './sim-workspace.css';",
  "@import './handbook.css';",
  "@import './side-hub.css';",
  "@import './app-mocks.css';",
  '',
])

console.log('workbench.css split complete:')
for (const f of ['workbench.css', ...Object.keys(chunks)]) {
  const n = fs.readFileSync(path.join(stylesDir, f), 'utf8').split(/\r?\n/).length
  console.log(`  ${f}: ${n} lines`)
}
