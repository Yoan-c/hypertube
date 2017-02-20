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
			 <div v-if="see">
				<video width="480" controls crossorigin="anonymous">
					<source :src=lien>
						<track v-for="(item, i) in sub" kind="subtitles" :srclang ="i" :label ="i" :src="'http://localhost:8080/subtitles/'+imdb+'/'+i+'/'+item[0]" crossorigin="anonymous">
			 	</video>
			 </div>
			<p style="color: blue;" v-for="value in comments"> {{value.login}} {{value.comment}} </p>
			<textarea v-model="comment" placeholder="comment"></textarea>
			<button v-on:click="add">Add </button><br/>
			<li v-for="(item, i) in torrent">
		   	<input type="radio" id="i" v-bind:value="i" v-model="picked">
			<label for="one">{{item.quality}}</label>
			 <br>
			 <em>seeds : {{item.seeds}} peers : {{item.peers}}</em>
			</li>	
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
			see : false,
			lien : "",
			imdb: "",
			id : "",
			code : "",
			picked : 0,
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
			torrent : [],
			sub : [],
			comment : ""
		}
	},
	methods: {
		search: function () {
			var vm = this
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
					this.torrent = res.torrents
					if (res && res.film && res.film.comment)
					res.film.comment.forEach(elem=>{
						this.comments.push({"comment" : elem.comment, "login" : elem.login})
					})
				});
			}, (response) =>{
				this.tab = response
				auth.logout();
				app.redirect("/login")
			});
		},
		add : function () {
			let token = window.localStorage.getItem("token")
			this.$http.post("http://localhost:8080/comment",{comment : this.comment, token : token , code : this.code, id : this.id, imdb : this.imdb})
			this.comments.push(this.comment);
			this.comment = ""
		},
		sub : function (en)
		{
			console.log("en ",en)
		},
		voir : function (){
			let token = window.localStorage.getItem("token")
			this.$http.post("see", {magnet : this.tab.magnet[this.picked] , token : token, code : this.code, imdb : this.imdb , id : this.id}).then(data=>{
				console.log("data seen", data)
				if (data && data.body && data.body.data)
				{
					this.$http.get("subtitle", {params : {imdb : this.imdb, token : token}}).then(res=>{
					
					console.log("test ", res)
					this.sub = res.body
						this.lien = "http://"+data.body.data.url
					this.see = true
					}).catch(err=>{
						console.log("erreur ", err)
					})
				}
				else
					return
			}).catch(err=>{
				console.log("erreur seen", err)
			})
		}
	},
	mounted : function () {
		this.comments = []
		this.comment = "" 
		this.see = false
		this.imdb = this.$route.params.imdb
		this.code = this.$route.params.code
		this.id = this.$route.params.id
		this.search();
	},

}

</script>

