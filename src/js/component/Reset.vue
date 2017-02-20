<template>
	<div>
		{{error}}
		<table>
			<tr>
				<td>{{password}} : </td>
				<td><input type="password" v-model="req_pass" v-bind:placeholder="pass"></td>
			</tr>
			<tr>
				<td>{{conf_password}} : </td>
				<td><input type="password" v-model="req_conf_pass" v-bind:placeholder="conf_pass"></td>
			</tr>
			<tr>
				<td> <button v-on:click="update()">{{modify}}</button></td>
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
		 password : "",
		 pass : "",
		 error : "",
		 conf_password : "",
		 conf_pass : "",
		 req_conf_pass : "",
		 req_pass : "",
		 modify : "",
	 }
  },
  methods : {
	init : function ()
		{
			this.password = auth.i18n("authentication.password")
			this.pass = auth.i18n("authentication.password")
			this.conf_password = auth.i18n("authentication.conf_password")
			this.conf_pass = auth.i18n("authentication.conf_password")
			this.modify = auth.i18n("authentication.modify")
		},
		update : function (){
			let token = this.$route.query.token
			if (this.req_pass && this.req_conf_pass && this.req_pass !== this.req_conf_pass)
					this.error = auth.i18n("error.password")
			else if (this.req_pass && this.req_conf_pass && this.req_pass == this.req_conf_pass)
			{
				if (this.req_pass.length >= 4)
				{
					this.$http.post('resetMdp',{mdp : this.req_pass , token : token} ).then(res=>{
						if (res.data.token)
							localStorage.setItem("token", res.data.token)
							this.$router.push("/")
					}).catch(err=>{
						console.log("Erreur reset");
					})
				}
				else
					this.error = auth.i18n("error.password.length")
			}
			else
				this.error = auth.i18n("error.password")
		},
		verify : function (token){
			this.$http.post("verify", {token : token}).then(data =>{
				if (data.data.success == "true")
					this.init();
				else
					this.$router.push("/")
			}).catch(err=>{
				auth.logout();
				app.redirect("/login")
			})
		}
	},
	mounted : function () {
		let token = this.$route.query.token
		this.verify(token)
	}
}
</script>

