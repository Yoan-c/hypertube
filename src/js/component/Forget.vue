<template>

  <div id="content">

    <div v-if="error">
      <div class="alert alert-danger" role="alert">
        {{error}}
      </div>
    </div>

    <div class="col-xl-6 offset-xl-3">
      <div class="card">

      <div class="card-block">

        <h2 class="card-title">Reset password</h2>

        <div class="form-group">
          <label> {{ login }}</label>
          <input class="form-control" v-model="req_log" type="text"
                 :placeholder="log" required autofocus>
        </div>

        <div class="form-group">
          <label>{{ email }}</label>
          <input class="form-control" type="email"
                 v-model="req_mail" :placeholder="mail" required>
        </div>

        <button class="btn btn-success" :disabled="disable" @click="reset()"> {{submit}}</button>

      </div>

    </div>
    </div>

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
		 req_log : "",
		 disable: false
	 }
  },
  methods : {
	  init : function  () {
			this.login = auth.i18n("authentication.login")
			this.log = auth.i18n("authentication.login")
			this.email = auth.i18n("authentication.email")
			this.mail = auth.i18n("authentication.email")
			this.submit = auth.i18n("authentication.submit")

		},
		isEmail : function (myVar){
		 // La 1ère étape consiste à définir l'expression régulière d'une adresse email
			var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$','i');
			return regEmail.test(myVar);
		},
		reset : function (){
			if (!this.req_mail)
				this.error = auth.i18n("error.email")
			else if (!this.req_log)
				this.error = auth.i18n("error.log")
			else if (!this.isEmail(this.req_mail))
				this.error = auth.i18n("error.email")
			else {
			  this.disable = true
				this.$http.post('reset',{login : this.req_log,  mail : this.req_mail} ).then(res=>{
					if (res.data.status == "ok")
						this.$router.push("/")
					else if (res.data.status == "email")
						this.error = "An error has occured with E-mail service"
					else
						this.error = auth.i18n("error.account")
					this.disable = false
				}).catch(err=>{
					auth.logout();
					app.redirect("/login")
				})
			}
		}
	},
	mounted : function () {
		this.init();
	}
}
</script>

