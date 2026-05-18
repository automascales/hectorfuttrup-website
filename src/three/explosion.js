import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js'

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

const NUM_GROUPS = 52
const LABELED = FACTS.length
const SHARD_THICKNESS = 0.045  // depth of each convex hull shard in world units

export function buildExplosion(scene, model) {
  if (!model) return null

  model.updateWorldMatrix(true, true)

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

  // Fisher-Yates shuffle — irregular fragment shapes, no ring/strip artifacts
  for (let i = triangles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[triangles[i], triangles[j]] = [triangles[j], triangles[i]]
  }

  const chunkSize = Math.ceil(triangles.length / NUM_GROUPS)
  const matcapTex = new THREE.TextureLoader().load('/textures/matcap-marble.png')
  const fragments = []

  for (let g = 0; g < NUM_GROUPS; g++) {
    const chunk = triangles.slice(g * chunkSize, (g + 1) * chunkSize)
    if (chunk.length === 0) continue

    // Group centroid + average surface normal
    const gCenter = new THREE.Vector3()
    const gNormal = new THREE.Vector3()
    chunk.forEach(({ center, normal }) => {
      gCenter.add(center)
      gNormal.add(normal)
    })
    gCenter.divideScalar(chunk.length)
    gNormal.divideScalar(chunk.length).normalize()

    // Collect unique vertex positions in local space (relative to gCenter)
    const seen = new Set()
    const frontPoints = []
    chunk.forEach(({ v0, v1, v2 }) => {
      for (const v of [v0, v1, v2]) {
        const key = `${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`
        if (!seen.has(key)) {
          seen.add(key)
          frontPoints.push(v.clone().sub(gCenter))
        }
      }
    })

    // Offset back-face copies along -normal to give each shard real 3D thickness
    const backPoints = frontPoints.map(p => p.clone().addScaledVector(gNormal, -SHARD_THICKNESS))
    const allPoints = [...frontPoints, ...backPoints]

    let geo
    try {
      geo = new ConvexGeometry(allPoints)
      // Convert to non-indexed for true flat-shaded face normals
      geo = geo.toNonIndexed()
      geo.computeVertexNormals()
    } catch {
      // Fallback: flat triangle mesh if convex hull fails
      const verts = []
      chunk.forEach(({ v0, v1, v2 }) => {
        verts.push(
          v0.x - gCenter.x, v0.y - gCenter.y, v0.z - gCenter.z,
          v1.x - gCenter.x, v1.y - gCenter.y, v1.z - gCenter.z,
          v2.x - gCenter.x, v2.y - gCenter.y, v2.z - gCenter.z
        )
      })
      geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      geo.computeVertexNormals()
    }

    const mat = new THREE.MeshMatcapMaterial({
      matcap: matcapTex,
      side: THREE.DoubleSide,
      flatShading: true,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(gCenter)
    mesh.visible = false
    scene.add(mesh)

    // Only labeled groups get a CSS2D fact tag
    let labelDiv = null
    if (g < LABELED) {
      const div = document.createElement('div')
      div.className = 'fragment-label'
      div.textContent = FACTS[g]
      const label = new CSS2DObject(div)
      label.position.set(0, 0, 0)
      mesh.add(label)
      labelDiv = div
    }

    // Explosion target — dramatic scatter, keep within camera frustum (cam z=4.5)
    const spread = 2.2 + Math.random() * 2.0
    const target = gCenter.clone().addScaledVector(gNormal, spread)
    target.x += (Math.random() - 0.5) * 3.2
    target.y += (Math.random() - 0.5) * 2.8
    target.z += (Math.random() - 0.5) * 1.6

    const rotTarget = new THREE.Euler(
      (Math.random() - 0.5) * Math.PI * 3,
      (Math.random() - 0.5) * Math.PI * 3,
      (Math.random() - 0.5) * Math.PI * 3
    )

    fragments.push({ mesh, label: labelDiv, origin: gCenter.clone(), target, rotTarget })
  }

  return fragments
}

export function triggerExplosion(fragments, model, progress) {
  if (!fragments || !model) return

  model.visible = progress < 0.04

  fragments.forEach((frag, i) => {
    const stagger = (i / fragments.length) * 0.25
    const local = clamp01((progress - stagger) / (1 - stagger))
    const e = easeOutCubic(local)

    frag.mesh.visible = local > 0
    frag.mesh.position.lerpVectors(frag.origin, frag.target, e)
    frag.mesh.rotation.x = frag.rotTarget.x * e
    frag.mesh.rotation.y = frag.rotTarget.y * e
    frag.mesh.rotation.z = frag.rotTarget.z * e

    if (frag.label) {
      frag.label.classList.toggle('visible', e > 0.6)
    }
  })
}

function clamp01(v) { return Math.max(0, Math.min(1, v)) }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
