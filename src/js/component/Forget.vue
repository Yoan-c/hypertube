<template>
	<div>
		<table>
			<tr>
				{{error}}
				<td>{{login}} : </td>
				<td><input v-model="req_log" v-bind:placeholder="log"></td>
			</tr>
			<tr>
				<td>{{email}} : </td>
				<td><input v-model="req_mail" v-bind:placeholder="mail"></td>
			</tr>
			<tr>
				<td> <button v-on:click="reset()">{{submit}}</button></td>
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
		 email : "",
		 error : "",
		 login : "",
		 log : "",
		 mail : "",
		 req_mail : "",
		 submit : "",
		 req_log : ""
	 }
  },
  methods : {
	  init : function  () {
			console.log("LA test i18n")
			this.login = auth.i18n("authentication.login")
			this.log = auth.i18n("authentication.login")
			this.email = auth.i18n("authentication.email")
			this.mail = auth.i18n("authentication.email")
			this.submit = auth.i18n("authentication.submit")
			console.log("LA test i18naeriug aeuirg ")

		},
		isEmail : function (myVar){
		 // La 1ère étape consiste à définir l'expression régulière d'une adresse email
			var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
			return regEmail.test(myVar);
		},
		reset : function (){
			console.log(this.req_mail)
			if (!this.req_mail)
				this.error = auth.i18n("error.email")
			else if (!this.req_log)
				this.error = auth.i18n("error.log")
			else if (!this.isEmail(this.req_mail))
				this.error = auth.i18n("error.email")
			else
				this.$http.post('reset',{login : this.req_log,  mail : this.req_mail} ).then(res=>{
					console.log(res.data)
					if (res.data.status == "ok")
						this.$router.push("/")
					else
						this.error = auth.i18n("error.account")
				}).catch(err=>{
					auth.logout();
					app.redirect("/login")
				})
		}
	},
	mounted : function () {
		this.init();
	}
}
</script>

