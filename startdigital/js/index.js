import debounce from './utils/debounce'
import animateOnScroll from './utils/animate-on-scroll'
import horizontalLoop from './utils/horizontal-loop'
import gsap from 'gsap'

document.addEventListener('DOMContentLoaded', () => {
	toggleMenu()
	toggleMobileSubMenu()
	shrinkLogoOnScroll()
	animateOnScroll()

	if (document.querySelector('.scrolling-text')) {
		scrollingText()
	}
})

/**
 * Toggle the state of the mobile menu
 *
 * @returns void
 */
const toggleMenu = () => {
	const menuButtons = document.querySelectorAll('[data-toggle-menu]')

	menuButtons.forEach((btn) => {
		btn.addEventListener('click', () =>
			document.body.classList.toggle('menuIsOpen')
		)
	})
}

/**
 * Toggles the mobile sub menu
 *
 * @returns void
 */
const toggleMobileSubMenu = () => {
	const toggles = document.querySelectorAll('[data-toggle-mobile-sub-menu]')

	toggles.forEach((toggle) => {
		toggle.addEventListener('click', () => {
			const parentEl = toggle.closest('[data-mobile-menu-item]')
			const subMenu = parentEl.querySelector('[data-mobile-sub-menu]')

			// Doesn't exist, bail early
			if (!subMenu) {
				return
			}

			subMenu.classList.toggle('hidden')
		})
	})
}

/**
 * Do some funky animation to the logo so it fits inside a fixed header
 */
function shrinkLogoOnScroll() {
	const logo = document.querySelector('[data-logo]')
	const scrollingText = document.querySelector('header [data-scrolling-text]')
	const header = document.querySelector('header')

	window.addEventListener(
		'scroll',
		debounce(() => {
			// If scrolling text, keep the navigation relative until scroll occurs
			if (scrollingText && window.scrollY < scrollingText?.scrollHeight) {
				logo.style.transform = 'scale(1.5)'
				header.classList.remove('shadow-sm')
			} else if (!scrollingText && window.scrollY < 50) {
				logo.style.transform = 'scale(1.5)'
				header.classList.remove('shadow-sm')
			} else {
				logo.style.transform = 'scale(1)'
				header.classList.add('shadow-sm')
			}
		}),
		50
	)
}

/**
 * Make the scrolling tepxt component do its thing
 */
function scrollingText() {
	const textElements = gsap.utils.toArray('.scrolling-text')

	// Setup the tween
	const loop = horizontalLoop(textElements, {
		repeat: -1, // Makes sure the tween runs infinitely
		duration: 10,
	})

	loop.play()
}
