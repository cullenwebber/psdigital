import gsap from 'gsap'

export default function initMenus() {
	toggleMenu()
	toggleMobileSubMenu()

	// TOGGLE STATE OF MOBILE MENU
	function toggleMenu() {
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

		mainElement.addEventListener('click', () => {
			if (document.body.classList.contains('menuIsOpen')) {
				closeMenu()
			}
		})

		document.addEventListener('keydown', (e) => {
			if (
				e.key === 'Escape' &&
				document.body.classList.contains('menuIsOpen')
			) {
				closeMenu()
			}
		})
	}

	// TOGGLE THE MOBILE SUB MENU
	function toggleMobileSubMenu() {
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
}

export function closeMenu() {
	document.body.classList.remove('menuIsOpen')
	document.documentElement.classList.remove('overflow-hidden')
}
