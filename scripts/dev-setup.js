import { db, config } from "../app";

if (config.isProduction) {
    console.error("This script cannot be run in production mode");
    process.exit(1);
}

db.setup(true).then(() => Promise.all([
    User.create({
        email: 'admin@ucla.edu',
        accessType: 'ADMIN',
        state: 'ACTIVE',
        firstName: 'Nikhil',
        lastName: 'Kansal',
        hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
        year: 2,
        major: 'Computer Science'
    }),

    User.create({
        email: 'user@ucla.edu',
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Nikhil',
        lastName: 'Kansal',
        hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
        year: 2,
        major: 'Computer Science'
    }),

    Event.create({
        title: "Project A*: Dynamic Programming",
        description: "<p>Our sixth session will be this Friday, May 19th, from 4 - 6 PM in Boelter 4760. We will be covering dynamic programming!</p><p>ACM's Project A* is a quarter-long academy led by ACM-ICPC that teaches algorithmic concepts and implementation. If you are interested in acing your technical interviews or want to learn & practice coding up important algorithms, join us on Fridays from 4 - 6 PM in Boelter 4760!</p>",
        committee: "ICPC",
        cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18527109_1622382914468446_8231612414050119289_o.jpg?oh=8673cf672e1426a4c568ab3cf5724ee3&oe=59A87784",
        location: "Boelter Hall 4760",
        eventLink: "https://www.facebook.com/events/124949728072141/",
        startDate: new Date(2017, 4, 19, 16),
        endDate: new Date(2017, 4, 19, 18),
        attendanceCode: "ast4r",
        attendancePoints: 10
    }),

    Event.create({
        title: "Intro to React",
        description: "<p>React is high-demand front-end Javascript library first created by Facebook. React powers the front-end of several major companies ranging from Facebook, AirBnb, Uber, and much more. We'll be hosting an introduction to React led by a Codesmith instructor to give you the tools necessary to work on your very first React project. Bring your laptop!</p><p>This session is designed for beginners to intermediates. React is perfect for beginners with basic HTML/CSS/Javascript knowledge looking to turn their static websites into full-fledged interactive web-apps. If you are already familiar with Javascript libraries like jQuery, learning React is a powerful alternative. Furthermore, React can be used to build mobile apps through Facebook's React Native library.</p>",
        committee: "Hack",
        cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18489548_1625912390782165_5564771335549555657_o.jpg?oh=2864206379323bba2b4647e5ccd22907&oe=59A57C6A",
        location: "Blackstone LaunchPad at UCLA",
        eventLink: "https://www.facebook.com/events/174847826374758/",
        startDate: new Date(2017, 4, 25, 19),
        endDate: new Date(2017, 4, 25, 21),
        attendanceCode: "re4ct",
        attendancePoints: 10
    }),

    Event.create({
        title: "Machine Learning with Tensorflow (part 5)",
        description: "<p>ACM AI is hosting a multi-part workshop series on machine learning with Tensorflow this quarter. If you're interested in learning machine learning and getting familiar with one of the most popular libraries out there, join us on Thursdays, weeks 3 - 9 from 4 - 6pm in Boelter 4760!</p><p>This is a hands-on series, where you'll have the opportunity to apply machine learning on real-world problems and datasets throughout the series.</p>",
        committee: "AI",
        cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18192678_1597747830265288_5596200055975220430_o.jpg?oh=19f2da7a58b78502c24c73f538c0b418&oe=59B2C8EE",
        location: "Boelter Hall 4760",
        eventLink: "https://www.facebook.com/events/417554198601623/",
        startDate: new Date(2017, 5, 1, 16),
        endDate: new Date(2017, 5, 1, 18),
        attendanceCode: "tens0r",
        attendancePoints: 10
    })
]));