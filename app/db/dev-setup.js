module.exports = (User, Event) => {
  Promise.all([
    User.findOrCreate({
      where: { email: 'acm@g.ucla.edu' },
      defaults: {
        accessType: 'SUPERADMIN',
        state: 'ACTIVE',
        firstName: 'ACM',
        lastName: 'chapter at UCLA',
        year: 5,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'admin@g.ucla.edu' },
      defaults: {
        accessType: 'ADMIN',
        state: 'ACTIVE',
        firstName: 'Nikhil',
        lastName: 'Kansal',
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'dylon@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Dylon',
        lastName: 'Tjanaka',
        points: 9001,
        year: 3,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'carey@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Carey',
        lastName: 'Nachenberg',
        points: 145,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'joebruin@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Joe',
        lastName: 'Bruin',
        points: 140,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'ram@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Ram',
        lastName: 'Goli',
        points: 135,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'justin@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Justin',
        lastName: 'Liu',
        points: 130,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'mihir@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Mihir',
        lastName: 'Mathur',
        points: 115,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'dmitri@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Dmitri',
        lastName: 'Brereton',
        points: 105,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'vic@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Vic',
        lastName: 'Yeh',
        points: 95,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'yvonne@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Yvonne',
        lastName: 'Chen',
        points: 80,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'helenhyewonlee@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Helen',
        lastName: 'Lee',
        points: 25,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'thanathanyang@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Nathan',
        lastName: 'Yang',
        points: 15,
        year: 2,
        major: 'Computer Science',
      },
    }),

    User.findOrCreate({
      where: { email: 'iloveyou3000@g.ucla.edu' },
      defaults: {
        accessType: 'STANDARD',
        state: 'ACTIVE',
        firstName: 'Tony',
        lastName: 'Stark',
        points: 880,
        year: 2,
        major: 'Cognitive Science',
      },
    }),

    Event.findOrCreate({
      where: { attendanceCode: 'ast4r' },
      defaults: {
        title: 'Project A*: Dynamic Programming',
        description:
          "<p>Our sixth session will be this Friday, May 19th, from 4 - 6 PM in Boelter 4760. We will be covering dynamic programming!</p><p>ACM's Project A* is a quarter-long academy led by ACM-ICPC that teaches algorithmic concepts and implementation. If you are interested in acing your technical interviews or want to learn & practice coding up important algorithms, join us on Fridays from 4 - 6 PM in Boelter 4760!</p>",
        committee: 'ICPC',
        cover:
          'https://www.uclaacm.com/nextimg/%2Fimages%2Fcommittees%2Ficpc%2FA.png/640/75?url=%2Fimages%2Fcommittees%2Ficpc%2FA.png&w=640&q=75',
        location: 'Boelter Hall 4760',
        eventLink: 'https://www.facebook.com/events/124949728072141/',
        startDate: new Date(2029, 5, 7, 16),
        endDate: new Date(2029, 5, 7, 19),
        attendancePoints: 10,
      },
    }),

    Event.findOrCreate({
      where: { attendanceCode: 're4ct' },
      defaults: {
        title: 'Intro to React',
        description:
          "<p>React is high-demand front-end Javascript library first created by Facebook. React powers the front-end of several major companies ranging from Facebook, AirBnb, Uber, and much more. We'll be hosting an introduction to React led by a Codesmith instructor to give you the tools necessary to work on your very first React project. Bring your laptop!</p><p>This session is designed for beginners to intermediates. React is perfect for beginners with basic HTML/CSS/Javascript knowledge looking to turn their static websites into full-fledged interactive web-apps. If you are already familiar with Javascript libraries like jQuery, learning React is a powerful alternative. Furthermore, React can be used to build mobile apps through Facebook's React Native library.</p>",
        committee: 'Hack',
        cover:
          "https://drive.google.com/file/d/1W3Fu5sQ3dQzac1XCZkZo0iZyZhO4HPqE/view?usp=sharing",
        location: "Blackstone LaunchPad at UCLA",
        eventLink: "https://www.facebook.com/events/174847826374758/",
        startDate: new Date(2029, 5, 7, 19),
        endDate: new Date(2029, 5, 7, 21),
        attendancePoints: 20,
      },
    }),

    Event.findOrCreate({
      where: { attendanceCode: 'tens0r' },
      defaults: {
        title: 'Machine Learning with Tensorflow (part 5)',
        description:
          "<p>ACM AI is hosting a multi-part workshop series on machine learning with Tensorflow this quarter. If you're interested in learning machine learning and getting familiar with one of the most popular libraries out there, join us on Thursdays, weeks 3 - 9 from 4 - 6pm in Boelter 4760!</p><p>This is a hands-on series, where you'll have the opportunity to apply machine learning on real-world problems and datasets throughout the series.</p>",
        committee: 'AI',
        cover:
          'https://www.uclaacm.com/nextimg/%2Fimages%2Fcommittees%2Fai%2Fai_motif_base.png/640/75?url=%2Fimages%2Fcommittees%2Fai%2Fai_motif_base.png&w=640&q=75',
        location: 'Boelter Hall 4760',
        eventLink: 'https://www.facebook.com/events/417554198601623/',
        startDate: new Date(2027, 5, 8, 14),
        endDate: new Date(2027, 5, 8, 18),
        attendancePoints: 30,
      },
    }),

    Event.findOrCreate({
      where: { attendanceCode: 'd0ggo' },
      defaults: {
        title: 'Pet a Doggo',
        description:
          '<p>Interested in petting a doggo? Come out to pet some doggos!</p>',
        committee: 'Hack',
        cover: 'https://media.giphy.com/media/Z3aQVJ78mmLyo/giphy.gif',
        location: 'De Neve Auditorium',
        eventLink: 'https://www.facebook.com/events/417554198601623/',
        startDate: new Date(2027, 5, 8, 14),
        endDate: new Date(2027, 5, 8, 18),
        attendancePoints: 50,
      },
    }),
  ]);
  return null; // we don't care about result (http://goo.gl/rRqMUw)
};
