let http = require('http');
let url = require("url")
let search = require("./search.js")
let querystring = require('querystring');
let whirlpool = require('whirlpool');
let data = require('./db_hypertube.js');
var jwt = require('jsonwebtoken');
let request = require("request");

let apiArray = []
apiArray["42"] = {
	uri_co : "https://api.intra.42.fr/oauth/token",
	client_id : "8a8c56a0edca0a04a3e1b89b70ba2a4b79f03f2c07784856a8d21d89547d9039",
	client_secret : "8411f18854005bb942bbcd88349651cf5811c0e7b14549d634fe1960409e6c8c",
	uri_req : "https://api.intra.42.fr/v2/me",
	redirect_uri : "http://localhost:3002/oauth/42/callback"
}

apiArray["google"] = {
	uri_co : "https://www.googleapis.com/oauth2/v4/token",
	client_id : "161312720047-a6o6f6iss7u5vonsq8og5g31c0hqsh4n.apps.googleusercontent.com",
	client_secret : "TyibLqZynsGsidCkMcAjjsq2",
	uri_req : "https://www.googleapis.com/plus/v1/people/me",
	redirect_uri : "http://localhost:3002/oauth/google/callback"
}

apiArray["slack"] = {
	uri_co : "https://slack.com/api/oauth.access",
	client_id : "3329266210.130370627137",
	client_secret : "9c2c70ad426e23734dfacde8a4b5c037",
	uri_req : "slack.com/api/oauth.access",
	redirect_uri : "http://localhost:3002/oauth/slack/callback"
}

apiArray["facebook"] = {
	uri_co : "https://graph.facebook.com/v2.8/oauth/access_token",
	client_id : "242812276172970",
	client_secret : "05104fd0f94dd7d7d3345cb6deba2a8e",
	uri_req : "https://graph.facebook.com/v2.8/oauth/access_token",
	redirect_uri : "http://localhost:3002/oauth/facebook/callback"
}


apiArray["github"] = {
	uri_co : "https://github.com/login/oauth/access_token",
	client_id : "75c7e71cbfca78dbf304",
	client_secret : "fc2737366b4f3dbefa10ef1e883072364bc1f54a",
	uri_req : "https://api.github.com/user",
	uri_req2 : "https://api.github.com/user/emails",
	redirect_uri : "http://localhost:3002/oauth/github/callback"
}

var fill_data = (result, jwt, state, res) => {
	data.checkUserOAUTH(result, jwt, state).then(data =>{
		console.log("auth OK ")
		let response = {
			token : data,
			result : true,
			status : true
		}
		res.write(JSON.stringify(response))
		res.end()
		}).catch(err=>{
			console.log("erreur "+ err)
		})
}

let server = http.createServer(function (req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Content-Type", "application/json");
	res.setHeader("Access-Control-Allow-Headers","Origin, Authorization, X-Requested-With, Content-Type, Accept");
	let query = url.parse(req.url).pathname;
	let post = ''
	req.setEncoding('utf8')
	req.on("data", data => {
		post += data
	})
	req.on('end', _ => {
		let params = querystring.parse(post)
		if (req.headers.authorization)
		{
			let token = req.headers.authorization.split(" ")[1]
			console.log("il y a un token ", token)
		jwt.verify(token, 'qwerty', function(err, decoded) {
			  console.log( "TEST DECODE ", decoded) // bar
			if (err)
			{
				console.log("erreur http checkTorrent")
				res.writeHead(401, {'Content-Type': 'text/html'});
				res.write('Erreur 401.');
				res.end()
			}
			else
				if (query == "/search" )
				{
					var params = querystring.parse(url.parse(req.url).query);
					if (params["imdb"] && params["id"] && params["code"])
					{
						search.getFile(params["id"], params["code"], params["imdb"]).then((data) => {
							res.write(JSON.stringify(data));
							res.end();
						})
					}
					else if (params["name"])
					{
						search.getFile_by_tag(params["name"]).then((data) => {
							res.write(JSON.stringify(data));
						res.end();
						})
					}
					else
					{
						search.getFile_by_page(0).then((data) => {
							res.write(JSON.stringify(data));
						res.end();
						})
					}
				}
				else
				{
					res.writeHead(401, {'Content-Type': 'text/html'});
					res.write('Erreur 401.');
					res.end()
				}
		});
		}
		else
		{
			if (query == "/login")
			{
				if (params.login && params.password)
				{
					let password = whirlpool(params.password)
					if (params.create == "false")
					{
						data.userAutentication(params.login, password, jwt).then((data)=>{
							let token = jwt.sign({username : data}, "qwerty");
							let response = {
								token: data,
								status: true
							}
								console.log("connecte ")
							res.write(JSON.stringify(response))
							res.end()
						}).catch((err) =>{
							console.log("ERR "+err)
							res.end()
						})
					}
					else
					{
						params.token = jwt.sign({username : data}, "qwerty");
						params.password = whirlpool(params.password)
						data.createUser(params).then(data=>{
							let response = {
								data : data,
								token : params.token,
								result : true,
								status : true
							}
							console.log("compte bien cree ")
							res.write(JSON.stringify(response))
							res.end()
						}).catch(err=>{
							let response = {
								data : err,
								result : false,
							}
							res.write(JSON.stringify(response))
							res.end()
						})
					}
				}
				else
					res.end()
			}
			else if (query == "/oauth/")
			{
				 request({
					 uri :  (apiArray[params['state']]) ? apiArray[params['state']].uri_co : "null",
					method : "POST",
					headers: {'Accept': 'application/json'},
					form : {
						grant_type : "authorization_code",
						client_id : (apiArray[params['state']]) ? apiArray[params['state']].client_id : "null",
					 	client_secret : (apiArray[params['state']]) ? apiArray[params['state']].client_secret : "null",
					 	code : params["code"],
					 	redirect_uri : (apiArray[params['state']]) ? apiArray[params['state']].redirect_uri : "null",
					}
				 }, (error, response, body) =>{
					let d
					 if (!error)
						d = JSON.parse(body)
					if (d && d.access_token)
						request({
							uri : apiArray[params['state']].uri_req,
							headers: {'Authorization': 'Bearer '+d.access_token, 'User-Agent' : 'hypertube'},
							method : "GET",
						}, (err, resp, result)=>{
							if (params['state'] == "github")
							{
								request({
									uri : apiArray[params['state']].uri_req2,
									headers: {'Authorization': 'Bearer '+d.access_token, 'User-Agent' : 'hypertube'},
									method : "GET",
								}, (err, resp, result2)=>{
									let resultat = JSON.parse(result);
									console.log("RESUTAT email" + result2)
									try {
										resultat.email = JSON.parse(result2)[0].email
									}catch (e)
									{
										console.log("erreur recuperation email GITHUB "+ e)	
									}
									fill_data(resultat, jwt, params['state'], res);
								})
							}
							else
								fill_data((result) ? JSON.parse(result) : d, jwt, params['state'], res);
						})
				 })
			}
			else
				res.end()
		}
	})
})
server.listen(8080);
