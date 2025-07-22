import gsap from 'gsap'

export default function toggleMobileMenu() {
	const menuButtons = document.querySelectorAll('[data-toggle-menu]')
	const mainElement = document.querySelector('main')
	const staggerContainers = document.querySelectorAll('[data-stagger-items]')
	const mobileMenu = document.querySelector('[data-mobile-menu]') // Add this to your menu container

	menuButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const isOpening = !document.body.classList.contains('menu-open')
			// const hamburgerLines = btn.querySelectorAll('.lines')

			document.body.classList.toggle('menu-open')
			document.documentElement.classList.toggle('overflow-hidden')

			if (isOpening) {
				// Animate hamburger to cross
				// animateHamburgerToX(hamburgerLines)

				// Animate menu in
				gsap.set(mobileMenu, { visibility: 'visible' })
				gsap.fromTo(
					mobileMenu,
					{ opacity: 0, x: '100%' },
					{ opacity: 1, x: '0%', duration: 0.4, ease: 'power2.out' }
				)

				// Stagger menu items
				staggerContainers.forEach((stagger) => {
					const elementsStagger = gsap.utils.toArray(stagger.children)

					gsap.fromTo(
						elementsStagger,
						{ yPercent: 100, opacity: 0 },
						{
							yPercent: 0,
							opacity: 1,
							delay: 0.2,
							stagger: 0.06,
							duration: 0.5,
							ease: 'power2.out',
						}
					)
				})
			} else {
				// Animate cross back to hamburger
				animateXToHamburger(hamburgerLines)
				closeMenu()
			}
		})
	})

	mainElement.addEventListener('click', () => {
		if (document.body.classList.contains('menu-open')) {
			// Reset hamburger when closing via main click
			const menuButtons = document.querySelectorAll('[data-toggle-menu]')
			menuButtons.forEach((btn) => {
				const hamburgerLines = btn.querySelectorAll('.lines')
				animateXToHamburger(hamburgerLines)
			})
			closeMenu()
		}
	})

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
			// Reset hamburger when closing via Escape
			const menuButtons = document.querySelectorAll('[data-toggle-menu]')
			menuButtons.forEach((btn) => {
				const hamburgerLines = btn.querySelectorAll('.lines')
				animateXToHamburger(hamburgerLines)
			})
			closeMenu()
		}
	})
}

// Function to animate hamburger to X
function animateHamburgerToX(lines) {
	if (lines.length >= 3) {
		const tl = gsap.timeline()

		// Animate first line (top) - rotate and move to center
		tl.to(
			lines[0],
			{
				rotation: 45,
				y: 5, // Move down to center (3.5px gap + 1.5px line height)
				duration: 0.3,
				ease: 'power2.inOut',
			},
			0
		)

		// Animate middle line - fade out
		tl.to(
			lines[1],
			{
				opacity: 0,
				scale: 0,
				duration: 0.2,
				ease: 'power2.inOut',
			},
			0
		)

		// Animate third line (bottom) - rotate and move to center
		tl.to(
			lines[2],
			{
				rotation: -45,
				y: -5, // Move up to center
				duration: 0.3,
				ease: 'power2.inOut',
			},
			0
		)
	}
}

// Function to animate X back to hamburger
function animateXToHamburger(lines) {
	if (lines.length >= 3) {
		const tl = gsap.timeline()

		// Reset first line
		tl.to(
			lines[0],
			{
				rotation: 0,
				y: 0,
				duration: 0.3,
				ease: 'power2.inOut',
			},
			0
		)

		// Reset middle line
		tl.to(
			lines[1],
			{
				opacity: 1,
				scale: 1,
				duration: 0.2,
				ease: 'power2.inOut',
			},
			0.1
		)

		// Reset third line
		tl.to(
			lines[2],
			{
				rotation: 0,
				y: 0,
				duration: 0.3,
				ease: 'power2.inOut',
			},
			0
		)
	}
}

// ENHANCED MOBILE SUB MENU WITH ANIMATIONS
export function toggleMobileSubMenu() {
	const toggles = document.querySelectorAll('[data-toggle-mobile-sub-menu]')

	toggles.forEach((toggle) => {
		toggle.addEventListener('click', (e) => {
			e.preventDefault()
			e.stopPropagation()

			const parentEl = toggle.closest('[data-mobile-menu-item]')
			const subMenu = parentEl.querySelector('[data-mobile-sub-menu]')
			const icon = toggle.querySelector('svg') // Add this to your toggle icons

			if (!subMenu) return

			const isOpen = parentEl.classList.contains('submenu-open')

			// Close other open submenus first
			closeOtherSubmenus(parentEl)

			if (!isOpen) {
				// Open submenu
				parentEl.classList.add('submenu-open')
				toggle.setAttribute('aria-expanded', 'true')

				// Remove hidden class and set initial state
				subMenu.classList.remove('hidden')
				gsap.set(subMenu, { height: 'auto' })
				const height = subMenu.offsetHeight
				gsap.set(subMenu, { height: 0, opacity: 0, overflow: 'hidden' })

				// Animate in
				const tl = gsap.timeline()
				tl.to(subMenu, {
					height: height,
					duration: 0.5,
					ease: 'power2.inOut',
				}).to(
					subMenu,
					{
						opacity: 1,
						duration: 0.3,
						ease: 'power2.out',
					},
					'<=25%'
				)

				// Animate submenu items
				const subMenuItems = gsap.utils.toArray(subMenu.children)
				tl.fromTo(
					subMenuItems,
					{ yPercent: 100, opacity: 0 },
					{
						yPercent: 0,
						opacity: 1,
						stagger: 0.025,
						duration: 0.3,
						ease: 'power2.out',
					},
					'<=25%'
				)

				// Rotate icon
				if (icon) {
					gsap.to(icon, {
						rotation: 180,
						duration: 0.3,
						ease: 'power2.out',
					})
				}
			} else {
				// Close submenu
				const tl = gsap.timeline({
					onComplete: () => {
						subMenu.classList.add('hidden')
						parentEl.classList.remove('submenu-open')
						toggle.setAttribute('aria-expanded', 'false')
					},
				})

				tl.to(subMenu, {
					opacity: 0,
					duration: 0.3,
					ease: 'power2.in',
				}).to(
					subMenu,
					{
						height: 0,
						duration: 0.5,
						ease: 'power2.inOut',
					},
					'<=25%'
				)

				// Rotate icon back
				if (icon) {
					gsap.to(icon, {
						rotation: 0,
						duration: 0.3,
						ease: 'power2.out',
					})
				}
			}
		})
	})
}

// Helper function to close other open submenus
function closeOtherSubmenus(currentParent) {
	const allMenuItems = document.querySelectorAll(
		'[data-mobile-menu-item].submenu-open'
	)

	allMenuItems.forEach((item) => {
		if (item === currentParent) return

		const subMenu = item.querySelector('[data-mobile-sub-menu]')
		const toggle = item.querySelector('[data-toggle-mobile-sub-menu]')
		const icon = toggle?.querySelector('svg')

		if (subMenu) {
			const tl = gsap.timeline({
				onComplete: () => {
					subMenu.classList.add('hidden')
					item.classList.remove('submenu-open')
					toggle?.setAttribute('aria-expanded', 'false')
				},
			})

			tl.to(subMenu, {
				opacity: 0,
				height: 0,
				duration: 0.25,
				ease: 'power2.inOut',
			})

			if (icon) {
				gsap.to(icon, {
					rotation: 0,
					duration: 0.25,
					ease: 'power2.out',
				})
			}
		}
	})
}

export function closeMenu() {
	const mobileMenu = document.querySelector('[data-mobile-menu]')
	const staggerContainers = document.querySelectorAll('[data-stagger-items]')

	// Close all submenus first
	closeOtherSubmenus(null)

	// Animate menu out
	const tl = gsap.timeline({
		onComplete: () => {
			document.body.classList.remove('menu-open')
			document.documentElement.classList.remove('overflow-hidden')
			gsap.set(mobileMenu, { visibility: 'hidden' })
		},
	})

	// Animate stagger items out
	staggerContainers.forEach((stagger) => {
		const elementsStagger = gsap.utils.toArray(stagger.children)
		tl.to(
			elementsStagger,
			{
				yPercent: -100,
				opacity: 0,
				stagger: 0.03,
				duration: 0.2,
				ease: 'power2.in',
			},
			0
		)
	})

	// Animate main menu out
	tl.to(
		mobileMenu,
		{
			opacity: 0,
			x: '100%',
			duration: 0.3,
			ease: 'power2.in',
		},
		'-=0.1'
	)
}

// Initialize both functions
export function initMobileMenu() {
	toggleMobileMenu()
	toggleMobileSubMenu()
}
