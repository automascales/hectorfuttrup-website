import * as THREE from 'three'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'

export function createScene(container, labelContainer) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#f2ede4')

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )
  camera.position.set(0, 0.5, 4.5)

  // WebGL renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = false
  container.appendChild(renderer.domElement)

  // CSS2D renderer for text labels
  const labelRenderer = new CSS2DRenderer({ element: labelContainer })
  labelRenderer.setSize(container.clientWidth, container.clientHeight)
  labelRenderer.domElement.style.position = 'fixed'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'

  // Lighting — warm, soft, directional
  const ambient = new THREE.AmbientLight('#f2ede4', 1.2)
  scene.add(ambient)

  const key = new THREE.DirectionalLight('#fff8f0', 3.5)
  key.position.set(3, 5, 4)
  scene.add(key)

  const fill = new THREE.DirectionalLight('#c8a090', 1.0)
  fill.position.set(-4, 0, 2)
  scene.add(fill)

  const rim = new THREE.DirectionalLight('#b8942a', 0.6)
  rim.position.set(0, -3, -4)
  scene.add(rim)

  // Resize handler
  function onResize() {
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    labelRenderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  return { scene, camera, renderer, labelRenderer }
}
