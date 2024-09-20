import animateOnScroll from './utils/animate-on-scroll'
import initAccordions from './components/accordions'
import initSliders from './components/sliders'
import initRemoveLinks from './utils/removeLink'
import initMenus from './components/menu'
import initInfiniteScroll from './utils/infiniteScroll'

document.addEventListener('DOMContentLoaded', () => {
	animateOnScroll()
	initMenus()
	initSliders()
	initInfiniteScroll()
	initAccordions()
	initRemoveLinks()
})
