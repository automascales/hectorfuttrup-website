import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

const FACTS = [
  '17 years old',
  'Copenhagen, Denmark',
  '10 months in Vancouver',
  'JBIA · August 2026',
  '3 years strength training',
  'First job: opening oysters',
  'Cinema at 14',
  'Building AI companies',
  'Catering waiter at 15',
  'Entrepreneur since always',
  'Curious by default',
  'Work before comfort',
  'Exchange year · Vancouver',
  'Speaks Danish & English',
  'Science-based training',
  'Never stops building',
]

const NUM_GROUPS = FACTS.length

export function buildExplosion(scene, model) {
  if (!model) return null

  model.updateWorldMatrix(true, true)

  // Collect all triangles in world space
  const triangles = []
  model.traverse((child) => {
    if (!child.isMesh) return
    const geo = child.geometry.clone()
    geo.applyMatrix4(child.matrixWorld)
    const flat = geo.index ? geo.toNonIndexed() : geo
    const pos = flat.getAttribute('position')

    for (let i = 0; i < pos.count; i += 3) {
      const v0 = new THREE.Vector3().fromBufferAttribute(pos, i)
      const v1 = new THREE.Vector3().fromBufferAttribute(pos, i + 1)
      const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 2)
      const center = new THREE.Vector3().addVectors(v0, v1).add(v2).divideScalar(3)
      const e1 = v1.clone().sub(v0)
      const e2 = v2.clone().sub(v0)
      const normal = e1.cross(e2).normalize()
      triangles.push({ v0, v1, v2, center, normal })
    }
  })

  if (triangles.length === 0) return null

  // Sort by Y, chunk into NUM_GROUPS
  triangles.sort((a, b) => b.center.y - a.center.y)
  const chunkSize = Math.ceil(triangles.length / NUM_GROUPS)

  const matcapTex = new THREE.TextureLoader().load('/textures/matcap-marble.png')
  const fragments = []

  for (let g = 0; g < NUM_GROUPS; g++) {
    const chunk = triangles.slice(g * chunkSize, (g + 1) * chunkSize)
    if (chunk.length === 0) continue

    // Compute group centroid and average normal in world space
    let gCenter = new THREE.Vector3()
    let gNormal = new THREE.Vector3()
    chunk.forEach(({ center, normal }) => {
      gCenter.add(center)
      gNormal.add(normal)
    })
    gCenter.divideScalar(chunk.length)
    gNormal.divideScalar(chunk.length).normalize()

    // Build geometry with vertices RELATIVE to gCenter (local space)
    const verts = []
    chunk.forEach(({ v0, v1, v2 }) => {
      verts.push(
        v0.x - gCenter.x, v0.y - gCenter.y, v0.z - gCenter.z,
        v1.x - gCenter.x, v1.y - gCenter.y, v1.z - gCenter.z,
        v2.x - gCenter.x, v2.y - gCenter.y, v2.z - gCenter.z
      )
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshMatcapMaterial({ matcap: matcapTex, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(geo, mat)
    // Start at world centroid — matches where the head actually sits
    mesh.position.copy(gCenter)
    mesh.visible = false
    scene.add(mesh)

    // CSS2D label — positioned at mesh local origin (= gCenter in world)
    const div = document.createElement('div')
    div.className = 'fragment-label'
    div.textContent = FACTS[g]
    const label = new CSS2DObject(div)
    label.position.set(0, 0, 0)
    mesh.add(label)

    // Explosion target — keep within camera view (camera at z=4.5, looking at origin)
    const spread = 1.2 + Math.random() * 1.0
    const target = gCenter.clone().addScaledVector(gNormal, spread)
    target.x += (Math.random() - 0.5) * 2.5
    target.y += (Math.random() - 0.5) * 2.0
    target.z += (Math.random() - 0.5) * 0.8

    const rotTarget = new THREE.Euler(
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI * 2
    )

    fragments.push({ mesh, label: div, origin: gCenter.clone(), target, rotTarget })
  }

  return fragments
}

export function triggerExplosion(fragments, model, progress) {
  if (!fragments || !model) return

  model.visible = progress < 0.04

  fragments.forEach((frag, i) => {
    const stagger = (i / fragments.length) * 0.2
    const local = clamp01((progress - stagger) / (1 - stagger))
    const e = easeOutCubic(local)

    frag.mesh.visible = local > 0
    frag.mesh.position.lerpVectors(frag.origin, frag.target, e)
    frag.mesh.rotation.x = frag.rotTarget.x * e
    frag.mesh.rotation.y = frag.rotTarget.y * e
    frag.mesh.rotation.z = frag.rotTarget.z * e

    frag.label.classList.toggle('visible', e > 0.65)
  })
}

function clamp01(v) { return Math.max(0, Math.min(1, v)) }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
