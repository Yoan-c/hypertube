<template>
	<div id="content" class="container">

		<div v-show="vue" class="row">

			<div class="col col-6 col-md-4">
        <div class="card" style="max-width: 300px;">
          <img class="card-img" :src="tab.poster" :alt="title">
        </div>
			</div>

			<div class="col col-md-8">

        <div class="card">

          <div class="card-header">
            {{title}}
            <p class="card-text"><small class="text-muted">{{tab.genre}}</small></p>
          </div>

          <div class="card-block">
            <p class="card-text">{{resume}}</p>
          </div>

          <ul class="list-group list-group-flush">
            <li class="list-group-item">{{director}}</li>
            <li class="list-group-item">{{writer}}</li>
            <li class="list-group-item">{{actors}}</li>
          </ul>

          <div class="card-footer text-muted ">
            {{note}}
            <span class="pull-right">{{release}}</span>
          </div>

        </div>

        <button class="btn btn-primary" @click="voir">voir</button>

			</div>

		</div>

		<div v-show="!vue">
				<video id="player" class="video-js vjs-default-skin vjs-big-play-centered" width="640" height="264"
               preload controls crossorigin="anonymous">
        </video>
		</div>

    <div id="comment">

      <div v-for="value in comments" :class="value.color" class="card card-inverse">
        <div class="card-block">
          <blockquote class="card-blockquote">
            <p>{{value.comment}}</p>
            <footer class="pull-right"><cite>{{value.login}}</cite></footer>
          </blockquote>
        </div>
      </div>

      <div class="input-group" style="margin-bottom:20px">
        <label class="input-group-btn">
            <button class="btn btn-primary" @click="add">Send</button>
        </label>
        <input type="text" class="form-control" placeholder="comment" v-model="comment">
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
		  color: ['card-primary', 'card-info', 'card-success', 'card-warning'],
		  release : 0,
			see : false,
			vue : true,
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
					this.time = res.time
					this.genre = res.genre
					this.director = "Director : "+res.director
					this.actors = "Actors : "+res.actors
					this.writer = "Writer : "+res.writer
					this.resume = res.resume
					this.note = res.note+"/10"
					this.info = this.released+" / "+this.time+" / "+this.genre
					this.torrent = res.torrents

					this.release = new Date(res.released).getFullYear()

					if (res && res.film && res.film.comment)
					res.film.comment.forEach(elem=>{
					  let color = this.color[Math.floor(Math.random() * this.color.length)]

            console.log(color, this.color)

						this.comments.push({"comment" : elem.comment, "login" : elem.login, color})
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
			this.$http.post("comment",{comment : this.comment, token : token , code : this.code, id : this.id, imdb : this.imdb})

      console.log('add')

			let color = this.color[Math.floor(Math.random() * this.color.length)]
			this.comments.push({"comment" : this.comment, "login" : 'you', color});
			this.comment = ''
		},
		sub : function (en)
		{
			console.log("en ",en)
		},
		voir : function (){
			this.vue = false
			let token = window.localStorage.getItem("token")
			let mag = this.tab.magnet
			if (this.code == "Y")
				mag = this.tab.magnet[this.tab.magnet.length -1]

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
			let video = this.video = videojs('player', {
				controls: true,
				plugins: {
					videoJsResolutionSwitcher: {
						default: 'high',
						dynamicLabel: true
					}
				}
			})


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
				return {type: 'video/webm', src: preset.stream.replace('localhost', 'e3r10p6.42.fr'), label: preset.quality}
			})

			if (this.code == "Y")
				source = [{type : 'video/mp4', src:data.url.replace('localhost', 'e3r10p6.42.fr'), label : "Source"}, ...source]

			video.updateSrc(source)
			video.on('error', e => {
				if (video.error().code == 4) return
				video.updateSrc(source)
			})

			for (let i in subtitles) {
				let sub = subtitles[i]
				video.addRemoteTextTrack({ src: `http://e3r10p6.42.fr:8080/subtitles/${this.imdb}/${i}/${sub[0]}`, kind: 'subtitles', srclang: i, label: i, default:(i.toUpperCase() == window.localStorage.getItem("lang"))}, true);
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
		if (this.video) this.video.dispose()
	}

}

</script>


<style>

  .card-img {
    max-height: 444px;
    width: 100%; display: block;
  }

</style>

