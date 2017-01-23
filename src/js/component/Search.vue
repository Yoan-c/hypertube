<template>
	<form id="film" @submit.prevent>
		<div id="content">
			<input v-model="req" placeholder="search">
			<ul>
				<li v-for="item in answer">
				<router-link v-bind:to="'search/'+item.imdb_code+'/'+item.id+'/'+item.code">{{ item.title}} {{item.imdb_code}}<img v-bind:src=item.img /></router-link> {{item.imdb_code}}
				<div> </div>
				</li>
			</ul>
		</div>
	</form>
</template>

<script>
import auth from '../app.js'
export default {
  data () {
	 return {
		 req : "",
		 log : "log out",
		answer : [],
	 }
  },
  watch : {
	req : function (newReq)
	{
		this.answer = "searching..."
		this.getFilm()
	}
  },
  methods : {
	getFilm: _.debounce(
	function () {
		var vm = this
		vm.answer = 'Thinking...'
		vm.$http.get('http://localhost:8080/search',{params : {name : this.req}} ).then((response) =>{
			response.json().then((res)=>{
				this.answer = res
			});
		}, (response) =>{
			this.answer = response
		});
	},
	// This is the number of milliseconds we wait for the
	// user to stop typing.
	500),
	page: _.debounce(
	function () {
		this.$http.get('http://localhost:8080/search').then((response) =>{
			response.json().then((res)=>{
				this.answer = res
			});
		}, (response) =>{
			this.answer = response
		});
	}),
	/*logout : function ()
		{
			auth.logout();
			this.$router.push("/")
		}*/
	},
	mounted : function () {
		this.page();
	}
}
</script>

