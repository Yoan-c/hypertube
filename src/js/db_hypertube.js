let mongo = require("mongodb").MongoClient;
let assert = require("assert")
let request = require("request");
let tab_fct = []
let fs = require('fs');

// TODO url ici
//const mongo_url = 'mongodb://e3r10p6.42.fr:27017/hypertube'
const mongo_url = 'mongodb://localhost:27017/hypertube'

exports.createUser = (tab_user, jwt) => {

	return new Promise ((result, error) =>
	{
		mongo.connect(mongo_url, function(err, db){
			if (err) error(err)
			db.collection("user").findOne({"username" : tab_user["login"]}).then(data=>{
				if (err)
				{
					db.close();
					error(err);
				}
				else if (data)
				{
					db.close();
					error("login already exists");
				}
				else
				{
					db.collection("user").findOne({ "email" : tab_user["mail"] }).then( resultat =>{
						if (resultat)
						{
							db.close();
							error("mail already exists");
						}
						else
						{
							var token = jwt.sign({username : tab_user['login'], email : tab_user["mail"]}, "qwerty");
							db.collection('user').insertOne({
								"username" : tab_user["login"],
								"email" : tab_user["mail"],
								"profil_picture" : tab_user["photo"],
								"first_name" : tab_user["firstname"],
								"last_name" : tab_user["lastname"],
								"password" : tab_user["password"],
								"langue" : (tab_user["langue"]) ? tab_user["langue"] : "EN",
								"film_vue" : [],
								"tokens" : [token]
							}, (err, res) =>{
								if (err)
								{
									db.close();
									error("erreur createUser")
								}
								db.close();
								result(token);
							})
						}
					})
				}
			}).catch(err=>{
				db.close()
				if (err) error("erreur recherche createUser "+err);
			})
		})
	})
}


exports.userAutentication = (login, password, jwt) =>{

	return new Promise ((result, error) =>
	{
		mongo.connect(mongo_url, function (err, db){
			if (err) error("erreur de connection")
			db.collection("user").findOne({"username" : login}).then(data=>{
				if (data && data.password && password && password === data.password)
				{
					let t = jwt.sign({username : data.username, email : data.email}, "qwerty");
					db.collection("user").updateOne(
						{"username" : data.username},
						{
							$set : {"tokens" : t }
						})
					db.close();
					result({"token" : t, "lang" : data.langue})
				}
				else
				{
					db.close();
					error("error.user")
					//error("user not found : please check your login/password")
				}
			}).catch(err=>{
				db.close();
				error(" erreur user autentication");
			})
		})
	})
}

exports.checkToken = (token) =>{
	return new Promise((result, error) =>{
		mongo.connect(mongo_url, function (err, db){
			if (err) error("erreur recherche de token")
			db.collection("user").findOne({"tokens" : token}).then(data=>{
				db.close();
				if (data)
					result(true)
				error(false)
			}).catch(err=>{
				db.close();
				error(false)
			})
		})
	})
}


function fill_tab (state, params)
{
	let info = []
	if (state == "42")
	{
		info['login'] = params["login"];
		info['email'] = params["email"];
		info['image_url'] = params["image_url"];
		info['first_name'] = params["first_name"];
		info['last_name'] = params["last_name"];
	}
	else if (state == "google")
	{
		info['login'] = params["nickname"];
		info['email'] = params["emails"][0].value;
		info['image_url'] = params["image"].url;
		info['first_name'] = params["name"].familyName;
		info['last_name'] = params["name"].givenName;
	}
	else if (state == "slack")
	{
		info['login'] = params.user.name;
		info['email'] = params.user.email;
	}
	else if (state == "github")
	{
		info['login'] = params.login;
		info['image_url'] = params.avatar_url;
		info['email'] = params.email;
	}
	info.langue = "EN";
	return (info)
}

exports.checkUserOAUTH = (params, jwt, state) =>{
	return new Promise((result, error) =>{
		mongo.connect(mongo_url, function (err, db){
			if (err) error("erreur recherche de OAUTH")
			if (state == "google")
				var email  = params["emails"][0].value
			else if (state == "42")
				var email  = params["email"]
			else if (state == "slack")
				var email  = params.user.email
			else
				var email  = params.email
			db.collection("user").findOne({"email" : email}).then(data=>{

				let info = fill_tab(state, params);
				if (data)
				{
					let t = jwt.sign({username : data.username, email : data.email}, "qwerty");
					db.collection("user").updateOne(
						{"username" : info["login"]},
						{
							$set : {"tokens" : t }
						})
					db.close();
					result(t)
				}
				else
				{
					let t = jwt.sign({username : info['login'], email : info['email']}, "qwerty");
					db.collection('user').insertOne({
						"username" : info['login'],
						"email" : info['email'],
						"profil_picture" : info['image_url'],
						"first_name" : info['first_name'],
						"last_name" : info['last_name'],
						"langue" : info['langue'],
						"film_vue" : [{}],
						"tokens" : [t]
					}, (err, res) =>{
						db.close();
						if (err)
							error("erreur createUser")
						else
							result(t);
					})
				}
			}).catch(err=>{
				error(false)
			})
		})
	})
}

exports.getProfile = (tab) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in getProfile")
			db.collection("user").findOne({"username" : tab.username, "email" : tab.email}).then(data=>{
				db.close()
				if (!data)
					error("NO data found")
				result({login : data.username, email : data.email, picture : data.profil_picture, first_name : data.first_name, last_name : data.last_name, langue : data.langue});
			}).catch(err=>{
				error("search failed getProfile")
			})
		})
	})
}

exports.setProfile = (tab, params, jwt) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
			{
				db.close()
				error("open mongo failed in getProfile")
			}
			db.collection("user").findOne({"username" : tab.username, "email" : tab.email}).then(data=>{
				if (!data)
				{
					db.close()
					error("NO data found")
				}
				else
				{
					let token = jwt.sign({username : data.username , email : (params['email']) ? params['email'] : data.email}, "qwerty")
					db.collection("user").updateOne(
						{"_id" : data._id},
						{
							$set :	{"email" : (params['email']) ? params['email'] : tab.email, "profil_picture" : params['photo'], "first_name" : (params['first_name']) ? params['first_name'] : data.first_name, "last_name" : (params['last_name']) ? params['last_name'] : data.last_name , "langue" : (params['langue']) ? params['langue'] : data.langue , "password" : (params['password']) ? params['password'] : data.password, tokens : token}
						}, (err, res) =>{
							db.close();
							if (err)
								error("erreur update user")
							else
								result(token);
						})
				}
			}).catch(err=>{
				error("search failed setProfile "+ err)
			})
		})
	})
}

exports.reset = (params, jwt) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			db.collection("user").findOne({"username" : params['login'], "email" : params['mail']}).then(data=>{
				if (!data)
				{
					db.close()
					error("NO data found")
				}
				else
				{
					if (data.password)
					{
						let t = jwt.sign({username : data.username , email : data.email}, "qwerty")
						db.collection("user").updateOne(
							{"_id" : data._id},
							{
								$set : {"tokens" : t, "password" : t}
							}, (err, res)=>{
								db.close()
								if (err)
									error("erreur reset user")
								else
									result({"token" : t, "lang" : data.langue});
							})
					}
				}
			}).catch(err=>{
				error("search failed reset")
			})
		})
	})
}


exports.resetPass = (params, jwt) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			jwt.verify(params["token"], "qwerty", function (err, decoded){
				db.collection("user").findOne({"username" : decoded.username, "email" : decoded.email}).then(data=>{
					if (!data)
					{
						db.close()
						error("NO data found")
					}
					else
					{
						let token = jwt.sign({username : data.username , email : data.email}, "qwerty")
							db.collection("user").updateOne(
								{"_id" : data._id},
								{
									$set : {"tokens" : token, "password" : params["mdp"]}
								}, (err, res)=>{
									db.close()
									if (err)
										error("erreur reset user")
									else
										result(token);
								})
					}
				}).catch(err=>{
					error("search failed reset")
				})
			})
		})
	})
}

exports.verify = (token, jwt) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			jwt.verify(token, "qwerty", function (err, decoded){
				db.collection("user").findOne({"username" : decoded.username, "email" : decoded.email}).then(data=>{
					if (!data)
					{
						db.close()
						error("NO data found")
					}
					else
					{
						db.close()
						if (token == data.tokens)
							result("true")
						else
							error("false")
					}
				}).catch(err=>{
					error("false")
				})
			})
		})
	})
}

function ajout_film(params)
{
	mongo.connect(mongo_url, function(err, db){
		if (err)
			return
		else
		{
			db.collection("film").findOne({"code" : params['code'], "id" : params['id'], "imdb" : params['imdb']}).then(data=>{
				if (!data)
				{
					db.collection("film").insertOne({
						"code" : params['code'],
						"code_Magnet" : params['code_Magnet'],
						"imdb" : params['imdb'],
						"id" : params["id"],
						"comment" : [],
						"month" : new Date().getMonth(),
						"day" : new Date().getDate()
						},(err, res)=>{
						db.close()
						return
					})
				}
				else
				{
					db.collection("film").updateOne(
						{"_id" : data._id},
						{
							$set : {"month" : new Date().getMonth(), "day" : new Date().getDate() }
						}, (err, res)=>{
							db.close()
							if (err)
								console("erreur film")
					})
				}
			})
		}
	})
}

exports.comment = (params, decoded) =>{
	mongo.connect(mongo_url, function(err, db){
		if (err)
			return
		else
		{
			db.collection("film").findOne({"code" : params.code, "id" : params.id, "imdb" : params.imdb}).then(data=>{
				if (!data)
				{
					db.collection("film").insertOne({
						"code" : params.code,
						"imdb" : params.imdb,
						"id" : params.id,
						"comment" : [{ login : decoded.username, comment : params.comment}],
						"month" : new Date().getMonth(),
						"day" : new Date().getDate()
						},(err, res)=>{
						db.close()
						return
					})
				}
				else
				{
					db.collection("film").updateOne(
						{"_id" : data._id},
						{
							$push : {"comment" : {login : decoded.username , comment : params.comment}}
						}, (err, res)=>{
							db.close()
							if (err)
								console("erreur film")
					})
				}
			})
		}
	})
}

exports.addFilm = (params, decoded) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			{
				db.collection("user").findOne({"username" : decoded.username, "email" : decoded.email}).then(data=>{
					if (!data)
					{
						db.close()
						error("NO data found")
					}
					else
					{
						let ok = false
						for (let i = 0; i < data.film_vue.length -1; i++)
							if (data.film_vue[i].code == params['code'] && data.film_vue[i].imdb == params["imdb"] && data.film_vue[i].id == params["id"])
								ok = true
						if (!ok)
						{
							db.collection("user").updateOne(
								{"_id" : data._id},
								{
									$push : {"film_vue" : {code : params['code'], imdb : params['imdb'] , id : params['id']}}
								}, (err, res)=>{
									db.close()
									if (err)
										error("erreur reset user")
									else
									{
										ajout_film(params)
										result(data);
									}
								})
						}
					}
				}).catch(err=>{
					db.close()
					error("false")
				})
			}
		})
	})
}

exports.get_Film_User = (decoded) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			{
				db.collection("user").findOne({"username" : decoded.username, "email" : decoded.email}).then(data=>{
					db.close()
					if (!data)
					{
						error("NO data found")
					}
					else
						result(data);
				}).catch(err=>{
					error("false")
				})
			}
		})
	})
}
exports.get_Film = (params) =>{
	return new Promise ((result, error)=>{
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			{
				db.collection("film").findOne({"code" : params["code"], "id" : params['id'], "imdb" : params['imdb']}).then(data=>{
					db.close()
					if (!data)
						error("NO data found")
					else
						result(data);
				}).catch(err=>{
					error("false")
				})
			}
		})
	})
}

exports.get_all_user = (decoded) =>{
	return new Promise ((result, error)=>{
		let tab_user = [];
		mongo.connect(mongo_url, function(err, db){
			if (err)
				error("open mongo failed in reset")
			else
			{
				data = db.collection("user").find().toArray((err, res)=>{
					db.close()
					if (res)
					{
						res.forEach(elem=>{
							tab_user.push({
								username : elem.username,
								picture : elem.profil_picture,
								first_name : elem.first_name,
								last_name : elem.last_name,
							})
						})
						result(tab_user);
					}
					else
						error("err")
				})
			}
		})
	})
}

exports.check_film = _=>{
	mongo.connect(mongo_url, function(err, db) {
		if (err) return

		db.collection("film").find().toArray((err, res)=>{
			if (res)
			{
				let currentMonth = new Date().getMonth()
				let currentDay = new Date().getDate()
				res.forEach((elem, i)=>{
					let path = "/tmp/test/"+elem.code_Magnet
					if (elem.month < currentMonth)
					{
						if (elem.day < currentDay)
						{
							db.collection("film").remove({_id : elem._id})
							fs.access(path , err => {
								if (err)
									return
								else
									fs.readdir(path, (err, file) =>{
										for (let i = 0; i < file.length; i++)
											fs.unlink(path+"/"+file[i], err=>{
												if (err)
													return
											})
										fs.rmdir(path, err=>{
											if (err)
												return
										})
									})
							})
						}
					}
					if (i == res.length -1)
						db.close()
				})
			}
			else
			{
				db.close()
				return
			}
		})
	})
}
