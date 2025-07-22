import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from '../../utils/lenis-init'

export default function infiniteScroller() {
	const infiniteScrollerContainers = document.querySelectorAll(
		'[data-infinite-scroll]'
	)

	if (!infiniteScrollerContainers.length > 0) return

	let tlArray = []

	infiniteScrollerContainers.forEach((cont) => {
		const innerScroller = cont.querySelectorAll('[data-infinite-inner]')

		const tl_marquee = gsap.timeline({ repeat: -1 }).to(innerScroller, {
			duration: cont.dataset?.infiniteScroll || 15,
			xPercent: -100,
			ease: 'linear',
		})

		tlArray.push(tl_marquee)
	})

	ScrollTrigger.create({
		trigger: document.body,
		start: 'top top',
		end: 'max',
		onUpdate: (self) => {
			let velo = getLenis().velocity
			const direction = velo < 0 ? -1 : 1

			if (Math.abs(velo) < 0.01) {
				velo = 0.01
			}
			velo = gsap.utils.clamp(-25, velo, 25)

			tlArray.forEach((tl) => {
				tl.timeScale(direction * (1 + Math.abs(velo)))
			})
		},
	})
}
