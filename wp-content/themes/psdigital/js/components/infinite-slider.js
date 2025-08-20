import gsap from 'gsap'
import horizontalLoop from '../utils/horizontal-loop'

export default function infiniteImageSlider() {
	const container = document.querySelector('#infinite-image-slider')

	if (!container) return
	const images = gsap.utils.toArray('[data-infinite-images]')

	const loop = horizontalLoop(images, {
		repeat: -1,
	})
}
