export default class AjaxContent {
	constructor({ container = '[data-posts-container]', query = {} } = {}) {
		this.container = document.querySelector(container)
		this.page = parseInt(this.container.getAttribute('data-page'))
		this.query = this.createQueryObject(query)

		this.fetch()
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
			},
			success: ({ success, data }) => {
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
}
