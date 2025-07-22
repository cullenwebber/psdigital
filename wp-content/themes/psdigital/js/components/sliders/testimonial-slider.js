import { gsap } from 'gsap'

/**
 * Creates a testimonial swiper with simple fade animations
 * @param {string} containerSelector - The selector for the testimonials container
 * @param {Object} options - Configuration options
 */
export function createTestimonialSwiper(
	containerSelector = '#testimonials-home-inner',
	options = {}
) {
	// Early returns for missing elements
	const container = document.querySelector(containerSelector)
	if (!container) {
		return
	}

	const testimonials = container.querySelectorAll('[data-testimonial]')
	if (testimonials.length === 0) {
		return null
	}

	// Navigation buttons
	const prevButtons = container.querySelectorAll('.prev')
	const nextButtons = container.querySelectorAll('.next')

	// Early return if navigation buttons are missing
	if (!prevButtons || !nextButtons) {
		return null
	}

	// Default configuration
	const config = {
		autoplayDelay: 5000,
		animationDuration: 0.5,
		stagger: 0.05,
		ease: 'power2.out',
		...options,
	}

	// State management
	let currentIndex = 0
	let isAnimating = false
	let autoplayTimer = null

	/**
	 * Gets all animatable elements for a testimonial
	 */
	function getTestimonialElements(testimonial) {
		return {
			content: testimonial.querySelector('[data-testimonial-content]'),
			services: testimonial.querySelectorAll(
				'[data-testimonial-services] span'
			),
			title: testimonial.querySelector('[data-testimonial-title]'),
			jobTitle: testimonial.querySelector('[data-testimonial-job-title]'),
			logo: testimonial.querySelector('[data-testimonial-logo]'),
			separator: testimonial.querySelector('.seperator'),
			buttons: testimonial.querySelectorAll('.btn-wrapper'),
		}
	}

	/**
	 * Sets initial states for all testimonials
	 */
	function setInitialStates() {
		testimonials.forEach((testimonial, index) => {
			const elements = getTestimonialElements(testimonial)

			// Hide all testimonials except the first one using visibility
			if (index !== 0) {
				gsap.set(testimonial, {
					visibility: 'hidden',
					opacity: 0,
				})
			} else {
				gsap.set(testimonial, {
					visibility: 'visible',
					opacity: 1,
				})
			}

			// Set initial states for all elements
			const elementsToAnimate = [
				elements.content,
				elements.title,
				elements.jobTitle,
				elements.logo,
				elements.separator,
				elements.buttons,
				...Array.from(elements.services || []),
			].filter(Boolean)

			elementsToAnimate.forEach((element) => {
				gsap.set(element, {
					opacity: 0,
					y: 30,
					scale: 0.95,
				})
			})
		})
	}

	/**
	 * Animates testimonial elements in
	 */
	function animateTestimonialIn(index) {
		const testimonial = testimonials[index]
		const elements = getTestimonialElements(testimonial)

		const tl = gsap.timeline()

		// Show the testimonial container
		tl.set(testimonial, {
			visibility: 'visible',
			opacity: 1,
		})

		// Animate logo first
		if (elements.logo) {
			tl.to(
				elements.logo,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.8,
					ease: config.ease,
				},
				0.1
			)
		}

		// Animate content
		if (elements.content) {
			tl.to(
				elements.content,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration,
					ease: config.ease,
				},
				0.2
			)
		}

		// Animate services with stagger
		if (elements.services && elements.services.length > 0) {
			tl.to(
				Array.from(elements.services),
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.8,
					stagger: config.stagger * 0.5,
					ease: config.ease,
				},
				0.4
			)
		}

		// Animate the separator line
		if (elements.separator) {
			tl.to(
				elements.separator,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.7,
					ease: config.ease,
				},
				0.3
			)
		}
		// Animate the separator line
		if (elements.buttons) {
			tl.to(
				elements.buttons,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.7,
					ease: config.ease,
				},
				0.3
			)
		}

		// Animate title
		if (elements.title) {
			tl.to(
				elements.title,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.8,
					ease: config.ease,
				},
				0.5
			)
		}

		// Animate job title
		if (elements.jobTitle) {
			tl.to(
				elements.jobTitle,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: config.animationDuration * 0.8,
					ease: config.ease,
				},
				0.6
			)
		}

		return tl
	}

	/**
	 * Animates testimonial elements out
	 */
	function animateTestimonialOut(index) {
		const testimonial = testimonials[index]
		const elements = getTestimonialElements(testimonial)

		const tl = gsap.timeline()

		// Animate out job title first
		if (elements.jobTitle) {
			tl.to(elements.jobTitle, {
				opacity: 0,
				y: -20,

				duration: config.animationDuration * 0.6,
				ease: config.ease,
			})
		}

		// Animate out title
		if (elements.title) {
			tl.to(
				elements.title,
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.6,
					ease: config.ease,
				},
				'-=0.4'
			)
		}

		// Animate out separator line
		if (elements.separator) {
			tl.to(
				elements.separator,
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.5,
					ease: config.ease,
				},
				'-=0.4'
			)
		}

		if (elements.buttons) {
			tl.to(
				elements.buttons,
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.5,
					ease: config.ease,
				},
				'-=0.4'
			)
		}

		// Animate out services
		if (elements.services && elements.services.length > 0) {
			tl.to(
				Array.from(elements.services),
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.5,
					stagger: config.stagger * 0.3,
					ease: config.ease,
				},
				'-=0.4'
			)
		}

		// Animate out content
		if (elements.content) {
			tl.to(
				elements.content,
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.7,
					ease: config.ease,
				},
				'-=0.5'
			)
		}

		// Animate out logo
		if (elements.logo) {
			tl.to(
				elements.logo,
				{
					opacity: 0,
					y: -20,

					duration: config.animationDuration * 0.5,
					ease: config.ease,
				},
				'-=0.5'
			)
		}

		// Hide testimonial container at the end
		tl.set(testimonial, {
			visibility: 'hidden',
			opacity: 0,
		})

		return tl
	}

	/**
	 * Transitions between testimonials
	 */
	function transitionToTestimonial(newIndex) {
		if (isAnimating || newIndex === currentIndex) return

		isAnimating = true
		clearTimeout(autoplayTimer)

		const masterTl = gsap.timeline({
			onComplete: () => {
				isAnimating = false
				startAutoplay()
			},
		})

		// Animate current testimonial out
		const outTl = animateTestimonialOut(currentIndex)
		masterTl.add(outTl)

		// Animate new testimonial in with slight overlap
		const inTl = animateTestimonialIn(newIndex)
		masterTl.add(inTl, '-=0.2')

		currentIndex = newIndex
	}

	/**
	 * Goes to next testimonial
	 */
	function nextTestimonial() {
		const nextIndex = (currentIndex + 1) % testimonials.length
		transitionToTestimonial(nextIndex)
	}

	/**
	 * Goes to previous testimonial
	 */
	function prevTestimonial() {
		const prevIndex =
			(currentIndex - 1 + testimonials.length) % testimonials.length
		transitionToTestimonial(prevIndex)
	}

	/**
	 * Goes to specific testimonial
	 */
	function goToTestimonial(index) {
		if (index >= 0 && index < testimonials.length) {
			transitionToTestimonial(index)
		}
	}

	/**
	 * Starts autoplay functionality
	 */
	function startAutoplay() {
		if (config.autoplayDelay > 0) {
			autoplayTimer = setTimeout(() => {
				nextTestimonial()
			}, config.autoplayDelay)
		}
	}

	/**
	 * Stops autoplay functionality
	 */
	function stopAutoplay() {
		clearTimeout(autoplayTimer)
	}

	/**
	 * Event handlers
	 */
	const handleNext = (e) => {
		e.preventDefault()
		e.stopPropagation()
		nextTestimonial()
	}

	const handlePrev = (e) => {
		e.preventDefault()

		prevTestimonial()
	}

	/**
	 * Initializes the testimonial swiper
	 */
	function init() {
		// Set initial states
		setInitialStates()

		// Animate in the first testimonial
		const initialTl = animateTestimonialIn(0)
		initialTl.play()

		// Add event listeners
		nextButtons.forEach((btn) => btn.addEventListener('click', handleNext))
		prevButtons.forEach((btn) => btn.addEventListener('click', handlePrev))

		// Pause autoplay on hover
		container.addEventListener('mouseenter', stopAutoplay)
		container.addEventListener('mouseleave', startAutoplay)

		// Start autoplay
		startAutoplay()
	}

	/**
	 * Destroys the swiper instance
	 */
	function destroy() {
		stopAutoplay()

		// Remove event listeners
		if (nextButton && prevButton) {
			nextButton.removeEventListener('click', handleNext)
			prevButton.removeEventListener('click', handlePrev)
		}

		container.removeEventListener('mouseenter', stopAutoplay)
		container.removeEventListener('mouseleave', startAutoplay)

		// Reset all testimonials to initial state
		testimonials.forEach((testimonial) => {
			gsap.set(testimonial, { clearProps: 'all' })

			const elements = getTestimonialElements(testimonial)
			const elementsToReset = [
				elements.content,
				elements.title,
				elements.jobTitle,
				elements.logo,
				elements.separator,
				...Array.from(elements.services || []),
			].filter(Boolean)

			elementsToReset.forEach((element) => {
				gsap.set(element, { clearProps: 'all' })
			})
		})
	}

	// Initialize the swiper
	init()

	// Return public API
	return {
		goToTestimonial,
		nextTestimonial,
		prevTestimonial,
		startAutoplay,
		stopAutoplay,
		destroy,
		getCurrentIndex: () => currentIndex,
		getTestimonialCount: () => testimonials.length,
	}
}
