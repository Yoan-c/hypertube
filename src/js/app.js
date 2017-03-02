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
import Users from './component/Users'
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

// TODO url ici
//const api_url = 'http://e3r10p6.42.fr:8080'
const api_url = 'http://localhost:8080'

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
		{ path: '/users', component: Users },
	/*	{ path: '/See_film/:data', component: See_film,
			beforeEnter : (to, from, next)=>{
				if (to.params && to.params.data)
					next();
				else
					next(false);
			}
		},*/
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
		connect : auth.i18n("authentication.sign_in"),
		Out : auth.i18n("authentication.logout"),
		other_user : auth.i18n("search.users"),
		profile : auth.i18n("authentication.profile"),
		search : auth.i18n("authentication.search")
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
}



