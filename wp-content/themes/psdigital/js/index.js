import initMenus from './components/menus'
import initAccordions from './components/accordions'
import animateOnScroll from './utils/animate-on-scroll'
import initRemoveLinks from './utils/removeLink'
import initHeaderOnScroll from './utils/headerOnScroll'
import infiniteScroller from './components/sliders/infinite-slider'
import initSmoothScrolling from './utils/lenis-init'
import initSwipers from './components/sliders/swiper'
import serviceScroll from './components/service-scroll'
import parallaxEffect from './utils/parallax-images'
import createGradient from './components/gradient'
import initFooterPhysics from './components/footer-physics'
import { createTestimonialSwiper } from './components/sliders/testimonial-slider'

document.addEventListener('DOMContentLoaded', () => {
	animateOnScroll()
	initMenus()
	initAccordions()
	initRemoveLinks()
	initHeaderOnScroll()
	initSmoothScrolling()
	infiniteScroller()
	initSwipers()
	serviceScroll()
	parallaxEffect()
	createGradient()
	initFooterPhysics()
	createTestimonialSwiper()
})
