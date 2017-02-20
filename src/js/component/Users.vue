<template>
	{{error}}
	{{msg}}
	<div id="content">
		<ul>
			<li v-for="item in answer">
				{{login}} : {{item.username}}
				{{firstname}} : {{item.first_name}} 
				{{lastname}} :  {{item.last_name}}
				{{picture}} : <img :src=item.picture />
			</li>
		</ul>
	</div>
</template>

<script>
import auth from '../function'
import app from '../app.js'
export default {
	data () {
		return {
			answer : [],
			error : "",
			login : "",
			firstname : "",
			lastname : "",
			picture : ""
		}
	},
	methods: {
		init : function (){
			this.login = auth.i18n("authentication.login")
			this.firstname = auth.i18n("authentication.first_name")
			this.lastname = auth.i18n("authentication.last_name")
			this.picture = auth.i18n("authentication.photo")
		},
		search: function () {
			var vm = this
			let token = window.localStorage.getItem("token")
			vm.$http.post("http://localhost:8080/users", {token , token}).then(res =>{
				if (res.body.ret == "err")
					this.erreur = "erreur"
				else
					this.answer = res.body.ret
			}).catch(err=>{
					auth.logout()
					app.redirect("/login")
			})
		},
	},
	beforeMount : function () {
		this.init();
		this.search();
	}
}

</script>

