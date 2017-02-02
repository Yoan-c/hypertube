let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
	localhost : "localhost",
	port : 25,
});

transporter.verify(function(err, succ){
	if (err)
	console.log("error ", err)
	else
	console.log("OKOKOKOKOK ")
})
exports.sendMail = (data, tab) =>
{
	return new Promise ((result, err) =>
	{
		let mailOptions = {
			from: "ycoutenay@student.42.fr",
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
