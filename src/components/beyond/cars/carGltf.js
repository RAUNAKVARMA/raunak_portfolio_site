import { useGLTF } from '@react-three/drei'

/** Google-hosted Draco decoders — required for compressed showcase GLBs. */
export const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

let configured = false

export function ensureDracoDecoder() {
  if (configured) return
  useGLTF.setDecoderPath(DRACO_DECODER_PATH)
  configured = true
}

/** Preload a car GLB with Draco support. */
export function preloadCar(url) {
  if (!url) return
  ensureDracoDecoder()
  try {
    useGLTF.preload(url, true)
  } catch {
    try {
      useGLTF.preload(url)
    } catch {
      /* */
    }
  }
}
