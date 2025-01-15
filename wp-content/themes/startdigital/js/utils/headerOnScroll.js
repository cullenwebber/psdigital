export default function initHeaderOnScroll() {
	const header = document.querySelector('header')
	if (!header) return
	let prevScrollpos = window.scrollY

	window.onscroll = function () {
		let currentScrollPos = window.scrollY

		toggleScrollActive()
		toggleScrollBackground()

		// TOGGLE HEADER VISIBILITY
		function toggleScrollActive() {
			if (currentScrollPos < 100) {
				header.classList.remove('header-scrolling')
			} else if (prevScrollpos > currentScrollPos) {
				header.classList.remove('header-scrolling')
			} else {
				header.classList.add('header-scrolling')
			}
		}

		prevScrollpos = currentScrollPos
	}
}
