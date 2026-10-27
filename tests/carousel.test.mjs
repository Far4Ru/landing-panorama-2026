import test from 'node:test'
import assert from 'node:assert/strict'
import { nearestPosition, wrapIndex } from '../src/carousel.ts'

test('both seam crossings keep moving by one panel, across repeated laps', () => {
  const count = 7
  for (let position = -28; position <= 28; position++) {
    const current = wrapIndex(position, count)
    const previous = wrapIndex(current - 1, count)
    const next = wrapIndex(current + 1, count)
    assert.equal(nearestPosition(position, previous, count), position - 1)
    assert.equal(nearestPosition(position, next, count), position + 1)
    assert.equal(nearestPosition(position, current, count), position)
  }
})

test('home starts between contacts and the first section', () => {
  assert.deepEqual([-1, 0, 1].map((offset) => wrapIndex(offset, 7)), [6, 0, 1])
})

test('direct navigation chooses a shortest path and preserves the selected section', () => {
  for (let position = -21; position <= 21; position++) {
    for (let target = 0; target < 7; target++) {
      const result = nearestPosition(position, target, 7)
      assert.equal(wrapIndex(result, 7), target)
      assert.ok(Math.abs(result - position) <= 3)
    }
  }
})

test('first and last panels meet on a closed ring', () => {
  const count = 7
  const angle = 2 * Math.PI / count
  const width = 1280
  const radius = width / (2 * Math.tan(angle / 2))
  const last = (count - 1) * angle
  const lastRightX = width / 2 * Math.cos(last) + radius * Math.sin(last)
  const lastRightZ = -width / 2 * Math.sin(last) + radius * Math.cos(last)
  assert.ok(Math.abs(lastRightX + width / 2) < 1e-9)
  assert.ok(Math.abs(lastRightZ - radius) < 1e-9)
})
