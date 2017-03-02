<template>
<div id="content">

  <div v-if="error">
    <div class="alert alert-danger" role="alert">
      {{error}}
    </div>
  </div>

  <div v-if="show" class="col-xl-8 offset-xl-2">
    <div class="card">

      <div class="card-block">

		  <h2 class="card-title">{{conn}}</h2>

          <div class="form-group">
			  <label for="username"> {{log}}</label>
            <input class="form-control" type="text" v-model="login"
                   :placeholder="log" required autofocus>
          </div>

          <div class="form-group">
			  <label for="password">{{passwd}}</label>
            <input class="form-control" type="password" v-model="password"
                   :placeholder="passwd" required>
          </div>

          <button class="btn btn-success" @click="sign()"> {{sign_in}}</button>
          <a href="#" class="btn btn-link" @click="forget()">{{forget_pass}}</a>

      </div>

      <div class="card-footer">
        <a href="#" class="btn btn-link" @click.prevent="shows(false)">{{create}}</a>
        <div class="pull-right">

          <div class="col-md-12">

              <a class="btn btn-school"
                 href="https://api.intra.42.fr/oauth/authorize?client_id=8a8c56a0edca0a04a3e1b89b70ba2a4b79f03f2c07784856a8d21d89547d9039&redirect_uri=http%3A%2F%2Flocalhost%3A3002%2Foauth%2F42%2Fcallback&scope=public&response_type=code">
                  42
              </a>

              <a class="btn btn-google"
                 href="https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&state=google&redirect_uri=http://localhost:3002/oauth/google/callback&response_type=code&client_id=161312720047-a6o6f6iss7u5vonsq8og5g31c0hqsh4n.apps.googleusercontent.com">
                <span class="fa fa-google"></span>
                Google
              </a>

              <a class="btn btn-slack"
                 href="https://slack.com/oauth/authorize?scope=identity.basic,identity.email&client_id=3329266210.130370627137&state=slack">
                <span class="fa fa-slack"></span>
                Slack
              </a>

              <a class="btn btn-github"
                 href="https://github.com/login/oauth/authorize?client_id=75c7e71cbfca78dbf304&redirect_uri=http://localhost:3002/oauth/github/callback&state=github">
                <span class="fa fa-github"></span>
                Github
              </a>

            </div>

        </div>
      </div>
    </div>
  </div>

  <div v-else class="col-xl-8 offset-xl-2">

    <div class="card">

      <div class="card-block">

		  <h2 class="card-title">{{creation}}</h2>

          <div class="form-group row">

            <div class="col-md-12">
              <label>Name :</label>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="text" v-model="firstname"
                     :placeholder="firstname2" required autofocus>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="text" v-model="lastname"
                     :placeholder="lastname2" required>
            </div>

          </div>

          <div class="form-group">
			  <label for="username">{{pseudo}} :</label>
            <input class="form-control" type="text" v-model="login"
                   :placeholder="log" required>
          </div>

          <div class="form-group">
            <label for="email">E-mail :</label>
            <input class="form-control" type="email" v-model="mail"
                   :placeholder="email" required>
          </div>

          <div class="form-group row">

            <div class="col-md-12">
				<label for="password">{{passwd}} :</label>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="password" v-model="password"
                     :placeholder="passwd" required>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="password" v-model="confirm_passwd"
                     :placeholder="confirm_pass" required>
            </div>

          </div>


          <button class="btn btn-primary" @click="newUser()" >{{create}}</button>

      </div>

      <div class="card-footer text-muted">
		  <p> {{verif}} <a href="#" @click.prevent="shows(true)" >{{conn}}</a></p>
      </div>

    </div>
  </div>
</div>
</template>

<script>
import auth from '../function.js'
export default {
	data () {
		return {
			login : "",
			log : "",
			conn : "",
			verif : "",
			pseudo : "",
			creation : "",
			password : "",
			passwd : "",
			sign_in : "",
			create : "",
			mail : "",
			email : "",
			photo : "",
			firstname : "",
			firstname2 : "",
			lastname : "",
			forget_pass : "",
			lastname2 : "",
			confirm_passwd : "",
			confirm_pass : "",
			error : "",
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
			auth.login(this, "/search")
		},
		forget : function(){
			this.$router.push("/forget")
		},
		newUser : function(){
			if (this.login && this.password && this.lastname && this.firstname && this.mail)
			{
				if (this.password === this.confirm_passwd && this.password.length >= 4)
				{
					if (this.isEmail(this.mail))
						auth.signup(this, "/search");
					else
						this.error = auth.i18n("error.email")
				}
				else if (this.password.length < 4)
					this.error = auth.i18n("error.password_length")
				else
					this.error = auth.i18n("error.password")
			}
			else
				this.error = auth.i18n("error.field")
		},
		shows : function (ret){
			this.error = "";
			this.show = ret
		},
		init : function (){
			this.log = auth.i18n("authentication.login")
			this.conn = auth.i18n("authentication.connect")
			this.verif = auth.i18n("authentication.sign_up")
			this.pseudo = auth.i18n("authentication.pseudo")
			this.creation = auth.i18n("authentication.creation")
			this.passwd = auth.i18n("authentication.password")
			this.sign_in = auth.i18n("authentication.sign_in")
			this.create = auth.i18n("authentication.create")
			this.email = auth.i18n("authentication.email")
			this.firstname2 = auth.i18n("authentication.first_name")
			this.lastname2 = auth.i18n("authentication.last_name")
			this.confirm_pass = auth.i18n("authentication.conf_password")
			this.forget_pass = auth.i18n("authentication.forget_pass")
		}
	},
	mounted : function (){
		this.init();
	}


}
</script>


<style lang="scss">

  .btn-school {
    background: #27384c;
    color: white;

    &:hover {
      color: white;
    }

  }

  .btn-google {
    color: white;
    background: #dd4b39;

    &:hover {
      color: white;
    }
  }

  .btn-github {
    color: white;
    background: #444;

    &:hover {
      color: white;
    }
  }

  .btn-slack {
    color: black;
    background: #ffffff;

    &:hover {
      color: black;
    }
  }

  .btn-github, .btn-google, .btn-school, .btn-slack {
    margin: 0 5px 0 5px;
  }

</style>
