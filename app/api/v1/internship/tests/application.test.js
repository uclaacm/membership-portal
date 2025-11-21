const mongoose = require('mongoose');
// const app = require('../../../../../index');
// const {validationResult} = require('express-validator');
const InternshipApplication = require('../models/InternshipApplication');
// const { validateCreateApplication } = require('../middleware/validation');
const test_db = require('./test_db');

/* TODO:
  change catch block -> no console
*/

beforeAll(async () => {
  await test_db.setUp();
});

afterEach(async () => {
  await test_db.dropCollections();
});

afterAll(async () => {
  await test_db.dropDatabase();
});

describe('Basic Schema Tests', () => {
  it('should accept a valid application', async () => {
    const validApp = new InternshipApplication({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@g.ucla.edu',
      university: 'UCLA',
      major: 'Underwater Basket Weaving',
      graduationYear: 2028,
      firstChoice: 'Board',
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'really good answer',
      }],
      // firstChoiceStatus: "pending",
    });
    const savedApp = await validApp.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedApp._id).toBeDefined();
    expect(savedApp.firstName).toBe(validApp.firstName);
    expect(savedApp.lastName).toBe(validApp.lastName);
    expect(savedApp.email).toBe(validApp.email);
    expect(savedApp.university).toBe(validApp.university);
    expect(savedApp.major).toBe(validApp.major);
    expect(savedApp.graduationYear).toBe(validApp.graduationYear);
    expect(savedApp.firstChoice).toBe(validApp.firstChoice);
    expect(savedApp.firstChoiceResponses).toEqual(validApp.firstChoiceResponses);

    expect(savedApp.appliedAt).toBeDefined();
  });

  it('Should reject an application that doesn\'t use a UCLA email', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Parker',
      lastName: 'Horne',
      email: 'adsfj@gmail.com',
      university: 'UCLA',
      major: 'Psychobio',
      graduationYear: 2028,
      firstChoice: 'Hack',
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'super good answer',
      }],
    });
    try {
      await invalidApp.save();
      fail('Email validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });

  it('Should reject an application that does not graduate after min_grad year', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Parker',
      lastName: 'Horne',
      email: 'adsfj@g.ucla.edu',
      university: 'UCLA',
      major: 'Psychobio',
      graduationYear: 2000,
      firstChoice: 'Hack',
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'super good answer',
      }],
    });
    try {
      await (invalidApp.save());
      fail('Graduation year validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });
  it('Should reject an application that does not have a firstChoice committee', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Parker',
      lastName: 'Horne',
      email: 'adsfj@g.ucla.edu',
      university: 'UCLA',
      major: 'Psychobio',
      graduationYear: 2028,
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'super good answer',
      }],
    });
    try {
      await invalidApp.save();
      fail('Committee choice validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });
});

describe('Complex Schema and Validation Tests', () => {
  it('Should reject an application with duplicate committee choices', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@g.ucla.edu',
      university: 'UCLA',
      major: 'Underwater Basket Weaving',
      graduationYear: 2028,
      firstChoice: 'Dev Team',
      secondChoice: 'Dev Team',
      thirdChoice: 'Board',
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'chillinggggg',
      }],
      secondChoiceResponses: [{
        question: 'question2',
        answer: 'ultra chillingggg',
      }],
      thirdChoiceResponses: [{
        question: 'question3',
        answer: 'not chilling.',
      }],
    });
    try {
      await invalidApp.save();
      fail('Duplicate committee choice validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });
  it('Should reject an application with a blank response', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Ur',
      lastName: 'Mom',
      email: 'urmom@g.ucla.edu',
      university: 'UCLA',
      major: 'idk',
      graduationYear: 2028,
      firstChoice: 'Board',
      firstChoiceResponses: [{
        question: 'question1',
        answer: '',
      }],
    });
    try {
      await invalidApp.save();
      fail('Blank response validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });
  it('Should reject an application with a blank response when a corresponding committee is chosen', async () => {
    const invalidApp = new InternshipApplication({
      firstName: 'Ur',
      lastName: 'Mom',
      email: 'urmom@g.ucla.edu',
      university: 'UCLA',
      major: 'idk',
      graduationYear: 2028,
      firstChoice: 'Board',
      secondChoice: 'Hack',
      firstChoiceResponses: [{
        question: 'question1',
        answer: 'asfdsf',
      }],
    });
    try {
      await invalidApp.save();
      fail('Blank response validation should have failed, but the save operation succeeded.');
    } catch (error) {
      console.error('--- RECEIVED ERROR DURING TEST ---');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('----------------------------------');
    }
  });
});
