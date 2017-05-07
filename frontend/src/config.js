export default {
    health: {
        url: 'http://localhost:8080/api/health/check',
    },
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
        user: '/app/api/v1/user',
        auth: {
            register: '/app/api/v1/auth/register'
        }
    }
};
