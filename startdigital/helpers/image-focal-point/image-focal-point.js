let screenSizes = ['desktop', 'mobile']
let positions = {
	desktop: { left: null, right: null },
	mobile: { left: null, right: null },
}
let currentScreen = 'desktop'
let bgX = null
let bgY = null
let centeredText = 'Centered (default)'
let imageWt = 0
let imageHt = 0
let containerHt = 0
let containerWt = 0

/**
 * Sets the background position values for each screen size based on the input field values.
 */
function setBgValues() {
	screenSizes.forEach((size) => {
		const inputElement = document.querySelector(`#bg_pos_${size}_id`)
		if (!inputElement.value) {
			return
		}

		const value = inputElement.value.replaceAll('%', '')
		positions[size].left = value.split(' ')[0]
		positions[size].right = value.split(' ')[1]
	})
}

/**
 * Cancels focus mode by hiding the media frame content, media sidebar, and overlay.
 * Resets the current screen to 'desktop'.
 */
function cancelFocus() {
	document
		.querySelectorAll('.media-frame-content,.media-sidebar')
		.forEach((element) => {
			element.classList.remove('show')
		})
	document.querySelector('.overlay').classList.remove('show')
	currentScreen = 'desktop'
}

/**
 * Closes the overlay and updates the background position values for the current screen.
 * If the position is not centered, it updates the displayed position values and button labels.
 */
function closeOverlay() {
	document
		.querySelectorAll('.media-frame-content,.media-sidebar')
		.forEach((element) => {
			element.classList.remove('show')
		})
	document.querySelector('.overlay').classList.remove('show')
	positions[currentScreen].left = bgX
	positions[currentScreen].right = bgY
	let inputElement = document.querySelector(`#bg_pos_${currentScreen}_id`)
	inputElement.value = `${bgX}% ${bgY}%`
	inputElement.dispatchEvent(new Event('change'))

	let screenValueElement = document.querySelector(`#${currentScreen}_value`)
	let labelElement = document.querySelector(`#label_${currentScreen}`)
	let resetElement = document.querySelector(`#reset_${currentScreen}`)

	if (bgX !== 50 && bgY !== 50) {
		screenValueElement.innerHTML = `<b>${currentScreen}</b>: ${bgX}% ${bgY}%`
		labelElement.setAttribute('value', 'Change')
		resetElement.style.display = 'block'
	} else {
		screenValueElement.innerHTML = `<b>${currentScreen}</b>: ${centeredText}`
		labelElement.setAttribute('value', 'Set')
	}

	currentScreen = 'desktop'
}

/**
 * Sets the focus for the selected screen size.
 * @param {string} screen - The screen size (default is 'desktop').
 */
function setFocus(screen = 'desktop') {
	currentScreen = screen
	document
		.querySelectorAll('.media-frame-content,.media-sidebar')
		.forEach((element) => {
			element.classList.add('show')
		})
	document
		.querySelectorAll('.media-toolbar,.media-menu-item')
		.forEach((element) => {
			element.style.zIndex = 0
		})
	setBgValues()
	document.querySelector('.overlay').classList.add('show')

	let container = document.querySelector('.image_focus_point .container')
	let image = document.querySelector('.image_focus_point img')
	containerHt = container.offsetHeight
	containerWt = container.offsetWidth
	imageWt = image.offsetWidth
	imageHt = image.offsetHeight

	let left =
		imageWt * (positions[currentScreen].left / 100) +
		(containerWt - imageWt) / 2
	let top =
		imageHt * (positions[currentScreen].right / 100) +
		(containerHt - imageHt) / 2
	document.querySelector('.pin').style.left = `${left}px`
	document.querySelector('.pin').style.top = `${top}px`
}

/**
 * Resets the focus point to the default centered position.
 * @param {string} screen - The screen size (default is 'desktop').
 */
function resetFocus(screen = 'desktop') {
	currentScreen = screen
	bgX = 50
	bgY = 50
	let pinElement = document.querySelector('.overlay .pin')
	pinElement.style.left = '50%'
	pinElement.style.top = '50%'
	document.querySelector(`#reset_${currentScreen}`).style.display = 'none'
	closeOverlay()
}

/**
 * Event listener for click events on the overlay container image.
 * Updates the background position based on the click coordinates.
 */
document.addEventListener('click', (e) => {
	if (!e.target.closest('.overlay .container img')) return

	let target = e.target.closest('.overlay .container img')
	let offset = target.getBoundingClientRect()

	let relX = e.pageX - offset.left
	let relY = e.pageY - offset.top
	bgX = Math.round((relX / imageWt) * 100)
	bgY = Math.round((relY / imageHt) * 100)

	let left = imageWt * (bgX / 100) + (containerWt - imageWt) / 2
	let top = imageHt * (bgY / 100) + (containerHt - imageHt) / 2

	document.querySelector('.pin').style.left = `${left}px`
	document.querySelector('.pin').style.top = `${top}px`
})
