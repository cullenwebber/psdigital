import gsap from 'gsap'
import { Swiper } from 'swiper/bundle'
import { Navigation } from 'swiper/modules'

export default function initSwipers() {
	teamSwiper()
}

function teamSwiper() {
	const teamSection = document.querySelectorAll('.team-swiper')

	if (!teamSection.length > 0) return

	teamSection.forEach((section) => {
		const swiperContainer = section.querySelector('.swiper')
		if (!swiperContainer) return

		const sliderCards = section.querySelectorAll('article')
		const swiperNext = section.querySelector('.next')
		const swiperPrev = section.querySelector('.prev')

		const swiper = new Swiper(swiperContainer, {
			slidesPerView: 1,
			spaceBetween: 16,
			modules: [Navigation],
			navigation: {
				nextEl: swiperNext,
				prevEl: swiperPrev,
			},
			breakpoints: {
				640: {
					slidesPerView: 1,
				},
				768: {
					slidesPerView: 2,
				},
				1024: {
					slidesPerView: 2,
				},
			},
			on: {
				sliderFirstMove: () => {
					gsap.to(sliderCards, {
						scale: 0.9,
						ease: 'power2.out',
						duration: 0.25,
					})
				},
				touchEnd: () => {
					gsap.to(sliderCards, {
						scale: 1,
						ease: 'power2.inOut',
						duration: 0.25,
					})
				},
			},
		})
	})
}
