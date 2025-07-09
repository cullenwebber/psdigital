import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

let lenis

export default function initSmoothScrolling() {
	lenis = new Lenis({
		lerp: 0.175,
	})

	lenis.on('scroll', ScrollTrigger.update)

	gsap.ticker.add((time) => {
		lenis.raf(time * 1000)
	})

	gsap.ticker.lagSmoothing(0)
}

export function getLenis() {
	return lenis
}
