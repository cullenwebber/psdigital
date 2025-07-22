import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import parallaxEffect from '../utils/parallax-images'

export default function initProjectAjax() {
	const projectGrid = document.querySelector('.project-grid')
	const categoryButtons = document.querySelectorAll('button')

	if (!projectGrid || !categoryButtons.length) return

	let currentPage = 1
	let currentCategory = 'all'
	let isLoading = false
	let hasMore = true
	let loadMoreButton = null
	let loadingOverlay = null

	// Create loading overlay with spinner
	function createLoadingOverlay() {
		if (loadingOverlay) return loadingOverlay

		loadingOverlay = document.createElement('div')
		loadingOverlay.className =
			'loading-overlay absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 opacity-0 pointer-events-none'
		loadingOverlay.innerHTML = `
			<div class="loading-spinner">
				<div class="w-8 h-8 border-3 border-gray-300 border-t-dark-blue rounded-full animate-spin"></div>
				<p class="text-dark-blue font-medium mt-3">Loading projects...</p>
			</div>
		`

		// Make project grid container relative if it isn't already
		if (getComputedStyle(projectGrid.parentNode).position === 'static') {
			projectGrid.parentNode.style.position = 'relative'
		}

		projectGrid.parentNode.appendChild(loadingOverlay)
		return loadingOverlay
	}

	// Show/hide loading overlay
	function toggleLoadingOverlay(show) {
		if (!loadingOverlay) {
			createLoadingOverlay()
		}

		if (show) {
			loadingOverlay.style.pointerEvents = 'auto'
			gsap.to(loadingOverlay, {
				opacity: 1,
				duration: 0.3,
				ease: 'power2.out',
			})
		} else {
			gsap.to(loadingOverlay, {
				opacity: 0,
				duration: 0.3,
				ease: 'power2.inOut',
				onComplete: () => {
					loadingOverlay.style.pointerEvents = 'none'
				},
			})
		}
	}

	// Create and insert Load More button
	function createLoadMoreButton() {
		if (loadMoreButton) return loadMoreButton

		loadMoreButton = document.createElement('button')
		loadMoreButton.className =
			'load-more-btn bg-dark-blue hover:bg-light-blue hover:text-dark-blue text-white items-center rounded-[12px] text-lg px-6 py-3 transition-all duration-300 ease-fancy col-span-2 mx-auto mt-8 opacity-0'
		loadMoreButton.innerHTML = `
			<span class="load-text">Load More Projects</span>
			<span class="loading-text hidden">Loading...</span>
		`

		// Insert after project grid
		projectGrid.parentNode.insertBefore(loadMoreButton, projectGrid.nextSibling)

		// Animate button in
		gsap.to(loadMoreButton, {
			opacity: 1,
			y: 0,
			duration: 0.5,
			ease: 'power2.out',
		})

		loadMoreButton.addEventListener('click', handleLoadMore)
		return loadMoreButton
	}

	// Update active button
	function updateActiveButton(activeButton) {
		categoryButtons.forEach((btn) => btn.classList.remove('active'))
		activeButton.classList.add('active')
	}

	// Get category from button
	function getCategoryFromButton(button) {
		const buttonText = button.textContent.trim().toLowerCase()
		if (buttonText === 'show all') {
			return 'all'
		}

		if (button.dataset.category) {
			return button.dataset.category
		}
	}

	// Toggle loading state for Load More button
	function toggleLoading(loading) {
		isLoading = loading
		if (loadMoreButton) {
			const loadText = loadMoreButton.querySelector('.load-text')
			const loadingText = loadMoreButton.querySelector('.loading-text')

			if (loading) {
				loadText.classList.add('hidden')
				loadingText.classList.remove('hidden')
				loadMoreButton.disabled = true
				loadMoreButton.style.opacity = '0.6'
			} else {
				loadText.classList.remove('hidden')
				loadingText.classList.add('hidden')
				loadMoreButton.disabled = false
				loadMoreButton.style.opacity = '1'
			}
		}
	}

	// Load projects via AJAX
	function loadProjects(page = 1, category = 'all', append = false) {
		if (isLoading) return

		// Show different loading states based on operation
		if (append) {
			toggleLoading(true) // Show Load More button loading
		} else {
			toggleLoadingOverlay(true) // Show overlay spinner for category filtering
		}

		const formData = new FormData()
		formData.append('action', 'load_projects')
		formData.append('page', page)
		formData.append('category', category)
		formData.append('nonce', project_ajax.nonce)

		fetch(project_ajax.ajax_url, {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				// Hide loading states
				toggleLoading(false)
				toggleLoadingOverlay(false)

				ScrollTrigger.killAll()

				if (data.success) {
					if (append) {
						// Create temporary container for new items
						const tempDiv = document.createElement('div')
						tempDiv.innerHTML = data.data.html
						const newItems = Array.from(tempDiv.children)

						// Set initial state for animation
						newItems.forEach((item) => {
							gsap.set(item, {
								opacity: 0,
								scale: 0.9,
							})
							projectGrid.appendChild(item)
						})
						parallaxEffect()
						// Animate new items in with stagger
						gsap.to(newItems, {
							opacity: 1,
							scale: 1,
							duration: 0.6,
							stagger: 0.1,
							ease: 'power2.out',
						})
					} else {
						// For category filtering, replace content with smooth transition
						projectGrid.innerHTML = data.data.html
						parallaxEffect()

						// Animate new content in
						const newItems = projectGrid.children
						gsap.set(newItems, {
							opacity: 0,
							scale: 0.9,
							y: 20,
						})

						gsap.to(newItems, {
							opacity: 1,
							scale: 1,
							y: 0,
							duration: 0.5,
							stagger: 0.1,
							ease: 'power2.out',
							delay: 0.1, // Small delay after overlay disappears
						})
					}

					hasMore = data.data.has_more
					currentPage = data.data.current_page

					// Handle Load More button visibility
					if (hasMore && page === 1) {
						createLoadMoreButton()
					} else if (hasMore && loadMoreButton) {
						// Show existing button
						gsap.to(loadMoreButton, {
							opacity: 1,
							duration: 0.3,
							ease: 'power2.out',
						})
					} else if (!hasMore && loadMoreButton) {
						// Hide Load More button and show end message
						gsap.to(loadMoreButton, {
							opacity: 0,
							duration: 0.3,
							ease: 'power2.inOut',
							onComplete: () => {
								loadMoreButton.style.display = 'none'
							},
						})
					}
				} else {
					console.error('Server error:', data.data || 'Unknown error')
				}
			})
			.catch((error) => {
				console.error('Network error:', error)
				toggleLoading(false)
				toggleLoadingOverlay(false)
			})
	}

	// Handle Load More button click
	function handleLoadMore() {
		if (!isLoading && hasMore) {
			currentPage++
			loadProjects(currentPage, currentCategory, true)
		}
	}

	// Category button handlers
	categoryButtons.forEach((button) => {
		button.addEventListener('click', function (e) {
			e.preventDefault()

			// Remove existing messages and load more button
			document.querySelector('.no-more-message')?.remove()
			if (loadMoreButton) {
				loadMoreButton.style.display = 'none'
				loadMoreButton = null
			}

			const category = getCategoryFromButton(button)

			if (category !== currentCategory) {
				currentCategory = category
				currentPage = 1
				hasMore = true

				updateActiveButton(button)
				loadProjects(1, category, false)
			}
		})
	})

	// Initialize
	categoryButtons[0]?.classList.add('active')

	// Load initial projects and create load more button if needed
	setTimeout(() => {
		if (hasMore) {
			createLoadMoreButton()
		}
	}, 500)

	// Cleanup function
	return () => {
		if (loadMoreButton) {
			loadMoreButton.removeEventListener('click', handleLoadMore)
			loadMoreButton.remove()
		}
		if (loadingOverlay) {
			loadingOverlay.remove()
		}
	}
}
