<template>
	<div id="content">
		{{error}}
    <div class="col-xl-8 offset-xl-2">

      <div class="card">

        <div class="card-block">

          <h2 class="card-title">Profile</h2>

          <div class="form-group row">

            <div class="col-md-12">
              <label>{{first_name}} / {{last_name}}:</label>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="text" v-model="firstName"
                     :placeholder="answer.first_name" autofocus>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="text" v-model="lastName"
                     :placeholder="answer.last_name">
            </div>

          </div>

          <div class="form-group row">

            <div class="form-group col-md-6">
              <label for="email">{{ email }} :</label>
              <input class="form-control" type="email" v-model="email2"
                     :placeholder="answer.email">
            </div>

            <div class="form-group col-md-6">
              <label>{{ langue }}:</label>
              <select class="form-control" v-model="lang"  >
                <option v-for="option in options" :value="option.value">
                  {{option.value}}
                </option>
              </select>
            </div>

          </div>

          <div class="form-group row">

            <div class="col-md-12">
              <label for="password">{{ password }} :</label>
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="password" v-model="password2">
            </div>

            <div class="form-group col-md-6">
              <input class="form-control" type="password" v-model="confirm_password">
            </div>

          </div>

          <div class="form-group">
            {{photo}} :
            <div v-if="!image">
              <h2>Select an image</h2>
              <input type="file" @change="onFileChange">
            </div>
            <div v-else>
              <img :src="image" height="200" width="240"/>
              <button @click="removeImage">Remove image</button>
            </div>
          </div>

          <button class="btn btn-primary" @click="modifier()" >{{modify}}</button>

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
		 req : "",
		 profile : "Profile",
		 log : "log out",
		 login : "",
		 image : "",
		 lang : "",
		 last_name : "",
		 lastName : "",
		 first_name : "",
		 firstName : "",
		 error : "",
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
	onFileChange(e) {
		var files = e.target.files || e.dataTransfer.files;
		if (!files.length)
			return;
		this.createImage(files[0]);
	},
	createImage(file) {
		var image = new Image();
		var reader = new FileReader();
		var vm = this;
		reader.onload = (e) => {
			vm.image = e.target.result;
		};
		reader.readAsDataURL(file);
	},
	removeImage: function (e) {
		this.image = '';
	},
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
			this.answer = response.data;
			this.image = this.answer.picture
			let lang = response.data.langue;
			localStorage.setItem("lang", lang);
		}).catch(error =>{
			auth.logout();
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
			if ((this.password2 && !this.confirm_password || !this.password2 && this.confirm_password) || this.password2 && this.confirm_password && this.password2 != this.confirm_password)
				this.error = auth.i18n("error.password")
			else
			{
				if (this.password2 && this.password2.length < 4)
					this.error = auth.i18n("error.password_length")
				else
				{
					if (!this.email2 || (this.email2 && this.isEmail(this.email2)))
					{
						if (!(this.lang == "FR" || this.lang == "EN"))
							this.lang = "EN"
						localStorage.setItem("lang", this.lang);
						let token = window.localStorage.getItem("token")
						this.$http.post('info_profile', {modif : true, first_name : this.firstName, last_name : this.lastName, email : this.email2, photo : this.image, langue : this.lang, password : this.password2, token : token}).then(res =>{
							window.localStorage.setItem("token", res.data.token)
							this.$router.go(0)
						}).catch(err=>{
							auth.logout();
							app.redirect("/login")
						})
					}
					else
						this.error = auth.i18n("error.email")
				}
			}
		}
	},
	mounted : function () {
		this.getInfo();
	}
}
</script>
