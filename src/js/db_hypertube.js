let mongo = require("mongodb").MongoClient;
let assert = require("assert")
let request = require("request");
let tab_fct = []

exports.createUser = (tab_user) => {

	return new Promise ((result, error) =>
	{
		mongo.connect("mongodb://localhost:27017/hypertube", function(err, db){
			if (err) error(err)
			db.collection("user").findOne({"username" : tab_user["login"], "email" : tab_user["mail"] }).then(data=>{
				if (err)
				{
					db.close();
					error(err);
				}
				else if (data)
				{
					db.close();
					error("login or mail already exists");
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
							db.collection('user').insertOne({
								"username" : tab_user["login"],
								"email" : tab_user["mail"],
								"profil_picture" : tab_user["photo"],
								"first_name" : tab_user["firstname"],
								"last_name" : tab_user["lastname"],
								"password" : tab_user["password"],
								"langue" : (tab_user["langue"]) ? tab_user["langue"] : "EN",
								"film_vue" : [{}],
								"tokens" : [tab_user["token"]]
							}, (err, res) =>{
								if (err)
								{
									db.close();
									error("erreur createUser")
								}
								db.close();
								result("ok");
							})
						}
					})
				}
			}).catch(err=>{
				console.log("passe la")
				db.close()
				if (err) error("erreur recherche createUser "+err);
			})
		})
	})
}


tab_fct["insertFilm"] = (db, tab_film, callback) =>{
	db.collection('film').insertOne({
		"title" : tab_film['title'],
		"imdb" : tab_film['imdb'],
		"view" : 0,
		"categorie" : tab_film['categorie'],
		"quality" : tab_film["magnet"],
		"comments" : [{}]
	}, (err, res) =>{
		assert.equal(err, null);
		console.log("insert film");
		callback();
	})
}

exports.userAutentication = (login, password, jwt) =>{

	return new Promise ((result, error) =>
	{
		mongo.connect("mongodb://localhost:27017/hypertube", function (err, db){
			if (err) error("erreur de connection")
			db.collection("user").findOne({"username" : login}).then(data=>{
				if (data && data.password && password && password === data.password)
				{
					let t = jwt.sign({username : data.username}, "qwerty");
					db.collection("user").updateOne(
						{"username" : data.username},
						{
							$set : {"tokens" : t }
						}, (err, res) =>{
							if (err) console.log("erreur update token")
						})
					db.close();
					result(t)
				}
				else
				{
					db.close();
					error("user not found : please check your login/password")
				}
			}).catch(err=>{
				db.close();
				console.log(err)
				error(" erreur user autentication");
			})
		})
	})
}

exports.checkToken = (token) =>{
	return new Promise((result, error) =>{
		mongo.connect("mongodb://localhost:27017/hypertube", function (err, db){
			if (err) error("erreur recherche de token")
			db.collection("user").findOne({"tokens" : token}).then(data=>{
				if (data)
					result(true)
				error(false)
			}).catch(err=>{
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
		mongo.connect("mongodb://localhost:27017/hypertube", function (err, db){
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
					console.log("entre DATA")
					let t = jwt.sign({username : data.username}, "qwerty");
					db.collection("user").updateOne(
						{"username" : info["login"]},
						{
							$set : {"tokens" : t }
						}, (err, res) =>{
							if (err) console.log("erreur update OAUTH token")
						})
					db.close();
					result(t)
				}
				else
				{
					console.log("INFO ", info)
					let t = jwt.sign({username : info['login']}, "qwerty");
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
			console.log("erreur 22" + err)
				error(false)
			})
		})
	})
}
