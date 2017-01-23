import Vue from 'vue'
import Hello from './component/Hello'
import Index from './component/Index'
import Search from './component/Search'
import Oauth from './component/Oauth'
import Film from './component/Film'
import VueRouter from 'vue-router'
import VueRessource from 'vue-resource'
Vue.use(VueRouter)
Vue.use(VueRessource)
Vue.http.options.emulateJSON = true;

var path_auto = ["/login", "/oauth/42/callback", "/oauth/google/callback", "/oauth/slack/callback", "/oauth/facebook/callback", "/oauth/github/callback"]

const routes =
	[
		{ path: '/login', component: Index },
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
	console.log(token)

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
import auth from "./app.js"
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
			auth.logout();
			router.push("/")
		},
		check : function() {
					console.log("fct check")
			let token = localStorage.getItem("token");
			return (token) ? true : false;
		}
	},

}).$mount('#page')

export default {

	login(context, redirect){
		console.log('je fait un ' + context.login, context.password);
		context.$http.post('http://localhost:8080/login', {create : false, login : context.login, password : context.password}).then(data =>
			{
				if (data.body.token)
				{
					window.localStorage.setItem("token", data.body.token)
					if (redirect)
						router.push(redirect)
				}
			}).catch(err =>{
				console.log("errr")
			})
	},
	log(token, redirect){
			console.log("TOKEN "+ token)
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
	},
	
	getAuthHeader(){
		return {
			'Authorization' : 'Bearer ' + localStorage.getItem('token')
		}
	}
}



