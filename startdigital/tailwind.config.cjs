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
			colors: {
				mocha: '#9F877E',
				wood: '#B77B65',
				brown: '#D97A3B',
				'dark-brown': '#707070',
				cyan: '#BDF5F5',
				cream: '#F5F5F5',
				grey: '#E7E7E2',
				champagne: '#E7E7E2',
				amber: '#703824',
				'olive-green': '#2E3419',
			},
			fontFamily: {
				display: ['paralucent', 'sans-serif'],
				body: ['Inter', 'sans-serif'],
			},
			fontSize: {
				'4xl': '40px',
			},
			screens: {
				'2xl': '1640px',
			},
		},
	},
	plugins: [],
}
