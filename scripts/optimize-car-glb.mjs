/**
 * Downsample embedded GLB textures with sharp (custom path — avoids
 * gltf-transform's broken Vips colourspace on this Windows install),
 * then mesh-optimize + Draco.
 *
 * Usage: node scripts/optimize-car-glb.mjs
 */
import { readdir, mkdir, copyFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import {
  dedup,
  flatten,
  join,
  prune,
  resample,
  simplify,
  weld,
  draco,
} from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'
import draco3d from 'draco3dgltf'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CARS_DIR = path.resolve(__dirname, '../public/models/cars')
const ORIG_DIR = path.join(CARS_DIR, 'originals')
const MAX_TEX = 1024
const JPEG_Q = 74

const TARGETS = [
  'toyota-supra.glb',
  'ferrari-sf90-stradale.glb',
  'porsche-918-spyder.glb',
  'lamborghini-aventador.glb',
  'bmw-m4-f82-razor.glb',
  'aston-martin-valour.glb',
  'bugatti-la-voiture-noire.glb',
]

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

async function downsampleTextures(document) {
  const textures = document.getRoot().listTextures()
  for (const texture of textures) {
    const image = texture.getImage()
    if (!image) continue
    try {
      const buf = Buffer.from(image)
      const meta = await sharp(buf).metadata()
      const w = meta.width || MAX_TEX
      const h = meta.height || MAX_TEX
      if (w <= MAX_TEX && h <= MAX_TEX && meta.format === 'jpeg') continue

      const out = await sharp(buf)
        .rotate()
        .resize({
          width: MAX_TEX,
          height: MAX_TEX,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_Q, mozjpeg: true })
        .toBuffer()

      texture.setImage(out)
      texture.setMimeType('image/jpeg')
    } catch (err) {
      console.warn(`  texture skip: ${err.message}`)
    }
  }
}

async function optimizeOne(name) {
  const src = path.join(CARS_DIR, name)
  const bak = path.join(ORIG_DIR, name)
  if (!(await exists(bak))) await copyFile(src, bak)
  await copyFile(bak, src)

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
      'draco3d.encoder': await draco3d.createEncoderModule(),
    })

  console.log(`\n→ ${name}`)
  const document = await io.read(src)

  await downsampleTextures(document)

  await document.transform(
    dedup(),
    flatten(),
    join({ keepNamed: false }),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.75, error: 0.001 }),
    resample(),
    prune(),
    draco({ method: 'edgebreaker' }),
  )

  await io.write(src, document)
  const { size } = await import('node:fs').then((fs) => fs.promises.stat(src))
  console.log(`  ✓ ${(size / (1024 * 1024)).toFixed(2)} MB`)
}

async function main() {
  await mkdir(ORIG_DIR, { recursive: true })
  await MeshoptSimplifier.ready
  for (const name of TARGETS) {
    if (!(await exists(path.join(ORIG_DIR, name))) && !(await exists(path.join(CARS_DIR, name)))) {
      console.warn(`missing ${name}`)
      continue
    }
    try {
      await optimizeOne(name)
    } catch (err) {
      console.error(`  ✗ ${name}:`, err.message)
    }
  }
}

main()
