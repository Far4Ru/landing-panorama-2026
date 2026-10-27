import test from 'node:test'
import assert from 'node:assert/strict'
import { createOrbitalRenderer } from '../src/orbitalRenderer.ts'

export function recordingContext(record = false) {
  const counts = { strokes: 0, segments: 0, gradients: 0, clears: 0 }
  const segments = []
  let from = [0, 0]
  return {
    counts,
    segments,
    createRadialGradient() {
      counts.gradients++
      return { addColorStop() {} }
    },
    clearRect() { counts.clears++ },
    fillRect() {},
    setTransform() {},
    beginPath() {},
    moveTo(x, y) { if (record) from = [x, y] },
    lineTo(x, y) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y))
      counts.segments++
      if (record) segments.push([...from, x, y])
    },
    stroke() { counts.strokes++ },
    arc() {},
    fill() {},
  }
}

test('all 2640 line segments are retained with only eight stroke submissions', () => {
  for (const angle of [0, -51.428571, 360, -1080, 173]) {
    const context = recordingContext()
    createOrbitalRenderer(context).draw(800, angle)
    assert.equal(context.counts.segments, 2640)
    assert.equal(context.counts.strokes, 8)
  }
})

test('idle frames do no work, rotation reuses gradient, resize rebuilds it', () => {
  const context = recordingContext()
  const renderer = createOrbitalRenderer(context)
  renderer.draw(800, 0)
  for (let index = 0; index < 120; index++) renderer.draw(800, 0)
  assert.equal(context.counts.clears, 1)
  renderer.draw(800, -50)
  assert.equal(context.counts.gradients, 1)
  renderer.draw(400, -50)
  assert.equal(context.counts.gradients, 2)
  renderer.invalidate()
  renderer.draw(400, -50)
  assert.equal(context.counts.clears, 4)
  assert.equal(context.counts.gradients, 2)
})

test('a full revolution preserves projected geometry', () => {
  const first = recordingContext(true)
  const last = recordingContext(true)
  createOrbitalRenderer(first).draw(800, 17)
  createOrbitalRenderer(last).draw(800, 377)
  assert.equal(first.segments.length, last.segments.length)
  first.segments.forEach((segment, index) => {
    segment.forEach((value, coordinate) => {
      assert.ok(Math.abs(value - last.segments[index][coordinate]) < 1e-9)
    })
  })
})
