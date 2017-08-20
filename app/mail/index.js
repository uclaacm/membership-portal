const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');
const config = require('../config');
const mailgun = require('mailgun-js')({
	apiKey: config.mailgun.apiKey,
	domain: config.mailgun.domain,
});

const passwordResetTemplate = hbs.compile(fs.readFileSync(path.join(__dirname, '../../mail/passwordReset.hbs'), 'utf-8'));

const sendMessage = data => new Promise((resolve, reject) => {
	mailgun.messages().send(data, (err, body) => {
		if (err)
			return reject(err);
		return resolve(body);
	});
});

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