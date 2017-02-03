<template>
			{{msg}}
	<div id="content">
		<div>
			<div>
				<img v-bind:src=tab.img />
			</div>
			<div>
				{{title}}<br/>
				{{info}}<br/>
				{{director}}<br/>
				{{writer}}<br/>
				{{actors}}<br/>
				{{resume}}<br/>
				<p style="text : justify">	{{note}}</p>
			</div>
		</div>
		<div>
			<p style="color: blue;" v-for="value in comments"> {{value}} </p>
			<textarea v-model="comment" placeholder="comment"></textarea>
			 <button v-on:click="add">Add </button>
			 <button v-on:click="voir">voir </button>
		</div>
	</div>
</template>

<script>
import auth from '../function'
import app from '../app.js'
export default {
	data () {
		return {
			msg : "testa",
			imdb: "",
			id : "",
			code : "",
			tab : [],
			title : "",
			released : "",
			time : "",
			genre : "",
			director : "",
			writer : "",
			actors : "",
			resume : "",
			note : "",
			info : "",
			comments : [],
			comment : ""
		}
	},
	methods: {
		search: _.debounce(
		function () {
			var vm = this
			console.log(this.imdb_code)
			let token = window.localStorage.getItem("token")
			vm.$http.get('search', {params : {imdb : this.imdb, code : this.code, id : this.id, token : token}} ).then((response) =>{
				response.json().then((res)=>{
					this.tab = res
					this.title = res.title
					this.released = res.released
					this.time = res.time
					this.genre = res.genre
					this.director = "Director : "+res.director
					this.actors = "Actors : "+res.actors
					this.writer = "Writer : "+res.writer
					this.resume = res.resume
					this.note = res.note+"/10"
					this.info = this.released+" / "+this.time+" / "+this.genre
					console.log("resr ",res.magnet);
				});
			}, (response) =>{
		//		console.log(response)
				this.tab = response
				auth.logout();
				app.redirect("/login")
			});
		}),
		add : function () {
			this.comments.push(this.comment);
			this.comment = ""
		},
		voir : function (){
			console.log(this.tab.magnet)
			let token = window.localStorage.getItem("token")
			this.$http.post("see", {magnet : this.tab.magnet , token : token, code : this.code, imdb : this.imdb , id : this.id}).then(data=>{
				console.log("data seen", data)
			}).catch(err=>{
				console.log("erreur seen", err)
			})
		}
	},
	beforeMount : function () {
		this.imdb = this.$route.params.imdb
		this.code = this.$route.params.code
		this.id = this.$route.params.id
		this.search();
	}

}

</script>

