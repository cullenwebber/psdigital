// import AjaxContent from '../ajax/ajax'
import animateOnScroll from './utils/animate-on-scroll'
import initAccordions from './components/accordions'
import initSliders from './components/sliders'

document.addEventListener('DOMContentLoaded', () => {
	toggleMenu()
	toggleMobileSubMenu()
	animateOnScroll()
	loadAjaxPosts()
	initSliders()

	if (document.querySelector('.scrolling-text')) {
		scrollingText()
	}

	if (document.querySelector('.accordion')) {
		initAccordions()
	}

	// REMOVE DEFAULT ACTION AND LINK FROM PARENT NAVIGATION ITEMS

	if (document.querySelector('.no-link')) {
		const noLink = document.querySelectorAll('.no-link > a')

		noLink.forEach((link) => {
			link.removeAttribute('href')

			link.addEventListener('click', (e) => {
				e.preventDefault()
			})
		})
	}
})

/**
 * Toggle the state of the mobile menu
 *
 * @returns void
 */
const toggleMenu = () => {
	const menuButtons = document.querySelectorAll('[data-toggle-menu]')
	const mainElement = document.querySelector('main')
	const staggerContainers = document.querySelectorAll(
		'[data-animate-stagger-menu]'
	)

	menuButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			document.body.classList.toggle('menuIsOpen')
			document.documentElement.classList.toggle('overflow-hidden')

			if (document.body.classList.contains('menuIsOpen')) {
				staggerContainers.forEach((stagger) => {
					const elementsStagger = gsap.utils.toArray(stagger.children)

					gsap.from(elementsStagger, {
						y: 20,
						opacity: 0,
						delay: 0.5,
						stagger: 0.1,
					})
				})
			}
		})
	})

	const closeMenu = () => {
		document.body.classList.remove('menuIsOpen')
		document.documentElement.classList.remove('overflow-hidden')
	}

	mainElement.addEventListener('click', () => {
		if (document.body.classList.contains('menuIsOpen')) {
			closeMenu()
		}
	})

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && document.body.classList.contains('menuIsOpen')) {
			closeMenu()
		}
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
