const { Committee } = require('../api/v1/internship/models/Committee');

module.exports = async (User, Event) => {
  const committeeSeeds = [
    {
      name: 'AI',
      displayName: 'AI',
      description: 'Explore machine learning, applied AI, and research-inspired projects.',
      internLimit: 10,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'Hack',
      displayName: 'Hack',
      description: 'Build web apps, developer tools, and polished product prototypes.',
      internLimit: 12,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'Design',
      displayName: 'Design',
      description: 'Create user-centered design systems, visuals, and product experiences.',
      internLimit: 8,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'Studio',
      displayName: 'Studio',
      description: 'Ship creative technical projects with a focus on craft and collaboration.',
      internLimit: 6,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'Cyber',
      displayName: 'Cyber',
      description: 'Learn practical security through workshops, labs, and CTF-style projects.',
      internLimit: 8,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'ICPC',
      displayName: 'ICPC',
      description: 'Competitive programming, algorithms, and interview prep.',
      internLimit: 10,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'W',
      displayName: 'W',
      description: 'ACM-W community, mentorship, and professional development.',
      internLimit: 10,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'TeachLA',
      displayName: 'TeachLA',
      description: 'Education outreach and curriculum development for K-12 CS.',
      internLimit: 12,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
    {
      name: 'Cloud',
      displayName: 'Cloud',
      description: 'Cloud infrastructure, DevOps, and reliability engineering projects.',
      internLimit: 8,
      applicationDeadline: new Date('2030-10-15T23:59:59.000Z'),
    },
  ];

  const committeeSeedPromises = committeeSeeds.map((seed) => {
    const nameVariants = [seed.name, seed.name.toLowerCase()];
    return Committee.updateOne(
      { name: { $in: nameVariants } },
      {
        $set: {
          name: seed.name,
          displayName: seed.displayName,
          description: seed.description,
          internLimit: seed.internLimit,
          applicationDeadline: seed.applicationDeadline,
        },
      },
      { upsert: true },
    );
  });

  Promise.all([
    ...committeeSeedPromises,
    User.upsert({
      email: 'acm@g.ucla.edu',
      accessType: 'SUPERADMIN',
      state: 'ACTIVE',
      firstName: 'ACM',
      lastName: 'chapter at UCLA',
      year: 5,
      major: 'Computer Science',
      bio: 'The official ACM chapter at UCLA.',
      linkedinUrl: 'https://linkedin.com/company/ucla-acm',
      githubUrl: 'https://github.com/uclaacm',
      skills: ['Leadership', 'Community Building'],
      careerInterests: ['Technology', 'Education'],
      isProfilePublic: true,
      pronouns: 'They/Them',
    }),

    User.upsert({
      email: 'admin@g.ucla.edu',
      accessType: 'ADMIN',
      state: 'ACTIVE',
      firstName: 'Nikhil',
      lastName: 'Kansal',
      year: 2,
      major: 'Computer Science',
      bio: 'Passionate about full-stack development.',
      linkedinUrl: 'https://linkedin.com/in/nikhilkansal',
      githubUrl: 'https://github.com/nikhilkansal',
      portfolioUrl: 'https://nikhilkansal.dev',
      skills: ['JavaScript', 'React', 'Node.js'],
      careerInterests: ['Software Engineering', 'Startups'],
      isProfilePublic: true,
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'dylon@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Dylon',
      lastName: 'Tjanaka',
      points: 9001,
      year: 3,
      major: 'Computer Science',
      bio: 'Loves solving algorithmic challenges.',
      githubUrl: 'https://github.com/dylontjanaka',
      skills: ['Algorithms', 'Competitive Programming'],
      careerInterests: ['Research', 'Teaching'],
      isProfilePublic: false,
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'carey@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Carey',
      lastName: 'Nachenberg',
      points: 145,
      year: 2,
      major: 'Computer Science',
      bio: 'Interested in cybersecurity and privacy.',
      linkedinUrl: 'https://linkedin.com/in/careynachenberg',
      skills: ['Cybersecurity', 'Privacy'],
      careerInterests: ['Security Engineering'],
      isProfilePublic: true,
      pronouns: 'She/Her',
    }),

    User.upsert({
      email: 'joebruin@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Joe',
      lastName: 'Bruin',
      points: 140,
      year: 2,
      major: 'Computer Science',
      bio: 'UCLA mascot and tech enthusiast.',
      skills: ['Mascot Duties', 'Public Speaking'],
      careerInterests: ['Community Engagement'],
      isProfilePublic: true,
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'ram@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Ram',
      lastName: 'Goli',
      points: 135,
      year: 2,
      major: 'Computer Science',
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'justin@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Justin',
      lastName: 'Liu',
      points: 130,
      year: 2,
      major: 'Computer Science',
      bio: 'Aspiring cloud developer.',
      githubUrl: 'https://github.com/justinliu',
      skills: ['Cloud Development', 'Unity'],
      careerInterests: ['Cloud Design'],
      isProfilePublic: false,
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'mihir@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Mihir',
      lastName: 'Mathur',
      points: 115,
      year: 2,
      major: 'Computer Science',
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'dmitri@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Dmitri',
      lastName: 'Brereton',
      points: 105,
      year: 2,
      major: 'Computer Science',
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'vic@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Vic',
      lastName: 'Yeh',
      points: 95,
      year: 2,
      major: 'Computer Science',
      pronouns: 'They/Them',
    }),

    User.upsert({
      email: 'yvonne@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Yvonne',
      lastName: 'Chen',
      points: 80,
      year: 2,
      major: 'Computer Science',
      pronouns: 'She/Her',
    }),

    User.upsert({
      email: 'helenhyewonlee@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Helen',
      lastName: 'Lee',
      points: 25,
      year: 2,
      major: 'Computer Science',
      pronouns: 'She/Her',
    }),

    User.upsert({
      email: 'thanathanyang@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Nathan',
      lastName: 'Yang',
      points: 15,
      year: 2,
      major: 'Computer Science',
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'iloveyou3000@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Tony',
      lastName: 'Stark',
      points: 880,
      year: 2,
      major: 'Cognitive Science',
      bio: 'Genius, billionaire, playboy, philanthropist.',
      linkedinUrl: 'https://linkedin.com/in/tonystark',
      githubUrl: 'https://github.com/ironman',
      portfolioUrl: 'https://starkindustries.com',
      personalWebsite: 'https://tonystark.com',
      resumeUrl: 'https://tonystark.com/resume.pdf',
      skills: ['Engineering', 'AI', 'Leadership'],
      careerInterests: ['Technology', 'Defense'],
      isProfilePublic: true,
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'awond@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Alice',
      lastName: 'Wonderland',
      year: 1,
      major: 'Mathematics',
      bio: 'Exploring the world of math and logic.',
      skills: ['Problem Solving', 'Critical Thinking'],
      pronouns: 'She/Her',
    }),

    User.upsert({
      email: 'bbuild@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Bob',
      lastName: 'Builder',
      year: 4,
      major: 'Civil Engineering',
      bio: 'Can we build it? Yes, we can!',
      skills: ['Construction', 'Teamwork'],
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'cbrown@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Charlie',
      lastName: 'Brown',
      year: 3,
      major: 'Psychology',
      pronouns: 'He/Him',
    }),

    User.upsert({
      email: 'dexplorer@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Dora',
      lastName: 'Explorer',
      year: 2,
      major: 'Geography',
      bio: 'Loves exploring new places.',
      skills: ['Navigation', 'Adventure'],
      pronouns: 'She/Her',
    }),

    User.upsert({
      email: 'evrobot@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Eve',
      lastName: 'Robot',
      year: 5,
      major: 'Robotics',
      bio: 'Building the future, one robot at a time.',
      skills: ['Robotics', 'AI'],
      pronouns: 'They/Them',
    }),

    User.upsert({
      email: 'frankcastle@g.ucla.edu',
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName: 'Frank',
      lastName: 'Castle',
      year: 4,
      major: 'Criminology',
      bio: 'Fighting crime and seeking justice.',
      pronouns: 'He/Him',
    }),

    // Officer seed users — one per committee
    User.findOrCreate({
      where: { email: 'officer.hack@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'Hack',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['Hack'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.ai@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'AI',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['AI'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.icpc@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'ICPC',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['ICPC'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.studio@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'Studio',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['Studio'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.cyber@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'Cyber',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['Cyber'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.w@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'ACM',
        lastName: 'W Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['W'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.cloud@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'Cloud',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['Cloud'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.design@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'Design',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['Design'],
      },
    }),

    User.findOrCreate({
      where: { email: 'officer.teachla@g.ucla.edu' },
      defaults: {
        accessType: 'OFFICER',
        state: 'ACTIVE',
        firstName: 'TeachLA',
        lastName: 'Officer',
        year: 3,
        major: 'Computer Science',
        committees: ['TeachLA'],
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
          'https://drive.google.com/file/d/1W3Fu5sQ3dQzac1XCZkZo0iZyZhO4HPqE/view?usp=sharing',
        location: 'Blackstone LaunchPad at UCLA',
        eventLink: 'https://www.facebook.com/events/174847826374758/',
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

  // ---------------------------------------------------------------------------
  // Extra seed data so the dashboard has something to lay out.
  //
  // The fit-to-window sections size themselves to the content available: with only a handful
  // of upcoming events and a dozen scored members, the featured rows and the leaderboard rail
  // rendered mostly empty and the layout could not be judged. Dates are relative to now so
  // these stay in the future without editing the file every term.
  // ---------------------------------------------------------------------------
  const soon = (days, hour) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const seedCommittees = ['AI', 'Hack', 'Cyber', 'Design', 'TeachLA', 'ICPC', 'W', 'Studio', 'Cloud'];
  const seedTitles = [
    'Intro to Neural Networks', 'React Workshop: Hooks in Depth', 'CTF Practice Night',
    'Design Crit & Portfolio Review', 'Volunteer Onboarding', 'Weekly Practice Contest',
    'Mentorship Mixer', 'Game Jam Kickoff', 'Deploying with Terraform',
    'Resume Workshop', 'Intro to Rust', 'Data Viz with D3',
    'Capture the Flag: Web Exploits', 'Figma Fundamentals', 'Teaching Demo Day',
    'Dynamic Programming Deep Dive', 'Women in Tech Panel', 'Unity Basics',
  ];
  const seedLocations = [
    'Boelter 3400', 'Kaplan A65', 'Engineering VI 289', 'Broad 2160E',
    'Public Affairs 1234', 'Boelter 5249', 'Kerckhoff Grand Salon', 'Royce 156',
  ];

  await Promise.all(seedTitles.map((title, i) => Event.findOrCreate({
    where: { attendanceCode: `seed-${i}` },
    defaults: {
      title,
      description: `<p>${title} — seeded for local development.</p>`,
      committee: seedCommittees[i % seedCommittees.length],
      location: seedLocations[i % seedLocations.length],
      // No cover on purpose: the card falls back to the committee banner, which is the path
      // most real events actually take. Omitted rather than '' — the column validates length.
      startDate: soon(i + 1, 17),
      endDate: soon(i + 1, 19),
      attendancePoints: 5 + (i % 5) * 5,
    },
  })));

  const seedMembers = [
    ['Priya', 'Raman', 512], ['Marcus', 'Webb', 468], ['Sofia', 'Delgado', 431],
    ['Ethan', 'Nakamura', 402], ['Amara', 'Okafor', 377], ['Liam', 'Torres', 355],
    ['Yuki', 'Tanaka', 340], ['Noor', 'Haddad', 318], ['Diego', 'Ramirez', 295],
    ['Hannah', 'Kim', 274], ['Omar', 'Farouk', 251], ['Grace', 'Chen', 233],
    ['Tobias', 'Lindqvist', 210], ['Ines', 'Moreau', 188], ['Kofi', 'Mensah', 165],
    ['Mei', 'Zhang', 142], ['Arjun', 'Patel', 121], ['Freya', 'Olsen', 98],
    ['Santiago', 'Cruz', 76], ['Zara', 'Ahmed', 54],
  ];

  await Promise.all(seedMembers.map(([firstName, lastName, points], i) => User.findOrCreate({
    where: { email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@g.ucla.edu` },
    defaults: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@g.ucla.edu`,
      accessType: 'STANDARD',
      state: 'ACTIVE',
      firstName,
      lastName,
      year: (i % 4) + 1,
      major: 'Computer Science',
      points,
    },
  })));

  return null; // we don't care about result (http://goo.gl/rRqMUw)
};
