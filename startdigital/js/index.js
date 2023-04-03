// import AjaxContent from '../ajax/ajax'
import animateOnScroll from './utils/animate-on-scroll'
import initAccordions from './components/initAccordions'

document.addEventListener('DOMContentLoaded', () => {
	toggleMenu()
	toggleMobileSubMenu()
	animateOnScroll()
	loadAjaxPosts()

	if (document.querySelector('.scrolling-text')) {
		scrollingText()
	}

	if (document.querySelector('.accordion')) {
		initAccordions()
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
 * Load posts via ajax into a container
 */
function loadAjaxPosts() {
	if (!document.querySelector('[data-posts-container]')) {
		return
	}

	const posts = new AjaxContent({
		container: '[data-posts-container]',
		item_template: 'ajax/post.twig',
		query: {
			post_type: 'post',
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
}
