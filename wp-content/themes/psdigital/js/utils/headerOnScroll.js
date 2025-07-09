import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hides header when scrolling down and shows it when scrolling up
 * Optimized to only animate on direction change
 *
 * @returns {void}
 * @requires ScrollTrigger
 *
 */
export default function initHeaderOnScroll() {
	const header = document.querySelector('header')
	if (!header) return

	let isHidden = false

	ScrollTrigger.create({
		start: '100px top',
		end: 'max',
		onUpdate: (self) => {
			const direction = self.direction

			if (direction === 1 && !isHidden) {
				gsap.to(header, { y: '-100%', duration: 0.3, ease: 'power2.inOut' })
				isHidden = true
			} else if (direction === -1 && isHidden) {
				gsap.to(header, { y: '0%', duration: 0.3, ease: 'power2.inOut' })
				isHidden = false
			}
		},
	})
}
