module.exports = {
	content: ['./*/*.php', './*.php', './templates/**/*.twig', './*/*/.js'],
	theme: {
		extend: {
			aspectRatio: {
				'16/9': '16/9',
				'3/2': '3/2',
				'4/3': '4/3',
				'3/4': '3/4',
				'1/1': '1/1',
			},
			colors: {
				white: '#FBFBFB',
				black: '#121212',
				'dark-blue': '#12448F',
				green: '#009E61',
				'light-green': '#04D081',
				'pale-green': '#B4FFB0',
				cream: '#F5F6ED',
			},
			fontFamily: {
				heading: ['Questrial', 'sans-serif'],
				fraunces: ['Fraunces', 'sans-serif'],
				body: ['Questrial', 'sans-serif'],
			},
			transitionTimingFunction: {
				fancy: 'cubic-bezier(0.76, 0, 0.24, 1)',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1435px',
				'3xl': '1690px',
				'4xl': '2000px',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
