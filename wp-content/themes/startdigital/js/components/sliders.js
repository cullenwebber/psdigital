import Swiper from 'swiper/bundle'

export default function initSliders() {
	if (document.querySelector('.simple-slider')) {
		document.querySelectorAll('.simple-slider').forEach((slider) => {
			const simpleSlider = new Swiper(slider, {
				direction: 'horizontal',
				loop: true,
				speed: 500,
				slidesPerView: 1,
				spaceBetween: 40,
				pagination: {
					el: '.swiper-pagination',
					type: 'bullets',
				},
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev',
				},
			})
		})
	}
}
