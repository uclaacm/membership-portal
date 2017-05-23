export default {
    health: {
        url: '/app/api/health/check',
    },
    API_URL: '/app',
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
        }
    }
};
