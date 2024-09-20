// USING EMBLA CAROUSEL
// DOCS: https://www.embla-carousel.com/get-started/module

import EmblaCarousel from 'embla-carousel'
import AutoScroll from 'embla-carousel-auto-scroll'

export default function initInfiniteScroll() {
	const emblaNode = document.querySelector('.embla')
	const viewportNode = emblaNode.querySelector('.embla__viewport')

	if (!emblaNode) {
		return
	}

	const options = { loop: true }
	EmblaCarousel(viewportNode, options, [
		AutoScroll({
			stopOnInteraction: false,
			speed: 2,
		}),
	])
}
