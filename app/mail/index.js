const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');
const config = require('../config');

// mailgun HTTP API interface
const mailgun = require('mailgun-js')({
	apiKey: config.mailgun.apiKey,
	domain: config.mailgun.domain,
});

// instantiate templates into memory for efficiency
const passwordResetTemplate = hbs.compile(fs.readFileSync(path.join(__dirname, '../../mail/passwordReset.hbs'), 'utf-8'));

/**
 * Internal helper function to send a message using the mailgun API
 * and also convert the API to promise format.
 * 
 * @private
 * @param data a object to pass to mailgun to send ({ to, from, subject, html } and possible more)
 */
const sendMessage = data => new Promise((resolve, reject) => {
	mailgun.messages().send(data, (err, body) => {
		if (err)
			return reject(err);
		return resolve(body);
	});
});

/**
 * Send a password reset email
 * 
 * @param {String} email      email address of recipient
 * @param {String} firstName  first name of recipient
 * @param {String} code       reset code
 */
const sendPasswordReset = (email, firstName, code) => {
	const data = {
		to: email,
		from: 'UCLA ACM <membership@mail.uclaacm.com>',
		subject: 'ACM Membership Password Reset',
		html: passwordResetTemplate({ 
			email,
			firstName, 
			link: `https://members.uclaacm.com/resetpassword/${code}`,
		}),
	};
	return sendMessage(data);
}

module.exports = { sendPasswordReset };