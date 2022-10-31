/**
 * Apply animations to elements
 */
export default function initAnimateOnScroll() {
	const elements = document.querySelectorAll('[data-animate]')

	elements.forEach((element) => {
		const settings = {
			scrollTrigger: {
				trigger: element,
				start: 'top bottom-=5%',
			},
			y: -16,
		}

		// Animation time
		gsap.from(element, settings)
	})
}
