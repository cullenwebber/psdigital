import AjaxContent from '../ajax/ajax'
import animateOnScroll from './utils/animate-on-scroll'
import horizontalLoop from './utils/horizontal-loop'
import gsap from 'gsap'

document.addEventListener('DOMContentLoaded', () => {
	toggleMenu()
	toggleMobileSubMenu()
	animateOnScroll()

	const posts = new AjaxContent({
		container: '[data-posts-container]',
		item_template: 'ajax/post.twig',
		query: {
			post_type: 'post',
			post_status: 'publish',
			posts_per_page: 5,
		},
	})

	const pages = new AjaxContent({
		container: '[data-page-container]',
		query: {
			post_type: 'page',
			post_status: 'publish',
			posts_per_page: 5,
		},
	})

	document.querySelectorAll('[data-category]').forEach((button) => {
		const category = button.getAttribute('data-category')
		button.addEventListener('click', () => {
			posts.update({
				tax_query: {
					0: {
						taxonomy: 'category',
						field: 'slug',
						terms: category,
					},
				},
			})
		})
	})

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
 * Make the scrolling tepxt component do its thing
 */
function scrollingText() {
	const textElements = gsap.utils.toArray('.scrolling-text')

	// Setup the tween
	const loop = horizontalLoop(textElements, {
		repeat: -1, // Makes sure the tween runs infinitely
		duration: 10,
		speed: 0.5,
	})

	loop.play()
}
