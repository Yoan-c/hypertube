let http = require('http');
let url = require("url")
let search = require("./search.js")
let querystring = require('querystring');
let whirlpool = require('whirlpool');
let data = require('./db_hypertube.js');
var jwt = require('jsonwebtoken');
let request = require("request");
let mail = require("./mail.js");
let StreamClient = require('./stream-client')
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
			let token2
			token2 = (params["token"])? params["token"] : querystring.parse(url.parse(req.url).query).token;
			if (token && token2 && token != token2)
				token = token2
			jwt.verify(token, 'qwerty', function(err, decoded) {
				params = querystring.parse(post)
				if (err)
				{
					console.log("erreur http checkTorrent")
					res.writeHead(401, {'Content-Type': 'text/html'});
					res.write('Erreur');
					console.log("test")
					res.end()
				}
				else
					if (query == "/users")
					{
						data.get_all_user(decoded).then(data =>{
							res.write(JSON.stringify({"ret" : data}));
							res.end();
						}).catch(err=>{
							res.write(JSON.stringify({"ret" : err}));
							res.end();
						})
					}
					else if (query == "/search" )
					{
						var params = querystring.parse(url.parse(req.url).query);
						if (params["imdb"] && params["id"] && params["code"])
						{
							search.getFile(params["id"], params["code"], params["imdb"]).then((result) => {
								data.get_Film(params).then(resultat=>{
									console.log("RESULTAT ", resultat)
									result.film = resultat
									res.write(JSON.stringify(result));
									res.end();
								}).catch(err=>{
									console.log("PAS TROUVEEEE ")
									result.film = "" 
									res.write(JSON.stringify(result));
									res.end();
								})
							})
						}
						else if (params["name"])
						{
							search.getFile_by_tag(params["name"]).then((resultat) => {
								data.get_Film_User(decoded).then((result)=>{
									res.write(JSON.stringify({"films" : resultat, "film_vue" : result.film_vue}));
									res.end();
								}).catch(err=>{
									res.write(JSON.stringify(err));
									res.end();
								})
							
							
							})
						}
						else if (params && Number(params['av']) && params['av'] == 1)
						{
							console.log(params)
							search.advance(params).then(resultat =>{
								data.get_Film_User(decoded).then((result)=>{
									if (resultat == "FIN")
										res.write(JSON.stringify({"ret" : resultat}));
									else 
										res.write(JSON.stringify({"films" : resultat, "film_vue" : result.film_vue}));
									res.end();
								}).catch(err=>{
									res.write(JSON.stringify(err));
									res.end();
								})
							}).catch(err=>{
								console.log("rien trouve")
								if (err == "fin")
								res.write(JSON.stringify({status : false}));
							res.end();
							})
						}
						else
						{
							if (!params["page"])
								params["page"] = '1'
							search.getFile_by_page(Number(params["page"])).then((resultat) => {
								data.get_Film_User(decoded).then((result)=>{
									res.write(JSON.stringify({"films" : resultat, "film_vue" : result.film_vue}));
									res.end();
								}).catch(err=>{
									res.write(JSON.stringify(err));
									res.end();
								})
							}).catch(error=>{
									res.write(JSON.stringify(error));
									res.end();
								
							})
						}
					}
					else if (query == "/info_profile")
					{
						if (params['modif'] == "false")
						{
							console.log(":A")
							data.getProfile(decoded).then((data) =>{
								console.log("Data profile " , data)
								res.write(JSON.stringify(data));
								res.end();
							}).catch(err=>{
								console.log("erreur "+ err)
								res.end();
							})
						}
						else
						{
							console.log(":BBBBBBBBBBBBBBBBBBB")
							if (params["password"])
								params["password"] = whirlpool(params["password"])
							data.setProfile(decoded, params, jwt).then(data =>{
								console.log("Modification success" + data)
								let response = {
									token : data,
									result : true,
									status : true
								}
								res.write(JSON.stringify(response));
								res.end();
							}).catch(err=>{
								console.log("Modification failed " + err)
								res.write(JSON.stringify(err));
								res.end();
							})
						}
					}
					else if (query == "/comment")
					{
						if (params.comment)
						{
							console.log("params ", params)
							data.comment(params, decoded)
							res.end()
						}
						else
							res.end()
					}
					else if (query == "/see")
					{
						if (params && params["magnet[]"], params['code'] && params['imdb'] && params['id'])
						{

							//console.log(params["magnet[]"][0])
							/*let magnet = params["magnet[]"][0]
							let client = new StreamClient()
							client.add(magnet)
							client.on("message", data=>{
								console.log("message ", data)
							})
							client.on("err", data=>{
								console.log("error ", data)
							})*/
							data.addFilm(params, decoded).then(data=>{
							}).catch(err=>{
								console.log("err FILM ", err)
							})
							
						}
							res.end()
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
							//let token = jwt.sign({username : data}, "qwerty");
							let response = {
								token: data.token,
								lang: data.lang,
								status: true
							}
							res.write(JSON.stringify(response))
							res.end()
						}).catch((err) =>{
							res.write(JSON.stringify({status : false, "err" : err}))
							res.end()
						})
					}
					else
					{
						params.password = whirlpool(params.password)
						data.createUser(params, jwt).then(data=>{
							let response = {
								token : data,
								result : true,
								status : true
							}
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
			else if (query == "/reset")
			{
				if (params['login'] && params['mail'])
				{
					data.reset(params, jwt).then(data=>{
						console.log(data)
						mail.sendMail(params, data).then(response=>{
							console.log("email send")
							res.write(JSON.stringify({status : "ok"}))
							res.end()
							
						}).catch(err =>{
							console.log("email not send", err)
							res.end()
							
						})
					}).catch(err=>{
						console.log("erreur reset http ", err)
						res.end()
					})
				}
				else
				{
					res.write(JSON.stringify({"erreur" : "erreur", "login" : params['login'], "email" : params['mail']}))
					res.end()
				}
			}
			else if (query == "/resetMdp")
			{
				if (params["mdp"] && params["token"])
				{
					params["mdp"] = whirlpool(params["mdp"])
					data.resetPass(params, jwt).then(data=>{
						res.write(JSON.stringify({"token" : data}))
						res.end()
					}).catch(err=>{
						console.log("erreur ", err)
						res.write(JSON.stringify({"token" : ""}))
						res.end()
					})
				}
				else
					res.end()
			}
			else if (query == "/verify")
			{
				if (params["token"])
					data.verify(params["token"], jwt).then(data=>{
						console.log("ici", data)
						res.write(JSON.stringify({"success" : data}))
						res.end()
					}).catch(err=>{
						res.write(JSON.stringify({"success" : data}))
						res.end()
					})
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
