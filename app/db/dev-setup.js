module.exports = (User, Event, Attendance, Activity) => {
	return Promise.all([
		User.create({
			uuid: '1b1ccafc-734a-4fc4-9247-064ac0b5d337',
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
			uuid: '5b2f8226-eb6b-4221-9a07-7cb47e086108',
			email: 'carey@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Carey',
			lastName: 'Nachenberg',
			profileId: '2533903',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 145,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: '4e1cb733-d1af-4a93-9fdd-ed81c6d27302',
			email: 'joebruin@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Joe',
			lastName: 'Bruin',
			profileId: '282285695209047',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 140,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: '85b2990f-365e-4974-909d-8cadd422b97a',
			email: 'ram@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Ram',
			lastName: 'Goli',
			profileId: '100001877363522',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 135,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: 'fa564971-b792-4974-b300-61bd6c642734',
			email: 'justin@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Justin',
			lastName: 'Liu',
			profileId: '1830026194',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 130,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: '21074cef-3b3f-4054-831c-0a1bad91f3ce',
			email: 'mihir@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Mihir',
			lastName: 'Mathur',
			profileId: '1700384262',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 115,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: 'd2eae4aa-af34-4ae2-a8de-dc0c8091bc86',
			email: 'dmitri@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Dmitri',
			lastName: 'Brereton',
			profileId: '1356192522',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 105,
			year: 2,
			major: 'Computer Science'
		}), 

		User.create({
			uuid: '2d3422d0-6367-454e-bc32-96919fe72d0c',
			email: 'vic@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Vic',
			lastName: 'Yeh',
			profileId: '830034819',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 95,
			year: 2,
			major: 'Computer Science'
		}), 

		User.create({
			uuid: '5607f792-3ebb-41d2-b70c-bc9c4f3700d9',
			email: 'yvonne@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Yvonne',
			lastName: 'Chen',
			profileId: '100007447565065',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 80,
			year: 2,
			major: 'Computer Science'
		}), 
		
		User.create({
			uuid: 'de99efd3-1b6c-4720-a0dc-f03f03e46408',
			email: 'helenhyewonlee@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Helen',
			lastName: 'Lee',
			profileId: '100001123076418',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 25,
			year: 2,
			major: 'Computer Science'
		}),

		User.create({
			uuid: '961330d3-1469-4e2e-89f4-3fa2cf26cdf3',
			email: 'thanathanyang@ucla.edu',
			accessType: 'STANDARD',
			state: 'ACTIVE',
			firstName: 'Nathan',
			lastName: 'Yang',
			profileId: '100000035467311',
			hash: '$2a$10$db7eYhWGZ1LZl27gvyX/iOgb33ji1PHY5.pPzRyXaNlbctCFWMF9G', //test1234
			points: 15,
			year: 2,
			major: 'Computer Science'
		}),
		
		Event.create({
			uuid: 'f83f3358-4eab-49a5-87a2-480c84bee758',
			title: "Project A*: Dynamic Programming",
			description: "<p>Our sixth session will be this Friday, May 19th, from 4 - 6 PM in Boelter 4760. We will be covering dynamic programming!</p><p>ACM's Project A* is a quarter-long academy led by ACM-ICPC that teaches algorithmic concepts and implementation. If you are interested in acing your technical interviews or want to learn & practice coding up important algorithms, join us on Fridays from 4 - 6 PM in Boelter 4760!</p>",
			committee: "ICPC",
			cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18527109_1622382914468446_8231612414050119289_o.jpg?oh=8673cf672e1426a4c568ab3cf5724ee3&oe=59A87784",
			location: "Boelter Hall 4760",
			eventLink: "https://www.facebook.com/events/124949728072141/",
			startDate: new Date(2017, 5, 7, 16),
			endDate: new Date(2017, 5, 7, 19),
			attendanceCode: "ast4r",
			attendancePoints: 10
		}),

		Event.create({
			uuid: '3f80844d-653f-41a2-8d60-c26847f44644',
			title: "Intro to React",
			description: "<p>React is high-demand front-end Javascript library first created by Facebook. React powers the front-end of several major companies ranging from Facebook, AirBnb, Uber, and much more. We'll be hosting an introduction to React led by a Codesmith instructor to give you the tools necessary to work on your very first React project. Bring your laptop!</p><p>This session is designed for beginners to intermediates. React is perfect for beginners with basic HTML/CSS/Javascript knowledge looking to turn their static websites into full-fledged interactive web-apps. If you are already familiar with Javascript libraries like jQuery, learning React is a powerful alternative. Furthermore, React can be used to build mobile apps through Facebook's React Native library.</p>",
			committee: "Hack",
			cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18489548_1625912390782165_5564771335549555657_o.jpg?oh=2864206379323bba2b4647e5ccd22907&oe=59A57C6A",
			location: "Blackstone LaunchPad at UCLA",
			eventLink: "https://www.facebook.com/events/174847826374758/",
			startDate: new Date(2017, 5, 7, 19),
			endDate: new Date(2017, 5, 7, 21),
			attendanceCode: "re4ct",
			attendancePoints: 20
		}),

		Event.create({
			uuid: 'a11c7027-54ca-43d5-9be9-4779fcc47b33',
			title: "Machine Learning with Tensorflow (part 5)",
			description: "<p>ACM AI is hosting a multi-part workshop series on machine learning with Tensorflow this quarter. If you're interested in learning machine learning and getting familiar with one of the most popular libraries out there, join us on Thursdays, weeks 3 - 9 from 4 - 6pm in Boelter 4760!</p><p>This is a hands-on series, where you'll have the opportunity to apply machine learning on real-world problems and datasets throughout the series.</p>",
			committee: "AI",
			cover: "https://scontent.xx.fbcdn.net/v/t31.0-8/18192678_1597747830265288_5596200055975220430_o.jpg?oh=19f2da7a58b78502c24c73f538c0b418&oe=59B2C8EE",
			location: "Boelter Hall 4760",
			eventLink: "https://www.facebook.com/events/417554198601623/",
			startDate: new Date(2017, 5, 8, 14),
			endDate: new Date(2017, 5, 8, 18),
			attendanceCode: "tens0r",
			attendancePoints: 30
		}),

		Event.create({
			uuid: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			title: "Pet a Doggo",
			description: "<p>Interested in petting a doggo? Come out to pet some doggos!</p>",
			committee: "Hack",
			cover: "https://media.giphy.com/media/Z3aQVJ78mmLyo/giphy.gif",
			location: "De Neve Auditorium",
			eventLink: "https://www.facebook.com/events/417554198601623/",
			startDate: new Date(2017, 5, 8, 14),
			endDate: new Date(2017, 5, 8, 18),
			attendanceCode: "d0ggo",
			attendancePoints: 50
		}),

		Attendance.create({
			user: '1b1ccafc-734a-4fc4-9247-064ac0b5d337',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 14, 0, 55)
		}),

		Activity.attendedEvent('1b1ccafc-734a-4fc4-9247-064ac0b5d337', 'Pet a Doggo', 50),

		Attendance.create({
			user: '5b2f8226-eb6b-4221-9a07-7cb47e086108',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 14, 3, 34)
		}),

		Activity.attendedEvent('5b2f8226-eb6b-4221-9a07-7cb47e086108', 'Pet a Doggo', 10),

		Attendance.create({
			user: '4e1cb733-d1af-4a93-9fdd-ed81c6d27302',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 14, 15, 0)
		}),

		Activity.attendedEvent('4e1cb733-d1af-4a93-9fdd-ed81c6d27302', 'Pet a Doggo', 10),

		Attendance.create({
			user: '85b2990f-365e-4974-909d-8cadd422b97a',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 14, 22, 2)
		}),

		Activity.attendedEvent('85b2990f-365e-4974-909d-8cadd422b97a', 'Pet a Doggo', 10),

		Attendance.create({
			user: 'fa564971-b792-4974-b300-61bd6c642734',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 1, 34)
		}),

		Activity.attendedEvent('fa564971-b792-4974-b300-61bd6c642734', 'Pet a Doggo', 10),

		Attendance.create({
			user: '21074cef-3b3f-4054-831c-0a1bad91f3ce',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 3, 49)
		}),

		Activity.attendedEvent('21074cef-3b3f-4054-831c-0a1bad91f3ce', 'Pet a Doggo', 10),

		Attendance.create({
			user: 'd2eae4aa-af34-4ae2-a8de-dc0c8091bc86',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 3, 25)
		}),

		Activity.attendedEvent('d2eae4aa-af34-4ae2-a8de-dc0c8091bc86', 'Pet a Doggo', 10),

		Attendance.create({
			user: '2d3422d0-6367-454e-bc32-96919fe72d0c',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 3, 30)
		}),

		Activity.attendedEvent('2d3422d0-6367-454e-bc32-96919fe72d0c', 'Pet a Doggo', 10),

		Attendance.create({
			user: '5607f792-3ebb-41d2-b70c-bc9c4f3700d9',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 5, 12)
		}),

		Activity.attendedEvent('5607f792-3ebb-41d2-b70c-bc9c4f3700d9', 'Pet a Doggo', 10),

		Attendance.create({
			user: 'de99efd3-1b6c-4720-a0dc-f03f03e46408',
			event: '84feb61b-7c22-4e3e-aabd-500f13beaa12',
			date: new Date(2017, 5, 8, 15, 5, 35)
		}),

		Activity.attendedEvent('de99efd3-1b6c-4720-a0dc-f03f03e46408', 'Pet a Doggo', 10),

		Attendance.create({
			user: '4e1cb733-d1af-4a93-9fdd-ed81c6d27302',
			event: '3f80844d-653f-41a2-8d60-c26847f44644',
			date: new Date(2017, 5, 7, 19)
		}),

		Activity.attendedEvent('4e1cb733-d1af-4a93-9fdd-ed81c6d27302', 'Intro to React', 20),

		Attendance.create({
			user: 'de99efd3-1b6c-4720-a0dc-f03f03e46408',
			event: '3f80844d-653f-41a2-8d60-c26847f44644',
			date: new Date(2017, 5, 7, 19)
		}),

		Activity.attendedEvent('de99efd3-1b6c-4720-a0dc-f03f03e46408', 'Intro to React', 20),

		Attendance.create({
			user: '85b2990f-365e-4974-909d-8cadd422b97a',
			event: '3f80844d-653f-41a2-8d60-c26847f44644',
			date: new Date(2017, 5, 7, 20)
		}),

		Activity.attendedEvent('85b2990f-365e-4974-909d-8cadd422b97a', 'Intro to React', 20),

		Attendance.create({
			user: 'fa564971-b792-4974-b300-61bd6c642734',
			event: '3f80844d-653f-41a2-8d60-c26847f44644',
			date: new Date(2017, 5, 7, 20)
		}),

		Activity.attendedEvent('fa564971-b792-4974-b300-61bd6c642734', 'Intro to React', 20),
	]);
};
