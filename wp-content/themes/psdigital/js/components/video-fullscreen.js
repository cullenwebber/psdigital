import { gsap } from 'gsap'

/**
 * Fullscreen Video Overlay Controller
 * Handles opening/closing fullscreen video overlays with smooth animations
 */
class VideoOverlayController {
	constructor() {
		this.overlay = null
		this.fullscreenVideo = null
		this.originalVideo = null
		this.isOpen = false

		this.init()
	}

	/**
	 * Initialize the controller
	 */
	init() {
		if (!this.cacheElements()) return

		this.bindEvents()
		this.setupAccessibility()
	}

	/**
	 * Cache DOM elements
	 * @returns {boolean} Success status
	 */
	cacheElements() {
		this.overlay = document.getElementById('video-overlay')
		this.fullscreenVideo = document.getElementById('fullscreen-video')
		this.originalVideo = document.getElementById('about-video')

		if (!this.overlay || !this.fullscreenVideo || !this.originalVideo) {
			console.warn('VideoOverlayController: Required elements not found')
			return false
		}

		return true
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Open overlay when clicking video container
		const videoTrigger = document.getElementById('about-video-trigger')
		if (videoTrigger) {
			videoTrigger.addEventListener('click', this.handleVideoClick.bind(this))
		}

		// Close overlay events
		const closeBtn = document.getElementById('close-video')
		if (closeBtn) {
			closeBtn.addEventListener('click', this.handleCloseClick.bind(this))
		}

		// Close on overlay background click
		this.overlay.addEventListener('click', this.handleOverlayClick.bind(this))

		// Keyboard events
		document.addEventListener('keydown', this.handleKeydown.bind(this))
	}

	/**
	 * Setup accessibility features
	 */
	setupAccessibility() {
		this.overlay.setAttribute('role', 'dialog')
		this.overlay.setAttribute('aria-modal', 'true')
		this.overlay.setAttribute('aria-label', 'Fullscreen video player')

		// Make video trigger keyboard accessible
		const videoTrigger = document.getElementById('about-video-trigger')
		if (videoTrigger) {
			videoTrigger.setAttribute('role', 'button')
			videoTrigger.setAttribute('tabindex', '0')
			videoTrigger.setAttribute('aria-label', 'Open video in fullscreen')

			videoTrigger.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					this.handleVideoClick()
				}
			})
		}
	}

	/**
	 * Handle video click/tap
	 */
	handleVideoClick() {
		if (this.isOpen) return

		this.openOverlay()
	}

	/**
	 * Handle close button click
	 * @param {Event} e
	 */
	handleCloseClick(e) {
		e.stopPropagation()
		this.closeOverlay()
	}

	/**
	 * Handle overlay background click
	 * @param {Event} e
	 */
	handleOverlayClick(e) {
		if (e.target === this.overlay) {
			this.closeOverlay()
		}
	}

	/**
	 * Handle keyboard events
	 * @param {KeyboardEvent} e
	 */
	handleKeydown(e) {
		if (!this.isOpen) return

		if (e.key === 'Escape') {
			this.closeOverlay()
		}
	}

	/**
	 * Open the fullscreen overlay
	 */
	openOverlay() {
		if (this.isOpen) return

		// Copy video source
		this.fullscreenVideo.src = this.originalVideo.src
		this.fullscreenVideo.currentTime = this.originalVideo.currentTime

		// Pause original video
		this.originalVideo.pause()

		// Show overlay
		this.overlay.classList.add('active')
		document.body.classList.add('video-overlay-open')

		// Focus management for accessibility
		const closeBtn = document.getElementById('close-video')
		if (closeBtn) {
			closeBtn.focus()
		}

		// GSAP animation
		gsap.fromTo(
			this.overlay,
			{
				opacity: 0,
			},
			{
				opacity: 1,
				duration: 0.5,
				ease: 'power2.out',
			}
		)

		gsap.fromTo(
			this.fullscreenVideo,
			{
				scale: 0.8,
				opacity: 0,
			},
			{
				scale: 1,
				opacity: 1,
				duration: 0.6,
				ease: 'power2.out',
				onComplete: () => {
					// Autoplay the video after animation completes
					this.fullscreenVideo.play().catch((error) => {
						console.warn('Autoplay was prevented:', error)
						// Fallback: show play button or handle autoplay restriction
					})
				},
			}
		)

		this.isOpen = true
	}

	/**
	 * Close the fullscreen overlay
	 */
	closeOverlay() {
		if (!this.isOpen) return

		// GSAP animation out
		gsap.to(this.overlay, {
			opacity: 0,
			duration: 0.4,
			ease: 'power2.in',
			onComplete: () => {
				this.overlay.classList.remove('active')
				document.body.classList.remove('video-overlay-open')

				// Clean up
				this.fullscreenVideo.pause()
				this.fullscreenVideo.src = ''

				// Resume original video if it was playing
				if (!this.originalVideo.paused) {
					this.originalVideo.play()
				}
			},
		})

		gsap.to(this.fullscreenVideo, {
			scale: 0.8,
			opacity: 0,
			duration: 0.3,
			ease: 'power2.in',
		})

		this.isOpen = false
	}
}

const initVideoOverlay = () => {
	const video = document.getElementById('about-video')
	if (!video) return

	new VideoOverlayController()
}

export default initVideoOverlay
