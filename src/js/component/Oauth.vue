<template>
	<div>
		{{req}}
	</div>
</template>

<script>
import auth from '../function.js'
import app from '../app.js'
export default {
  data () {
	 return {
		 req : "",
		 log : "log out",
		answer : [],
	 }
  },
  methods : {
	  page: function (query) {
		let state
		if (!query.state)
			state = "42"
		else
			state = query.state;

		this.$http.post('http://localhost:8080/oauth/', {code : query.code, state: state}).then(data =>{
				auth.log(data.data.token, "/search")
			}).catch(err=>{
				auth.logout();
				app.redirect("/login")
				console.log("errr ", err)
			})
		},
	},
	mounted : function () {
		this.req = auth.i18n("search.wait")
		this.page(this.$route.query);
	}
}
</script>

