export default {
    health: {
        url: '/app/api/health/check',
    },
    API_URL: process.env.WEBPACK ? 'http://localhost:8080/app' : '/app',
    CLIENT_ROOT_URL: '',
    info: {
        msg: 'Hello World!',
    },
    nav: [
        ['Home', '/'],
        ['About', '/about'],
        ['Login', '/login'],
        ['Register', '/register'],
        ],
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
            attend: '/api/v1/attendance/attend',
        }
    }
};
