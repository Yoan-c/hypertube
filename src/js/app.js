import Vue from 'vue'
import Hello from './component/Hello'
import Index from './component/Index'
import Profile from './component/Profile'
import Search from './component/Search'
import Forget from './component/Forget'
import Error from './component/Error'
import Reset from './component/Reset'
import Oauth from './component/Oauth'
import Film from './component/Film'
import VueRouter from 'vue-router'
import VueRessource from 'vue-resource'

let field = require("./field.js")


/*
 * Bootstrap and Dependence
 */
window.$ = window.jQuery = require('jquery')
window.Tether = require('tether')
require('bootstrap')

Vue.use(VueRouter)
Vue.use(VueRessource)
Vue.http.options.emulateJSON = true;

const default_lang = "EN"
const tab_lang = ["FR", "EN"]
let path_auto = ["/login", "/oauth/42/callback", "/oauth/google/callback", "/oauth/slack/callback", "/oauth/facebook/callback", "/oauth/github/callback", "/forget", "/reset"]

const api_url = 'http://e3r10p6.42.fr:8080'

Vue.http.options.root = api_url

const routes =
	[
		{ path: '/login', component: Index },
		{ path: '/profile', component: Profile },
		{ path: '/error', component: Error },
		{ path: '/forget', component: Forget },
		{ path: '/reset', component: Reset ,
			beforeEnter : (to, from, next) =>{
				if (to.query.lang)
					localStorage.setItem("lang", to.query.lang)
				else
					localStorage.setItem("lang", "EN")
				if (to.query.token)
					next();
				else
					router.push("/login")
						return ;
			}
		},
		{ path: '/oauth/42/callback', component: Oauth },
		{ path: '/oauth/google/callback', component: Oauth },
		{ path: '/oauth/slack/callback', component: Oauth },
		{ path: '/oauth/facebook/callback', component: Oauth },
		{ path: '/oauth/github/callback', component: Oauth },
		{ path: '/search', alias: '/', component: Search },
		{ path: '/search/:imdb/:id/:code', component: Film,
			beforeEnter : (to , from, next) =>{
				let reg = /^tt\d{7}$/
				let res = reg.exec(to.params.imdb);
				if (res && (to.params.code == "Y" || to.params.code == "P") && to.params.id)
					next();
				else
					next(false);
			}
		}

	]
const router = new VueRouter({
			mode : 'history',
			routes // short for routes: routes
	})

router.beforeEach((to, from, next)=>{
	let token = window.localStorage.getItem("token")

	if (token)
	{
		Vue.http.headers.common["Authorization"] = "Bearer "+token
		console.log("router add " + Vue.http.headers.common["Authorization"])
	}
	else
		delete Vue.http.headers.common["Authorization"]

	if (token && to.path == "/login")
		return next("/")

	if (token || path_auto.indexOf(to.path) >= 0 || to.path == "/oauth/google/callback")
	{
		return next()
	}
	next("/login")
})
import auth from "./function.js"
new Vue ({
	router,
	data : {
		log : "logout"
	},
	http: {
		root: '/',
	},
	methods : {
		logout: function() {
			auth.logout(this);
			delete Vue.http.headers.common["Authorization"]
			router.push("/login")
	//		this.log = auth.i18n("authentication.logout")
		},
		check : function() {
			let token = localStorage.getItem("token");
			this.log = auth.i18n("authentication.logout")


			return token ? true : false;
		}
	},

}).$mount('#page')

export default {
	redirect(redirect){
		router.push(redirect);
	},
	add_token(token){
		localStorage.setItem("token", token)
	},
	remove_token(){
		localStorage.removeItem('token')
	}
	/*
	login(context, redirect){
		context.$http.post('http://localhost:8080/login', {create : false, login : context.login, password : context.password}).then(data =>
			{
				console.log("data ")
				if (data.body.token)
				{
					window.localStorage.setItem("token", data.body.token)
					window.localStorage.setItem("lang", data.body.lang)
					if (redirect)
						router.push(redirect)
				}
				console.log("data ", data.body)
			}).catch(err =>{
				console.log("errr trois ", err)
			})
	},
	log(token, redirect){
		if (token)
		{
			console.log("TOKEN "+ token)
			window.localStorage.setItem("token", token)
			if (redirect)
				router.push(redirect)
		}
		else
			router.push("/login")
	},

	signup(context, redirect){
		context.$http.post("http://localhost:8080/login", {create : true, login : context.login, password : context.password, lastname : context.lastname, firstname : context.firstname, mail : context.mail, photo : context.photo}).then(data =>
		{
			console.log(data)
			if (data.body.result)
			{
				localStorage.setItem("token", data.body.token)
				console.log("compte bien cree")
				if (redirect)
					router.push(redirect)
			}
			else
				console.log("le compte n'a pas ete cree " + data.body.data)
		}).catch(err=>{
			console.log("erreur lors de la creation de compte")
		})
	},
	logout(){
		localStorage.removeItem('token')
		delete Vue.http.headers.common["Authorization"]
		console.log("TEST")
		router.push("/login")
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
	}*/
}



