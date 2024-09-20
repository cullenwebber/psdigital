import animateOnScroll from './utils/animate-on-scroll'
import initAccordions from './components/accordions'
import initSliders from './components/sliders/sliders'
import initRemoveLinks from './utils/removeLink'
import initMenus from './components/menu'

document.addEventListener('DOMContentLoaded', () => {
	animateOnScroll()
	initMenus()
	initSliders()
	initAccordions()
	initRemoveLinks()
})
