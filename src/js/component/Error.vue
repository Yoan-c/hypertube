<template>
	<div>
		{{error}}
	</div>
</template>

<script>
import auth from '../function.js'
import app from '../app.js'
export default {
  data () {
	 return {
		 error : "",
	 }
  },
  methods : {
	  init : function (){
			this.error = auth.i18n("error.def");
			auth.logout();
			app.redirect("/logout")
	  }
	},
	mounted : function () {
		this.init();
	}
}
</script>

