import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import fragment from './shaders/fragment'
import vertex from './shaders/vertex'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

let pallete = [0x12448f, 0x1a5bb8, 0x2d73d4, 0x4a8cf0]

const colorObjects = pallete.map((color) => new THREE.Color(color))
const colorArray = []
colorObjects.forEach((color) => {
	colorArray.push(color.r, color.g, color.b)
})

gsap.registerPlugin(ScrollTrigger)

class Sketch {
	constructor(options) {
		this.container = options.dom
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.time = 0
		this.logo = null
		this.scale = 1.1

		// CANNON.js physics
		this.world = new CANNON.World()
		this.physicsObjects = []
		this.mouse = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster()
		this.mouseBody = null

		this.lastMouseMoveTime = Date.now()
		this.mouseIdleThreshold = 2000
		this.idleForceStrength = 2.0
		this.rigidBodiesVisible = false
		this.rigidBodyMeshes = []

		this.setupScenes()
		this.setupCamera()
		this.worldHeight = this.calculateWorldHeight()
		this.setupRenderer()
		this.setupDracoLoader()
		this.setupPhysics()
		this.setupMouseEvents()
		this.addLogo()
		this.addGradientPlane()
		this.loadSVGs()
		this.createHDREnvironment()
		this.createLights()
		this.resize()
		this.render()
		this.setupResizeObserver()
	}

	createLights() {
		// Main key light - bright directional light from top-right
		this.keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
		this.keyLight.position.set(5, 8, 3)
		this.keyLight.castShadow = true
		this.keyLight.shadow.mapSize.width = 2048
		this.keyLight.shadow.mapSize.height = 2048
		this.keyLight.shadow.camera.near = 0.1
		this.keyLight.shadow.camera.far = 50
		this.keyLight.shadow.camera.left = -10
		this.keyLight.shadow.camera.right = 10
		this.keyLight.shadow.camera.top = 10
		this.keyLight.shadow.camera.bottom = -10
		this.logoScene.add(this.keyLight)

		// Fill light - softer light from the opposite side
		this.fillLight = new THREE.DirectionalLight(0x4a8cf0, 1.2)
		this.fillLight.position.set(-3, 2, 2)
		this.logoScene.add(this.fillLight)

		// Rim light - creates nice edge lighting
		this.rimLight = new THREE.DirectionalLight(0x2d73d4, 1.8)
		this.rimLight.position.set(-2, -1, -5)
		this.logoScene.add(this.rimLight)

		// Ambient light for overall illumination
		this.ambientLight = new THREE.AmbientLight(0x1a5bb8, 0.4)
		this.logoScene.add(this.ambientLight)

		// Point light for dynamic highlights
		this.pointLight = new THREE.PointLight(0xffffff, 1.5, 20)
		this.pointLight.position.set(0, 5, 0)
		this.logoScene.add(this.pointLight)

		// Spot light for dramatic effect
		this.spotLight = new THREE.SpotLight(0x12448f, 2.0)
		this.spotLight.position.set(0, 10, 5)
		this.spotLight.target.position.set(0, 0, -10)
		this.spotLight.angle = Math.PI / 6
		this.spotLight.penumbra = 0.3
		this.spotLight.decay = 2
		this.logoScene.add(this.spotLight)
		this.logoScene.add(this.spotLight.target)
	}

	createHDREnvironment() {
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
		pmremGenerator.compileEquirectangularShader()
		const canvas = document.createElement('canvas')
		canvas.width = 512
		canvas.height = 256
		const ctx = canvas.getContext('2d')

		const gradient = ctx.createLinearGradient(0, 0, 0, 256)
		gradient.addColorStop(0, '#4a8cf0')
		gradient.addColorStop(0.5, '#2d73d4')
		gradient.addColorStop(1, '#12448f')

		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, 512, 256)

		const texture = new THREE.CanvasTexture(canvas)
		texture.mapping = THREE.EquirectangularReflectionMapping

		const envMap = pmremGenerator.fromEquirectangular(texture).texture
		pmremGenerator.dispose()

		this.logoScene.environment = envMap
		this.logoScene.environmentIntensity = 0.25
	}

	setupPhysics() {
		this.world.gravity.set(0, 0, 0)
		this.world.broadphase = new CANNON.NaiveBroadphase()
		this.world.solver.iterations = 10

		// Create materials
		this.defaultMaterial = new CANNON.Material('default')
		this.mouseMaterial = new CANNON.Material('mouse')

		// Contact material for mouse collisions - bouncy interactions
		const mouseContact = new CANNON.ContactMaterial(
			this.defaultMaterial,
			this.mouseMaterial,
			{
				friction: 0.1,
				restitution: 1.2, // Extra bouncy for fun interactions
			}
		)
		this.world.addContactMaterial(mouseContact)

		// Contact material for object-to-object collisions
		const objectContact = new CANNON.ContactMaterial(
			this.defaultMaterial,
			this.defaultMaterial,
			{
				friction: 0.1,
				restitution: 0.8,
			}
		)
		this.world.addContactMaterial(objectContact)

		// Create mouse body - kinematic so it follows mouse but has collision
		this.mouseBody = new CANNON.Body({
			mass: 0,
			type: CANNON.Body.KINEMATIC,
			material: this.mouseMaterial,
		})
		this.mouseBody.addShape(new CANNON.Sphere(2)) // Slightly bigger for better collisions
		this.mouseBody.position.set(0, 100, 0) // Start off-screen
		this.world.addBody(this.mouseBody)
	}

	setupMouseEvents() {
		this.handleMouseMove = this.handleMouseMove.bind(this)
		document
			.querySelector('footer')
			.addEventListener('mousemove', this.handleMouseMove)

		document.querySelector('footer').addEventListener('mouseleave', () => {
			this.mouseBody.position.set(0, 100, 0) // Move off-screen
		})
	}

	handleMouseMove(event) {
		// Get mouse coordinates relative to the container
		const rect = this.container.getBoundingClientRect()
		this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1
		this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1

		this.raycaster.setFromCamera(this.mouse, this.camera)

		// Project mouse to the z = -10 plane where objects are
		const targetZ = -10
		const ray = this.raycaster.ray

		if (Math.abs(ray.direction.z) > 0.0001) {
			const t = (targetZ - ray.origin.z) / ray.direction.z
			const worldPos = new THREE.Vector3()
			worldPos.copy(ray.origin)
			worldPos.addScaledVector(ray.direction, t)

			this.mouseBody.position.set(worldPos.x, worldPos.y, worldPos.z)
		}

		this.lastMouseMoveTime = Date.now()
	}

	applyIdleMovement() {
		const currentTime = Date.now()

		const idleTime = (currentTime - this.mouseIdleThreshold) * 0.001

		this.physicsObjects.forEach((obj, index) => {
			// Apply subtle random forces to create gentle movement
			const randomForceX =
				(Math.sin(idleTime * 0.5 + index) + Math.random() * 0.9 - 0.1) *
				this.idleForceStrength
			const randomForceY =
				(Math.cos(idleTime * 0.7 + index) + Math.random() * 0.9 - 0.1) *
				this.idleForceStrength
			const randomForceZ =
				(Math.sin(idleTime * 0.3 + index * 2) + Math.random() * 0.9 - 0.1) *
				this.idleForceStrength

			const idleForce = new CANNON.Vec3(
				randomForceX,
				randomForceY,
				randomForceZ
			)
			obj.body.applyForce(idleForce)

			// Also apply subtle random torque for rotation
			const randomTorqueX = Math.sin(idleTime * 0.4 + index) * 0.02
			const randomTorqueY = Math.cos(idleTime * 0.6 + index) * 0.02
			const randomTorqueZ = Math.sin(idleTime * 0.8 + index) * 0.02

			const idleTorque = new CANNON.Vec3(
				randomTorqueX,
				randomTorqueY,
				randomTorqueZ
			)
			obj.body.applyTorque(idleTorque)
		})
	}

	loadSVGs() {
		const svgElements = document.querySelectorAll('#footer-svgs-container svg')
		const loader = new SVGLoader()

		svgElements.forEach((svgEl) => {
			const svgString = new XMLSerializer().serializeToString(svgEl)
			const data = loader.parse(svgString)
			const paths = data.paths
			const group = new THREE.Group()

			paths.forEach((path) => {
				const material = new THREE.MeshStandardMaterial({
					color: 0x12448f,
					roughness: 0.35,
					metalness: 1.0,
				})

				const shapes = SVGLoader.createShapes(path)

				shapes.forEach((shape) => {
					const extrudeSettings = {
						depth: 25.0,
						bevelEnabled: true,
						bevelSegments: 1,
						steps: 5,
						bevelSize: 3.0,
						bevelThickness: 0.3,
					}

					const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
					geometry.computeBoundingBox()

					const center = new THREE.Vector3()
					geometry.boundingBox.getCenter(center)
					geometry.translate(-center.x, -center.y, -center.z)

					const mesh = new THREE.Mesh(geometry, material)

					// Set proper scale FIRST (before creating physics body)
					const width = window.innerWidth
					width > 768
						? mesh.scale.setScalar(0.025)
						: mesh.scale.setScalar(0.015)

					// Random position
					mesh.position.set(
						(Math.random() - 0.5) * 20,
						(Math.random() - 0.5) * 20,
						(Math.random() - 0.5) * 20
					)

					mesh.rotation.set(
						Math.random() * Math.PI,
						Math.random() * Math.PI,
						Math.random() * Math.PI
					)

					// Create physics body with correct dimensions
					this.createPhysicsBody(mesh)

					// NOW scale to 0 for the entrance animation (this only affects visual mesh)
					mesh.scale.setScalar(0)

					group.add(mesh)

					// Store individual mesh for scaling animation
					this.rigidBodyMeshes.push(mesh)
				})
			})

			this.logoScene.add(group)
		})
	}

	// Also add a method to store the original target scales for each mesh
	storeTargetScales() {
		this.rigidBodyMeshes.forEach((mesh) => {
			const width = window.innerWidth
			const targetScale = width > 768 ? 0.025 : 0.015
			// Store the target scale on the mesh for later use
			mesh.userData.targetScale = targetScale
		})
	}

	createPhysicsBody(mesh) {
		// Get dimensions
		mesh.geometry.computeBoundingBox()
		const boundingBox = mesh.geometry.boundingBox
		const width = (boundingBox.max.x - boundingBox.min.x) * mesh.scale.x
		const height = (boundingBox.max.y - boundingBox.min.y) * mesh.scale.y
		const depth = (boundingBox.max.z - boundingBox.min.z) * mesh.scale.z

		// Create physics body
		const body = new CANNON.Body({
			mass: 0.4,
			material: this.defaultMaterial,
		})

		body.position.set(mesh.position.x, mesh.position.y, mesh.position.z)
		body.quaternion.set(
			mesh.quaternion.x,
			mesh.quaternion.y,
			mesh.quaternion.z,
			mesh.quaternion.w
		)

		// Simple box shape
		body.addShape(
			new CANNON.Box(
				new CANNON.Vec3(
					Math.max(width / 2, 0.01),
					Math.max(height / 2, 0.01),
					Math.max(depth / 2, 0.01)
				)
			)
		)

		this.world.addBody(body)
		this.physicsObjects.push({
			mesh: mesh,
			body: body,
		})
	}

	applyGravitationalForces() {
		const width = window.innerWidth
		const centerPoint =
			width > 768 ? new CANNON.Vec3(3, -2, -10) : new CANNON.Vec3(2, 0, -10)
		const centerStrength = 30.0
		const repulsionStrength = 0.2
		const minDistance = 0.5

		for (let i = 0; i < this.physicsObjects.length; i++) {
			const obj = this.physicsObjects[i]
			const pos = obj.body.position

			// Attraction to center
			const toCenterX = centerPoint.x - pos.x
			const toCenterY = centerPoint.y - pos.y
			const toCenterZ = centerPoint.z - pos.z
			const distanceToCenter = Math.sqrt(
				toCenterX * toCenterX + toCenterY * toCenterY + toCenterZ * toCenterZ
			)

			if (distanceToCenter > 0.1) {
				const forceMultiplier = centerStrength / distanceToCenter
				const centerForce = new CANNON.Vec3(
					toCenterX * forceMultiplier,
					toCenterY * forceMultiplier,
					toCenterZ * forceMultiplier
				)
				obj.body.applyForce(centerForce)
			}

			// Repulsion between objects
			for (let j = i + 1; j < this.physicsObjects.length; j++) {
				const obj2 = this.physicsObjects[j]
				const pos2 = obj2.body.position

				const dx = pos.x - pos2.x
				const dy = pos.y - pos2.y
				const dz = pos.z - pos2.z
				const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

				if (distance < minDistance && distance > 0.1) {
					const repulsionForce =
						repulsionStrength * (1 - distance / minDistance)
					const force1 = new CANNON.Vec3(
						(dx / distance) * repulsionForce,
						(dy / distance) * repulsionForce,
						(dz / distance) * repulsionForce
					)
					const force2 = new CANNON.Vec3(
						(-dx / distance) * repulsionForce,
						(-dy / distance) * repulsionForce,
						(-dz / distance) * repulsionForce
					)

					obj.body.applyForce(force1)
					obj2.body.applyForce(force2)
				}
			}
		}

		// No more mouse repulsion forces - let physics collisions handle it!
	}

	updatePhysics(deltaTime) {
		// Apply gravitational forces
		this.applyGravitationalForces()

		// Apply idle movement when mouse is inactive
		this.applyIdleMovement()

		// Step physics
		this.world.step(Math.min(deltaTime, 1 / 120))

		// Sync Three.js meshes with Cannon.js bodies
		this.physicsObjects.forEach((obj) => {
			obj.mesh.position.copy(obj.body.position)
			obj.mesh.quaternion.copy(obj.body.quaternion)

			// Apply damping
			obj.body.velocity.scale(0.98, obj.body.velocity)
			obj.body.angularVelocity.scale(0.98, obj.body.angularVelocity)
		})
	}

	setupScenes() {
		this.gradientScene = new THREE.Scene()
		this.logoScene = new THREE.Scene()
	}

	setupCamera() {
		this.camera = new THREE.PerspectiveCamera(
			70,
			this.width / this.height,
			0.0001,
			1000
		)

		this.camera.position.set(0, 0, 0.5)
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({ alpha: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderer.setSize(this.width, this.height)
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.physicallyCorrectLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
		this.renderer.autoClear = false
		this.container.appendChild(this.renderer.domElement)
	}

	setupResizeObserver() {
		this.resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (!entry) return

			const { width, height } = entry.contentRect
			if (width === this.width && height === this.height) return

			this.width = width
			this.height = height
			this.resize()
		})

		this.resizeObserver.observe(this.container)
	}

	resize() {
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height
		this.camera.updateProjectionMatrix()
	}

	setupDracoLoader() {
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath(
			'https://www.gstatic.com/draco/v1/decoders/'
		)
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)
	}

	calculateWorldHeight() {
		const distance = this.camera.position.z
		const vFOV = (this.camera.fov * Math.PI) / 180
		const worldHeight = 2 * Math.tan(vFOV / 2) * distance

		return worldHeight
	}

	addLogo() {
		let logoPath =
			'https://raw.githubusercontent.com/cullenwebber/psdigital/main/wp-content/themes/psdigital/static/logo.glb'
		const whiteMaterial = new THREE.MeshBasicMaterial({
			color: '#FBFBFB',
		})

		this.gltf.load(
			logoPath,
			(gltf) => {
				this.logoContainer = new THREE.Group()

				this.logo = gltf.scene
				this.logo.traverse((child) => {
					if (!child.isMesh) return
					child.material = whiteMaterial
				})

				this.logo.scale.set(this.scale, this.scale, this.scale * 6)
				this.logoContainer.rotation.y = Math.PI * 1.5
				this.logoContainer.add(this.logo)
				this.logoContainer.position.set(0, 0, 0)
				this.logoScene.add(this.logoContainer)

				this.setUpScrollTrigger()
			},
			undefined,
			undefined
		)
	}

	addGradientPlane() {
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable',
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: { value: 0 },
				uColor: { value: colorArray },
				resolution: { value: new THREE.Vector4() },
			},
			vertexShader: vertex,
			fragmentShader: fragment,
		})

		this.geometry = new THREE.PlaneGeometry(4, 4, 300, 300)

		this.plane = new THREE.Mesh(this.geometry, this.material)
		this.gradientScene.add(this.plane)
	}

	addLights() {
		const light1 = new THREE.AmbientLight(0xffffff, 0.5)
		const light2 = new THREE.DirectionalLight(0xffffff, 0.5)
		light2.position.set(0.5, 0, 0.866)

		this.logoScene.add(light1.clone())
		this.logoScene.add(light2.clone())

		this.gradientScene.add(light1)
		this.gradientScene.add(light2)
	}

	setUpScrollTrigger() {
		const that = this

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: '#testimonials-home-canvas-container',
				pin: false,
				start: 'top top',
				end: '+=200%',
				scrub: true,
				ease: 'none',
			},
		})

		tl.to(
			{},
			{
				onUpdate: function () {
					const progress = this.progress()
					const scale = that.scale - progress
					const scaleZ = that.scale * 6 - progress * 6.6
					that.logo.scale.set(scale, scale, scaleZ)
					that.logoContainer.rotation.y =
						Math.PI * 1.5 + Math.PI * 0.5 * progress
				},
			}
		).to(
			{},
			{
				onUpdate: function () {
					const progress = this.progress()
					that.logo.position.y = that.worldHeight * progress
				},
			}
		)

		ScrollTrigger.create({
			trigger: '#testimonials-home-trigger',
			pin: '#testimonials-home-canvas-container',
			start: 'top top',
			end: 'bottom bottom',
			endTrigger: 'footer',
			scrub: true,
			ease: 'none',
		})

		// Create paused timeline for rigid bodies scaling
		let bodytl = gsap.timeline({}).pause()

		this.rigidBodyMeshes.forEach((mesh, index) => {
			const targetScale = mesh.userData.targetScale || 0.025

			bodytl.to(
				mesh.scale,
				{
					x: targetScale,
					y: targetScale,
					z: targetScale,
					duration: 0.5,
					ease: 'back.out(2.0)',
				},
				index * 0.015
			)
		})

		// Add ScrollTrigger for rigid bodies scaling
		ScrollTrigger.create({
			trigger: '#footer-panel',
			start: 'top 75%',
			onEnter: () => {
				that.rigidBodiesVisible = true
				bodytl.play()
			},
			onLeaveBack: () => {
				that.rigidBodiesVisible = false
				bodytl.reverse()
			},
			// Add this to handle initial state
			onRefresh: (self) => {
				// Check if we're already past the trigger point
				if (self.isActive) {
					that.rigidBodiesVisible = true
					bodytl.progress(1) // Set to completed state immediately
				}
			},
		})

		// Call this after creating all meshes to store their target scales
		this.storeTargetScales()

		ScrollTrigger.refresh()
	}

	// Add this method to handle initial states more comprehensively
	initializeScrollStates() {
		// Wait for next frame to ensure DOM is ready
		requestAnimationFrame(() => {
			// Force a recalculation of all scroll positions
			ScrollTrigger.refresh()

			const scrollY = window.pageYOffset
			const footerPanel = document.getElementById('footer-panel')

			if (footerPanel) {
				const footerRect = footerPanel.getBoundingClientRect()
				const triggerPoint = footerRect.top + scrollY
				const windowHeight = window.innerHeight

				if (scrollY > triggerPoint - windowHeight * 0.75) {
					this.rigidBodiesVisible = true
					// Set all rigid bodies to their target scale immediately
					this.rigidBodyMeshes.forEach((mesh) => {
						const targetScale = mesh.userData.targetScale || 0.025
						mesh.scale.setScalar(targetScale)
					})
				}
			}
		})
	}

	render() {
		this.time += 0.0001
		this.material.uniforms.time.value = this.time
		let time = this.time
		// Rotate point light
		this.pointLight.position.x = Math.cos(time * 0.001) * 3
		this.pointLight.position.z = Math.sin(time * 0.001) * 3

		// Pulse spot light intensity
		this.spotLight.intensity = 2.0 + Math.sin(time * 0.002) * 0.5

		// Subtle color shift on rim light
		const hue = (time * 0.0005) % 1
		this.rimLight.color.setHSL(0.6 + hue * 0.1, 0.8, 0.5)

		// Update physics
		this.updatePhysics(0.016) // ~60fps

		this.renderer.clear()
		this.renderer.render(this.gradientScene, this.camera)
		this.renderer.clearDepth()
		this.renderer.render(this.logoScene, this.camera)

		requestAnimationFrame(this.render.bind(this))
	}

	// Clean up
	destroy() {
		this.container.removeEventListener('mousemove', this.handleMouseMove)
		if (this.resizeObserver) {
			this.resizeObserver.disconnect()
		}
	}
}

export default function initStripeGradient() {
	const testimonialsHome = document.getElementById(
		'testimonials-home-canvas-container'
	)

	if (!testimonialsHome) return

	new Sketch({
		dom: testimonialsHome,
	})
}
