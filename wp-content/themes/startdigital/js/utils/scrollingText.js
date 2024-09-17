import gsap from 'gsap'

export default function initScrollingText() {
	const scrollingText = document.querySelector('[data-scrolling-text]')

	if (!scrollingText) {
		return
	}

	gsap.to('.scrolling-text', {
		xPercent: -198,
		duration: 60,
		ease: 'none',
		repeat: -1,
	})
}
