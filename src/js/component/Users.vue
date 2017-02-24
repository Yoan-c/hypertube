<template>
	{{error}}
	{{msg}}
	<div id="content">

      <div v-for="user in answer" class="col-xl-3 col-lg-4 col-md-6">
        <div class="card">
          <img class="card-img-top" :src="user.picture ? user.picture : 'http://placehold.it/200x240'" :alt="user.username">

          <div class="card-block">
            <h6 class="card-title">{{ user.username }}</h6>
            <div class="meta">

              <strong class="pull-right">
                {{ user.first_name }} {{ user.last_name }}
              </strong>
              <br>

            </div>
          </div>
        </div>
      </div>

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
			vm.$http.post("users", {token , token}).then(res =>{
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

<style>

  .card-title, .meta {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .card-img-overlay {
    padding: 5px;
    height: 40px;
  }

  .card-img-top {
    max-height:294px;
    width: 100%; display: block;
  }

</style>
