import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function serviceScroll() {
	const serviceContainer = document.querySelector('#service-container')
	if (!serviceContainer) return

	const services = gsap.utils.toArray('.service-fullwidth')

	let tl = gsap.timeline({
		scrollTrigger: {
			trigger: serviceContainer,
			start: 'top top',
			end: () => `+=${services.length * 100}%`,
			scrub: true,
			pin: true,
		},
	})

	services.forEach((service, index) => {
		if (index === 0) return

		tl.fromTo(
			service,
			{
				y: '100lvh',
			},
			{
				y: 0,
				delay: 0.05,
				ease: 'power2.inOut',
			}
		)
			.to(
				services[index - 1]?.querySelector('.image-overlay'),
				{
					opacity: 1,
					ease: 'power2.inOut',
				},
				'<='
			)
			.to(
				services[index - 1],
				{
					scale: 0.8,
					ease: 'power2.inOut',
				},
				'<='
			)
	})
}
