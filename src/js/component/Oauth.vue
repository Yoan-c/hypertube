<template>
	<div>
	ok
	</div>
</template>

<script>
import auth from '../function.js'
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
			//console.log("data " , data.data.token)
				auth.log(data.data.token, "/search")
			}).catch(err=>{
				console.log("errr ", err)
			})
	},
	/*logout : function ()
		{
			auth.logout();
			this.$router.push("/")
		}*/
	},
	mounted : function () {
		this.page(this.$route.query);
	}
}
</script>

