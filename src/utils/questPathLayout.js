/** 蛇形（S 型）关卡路径：偶数行左→右，奇数行右→左 */
export function getSerpentineLayout(nodes, cols) {
  const count = Math.max(1, cols)
  const total = nodes.length

  return nodes.map((node, index) => {
    const row = Math.floor(index / count)
    const posInRow = index % count
    const col = row % 2 === 0 ? posInRow : count - 1 - posInRow
    const connector = getConnector(index, total, count)

    return {
      ...node,
      index,
      row,
      col,
      connector,
      gridRow: row + 1,
      gridColumn: col + 1,
      isLast: index === total - 1,
    }
  })
}

function getConnector(index, total, cols) {
  if (index >= total - 1) return 'none'
  const row = Math.floor(index / cols)
  const posInRow = index % cols
  const isEndOfRow = posInRow === cols - 1
  if (isEndOfRow) return 'down'
  return row % 2 === 0 ? 'right' : 'left'
}

export function getSerpentineRowCount(nodeCount, cols) {
  return Math.ceil(nodeCount / Math.max(1, cols)) || 1
}
