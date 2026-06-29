/** 按节点顺序连接圆心，生成 S 形折线路径 */
export function buildNodePath(points) {
  if (!points?.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

export function getPathLength(points) {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    len += Math.hypot(dx, dy)
  }
  return len
}

/** 已完成段占比：最后一个 completed 节点之后的比例 */
export function getProgressRatio(nodes) {
  if (!nodes.length) return 0
  let lastDone = -1
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].status === 'completed') lastDone = i
    else if (nodes[i].status === 'available') break
  }
  if (lastDone < 0) return 0
  if (lastDone >= nodes.length - 1) return 1
  return (lastDone + 0.55) / (nodes.length - 1)
}
