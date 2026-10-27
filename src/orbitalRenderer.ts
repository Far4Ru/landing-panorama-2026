type Point = [number, number, number]
type Line = { source: Point[]; projected: Float64Array }

function line(source: Point[]): Line {
  return { source, projected: new Float64Array(source.length * 3) }
}

/** Geometry and projection buffers are allocated once per mounted scene. */
export function createOrbitalRenderer(context: CanvasRenderingContext2D) {
  const grid: Line[] = []
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const phi = latitude * Math.PI / 180
    grid.push(line(Array.from({ length: 97 }, (_, index) => {
      const theta = index / 96 * Math.PI * 2
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)]
    })))
  }
  for (let longitude = 0; longitude < 360; longitude += 20) {
    const theta = longitude * Math.PI / 180
    grid.push(line(Array.from({ length: 65 }, (_, index) => {
      const phi = (index / 64 - .5) * Math.PI
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)]
    })))
  }
  const orbits = [-.32, .58, 1.12].map((inclination, orbit) => {
    const radius = 1.32 + orbit * .13
    return line(Array.from({ length: 145 }, (_, index) => {
      const angle = index / 144 * Math.PI * 2
      return [Math.cos(angle) * radius, Math.sin(angle) * Math.sin(inclination) * radius, Math.sin(angle) * Math.cos(inclination) * radius]
    }))
  })
  const landmarks = line(Array.from({ length: 54 }, (_, index) => {
    const phi = Math.asin(1 - 2 * (index + .5) / 54)
    const theta = index * 2.399963
    return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)]
  }))
  const tiltSin = Math.sin(-.22)
  const tiltCos = Math.cos(-.22)
  let halo: CanvasGradient
  let lastSize = 0
  let lastAngle = Number.NaN

  function projectLine(target: Line, size: number, sin: number, cos: number) {
    const scale = size * .285
    const center = size / 2
    for (let index = 0; index < target.source.length; index++) {
      const [x, y, z] = target.source[index]
      const turnedX = x * cos + z * sin
      const turnedZ = z * cos - x * sin
      const turnedY = y * tiltCos - turnedZ * tiltSin
      const depth = y * tiltSin + turnedZ * tiltCos
      const perspective = 4.8 / (4.8 - depth)
      const offset = index * 3
      target.projected[offset] = center + turnedX * scale * perspective
      target.projected[offset + 1] = center + turnedY * scale * perspective
      target.projected[offset + 2] = depth
    }
  }

  function appendSegments(target: Line, front: boolean, averageDepth: boolean) {
    const points = target.projected
    for (let index = 3; index < points.length; index += 3) {
      const depth = averageDepth ? (points[index + 2] + points[index - 1]) / 2 : points[index + 2]
      if ((depth > 0) !== front) continue
      context.moveTo(points[index - 3], points[index - 2])
      context.lineTo(points[index], points[index + 1])
    }
  }

  return {
    invalidate() {
      lastAngle = Number.NaN
    },
    draw(size: number, degrees: number) {
      if (size <= 0 || (size === lastSize && degrees === lastAngle)) return
      if (size !== lastSize) {
        halo = context.createRadialGradient(size * .46, size * .44, 0, size / 2, size / 2, size * .42)
        halo.addColorStop(0, 'rgba(24, 164, 218, .12)')
        halo.addColorStop(.65, 'rgba(17, 112, 196, .07)')
        halo.addColorStop(1, 'rgba(0, 50, 90, 0)')
      }
      lastSize = size
      lastAngle = degrees
      const angle = degrees * Math.PI / 180 + .35
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)
      context.clearRect(0, 0, size, size)
      context.fillStyle = halo
      context.fillRect(0, 0, size, size)

      for (const target of grid) projectLine(target, size, sin, cos)
      for (const front of [false, true]) {
        context.strokeStyle = front ? 'rgba(92, 220, 248, .42)' : 'rgba(61, 138, 182, .12)'
        context.lineWidth = front ? .8 : .6
        context.beginPath()
        for (const target of grid) appendSegments(target, front, true)
        context.stroke()
      }

      projectLine(landmarks, size, sin, cos)
      for (let index = 0; index < landmarks.source.length; index++) {
        const offset = index * 3
        if (landmarks.projected[offset + 2] < 0) continue
        context.beginPath()
        context.arc(landmarks.projected[offset], landmarks.projected[offset + 1], index % 9 === 0 ? 2.5 : 1, 0, Math.PI * 2)
        context.fillStyle = index % 9 === 0 ? '#c4f5ff' : 'rgba(108, 223, 255, .55)'
        context.shadowColor = '#38ceff'
        context.shadowBlur = index % 9 === 0 ? 12 : 0
        context.fill()
        context.shadowBlur = 0
      }

      orbits.forEach((target, orbit) => {
        projectLine(target, size, sin, cos)
        for (const front of [false, true]) {
          context.strokeStyle = front ? 'rgba(98, 223, 255, .42)' : 'rgba(71, 150, 205, .13)'
          context.lineWidth = orbit === 0 ? 1.1 : .65
          context.beginPath()
          appendSegments(target, front, false)
          context.stroke()
        }
        const offset = ((orbit * 43 + 22) % 144) * 3
        context.beginPath()
        context.arc(target.projected[offset], target.projected[offset + 1], 2.4, 0, Math.PI * 2)
        context.fillStyle = '#b8f5ff'
        context.shadowColor = '#38ceff'
        context.shadowBlur = 14
        context.fill()
        context.shadowBlur = 0
      })
    },
  }
}
