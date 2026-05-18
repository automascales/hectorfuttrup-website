import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function loadHead(scene) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader()

    // Marble matcap material — makes any mesh look like white marble/stone
    const textureLoader = new THREE.TextureLoader()
    const matcap = textureLoader.load('/textures/matcap-marble.png')
    const material = new THREE.MeshMatcapMaterial({
      matcap,
      side: THREE.FrontSide,
    })

    loader.load(
      '/models/marble-head.glb',
      (gltf) => {
        const model = gltf.scene

        // Apply marble material to all meshes
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = material
            child.castShadow = false
          }
        })

        // Center and scale
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2.2 / maxDim
        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))
        model.position.y += 0.3

        scene.add(model)
        resolve(model)
      },
      undefined,
      (err) => {
        console.error('GLB load error:', err)
        // Fallback: marble sphere
        const geo = new THREE.SphereGeometry(1, 64, 64)
        const mesh = new THREE.Mesh(geo, material)
        scene.add(mesh)
        resolve(mesh)
      }
    )
  })
}

export function animateHead(model, delta) {
  if (!model) return
  model.rotation.y += delta * 0.15  // slow auto-rotate
}
