<template>
			{{msg}}
	<div id="content" style="background-color:black">
		<div style="background-color: yellow;">
			<div style="width: 20%; background-color: pink">
				<img v-bind:src=tab.img />
			</div>
			<div style="width: 30%; background-color: red">
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
		</div>
	</div>
</template>

<script>
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
		vm.$http.get('http://localhost:8080/search', {params : {imdb : this.imdb, code : this.code, id : this.id}} ).then((response) =>{
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
				console.log(res);
			});
	}, (response) =>{
		console.log(response)
			this.tab = response
		});
	}),
	add : function () {
		this.comments.push(this.comment);
		this.comment = ""
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

