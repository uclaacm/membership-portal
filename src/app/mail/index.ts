import fs from 'fs';
import path from 'path';
import hbs from 'handlebars';
import mailgun from 'mailgun-js';
import { config } from '../config';

/** mailgun HTTP API interface */
const client = mailgun({
	apiKey: config.mailgun.apiKey,
	domain: config.mailgun.domain,
});

// instantiate templates into memory for efficiency
const passwordResetTemplate = hbs.compile(fs.readFileSync(path.join(__dirname, '../../../mail/passwordReset.hbs'), 'utf-8'));

/**
 * Internal helper function to send a message using the mailgun API
 * and also convert the API to promise format.
 * 
 * @param data a object to pass to mailgun to send ({ to, from, subject, html } and possibly more -- see Mailgun.messages.SendData)
 */
const sendMessage = (data: any) => new Promise((resolve, reject) => {
	client.messages().send(data, (err, body) => {
		if (err)
			return reject(err);
		return resolve(body);
	});
});

/**
 * Send a password reset email
 * 
 * @param email email address of recipient
 * @param firstName first name of recipient
 * @param code reset code
 */
export const sendPasswordReset = (email: string, firstName: string, code: string) =>
  sendMessage({
		to: email,
		from: 'UCLA ACM <membership@mail.uclaacm.com>',
		subject: 'ACM Membership Password Reset',
		html: passwordResetTemplate({ 
			email,
			firstName, 
			link: `https://members.uclaacm.com/resetpassword/${code}`,
    })
  });
