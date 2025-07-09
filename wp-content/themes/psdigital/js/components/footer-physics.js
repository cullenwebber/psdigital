import SVGPhysics from '../utils/SVGPhysics.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger.js'
gsap.registerPlugin(ScrollTrigger)

export default function initFooterPhysics() {
	const physics = new SVGPhysics('#footer-container', '#footer-container', {
		scale: 0.000575 * innerWidth,
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
