<template>
	<div>
		<table>
			<tr>
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
export default {
  data () {
	 return {
		 email : "",
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
				console.log("erreur il manque le mail")
			else if (!this.req_log)
				console.log("erreur il manque le login")
			else if (!this.isEmail(this.req_mail))
				console.log("mail non valide")
			else
				this.$http.post('http://localhost:8080/reset',{login : this.req_log,  mail : this.req_mail} ).then(res=>{
					console.log(res.data)
					if (res.data.status == "ok")
						this.$router.push("/")
					else
						console.log("User undefinded")
				}).catch(err=>{
					console.log("Erreur reset");
				})
		}
	},
	mounted : function () {
		this.init();
	}
}
</script>

