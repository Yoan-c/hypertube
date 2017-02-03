let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
	service : "hotmail",
	auth : {
		user : "Hypertube972@hotmail.fr",
		pass : "Hypertube"
	}
});

exports.sendMail = (data, tab) =>
{
	return new Promise ((result, err) =>
	{
		let mailOptions = {
			from: "hypertube972@hotmail.com",
			to: data['mail'],
			subject: "mail mdp",
			html: "Forget password ? <a href='http://localhost:3002/reset?lang="+tab.lang+"&token="+tab.token+"'>click here</a>"
		};
		
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log(error);
				err(" not send ")
			}
			else
			{
				console.log('Message sent: ' + info.response);
				result("mail send ")
			}
		});
	})
}
