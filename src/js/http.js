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
let path = require('path');
let fs = require('fs');

let apiArray = []
var mimeTypes = {
	 "html": "text/html",
	};

// One week in seconde
let Sec_Semaine = 60*60*24*7

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

setInterval(data.check_film, Sec_Semaine*2*1000);

let server = http.createServer(function (req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Content-Type", "application/json");
	res.setHeader("Access-Control-Allow-Headers","Origin, Authorization, X-Requested-With, Content-Type, Accept");
	
	let query = url.parse(req.url).pathname;
/*	var filename = path.join(process.cwd(), query);
	fs.access(filename, function(exists) {
		if(!exists) {
			console.log("not exists: " + filename);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write('404 Not Found\n');
			res.end();
		}
		var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
		res.writeHead(200, "text/plain");
		var fileStream = fs.createReadStream(filename);
		fileStream.pipe(res);
	});
*/	
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
									result.film = resultat
									res.write(JSON.stringify(result));
									res.end();
								}).catch(err=>{
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
									if (resultat == "FIN" || resultat == "NO")
										res.write(JSON.stringify({"ret" : resultat}));
									else
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
							search.advance(params).then(resultat =>{
								data.get_Film_User(decoded).then((result)=>{
									if (resultat == "FIN" || resultat == "NO")
										res.write(JSON.stringify({"ret" : resultat}));
									else 
										res.write(JSON.stringify({"films" : resultat, "film_vue" : result.film_vue}));
									res.end();
								}).catch(err=>{
									res.write(JSON.stringify(err));
									res.end();
								})
							}).catch(err=>{
								if (err == "fin")
								res.write(JSON.stringify({status : false}));
							res.end();
							})
						}
						else if (params && params["page"])
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
							data.getProfile(decoded).then((data) =>{
								res.write(JSON.stringify(data));
								res.end();
							}).catch(err=>{
								res.end();
							})
						}
						else
						{
							if (params["password"])
								params["password"] = whirlpool(params["password"])
							data.setProfile(decoded, params, jwt).then(data =>{
								let response = {
									token : data,
									result : true,
									status : true
								}
								res.write(JSON.stringify(response));
								res.end();
							}).catch(err=>{
								res.write(JSON.stringify(err));
								res.end();
							})
						}
					}
					else if (query == "/comment")
					{
						if (params.comment)
						{
							data.comment(params, decoded)
							res.end()
						}
						else
							res.end()
					}
					else if (query == "/subtitle")
					{
						params = querystring.parse(url.parse(req.url).query);
						search.search_sub(params, path).then(data=>{
								res.write(JSON.stringify(data));
							res.end()
						})
					}
					else if (query == "/see")
					{
						if (params && params["magnet"], params['code'] && params['imdb'] && params['id'])
						{
							let code_Magnet = params["magnet"].split(":")
							code_Magnet = code_Magnet[(code_Magnet.length -1)]
							params["code_Magnet"] = code_Magnet;
							let magnet = params["magnet"]
							let client = new StreamClient()
							client.add(magnet)
							client.on("message", data=>{
								res.write(JSON.stringify({"data" : data}));
								res.end();
							})
							client.on("err", data=>{
								res.write(JSON.stringify({"err" : data}));
								res.end();
							})
							data.addFilm(params, decoded).then(data=>{
							}).catch(err=>{
								res.write(JSON.stringify({"err" : data}));
								res.end();
							})
							
						}
						else
							res.end();
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
						mail.sendMail(params, data).then(response=>{
							res.write(JSON.stringify({status : "ok"}))
							res.end()
							
						}).catch(err =>{
							res.write(JSON.stringify({status : "email"}))
							res.end()
							
						})
					}).catch(err=>{
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
						res.write(JSON.stringify({"success" : data}))
						res.end()
					}).catch(err=>{
						res.write(JSON.stringify({"success" : data}))
						res.end()
					})
				else
					res.end()
			}
			else if (query == "/oauth")
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
			else{

					query = url.parse(req.url).pathname;
					query = querystring.unescape(query)
					var filename = path.join(process.cwd(), query);
					fs.exists(filename, function(exists) {
						if(!exists) {
							res.writeHead(200, {'Content-Type': 'text/plain'});
							res.write('404 Not Found\n');
							res.end();
							return 
						}
						res.writeHead(200, "text/plain");
						var fileStream = fs.createReadStream(filename);
						fileStream.pipe(res);
					});
				//res.end()
			}
		}
	})
})
server.listen(8080);
