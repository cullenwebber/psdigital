import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
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

		this.setupScenes()
		this.setupCamera()
		this.worldHeight = this.calculateWorldHeight()
		this.setupRenderer()
		this.setupDracoLoader()
		this.addLogo()
		this.addGradientPlane()
		this.resize()
		this.render()
		this.setupResizeObserver()
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
		const logoPath = 'wp-content/themes/psdigital/static/logo.glb'

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

		ScrollTrigger.create({
			trigger: '#testimonials-home-trigger',
			pin: '#testimonials-home-canvas-container',
			start: 'top top',
			end: 'bottom bottom',
			scrub: true,
			ease: 'none',
		})
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
	}

	render() {
		this.time += 0.0001
		this.material.uniforms.time.value = this.time
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
