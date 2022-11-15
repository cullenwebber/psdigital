module.exports = {
	content: ['./*/*.php', './*.php', './templates/**/*.twig'],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1.5rem',
				sm: '2rem',
				md: '2rem',
				lg: '4rem',
				xl: '2rem',
				'2xl': '0rem',
			},
		},
		extend: {
			aspectRatio: {
				// '16/9': '16/9',
				// '3/2': '3/2',
				// '4/3': '4/3',
				// '3/4': '3/4',
			},
			colors: {
				// white: '#FFFFFF',
			},
			fontFamily: {
				// display: ['Inter', 'sans-serif'],
				// body: ['Inter', 'sans-serif'],
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1690px',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
