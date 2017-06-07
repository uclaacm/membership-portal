export default {
    health: {
        url: '/app/api/health/check',
    },
    API_URL: process.env.WEBPACK ? 'http://localhost:8080/app' : '/app',
    CLIENT_ROOT_URL: '',
    info: {
        msg: 'Hello World!',
    },
    facebook: {
        appId: '1356860031017067'
    },
    routes: {
        user: '/api/v1/user',
        auth: {
          register: '/api/v1/auth/register',
          login: '/api/v1/auth/login'
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
                name: "Mihir Mathur",
                position: "President",
                email: "mihir.mathur@ucla.edu",
                picture: "/assets/images/officers/mihir.jpg"
            },
            {
                name: "Nikhil Kansal",
                position: "Vice President",
                email: "nkansal@ucla.edu",
                picture: "/assets/images/officers/nikhil.jpg"
            },
            {
                name: "Jennifer Liaw",
                position: "Vice President",
                email: "jdliaw@ucla.edu",
                picture: "/assets/images/officers/jennifer.jpg"
            },
            {
                name: "Rohan Varma",
                position: "President of AI",
                email: "rohan@ucla.edu",
                picture: "/assets/images/officers/rohan.jpg"
            },
            {
                name: "Yvonne Chen",
                position: "President of Hack",
                email: "yvonne@ucla.edu",
                picture: "/assets/images/officers/yvonne.jpg"
            },
            {
                name: "Jerry Li",
                position: "President of ICPC",
                email: "jerry@ucla.edu",
                picture: "/assets/images/officers/jerry.jpg"
            },
            {
                name: "Tyler Lindberg",
                position: "President of VRCG",
                email: "yvonne@ucla.edu",
                picture: "/assets/images/officers/tyler.jpg"
            },
            {
                name: "Garima Lunawat",
                position: "President of ACM-W",
                email: "garima@ucla.edu",
                picture: "/assets/images/officers/garima.jpg"
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
        { startsAt: 0, rank: "Newbie" },       // 
        { startsAt: 20, rank: "Newbie II" },
        { startsAt: 50, rank: "Newbie III" },
        { startsAt: 100, rank: "Hacker" },
        { startsAt: 150, rank: "Hacker II" },
        { startsAt: 200, rank: "Hacker III" }
    ],
};
