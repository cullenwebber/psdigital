import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function parallaxEffect() {
	const containers = document.querySelectorAll('[parallax-effect]')
	if (!containers.length) return

	containers.forEach((con) => {
		const image = con.querySelector('img')
		image.style.willChange = 'transform'
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
