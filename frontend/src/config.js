export default {
  API_URL: process.env.WEBPACK ? 'http://localhost:8080/app' : '/app',
  CLIENT_ROOT_URL: '',
  facebook: {
    appId: '1356860031017067',
  },
  google:  {
    apiKey: process.env.GOOGLE_API_KEY,
    authDomain: process.env.GOOGLE_AUTH_DOMAIN,
    clientId: process.env.GOOGLE_CLIENT_ID,
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
      future: '/api/v1/event/future',
    },
    attendance: {
      fetch: '/api/v1/attendance',
      attend: '/api/v1/attendance/attend',
    },
    leaderboard: '/api/v1/leaderboard',
  },
  organization: {
    logo: '/assets/images/logo.png',
    logoLight: '/assets/images/logo-white.png',
    loginTileBackground: '/assets/images/login-tile-bg.jpg',
    shortName: 'ACM at UCLA',
    name: 'Association for Computing Machinery at UCLA',
    mission: 'To create and support an inclusive community for all of those interested in computer science at UCLA and cultivate the next generation of technology leaders by fostering the spirit of innovation, a culture of creativity, and promoting equity, diversity, and inclusion within tech.',
    officers: [
      {
        name: 'Matthew Wang',
        title: 'President',
        picture: '/assets/images/officers/MattWang.jpg',
      },
      {
        name: 'Tina Huang',
        title: 'External Vice President',
        picture: '/assets/images/officers/TinaHuang.jpg',
      },
      {
        name: 'Evan Zhong',
        title: 'Internal Vice President',
        picture: '/assets/images/officers/EvanZhong.jpg',
      },
      {
        name: 'Asha Kar',
        title: 'Co-President, Hack',
        picture: '/assets/images/officers/AshaKar.jpg',
      },
      {
        name: 'Eugene Lo',
        title: 'Co-President, Hack',
        picture: '/assets/images/officers/EugeneLo.jpg',
      },
      {
        name: 'Cindy Zhang',
        title: 'President, ACM-W',
        picture: '/assets/images/officers/CindyZhang.jpg',
      },
      {
        name: 'Justin Yi',
        title: 'President, AI',
        picture: '/assets/images/officers/JustinYi.jpg',
      },
      {
        name: 'Christian Loanzon',
        title: 'Co-President, Game Studio',
        picture: '/assets/images/officers/ChristianLoanzon.jpg',
      },
      {
        name: 'Peter Sutarjo',
        title: 'Co-President, Game Studio',
        picture: '/assets/images/officers/PeterSutarjo.jpg',
      },
      {
        name: 'Jacob Zhang',
        title: 'President, ICPC',
        picture: '/assets/images/officers/JacobZhang.jpeg',
      },
      {
        name: 'Henry Chang',
        title: 'Co-President, Cyber',
        picture: '/assets/images/officers/HenryChang.jpg',
      },
      {
        name: 'Joshua Lee',
        title: 'Co-President, Cyber',
        picture: '/assets/images/officers/JoshLee.jpg',
      },
      {
        name: 'Sophie Schoenmeyer',
        title: 'President, Teach LA',
        picture: '/assets/images/officers/SophieSchoenmeyer.jpg',
      },
      {
        name: 'Crystal Huynh',
        title: 'President, Design',
        picture: '/assets/images/officers/CrystalHuynh.jpg',
      },
    ],
    resources: [
      {
        type: 'facebook',
        title: 'Facebook',
        subtitle: 'facebook.com/uclaacm',
        link: 'http://facebook.com/uclaacm',
      },
      {
        type: 'twitter',
        title: 'Twitter',
        subtitle: 'twitter.com/uclaacm',
        link: 'http://twitter.com/uclaacm',
      },
      {
        type: 'github',
        title: 'Github',
        subtitle: 'github.com/uclaacm',
        link: 'http://github.com/uclaacm',
      },
      {
        type: 'website',
        title: 'Website',
        subtitle: 'acm.cs.ucla.edu',
        link: 'http://acm.cs.ucla.edu',
      },
      {
        type: 'medium',
        title: 'Medium',
        subtitle: 'tech@ucla',
        link: 'https://medium.com/techatucla',
      },
      {
        type: 'slack',
        title: 'Slack',
        subtitle: 'uclaacm.slack.com',
        link: 'http://uclaacm.slack.com',
      },
    ],
  },
  levels: [
    { startsAt: 0, rank: 'Hello, World!' },
    { startsAt: 20, rank: 'Factorial Fly' },
    { startsAt: 40, rank: 'Exponential Elephant' },
    { startsAt: 80, rank: 'Cubic Chipmunk' },
    { startsAt: 120, rank: 'Quadratic Quokka' },
    { startsAt: 180, rank: 'Linearithmic Lizard' },
    { startsAt: 240, rank: 'Linear Lemur' },
    { startsAt: 320, rank: 'Square Root Sabre-Tooth' },
    { startsAt: 400, rank: 'Logarithmic Lynx' },
    { startsAt: 500, rank: 'Constant Cheetah' },
    { startsAt: 800, rank: 'Extraterrestrial Eagle' },
    { startsAt: 1000, rank: 'Binomial Baboon' },
    { startsAt: 1300, rank: 'Scalar Scorpion' },
  ],
};
