import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import WebGLErrorBoundary from '../ui/WebGLErrorBoundary'
import {
  HERO_FONT,
  assemblyArcPoint,
  buildLetterPlan,
  dampRig,
  domCharToWorld,
  letterProgress,
  letterIntroProgress,
  lineAssemblyPhase,
  orbitPosition,
  repelFromPortrait,
  scatterPosition,
  smoothstep,
  targetPositions,
  wallPosition,
} from './aboutHeroLayout'

function RigSmoother({ rigRef }) {
  useFrame((_, delta) => {
    if (rigRef.current) dampRig(rigRef.current, delta)
  })
  return null
}

function CameraRig({ rigRef }) {
  const { camera } = useThree()
  const look = useRef(new THREE.Vector3(0, 0.08, 0))

  useFrame((_, delta) => {
    const rig = rigRef.current
    if (!rig) return

    const dt = Math.min(delta, 0.032)
    const k = 1 - Math.exp(-8 * dt)
    const scroll = rig.scroll
    const mx = rig.mouse.x
    const my = rig.mouse.y
    const assembly = smoothstep((scroll - 0.12) / 0.62)

    const targetY = THREE.MathUtils.lerp(-1.05, 0.42, smoothstep(scroll / 0.88)) + my * 0.18
    const targetZ = 8.35 - assembly * 1.55 - scroll * 0.35

    camera.position.x += (mx * 0.62 - camera.position.x) * k
    camera.position.y += (targetY - camera.position.y) * k
    camera.position.z += (targetZ - camera.position.z) * k

    if (camera.fov !== undefined) {
      const targetFov = 40 - assembly * 5.5
      camera.fov += (targetFov - camera.fov) * k
      camera.updateProjectionMatrix()
    }

    look.current.set(mx * 0.12, THREE.MathUtils.lerp(-0.78, 0.18, scroll), 0.08)
    camera.lookAt(look.current)
  })

  return null
}

function LetterGlyph({ item, targetsRef, rigRef, index }) {
  const ref = useRef()
  const ghostRef = useRef()
  const posSmooth = useRef(new THREE.Vector3())
  const ghostPos = useRef(new THREE.Vector3())
  const rotSmooth = useRef({ x: 0, y: 0, z: 0 })
  const scaleSmooth = useRef(1)
  const opacitySmooth = useRef(item.kind === 'decoy' ? 0.28 : 1)
  const ready = useRef(false)

  const wall = useMemo(
    () => (item.kind === 'column' || item.kind === 'decoy' ? wallPosition(item.side, item.strip, item.row) : null),
    [item],
  )
  const orbit = useMemo(
    () => (item.kind === 'orbit' ? orbitPosition(item.orbitIndex) : null),
    [item],
  )
  const scatter = useMemo(() => scatterPosition(index * 0.37 + item.charIndex), [index, item.charIndex])

  useFrame((_, delta) => {
    const mesh = ref.current
    const rig = rigRef.current
    if (!mesh || !rig) return

    const dt = Math.min(delta, 0.032)
    const moveK = 1 - Math.exp(-12 * dt)
    const rotK = 1 - Math.exp(-10 * dt)
    const opacityK = 1 - Math.exp(-14 * dt)

    const intro = THREE.MathUtils.clamp(rig.intro, 0, 1)
    const scroll = THREE.MathUtils.clamp(rig.scroll, 0, 1)
    const mx = rig.mouse.x
    const my = rig.mouse.y
    const ip = letterIntroProgress(intro, item, index)

    let goal = scatter.clone()
    let assemblyT = 0

    if (wall) {
      const fallY = 2.8 * (1 - ip)
      const fallZ = -2.2 * (1 - ip)
      const from = scatter.clone().add(new THREE.Vector3(0, fallY, fallZ))
      goal.copy(from).lerp(wall, easeIntro(ip))
      goal = repelFromPortrait(goal, scroll)
    } else if (orbit) {
      const from = scatter.clone().add(new THREE.Vector3(0, 2.8 * (1 - ip), -2.4 * (1 - ip)))
      goal.copy(from).lerp(orbit, easeIntro(ip))
      goal = repelFromPortrait(goal, scroll, 1.15, 0.5)
    }

    let goalScale = item.kind === 'decoy' ? 0.92 : 1
    let goalOpacity =
      item.kind === 'decoy' ? THREE.MathUtils.lerp(0, 0.22, ip) : THREE.MathUtils.lerp(0, 1, ip)
    let ghostOpacity = 0

    const target =
      item.kind !== 'decoy'
        ? targetsRef.current?.get(`${item.lineIndex}-${item.charIndex}`) ?? null
        : null

    if (target) {
      assemblyT = letterProgress(scroll, item.lineIndex, item.charIndex)
      const origin = wall ?? orbit ?? goal
      goal.copy(assemblyArcPoint(origin, target, assemblyT, item.lineIndex))

      const flightPeak = Math.sin(assemblyT * Math.PI)
      goalScale = 1 + flightPeak * 0.22
      goalOpacity = THREE.MathUtils.lerp(1, 0, smoothstep((assemblyT - 0.68) / 0.32))
      ghostOpacity = flightPeak * 0.34 * (1 - assemblyT)

      if (assemblyT > 0.04 && assemblyT < 0.92) {
        rotSmooth.current.z = (origin.x < 0 ? 1 : -1) * flightPeak * 0.42
      }
    } else if (item.kind === 'decoy') {
      goalOpacity = THREE.MathUtils.lerp(0.22, 0, smoothDecoyFade(scroll))
    }

    const dx = goal.x - mx * 2.8
    const dy = goal.y - my * 1.55
    const dist = Math.sqrt(dx * dx + dy * dy)
    const push = Math.max(0, 1.15 - dist) * 0.14 * (1 - scroll * 0.85) * (1 - assemblyT)
    if (dist > 0.001 && push > 0) {
      goal.x += (dx / dist) * push
      goal.y += (dy / dist) * push
      goal.z += push * 0.28
    }

    if (!ready.current) {
      posSmooth.current.copy(goal)
      ready.current = true
    } else {
      posSmooth.current.lerp(goal, moveK)
    }

    mesh.position.copy(posSmooth.current)
    mesh.scale.setScalar(scaleSmooth.current)

    ghostPos.current.lerp(posSmooth.current, 0.08)
    if (ghostRef.current) {
      ghostRef.current.position.copy(ghostPos.current)
      ghostRef.current.scale.setScalar(scaleSmooth.current * 1.08)
      if (ghostRef.current.material) {
        ghostRef.current.material.opacity = ghostOpacity * opacitySmooth.current
      }
    }

    const wallTilt = wall ? (item.side === 'left' ? 0.48 : -0.48) : 0
    const targetRotY = (wallTilt + mx * 0.14) * (1 - assemblyT)
    const targetRotX = (my * 0.1 - assemblyT * 0.08) * (1 - assemblyT)
    rotSmooth.current.y += (targetRotY - rotSmooth.current.y) * rotK
    rotSmooth.current.x += (targetRotX - rotSmooth.current.x) * rotK
    rotSmooth.current.z += (rotSmooth.current.z * (1 - assemblyT) - rotSmooth.current.z) * rotK * 0.5
    mesh.rotation.set(rotSmooth.current.x, rotSmooth.current.y, rotSmooth.current.z)

    scaleSmooth.current += (goalScale - scaleSmooth.current) * (1 - Math.exp(-16 * dt))
    opacitySmooth.current += (goalOpacity - opacitySmooth.current) * opacityK
    if (mesh.material) {
      mesh.material.transparent = true
      mesh.material.depthWrite = false
      mesh.material.opacity = opacitySmooth.current
    }
  })

  const inFlight = item.kind !== 'decoy'

  return (
    <group>
      {inFlight ? (
        <Text
          ref={ghostRef}
          font={HERO_FONT}
          fontSize={item.kind === 'decoy' ? 0.12 : 0.145}
          color="#ffffff"
          fillOpacity={1}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
          outlineWidth={0}
          material-transparent
        >
          {item.ch}
        </Text>
      ) : null}
      <Text
        ref={ref}
        font={HERO_FONT}
        fontSize={item.kind === 'decoy' ? 0.12 : 0.145}
        color={item.kind === 'decoy' ? '#8a9678' : '#c2cabb'}
        fillOpacity={1}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        outlineWidth={0}
      >
        {item.ch}
      </Text>
    </group>
  )
}

function easeIntro(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function smoothDecoyFade(scroll) {
  return THREE.MathUtils.clamp((scroll - 0.05) / 0.12, 0, 1)
}

function WatermarkTopology({ rigRef }) {
  const leftRef = useRef()
  const rightRef = useRef()
  const leftPos = useRef(new THREE.Vector3(-3.2, 1.45, 0))
  const rightPos = useRef(new THREE.Vector3(2.55, 0.85, 0))

  useFrame((_, delta) => {
    const rig = rigRef.current
    if (!rig) return
    const k = 1 - Math.exp(-7 * Math.min(delta, 0.032))
    const scroll = rig.scroll
    const mx = rig.mouse.x
    const my = rig.mouse.y
    const breathe = Math.sin(rig.time * 0.35) * 0.012

    leftPos.current.set(
      -2.2 + mx * 0.12 + breathe,
      THREE.MathUtils.lerp(0.4, 0.6, scroll) + my * 0.04,
      -0.1,
    )
    rightPos.current.set(
      1.8 + mx * 0.12 - breathe,
      THREE.MathUtils.lerp(0.2, 0.4, scroll) + my * 0.03,
      -0.1,
    )

    if (leftRef.current) {
      leftRef.current.position.lerp(leftPos.current, k)
      leftRef.current.rotation.y += (-mx * 0.07 - scroll * 0.04 - leftRef.current.rotation.y) * k
      leftRef.current.rotation.z = scroll * 0.018
      if (leftRef.current.material) {
        leftRef.current.material.opacity = 0.035 + rig.watermark * 0.04 - scroll * 0.015
      }
    }
    if (rightRef.current) {
      rightRef.current.position.lerp(rightPos.current, k)
      rightRef.current.rotation.y += (mx * 0.07 + scroll * 0.04 - rightRef.current.rotation.y) * k
      rightRef.current.rotation.z = -scroll * 0.015
      if (rightRef.current.material) {
        rightRef.current.material.opacity = 0.03 + rig.watermark * 0.035 - scroll * 0.012
      }
    }
  })

  return (
    <group position={[0, 0, -9.5]}>
      <Text
        ref={leftRef}
        font={HERO_FONT}
        fontSize={0.68}
        color="#c2cabb"
        fillOpacity={1}
        anchorX="left"
        anchorY="top"
        letterSpacing={-0.03}
        material-transparent
        outlineWidth={0}
      >
        FUNDAMENTALS
      </Text>
      <Text
        ref={rightRef}
        font={HERO_FONT}
        fontSize={0.52}
        color="#c2cabb"
        fillOpacity={1}
        anchorX="right"
        anchorY="top"
        letterSpacing={-0.02}
        material-transparent
        outlineWidth={0}
      >
        {'OF ARTIFICIAL\nINTELLIGENCE'}
      </Text>
    </group>
  )
}

function TargetSync({ copyRef, targetsRef, rigRef }) {
  const { camera, gl } = useThree()

  useFrame(() => {
    const copy = copyRef?.current
    const targets = targetsRef.current
    if (!copy || !targets) return

    const canvas = gl.domElement
    copy.querySelectorAll('.about-hero__char[data-line]').forEach((el) => {
      const lineIndex = Number(el.dataset.line)
      const charIndex = Number(el.dataset.char)
      if (Number.isNaN(lineIndex) || Number.isNaN(charIndex)) return

      const world = domCharToWorld(el, camera, canvas)
      if (world) targets.set(`${lineIndex}-${charIndex}`, world)
    })
  })

  return null
}

function CharRevealSync({ copyRef, rigRef }) {
  useFrame(() => {
    const copy = copyRef?.current
    const rig = rigRef?.current
    if (!copy || !rig) return

    copy.querySelectorAll('.about-hero__line').forEach((lineEl, lineIndex) => {
      const linePhase = lineAssemblyPhase(rig.scroll, lineIndex)
      lineEl.style.setProperty('--line-glow', String(linePhase * (1 - linePhase) * 4))
    })

    copy.querySelectorAll('.about-hero__char[data-line]').forEach((el) => {
      const lineIndex = Number(el.dataset.line)
      const charIndex = Number(el.dataset.char)
      if (Number.isNaN(lineIndex) || Number.isNaN(charIndex)) return

      const t = letterProgress(rig.scroll, lineIndex, charIndex)
      const opacity = smoothstep((t - 0.72) / 0.28)
      const lift = (1 - opacity) * 10
      const scale = 0.9 + opacity * 0.1

      el.style.opacity = String(opacity)
      el.style.transform = `translateY(${lift}px) scale(${scale})`
    })
  })

  return null
}

function LetterField({ lines, rigRef, copyRef }) {
  const plan = useMemo(() => buildLetterPlan(lines), [lines])
  const targetsRef = useRef(null)

  if (!targetsRef.current) {
    targetsRef.current = targetPositions(lines)
  }

  useEffect(() => {
    targetsRef.current = targetPositions(lines)
  }, [lines])

  return (
    <>
      <ambientLight intensity={0.36} />
      <pointLight position={[2.5, 3.5, 4.5]} intensity={0.9} color="#f4f7ef" />
      <pointLight position={[-3.5, -0.5, 2.5]} intensity={0.42} color="#8a9678" />
      <pointLight position={[0, -1.5, 3]} intensity={0.28} color="#c2cabb" />
      <fog attach="fog" args={['#000000', 6.5, 16]} />
      <TargetSync copyRef={copyRef} targetsRef={targetsRef} rigRef={rigRef} />
      <CharRevealSync copyRef={copyRef} rigRef={rigRef} />
      <WatermarkTopology rigRef={rigRef} />
      {plan.map((item, index) => (
        <LetterGlyph
          key={`${item.kind}-${index}-${item.ch}`}
          item={item}
          targetsRef={targetsRef}
          rigRef={rigRef}
          index={index}
        />
      ))}
    </>
  )
}

function Scene({ lines, rigRef, copyRef }) {
  const { clock } = useThree()

  useFrame(() => {
    if (rigRef.current) rigRef.current.time = clock.elapsedTime
  })

  return <LetterField lines={lines} rigRef={rigRef} copyRef={copyRef} />
}

function AboutLetterCanvas({ lines, rigRef, copyRef, reducedMotion = false }) {
  if (reducedMotion) return null

  return (
    <WebGLErrorBoundary fallback={null}>
      <Canvas
        className="about-hero__canvas"
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        camera={{ position: [0, -1.05, 8.35], fov: 40, near: 0.1, far: 40 }}
      >
        <Suspense fallback={null}>
          <RigSmoother rigRef={rigRef} />
          <Scene lines={lines} rigRef={rigRef} copyRef={copyRef} />
          <CameraRig rigRef={rigRef} />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  )
}

export default AboutLetterCanvas
