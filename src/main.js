import * as THREE from 'three'
import { createScene } from './three/scene.js'
import { loadHead, animateHead } from './three/head.js'
import { buildExplosion, triggerExplosion } from './three/explosion.js'
import { initScroll } from './scroll.js'
import { initMagneticCursor } from './cursor.js'

const container = document.getElementById('canvas-container')
const labelContainer = document.getElementById('css2d-renderer')

const { scene, camera, renderer, labelRenderer } = createScene(container, labelContainer)

let model = null
let fragments = null
let explosionProgress = 0
const clock = new THREE.Clock()

loadHead(scene).then((head) => {
  model = head
  fragments = buildExplosion(scene, model)
})

initScroll((progress) => {
  explosionProgress = progress
})

initMagneticCursor()

function tick() {
  requestAnimationFrame(tick)
  const delta = clock.getDelta()

  if (model && explosionProgress < 0.05) {
    animateHead(model, delta)
  }

  if (fragments) {
    triggerExplosion(fragments, model, explosionProgress)
  }

  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

tick()
