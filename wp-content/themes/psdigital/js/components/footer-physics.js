import SVGPhysics from '../utils/SVGPhysics.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function initFooterPhysics() {
	const width = window.innerWidth
	let scale

	if (width >= 1600) {
		scale = 0.000575 * 1600
	} else if (width >= 640) {
		scale = 0.000575 * width
	} else {
		scale = 0.000875 * width
	}

	const physics = new SVGPhysics('#footer-container', '#footer-container', {
		scale: scale,
		debug: {
			devMode: false,
			showBoundingBoxes: false,
		},
		physics: {
			restitution: 0.65,
			friction: 0.25,
		},
	})

	physics.pause()

	ScrollTrigger.create({
		trigger: '#footer-container',
		start: 'top bottom',
		onEnter: () => {
			physics.resume()
		},
	})
}
