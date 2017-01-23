<template>
<div id="content">
	<div v-if="show">
		<input id="log" v-model="login" placeholder="login" />
		<input id="passwd" v-model="password" placeholder="password" />
		<button id="sign" v-on:click.prevent="sign()" type="hidden">sign in</button>
		<a href="#" id="lien" v-on:click.prevent="show=false">create an account</a>
	</div>
	<div v-else>
		<input id="log2" v-model="login" placeholder="login"/>

		<input type="email" v-model="mail" placeholder="email" />
		<input id="photo" v-model="photo" placeholder="photo" />
		<input id="firstname" v-model="firstname" placeholder="firstname" />
		<input id="lastname" v-model="lastname" placeholder="lastname" />
		<input id="passwd2" v-model="password" placeholder="password" />
		<input id="confirm_passwd" v-model="confirm_passwd" placeholder="confirm" />

		<button id="create" v-on:click="newUser()" >create</button>
		<a href="#" id="lien2" v-on:click.prevent="show=true" >sign in</a>
		
		{{ msg }}
	</div>
		<a href="https://api.intra.42.fr/oauth/authorize?client_id=8a8c56a0edca0a04a3e1b89b70ba2a4b79f03f2c07784856a8d21d89547d9039&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Foauth%2F42%2Fcallback&scope=public&response_type=code" >42</a>
		<a href="https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&state=google&redirect_uri=http://localhost:3002/oauth/google/callback&response_type=code&client_id=161312720047-a6o6f6iss7u5vonsq8og5g31c0hqsh4n.apps.googleusercontent.com" >google</a>
		<a href="https://slack.com/oauth/authorize?scope=identity.basic,identity.email&client_id=3329266210.130370627137&state=slack" >slack</a>
		<a href="https://www.facebook.com/v2.8/dialog/oauth?client_id=242812276172970&redirect_uri=http://localhost:3002/oauth/facebook/callback&state=facebook" >facebook</a>
		<a href="https://github.com/login/oauth/authorize?client_id=75c7e71cbfca78dbf304&redirect_uri=http://localhost:3002/oauth/github/callback&state=github" >github</a>
</div>
</template>

<script>
import auth from '../app.js'
export default {
	data () {
		return {
			msg: 'index!',
			login : "",
			password : "",
			mail : "",
			photo : "",
			firstname : "",
			lastname : "",
			confirm_passwd : "",
			show : true

		}
	},
	methods: {
		isEmail : function (myVar){
		 // La 1ère étape consiste à définir l'expression régulière d'une adresse email
			var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
			return regEmail.test(myVar);
		},
		sign : function(){
			/*var vm = this
			vm.$http.post('http://localhost:8080/', {create : false, login : this.login, password : this.password}).then((result) => {
				console.log(result.data.status)
				if (result.data.status == true)
				localStorage.setItem("token",result.data.token)
				result.json().then( data => console.log(data)  ).catch(err=> console.log("aucun champs") )
			}, (err) =>{
				console.log("err")
	})*/
			auth.login(this, "/search")
		},
		onSignIn : function (googleUser) {
			var profile = googleUser.getBasicProfile();
			console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
			console.log('Name: ' + profile.getName());
			console.log('Image URL: ' + profile.getImageUrl());
			console.log('Email: ' + profile.getEmail());
		},
		newUser : function(){
			console.log("create new user" + this.isEmail(this.mail))
			if (this.login && this.password && this.lastname && this.firstname && this.mail)
			{
				if (this.password === this.confirm_passwd)
				{
					if (this.isEmail(this.mail))
						auth.signup(this, "/search");
					else
						console.log("adresse mail non valide")

				}
				else
				{
					console.log("les 2 passwords match pas")
				}
			}
			else{
				console.log("erreur veuillez remplir tous les champs")
			}
		},

	}


}
</script>
