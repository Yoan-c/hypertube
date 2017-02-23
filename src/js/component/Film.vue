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
			<video id="player" class="video-js vjs-default-skin vjs-big-play-centered" width="640" height="264" preload controls crossorigin="anonymous">
			 	</video>
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
				if (data && data.body && data.body.data)
				{
					this.$http.get("subtitle", {params : {imdb : this.imdb, token : token}}).then(res=>{
					
					let sub = res.data

					this.see = true
					this.init_player(data.data.data, sub)
						//	this.lien = "http://"+data.body.data.url
					}).catch(err=>{
						console.log("erreur ", err)
					})
				}
				else
					return
			}).catch(err=>{
				console.log("erreur seen", err)
			})
		},
		init_player : function (data, subtitles){
			let video = videojs('player', {
				controls: true,
				plugins: {
					videoJsResolutionSwitcher: {
						default: 'high',
						dynamicLabel: true
					}
				}
			})

			console.log(data)

			video.duration = _ => Math.floor(data.duration)
			video.oldCurrentTime = video.currentTime

			let currentTime = time => {
				if(time == undefined) {
					return video.oldCurrentTime() + video.start;
				}

				time = Math.floor(time)
				video.start = time;

				video.oldCurrentTime(time)

				console.log(video.currentTime(), time, video.duration())

				//let old_src = video.src().replace(/\?start=[\d]+/, '')
				//video.src(old_src);
				setTimeout(function() {
					video.play();
				}, 100);
				return this;
			}

			video.currentTime = currentTime
			
			video.updateSrc(data.transcoded.map( (preset) => {
				return {type: 'video/webm', src: preset.stream, label: preset.quality}
			}))


			for (let i in subtitles) {
				let sub = subtitles[i]
				video.addRemoteTextTrack({ src: `http://localhost:8080/subtitles/${this.imdb}/${i}/${sub[0]}`, kind: 'subtitles', srclang: i, label: i }, true);
			}

			video.on('resolutionchange', _ => {
				let resolution = video.currentResolution()
				video.currentTime(video.currentTime())
			})

			video.currentTime(1)
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

