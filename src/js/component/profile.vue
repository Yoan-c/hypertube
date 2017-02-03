<template>
	<div>
		<table>
			<tr>
				<td>{{login}} : </td>
				<td>{{answer.login}}</td>
			</tr>
			<tr>
				<td>{{first_name}} : </td>
				<td><input v-model="firstName" v-bind:placeholder="answer.first_name"  ></td>
			</tr>
			<tr>
				<td>{{last_name}} : </td>
				<td><input v-model="lastName" v-bind:placeholder="answer.last_name"  ></td>
			</tr>
			<tr>
				<td>{{email}} : </td>
				<td><input v-model="email2" v-bind:placeholder="answer.email" ></td>
			</tr>
			<tr>
				<td>{{photo}} : </td>
				<td><input v-model="photo2" v-bind:placeholder="answer.picture" ></td>
			</tr>
			<tr>
				<td>{{langue}} : </td>
				<td><select v-model="lang"  >
						<option v-for="option in options" v-bind:value="option.value">
						{{option.value}}
						</option>
					</select>
				</td>
			</tr>
			<tr>
				<td>{{password}} : </td>
				<td><input v-model="password2" type="password" ></td>
			</tr>
			<tr>
				<td>{{conf_password}} : </td>
				<td><input v-model="confirm_password"  type="password"></td>
			</tr>
			<tr>
				<button @click="modifier()">{{modify}}</button>
			</tr>
		</table>
	</div>
</template>

<script>
import auth from '../function.js'
import app from '../app.js'
export default {
  data () {
	 return {
		 req : "",
		 profile : "Profile",
		 log : "log out",
		 login : "",
		 lang : "",
		 last_name : "",
		 lastName : "",
		 first_name : "",
		 firstName : "",
		 email : "",
		 email2 : "",
		 photo : "",
		 photo2 : "",
		 langue : "",
		 password : "",
		 password2 : "",
		 modify : "",
		 confirm_password : "",
		 conf_password : "",
		 answer : [],
		 lang : localStorage.getItem("lang") ? localStorage.getItem("lang") : "EN",
		 options : [
			{text : 'English', value: 'EN'},
			{text : 'Francais', value: 'FR'}
	 	]
	 }
  },
  methods : {
	  init : function (){
			this.login = auth.i18n("authentication.login")
			this.first_name = auth.i18n("authentication.first_name")
			this.last_name = auth.i18n("authentication.last_name")
			this.email = auth.i18n("authentication.email")
			this.photo = auth.i18n("authentication.photo")
			this.langue = auth.i18n("authentication.lang")
			this.password = auth.i18n("authentication.password")
			this.conf_password = auth.i18n("authentication.conf_password")
			this.modify = auth.i18n("authentication.modify")
		},
	getInfo: _.debounce(
	function () {
		var vm = this
		let token = window.localStorage.getItem("token")

		this.init();
		vm.$http.post('info_profile',{modif : false, token : token} ).then((response) =>{
			console.log("retour positif" , response)
			this.answer = response.data;
			let lang = response.data.langue;
			localStorage.setItem("lang", lang);
		}).catch(error =>{
			console.log("retour " , error)
			app.redirect("/error")
		});
	}),
		isEmail : function (myVar){
		 // La 1ère étape consiste à définir l'expression régulière d'une adresse email
			var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
			return regEmail.test(myVar);
		},
	modifier: function()
		{
			if ((this.password2 && !this.confirm_passwd || !this.password2 && this.confirm_passwd) || this.password2 && this.confirm_passwd && this.password2 != this.confirm_passwd)
				console.log("password et confirm_passwd sont different")
			else
			{
				if (!this.email2 || (this.email2 && this.isEmail(this.email2)))
				{
					if (!(this.lang == "FR" || this.lang == "EN"))
						this.lang = "EN"
					localStorage.setItem("lang", this.lang);
					let token = window.localStorage.getItem("token")
			 		this.$http.post('info_profile', {modif : true, first_name : this.firstName, last_name : this.lastName, email : this.email2, photo : this.photo2, langue : this.lang, password : this.password2, token : token}).then(res =>{
						console.log("OK cest bon")
						//auth.logout();
				//		console.log("token " + localStorage.getItem("token"))
				//		console.log("token " , res.data.token)
						window.localStorage.setItem("token", res.data.token)
						this.$router.go(0)
 					}).catch(err=>{
						console.log("erreur modif ",  err)
						auth.logout();
						app.redirect("/login")
 					})
				}
				else
					console.log("erreur dans la modification de mail")
			}
		}
	},
	mounted : function () {
		this.getInfo();
	}
}
</script>
