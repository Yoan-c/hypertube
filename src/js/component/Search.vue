<template>
	<form id="film" @submit.prevent>
		<div id="content">
			<button @click="modif_profile()">{{profile}}</button>
			<input v-model="req" v-bind:placeholder="search">
			<div>
				<input v-model="nomFilm" placeholder="nom">
				<select v-model="genre">
					<option value="">genre</option>
					<option v-for="option in options" v-bind:value="option.value">
					{{option.value}}
					</option>
				</select>
				<select v-model="minNote">
					<option value="">note min</option>
					<option v-for="min_note in min_notes" v-bind:value="min_note.value">
					{{min_note.value}}
					</option>
				</select>
				<select v-model="maxNote">
					<option value="">note max</option>
					<option v-for="max_note in max_notes" v-bind:value="max_note.value">
					{{max_note.value}}
					</option>
				</select>
				<input v-model="minAnnee" placeholder="annee">
				<input v-model="maxAnnee" placeholder="annee">
				<select v-model="sort">
					<option value="">sort by</option>
					<option v-for="sort_by in sorts" v-bind:value="sort_by.value">
					{{sort_by.text}}
					</option>
				</select>
				<select v-model="order">
					<option value="">order by</option>
					<option v-for="order_by in orders" v-bind:value="order_by.value">
					{{order_by.value}}
					</option>
				</select>
				<button @click="advanced_search()">recherche avance</button>
			</div>
			<ul>
				{{error}}
				{{patiente}}


          <div v-for="(item, key) in answer" class="card">

                <img class="card-img-top" :src="item.img" alt="Card image cap">
                <div class="card-block">
                  <h4 class="card-title">{{ item.title}}</h4>
                  <p class="card-text">{{item.imdb_code}} - {{item.year}}</p>
                </div>
                <div class="card-footer">
                  <small class="text-muted">Last updated 3 mins ago</small>
                  <router-link v-bind:to="'search/'+item.imdb_code+'/'+item.id+'/'+item.code">Select</router-link>
                </div>

          </div>

			</ul>
		</div>
	</form>
</template>

<script>
import auth from '../function.js'
import app from '../app.js'
export default {
  data () {
	 return {
		 req : "",
		 nomFilm : "",
		 genre : "",
		 minNote : "",
		 minAnnee : "",
		 maxAnnee : "",
		 maxNote : "",
		 profile : "",
		 error : "",
		 patiente : "",
		 log : "log out",
		 search : "",
		 current_page : 1,
		 current : 1,
		 avance : false,
		 answer : [],
		 answer_avance : [],
		 film_vue : [],
		 min_notes : [],
		 max_notes : [],
		 sort : "",
		 order : "",
		 res_sort : "",
		 res_current : 1,
		 res_order : "",
		 res_nomFilm : "",
		 res_genre : "",
		 res_minNote : "",
		 res_minAnnee : "",
		 res_maxAnnee : "",
		 res_maxNote : "",
		 orders : [
		 	{value : "asc"},
		 	{value : "desc"}
		 ],
		 sorts : [
		 	{text : "nom" , value : "nom"},
		 	{text : "genre", value : "genre"},
		 	{text : 'note', value : "rating"},
		 	{text : "annee", value : "year"}
		 ],
		 options : [
			{value : 'Action'},
			{value : 'Comedy'},
			{value : 'Family'},
			{value : 'History'},
			{value : 'Mystery'},
			{value : 'Sci-Fi'},
			{value : 'War'},
			{value : 'Adventure'},
			{value : 'Fantasy'},
			{value : 'Horror'},
			{value : 'Western'},
			{value : 'Animation'},
			{value : 'Drama'},
			{value : 'Romance'},
			{value : 'Thriller'},
		]
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
		this.error = ""
		this.patiente = ""
		var vm = this
		vm.answer = 'Thinking...'
		let token = window.localStorage.getItem("token")
		this.advance= false;
		if (!this.req)
		{
			this.answer = []
			this.page()
		}
		else
			vm.$http.get('search',{params : {name : this.req, token : token}} ).then((res) =>{
				console.log(res)
				this.answer = res.body.films
				this.film_vue = res.body.film_vue
				this.answer.forEach(data=>{
					let val = res.body.film_vue.some(elem=>{
						return (elem.id == data.id && elem.imdb == data.imdb_code && elem.code == data.code)
					})
					data.vue = val
				})
			}).catch(err=>{
				console.log("err ", err)
			})
	},
	// This is the number of milliseconds we wait for the
	// user to stop typing.
	500),
	init : function() {
		this.error = ""
		this.patiente = ""
		this.search = auth.i18n("authentication.search")
		this.log = auth.i18n("authentication.logout")
		this.profile = auth.i18n("authentication.profile")
		for (let i = 1 ; i < 11; i++)
		{
			this.min_notes.push({value : i})
			this.max_notes.push({value : i})
		}
		this.advance= false;
	},
	page: _.debounce(
	function () {
		this.init()
		let token = window.localStorage.getItem("token")
		this.$http.get('search', {params : {token : token, page : this.current_page}}).then((response) =>{
			response.json().then((res)=>{
				this.answer = this.answer.concat(res.films)
				this.film_vue = res.film_vue
				this.answer.forEach(data=>{
					let val = res.film_vue.some(elem=>{
						return (elem.id == data.id && elem.imdb == data.imdb_code && elem.code == data.code)
					})
					data.vue = val
				})
			});
		}, (response) =>{
			this.answer = response
			auth.logout();
			app.redirect("/login")
		});
	}),
	advanced_search : function()
	{
		this.error = ""
		if (!this.maxNote && !this.minNote && !this.minAnnee && !this.maxAnnee && !this.nomFilm && !this.genre && !this.sort && !this.order)
		{
			//return
			this.current_page = 1;
			this.answer = []
			this.avance = false;
			this.page()
		}
		else
		{
			this.res_maxNote = this.maxNote
			this.res_minNote = this.minNote
			this.res_minAnnee = this.minAnnee
			this.res_maxAnnee = this.maxAnnee
			this.res_nomFilm = this.nomFilm
			this.res_genre = this.genre
			this.res_sort = this.sort
			this.res_order = this.order
			//if (!this.avance)
				this.answer = []
			this.avance = true;
			if (this.maxNote && this.minNote && Number(this.maxNote) < Number(this.minNote))
				console.log("erreur dans les notes")
			else if (this.maxAnnee && this.minAnnee && Number(this.maxAnnee) < Number(this.minAnnee))
				console.log("erreur dans les annee")
			else
				this.$http.get("search", {params : {nom : this.nomFilm, genre : this.genre, minNote : this.minNote , maxNote : this.maxNote, minAnnee : this.minAnnee, maxAnnee : this.maxAnnee, sort : this.sort, order : this.order, page : this.current , av: 1}}).then(res =>{

					if (res.body.ret && res.body.ret == "FIN")
					{
						this.patiente = ""
						this.error = "Fin de la recherche"
					}
					else
					{
						console.log("la" , res, this.current)
						this.answer_avance = this.answer.concat(res.body.films)
						if (res.body.size < 1)
						{
							this.patiente = "patientez"
							this.current++;
							this.advanced_search()
						}
						else
						{
							this.patiente = ""
							this.res_current = this.current
							this.answer = this.answer_avance
						}
						this.film_vue = res.body.film_vue
						this.answer.forEach(data=>{
							let val = res.body.film_vue.some(elem=>{
								return (elem.id == data.id && elem.imdb == data.imdb_code && elem.code == data.code)
							})
							data.vue = val
						})
						console.log("vue ", this.answer)
					//this.answer = this.answer.concat(data)
					}
				}).catch(err=>{
					this.current = 0;
					this.current_page = 0;
					console.log("cest nul " , err)
				})
		}
	},
	_advanced : function()
	{
		this.error = ""
		this.current = 0;
		this.$http.get("search", {params : {nom : this.res_nomFilm, genre : this.res_genre, minNote : this.res_minNote , maxNote : this.res_maxNote, minAnnee : this.res_minAnnee, maxAnnee : this.res_maxAnnee, sort : this.res_sort, order : this.res_order, page : this.res_current , av: 1}}).then(data =>{
			console.log("la avance" , data, this.res_current)
		this.answer_avance = this.answer.concat(data.body)
			if (data.body.size < 1)
			{
				this.patiente = "patientez"
				this.res_current++;
				this.advanced_search()
			}
			else if (data.body.status == false)
				console.log("FINI")
			else
				this.answer = this.answer_avance
		//this.answer = this.answer.concat(data)
		}).catch(err=>{
			console.log("cest nul")
		})
	},
	modif_profile : function ()
		{
			this.$router.push("/profile")
		}
	},
	mounted : function () {
		this.page();
		$(window).scroll( () =>  {
			if ($(document).height() - $(window).height() == $(window).scrollTop()) {
				this.current_page++
				this.res_current++
				console.log(this.advance)
				if (!this.avance)
				{
					console.log("passe ici page normal")
					this.res_current = 0
					this.page();
				}
				else
				{
					console.log("passe ici page avance", this.res_current)
					this.current_page = 0;
					this._advanced()
				}
			}
		});
	}
}
</script>

