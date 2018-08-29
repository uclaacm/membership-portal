export default {
	API_URL: process.env.WEBPACK ? 'http://localhost:8080/app' : '/app',
	CLIENT_ROOT_URL: '',
	facebook: {
		appId: '1356860031017067'
	},
	routes: {
		user: {
			user: '/api/v1/user',
			activity: '/api/v1/user/activity',
		},
		activity: '/api/v1/activity',
		auth: {
			register: '/api/v1/auth/register',
			login: '/api/v1/auth/login',
			resetPassword: '/api/v1/auth/resetPassword',
		},
		events: {
			event: '/api/v1/event',
			past: '/api/v1/event/past',
			future: '/api/v1/event/future'
		},
		attendance: {
			fetch: '/api/v1/attendance',
			attend: '/api/v1/attendance/attend',
		},
		leaderboard: '/api/v1/leaderboard',
	},
	organization: {
		logo: "/assets/images/logo.png",
		logoLight: "/assets/images/logo-white.png",
		loginTileBackground: "/assets/images/login-tile-bg.jpg",
		shortName: "UCLA ACM",
		name: "UCLA Association for Computing Machinery",
		mission: "To create and support an inclusive community for all of those interested in computer science at UCLA and cultivate the next generation of technology leaders by promoting the spirit of innovation, a culture of creativity, and aspiration of entrepreneurship.",
		officers: [
			{
				name: "Yvonne Chen",
				position: "President",
				email: "ycyvonne@ucla.edu",
				picture: "/assets/images/officers/yvonne.jpg"
			},
			{
				name: "Nathan Yang",
				position: "External VP",
				email: "thenathanyang@ucla.edu",
				picture: "/assets/images/officers/nathan.jpg"
			},
			{
				name: "Natasha Kohli",
				position: "Internal VP",
				email: "jdliaw@ucla.edu",
				picture: "/assets/images/officers/natasha.jpg"
			},
			{
				name: "Adit Deshpande",
				position: "President of AI",
				email: "rvarm1@gmail.com",
				picture: "/assets/images/officers/adit.jpg"
			},
			{
				name: "Kevin Tan",
				position: "President of Hack",
				email: "rvarm1@gmail.com",
				picture: "/assets/images/officers/kevin.jpg"
			},
			{
				name: "Jeffrey Zhao",
				position: "President of ICPC",
				email: "jerrylinew@gmail.com",
				picture: "/assets/images/officers/jeffrey.jpg"
			},
			{
				name: "Akshara Sundara",
				position: "President of Cyber",
				email: "alrehanitanya@gmail.com",
				picture: "/assets/images/officers/akshara.jpg"
			},
			{
				name: "CJ Ordog & Judy Kim",
				position: "Co-Presidents of Studio",
				email: "tlindberg@ucla.edu",
				picture: "/assets/images/officers/cj_judy.png"
			},
			{
				name: "Caroline Quigg",
				position: "President of ACM-W",
				email: "glunawat@ucla.edu",
				picture: "/assets/images/officers/caroline.jpg"
			}
		],
		resources: [
			{
				type: "facebook",
				title: "Facebook",
				subtitle: "facebook.com/uclaacm",
				link: "http://facebook.com/uclaacm"
			},
			{
				type: "twitter",
				title: "Twitter",
				subtitle: "twitter.com/uclaacm",
				link: "http://twitter.com/uclaacm"
			},
			{
				type: "github",
				title: "Github",
				subtitle: "github.com/uclaacm",
				link: "http://github.com/uclaacm"
			},
			{
				type: "website",
				title: "Website",
				subtitle: "acm.cs.ucla.edu",
				link: "http://acm.cs.ucla.edu"
			},
			{
				type: "medium",
				title: "Medium",
				subtitle: "tech@ucla",
				link: "https://medium.com/techatucla"
			},
			{
				type: "slack",
				title: "Slack",
				subtitle: "uclaacm.slack.com",
				link: "http://uclaacm.slack.com"
			},
		]
	},
	levels: [
		{ startsAt: 0, rank: "Hello, World!" },
		{ startsAt: 20, rank: "Factorial Fly" },
		{ startsAt: 40, rank: "Exponential Elephant" },
		{ startsAt: 80, rank: "Cubic Chipmunk" },
		{ startsAt: 120, rank: "Quadratic Quokka" },
		{ startsAt: 180, rank: "Linearithmic Lizard" },
		{ startsAt: 240, rank: "Linear Lemur" },
		{ startsAt: 320, rank: "Square Root Sabre-Tooth" },
		{ startsAt: 400, rank: "Logarithmic Lynx" },
		{ startsAt: 500, rank: "Constant Cheetah" },
		{ startsAt: 800, rank: "Extraterrestrial Eagle" },
	],
};
