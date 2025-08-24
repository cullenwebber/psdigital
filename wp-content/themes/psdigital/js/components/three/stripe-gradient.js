import * as THREE from 'three'
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
		this.footerLogo = null
		this.scale = 1.1
		this.footerLogoScale = window.innerWidth > 1024 ? 1.1 : 0.6

		this.mouse = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster()

		// Footer mouse interaction properties
		this.footerMouseTarget = { x: 0, y: 0 }
		this.footerMouseCurrent = { x: 0, y: 0 }
		this.isMouseOverFooter = false

		this.setupScenes()
		this.setupCamera()
		this.worldHeight = this.calculateWorldHeight()
		this.setupRenderer()
		this.setupDracoLoader()
		this.setupMouseEvents()
		this.addLogo()
		this.addGradientPlane()
		this.createHDREnvironment()
		this.createLights()
		this.resize()
		this.render()
		this.setupResizeObserver()
	}

	createLights() {
		// Single key light for main illumination
		this.keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
		this.keyLight.position.set(2, 3, 1)
		this.logoScene.add(this.keyLight)

		// Subtle ambient for base lighting
		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
		this.logoScene.add(this.ambientLight)
	}

	createHDREnvironment() {
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer)

		// Create simple black and white gradient canvas
		const canvas = document.createElement('canvas')
		canvas.width = 512
		canvas.height = 256
		const ctx = canvas.getContext('2d')

		// Black to white vertical gradient for chrome reflections
		const gradient = ctx.createLinearGradient(0, 0, 0, 256)
		gradient.addColorStop(0, '#ffffff') // White top
		gradient.addColorStop(0.3, '#010f45') // Light gray
		gradient.addColorStop(0.7, '#12448F') // Dark gray
		gradient.addColorStop(1, '#010f45') // Black bottom

		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, 512, 256)

		// Add some horizontal bands for more interesting reflections
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 60, 512, 20)
		ctx.fillRect(0, 120, 512, 15)
		ctx.fillRect(0, 180, 512, 25)

		// Create environment map
		const texture = new THREE.CanvasTexture(canvas)
		texture.mapping = THREE.EquirectangularReflectionMapping

		const envMap = pmremGenerator.fromEquirectangular(texture).texture
		pmremGenerator.dispose()

		// Apply to scene with high intensity for chrome effect
		this.logoScene.environment = envMap
		this.logoScene.environmentIntensity = 1.0

		return envMap
	}

	setupMouseEvents() {
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleFooterMouseEnter = this.handleFooterMouseEnter.bind(this)
		this.handleFooterMouseLeave = this.handleFooterMouseLeave.bind(this)

		const footer = document.querySelector('footer')
		footer.addEventListener('mousemove', this.handleMouseMove)
		footer.addEventListener('mouseenter', this.handleFooterMouseEnter)
		footer.addEventListener('mouseleave', this.handleFooterMouseLeave)
	}

	handleFooterMouseEnter() {
		this.isMouseOverFooter = true
	}

	handleFooterMouseLeave() {
		this.isMouseOverFooter = false
		this.footerMouseTarget = { x: 0, y: 0 }
	}

	handleMouseMove(event) {
		const rect = this.container.getBoundingClientRect()
		this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1
		this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1

		this.raycaster.setFromCamera(this.mouse, this.camera)
		const targetZ = -10
		const ray = this.raycaster.ray

		// Footer logo interaction
		if (this.isMouseOverFooter) {
			this.footerMouseTarget.x = this.mouse.x * 0.15
			this.footerMouseTarget.y = this.mouse.y * 0.15
		}
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

			const { width } = entry.contentRect
			if (width === this.width) return

			this.width = width
			this.height = this.container.offsetHeight
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
		let logoPath = 'wp-content/themes/psdigital/static/logo.glb'
		// 'https://raw.githubusercontent.com/cullenwebber/psdigital/main/wp-content/themes/psdigital/static/logo.glb'

		this.gltf.load(
			logoPath,
			(gltf) => {
				let index = 1
				const whiteMaterial = new THREE.MeshBasicMaterial({ color: '#FBFBFB' })
				this.createLogoInstance(
					gltf.scene,
					whiteMaterial,
					{ x: 0, y: 0, z: 0 },
					index
				)

				index++
				const blueMaterial = new THREE.MeshStandardMaterial({
					color: 0x12448f,
					roughness: 0.2,
					metalness: 1.0,
				})

				this.createLogoInstance(
					gltf.scene,
					blueMaterial,
					{ x: 0, y: 0, z: 0 },
					index
				)
			},
			undefined,
			undefined
		)
	}

	createLogoInstance(originalScene, material, position, index) {
		const logoContainer = new THREE.Group()
		const logo = originalScene.clone()

		logo.traverse((child) => {
			if (!child.isMesh) return
			child.material = material
		})

		logoContainer.add(logo)
		logoContainer.position.set(position.x, position.y, position.z)
		this.logoScene.add(logoContainer)

		if (index === 1) {
			logo.scale.set(this.scale, this.scale, this.scale * 6)
			logoContainer.rotation.y = Math.PI * 1.5
			this.logo = logo
			this.logoContainer = logoContainer
			this.setUpScrollTrigger()
		} else {
			logo.scale.set(
				this.footerLogoScale * 0.6,
				this.footerLogoScale * 0.6,
				this.footerLogoScale * 0.6
			)
			logoContainer.position.y = -this.worldHeight
			logoContainer.position.x = window.innerWidth > 1024 ? 0.2 : 0
			this.footerLogo = logo
			this.footerLogoContainer = logoContainer
		}
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
			end: 'max',
			scrub: true,
			ease: 'none',
		})

		let footerTl = gsap
			.timeline({
				scrollTrigger: {
					trigger: '#footer-panel',
					endTrigger: 'footer',
					start: 'top bottom',
					end: 'bottom bottom',
					scrub: true,
					ease: 'none',
				},
			})
			.to(
				{},
				{
					onUpdate: function () {
						const progress = this.progress()
						that.footerLogoContainer.position.y =
							-that.worldHeight * 2.0 +
							that.worldHeight *
								(window.innerWidth > 1024 ? 1.9 : 2.0) *
								progress

						that.footerLogoContainer.rotation.y =
							Math.PI * 1.5 - Math.PI * 1.5 * progress
					},
				}
			)
	}

	render() {
		this.time += 0.0001
		this.material.uniforms.time.value = this.time
		let time = this.time

		// Smooth footer logo rotation
		if (this.footerLogo && this.isMouseOverFooter) {
			this.footerMouseCurrent.x +=
				(this.footerMouseTarget.x - this.footerMouseCurrent.x) * 0.11
			this.footerMouseCurrent.y +=
				(this.footerMouseTarget.y - this.footerMouseCurrent.y) * 0.1

			// Base floating rotation + mouse interaction
			const floatRotX = Math.sin(time * 40.0) * 0.2
			const floatRotY = Math.cos(time * 30.0) * 0.15

			this.footerLogo.rotation.x = this.footerMouseCurrent.y + floatRotX
			this.footerLogo.rotation.y = this.footerMouseCurrent.x + floatRotY
		} else if (this.footerLogo) {
			this.footerMouseCurrent.x *= 0.95
			this.footerMouseCurrent.y *= 0.95

			// Continue floating rotation even when not hovering
			const floatRotX = Math.sin(time * 120.0) * 0.02
			const floatRotY = Math.cos(time * 140.0) * 0.015

			this.footerLogo.rotation.x = this.footerMouseCurrent.y + floatRotX
			this.footerLogo.rotation.y = this.footerMouseCurrent.x + floatRotY
		}

		if (this.footerLogo) {
			// Combine multiple sine waves for complex floating motion
			const floatY =
				Math.sin(time * 100.0) * 0.008 + Math.sin(time * 80.0) * 0.004
			const floatX = Math.cos(time * 180.0) * 0.003
			const floatZ = Math.sin(time * 220.0) * 0.002

			this.footerLogo.position.y = floatY
			this.footerLogo.position.x = floatX
			this.footerLogo.position.z = floatZ

			// Add subtle Z-axis rotation for organic movement
			this.footerLogo.rotation.z = Math.sin(time * 100.0) * 0.01
		}

		this.renderer.clear()
		this.renderer.render(this.gradientScene, this.camera)
		this.renderer.clearDepth()
		this.renderer.render(this.logoScene, this.camera)

		requestAnimationFrame(this.render.bind(this))
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
