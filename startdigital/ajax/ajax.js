export default class AjaxContent {
	constructor({
		container = '[data-posts-container]',
		query = {},
		item_template = 'ajax/item.twig',
	} = {}) {
		if (!document.querySelector(container)) {
			return
		}

		// Setters
		this.container = document.querySelector(container)
		this.page = parseInt(this.container.getAttribute('data-page'))
		this.query = this.createQueryObject(query)
		this.item_template = item_template
		this.loader = this.container.parentElement.querySelector('[data-loader]')

		this.setLoading(true)

		// Emulate slow fetch
		setTimeout(() => {
			this.fetch()
		}, 1000)
	}

	/**
	 * Fetch the data using the provided query
	 */
	fetch() {
		jQuery.ajax({
			type: 'get',
			dataType: 'json',
			url: sd_ajax.ajax_url,
			data: {
				action: 'sd_ajax_fetch',
				page: this.page,
				query: this.query,
				item_template: this.item_template,
			},
			success: ({ success, data }) => {
				this.setLoading(false)

				if (!success) {
					return 'Failed'
				}

				// // Add the new posts to the container
				// const container = document.querySelector('[data-products-container]')
				this.container.innerHTML += data.content

				// Either up the page number or hide the button if no more posts to show
				// if (currentlyShowing < data.total) {
				// 	loadMore.setAttribute('data-page', page + 1)
				// 	loadMore.style.display = 'block'
				// } else {
				// 	loadMore.style.display = 'none'
				// }
			},
		})
	}

	/**
	 * Increment the page number
	 */
	incrementPage() {
		this.page += 1
	}

	/**
	 * Create the args to pass to the WP_Query
	 */
	createQueryObject(query) {
		return JSON.stringify(query)
	}

	/**
	 * Sets the loader state
	 */
	setLoading(isLoading) {
		if (!this.loader) {
			return
		}

		isLoading
			? this.loader.classList.remove('hidden')
			: this.loader.classList.add('hidden')
	}
}
