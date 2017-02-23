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
			video : false,
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
			let mag = this.tab.magnet
			if (this.code == "Y")
				mag = this.tab.magnet[this.picked]
			this.$http.post("see", {magnet : mag , token : token, code : this.code, imdb : this.imdb , id : this.id}).then(data=>{

				if (data && data.body && data.body.data)
				{
					this.$http.get("subtitle", {params : {imdb : this.imdb, token : token}}).then(res=>{
					
					let sub = res.data

					this.see = true
					this.init_player(data.data.data, sub)
						//	this.lien = "http://"+data.body.data.url
					}).catch(err=>{
						console.log("erreur", err)
					})
				}
				else
					this.voir()
			}).catch(err=>{
				console.log("erreur seen", err)
			})
		},
		init_player : function (data, subtitles){
			console.log("testARTRET")
			let video = this.video = videojs('player', {
				controls: true,
				plugins: {
					videoJsResolutionSwitcher: {
						default: 'high',
						dynamicLabel: true
					}
				}
			})

//			console.log(data)

			video.duration = _ => Math.floor(data.duration)
			video.oldCurrentTime = video.currentTime
			video.tech_.oldCurrentTime = video.tech_.currentTime

			let currentTime = time => {
				if(time == undefined) {
					return video.oldCurrentTime();
				}

				time = Math.floor(time)
				video.start = time;

				let old_src = video.src().replace(/\?start=[\d]+/, '')
				video.src(old_src + '?start=' + time);
				setTimeout(function() {
					video.play();
				}, 100);
				return this;
			}

			let source = data.transcoded.map( (preset) => {
				return {type: 'video/webm', src: preset.stream, label: preset.quality}
			})
			
			if (this.code == "Y")
				source = [{type : 'video/mp4', src:data.url, label : "Source"}, ...source]
			video.updateSrc(source)

			for (let i in subtitles) {
				let sub = subtitles[i]
				video.addRemoteTextTrack({ src: `http://localhost:8080/subtitles/${this.imdb}/${i}/${sub[0]}`, kind: 'subtitles', srclang: i, label: i, default:(i.toUpperCase() == window.localStorage.getItem("lang"))}, true);
			}
			video.on('resolutionchange', _ => {
				let resolution = video.currentResolution()
				// Save the current time
				let ct = video.currentTime()
				if (resolution.label != 'Source') {
					video.currentTime = currentTime
					video.tech_.currentTime = time => {
						if (time == undefined) {
							return video.tech_.oldCurrentTime() + video.start;
						}
						return video.tech_.oldCurrentTime(time)
					}
				} else {
					video.currentTime = video.oldCurrentTime
					video.tech_.currentTime = video.tech_.oldCurrentTime
				}
				video.currentTime(ct)
			})
		}
	},
	mounted : function () {
		this.comments = []
		this.comment = "" 
		this.see = false
		this.imdb = this.$route.params.imdb
		this.code = this.$route.params.code
		this.tab = []
		this.id = this.$route.params.id
		this.search();
	},
	destroyed : function (){
		console.log('destroy')
		if (this.video) this.video.dispose()
	}

}

</script>

