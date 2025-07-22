import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function parallaxEffect() {
	const containers = document.querySelectorAll('[parallax-effect]')
	if (!containers.length) return

	containers.forEach((con) => {
		const image = con.querySelector('img')
		image.style.willChange = 'transform'

		// Ensure container has overflow hidden
		con.style.overflow = 'hidden'

		// Calculate required scale to prevent edge showing
		const movementRange = 30 // total movement (30% up + 30% down)
		const requiredScale = 1 + movementRange / 100

		gsap.set(image, {
			scale: requiredScale,
			transformOrigin: 'center center',
		})

		gsap.fromTo(
			image,
			{ yPercent: -30 },
			{
				yPercent: 30,
				ease: 'none',
				scrollTrigger: {
					trigger: con,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true,
				},
			}
		)
	})
}
