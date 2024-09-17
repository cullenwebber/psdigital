import animateOnScroll from './utils/animate-on-scroll'
import initAccordions from './components/accordions'
import initSliders from './components/sliders'
import initScrollingText from './utils/scrollingText'
import initRemoveLinks from './utils/removeLink'
import initMenus from './components/menu'

document.addEventListener('DOMContentLoaded', () => {
	animateOnScroll()
	initMenus()
	initSliders()
	initScrollingText()
	initAccordions()
	initRemoveLinks()
})
