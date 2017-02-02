let field = require("./field.js")

const default_lang = "EN"
import app from './app.js'
export default {
		
	login(context, redirect){
		context.$http.post('http://localhost:8080/login', {create : false, login : context.login, password : context.password}).then(data =>
		{
			if (data.body.status)
			{
				if (data.body.token)
				{
					window.localStorage.setItem("token", data.body.token)
					window.localStorage.setItem("lang", data.body.lang)
					if (redirect)
						app.redirect(redirect)
				}
			}
			else if (!data.body.status)
			{
				console.log("la erroo", data.body.err)
				context.error = this.i18n(data.body.err)
			}
		}).catch(err =>{
			console.log("errr ", err)
		})
	},
		log(token, redirect){
			if (token)
			{
				console.log("TOKEN "+ token)
					window.localStorage.setItem("token", token)
					if (redirect)
						app.redirect(redirect)
			}
			else
				app.redirect("/login")
		},

		signup(context, redirect){
			context.$http.post("http://localhost:8080/login", {create : true, login : context.login, password : context.password, lastname : context.lastname, firstname : context.firstname, mail : context.mail, photo : context.photo}).then(data =>
					{
						console.log(data)
				if (data.body.result)
			{
				app.add_token(data.body.token)
				window.localStorage.setItem("token", data.body.token)
				console.log("compte bien cree 2")
				if (redirect)
					app.redirect(redirect)
			}
				else
				console.log("le compte n'a pas ete cree " + data.body.data)
					}).catch(err=>{
				console.log("erreur lors de la creation de compte")
			})
		},
		logout(){
			app.remove_token()
			localStorage.removeItem('token')
			//	vm.router.push("/login")
		},

		getAuthHeader(){
			return {
				'Authorization' : 'Bearer ' + localStorage.getItem('token')
			}
		},
		i18n(tab)
	{
			let lang = localStorage.getItem("lang");
		return this._i18n(tab, (lang) ? lang : "EN");
	},
		_i18n (tab, lang){
			let contents = tab.split(".")
				let content = field.field[lang];
			for (let index of contents){
				if (content)
					content = content[index]
			}
			if (!content)
				return this._i18n(tab, default_lang)
					return content
		}
}
