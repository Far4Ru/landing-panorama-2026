export function wrapIndex(position: number, count: number) {
  return ((position % count) + count) % count
}

export function nearestPosition(position: number, target: number, count: number) {
  let delta = wrapIndex(target - wrapIndex(position, count), count)
  if (delta > count / 2) delta -= count
  return position + delta
}
