import { initMobileMenu } from './components/menus'
import initAccordions from './components/accordions'
import animateOnScroll from './utils/animate-on-scroll'
import initRemoveLinks from './utils/removeLink'
import initHeaderOnScroll from './utils/headerOnScroll'
import infiniteScroller from './components/sliders/infinite-slider'
import initSmoothScrolling from './utils/lenis-init'
import initSwipers from './components/sliders/swiper'
import serviceScroll from './components/service-scroll'
import parallaxEffect from './utils/parallax-images'
import initFooterPhysics from './components/footer-physics'
import { createTestimonialSwiper } from './components/sliders/testimonial-slider'
import initProjectAjax from './components/ajax-projects'
import initStripeGradient from './components/three/stripe-gradient'
import infiniteImageSlider from './components/infinite-slider'
import initVideoOverlay from './components/video-fullscreen'

document.addEventListener('DOMContentLoaded', () => {
	animateOnScroll()
	initMobileMenu()
	initVideoOverlay()
	initAccordions()
	initRemoveLinks()
	initHeaderOnScroll()
	initSmoothScrolling()
	infiniteScroller()
	initSwipers()
	initProjectAjax()
	serviceScroll()
	parallaxEffect()
	infiniteImageSlider()
	createTestimonialSwiper()
	initStripeGradient()
	initFooterPhysics()
})
