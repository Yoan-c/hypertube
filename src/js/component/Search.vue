<template>
	<form id="film" @submit.prevent>
		<div id="content">
			<input v-model="req" :placeholder="search">
			<div>
				<input v-model="nomFilm" placeholder="nom">
				<select v-model="genre">
					<option value="">genre</option>
					<option v-for="option in options" :value="option.value">
					{{option.value}}
					</option>
				</select>
				<select v-model="minNote">
					<option value="">note min</option>
					<option v-for="min_note in min_notes" :value="min_note.value">
					{{min_note.value}}
					</option>
				</select>
				<select v-model="maxNote">
					<option value="">note max</option>
					<option v-for="max_note in max_notes" :value="max_note.value">
					{{max_note.value}}
					</option>
				</select>
				<input v-model="minAnnee" placeholder="annee">
				<input v-model="maxAnnee" placeholder="annee">
				<select v-model="sort">
					<option value="">sort by</option>
					<option v-for="sort_by in sorts" :value="sort_by.value">
					{{sort_by.text}}
					</option>
				</select>
				<select v-model="order">
					<option value="">order by</option>
					<option v-for="order_by in orders" :value="order_by.value">
					{{order_by.value}}
					</option>
				</select>
				<button @click="advanced_search()">recherche avance</button>
			</div>
			<ul>
				{{error}}
				{{patiente}}
				<li v-for="item in answer">
					<router-link v-bind:to="'search/'+item.imdb_code+'/'+item.id+'/'+item.code" @click="init()">
						{{ item.title}} <br/>
						<img :src=item.img />
						<div v-show="item.vue">
							<img src="../../img/check-mark.svg" alt="check" width=5%/>
						</div>
					</router-link>
				</li>
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
		 check : true,
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
		this.patiente = "searching..."
		this.answer = []
		this.getFilm()
	}
  },
  methods : {
	getFilm: _.debounce(
	function () {
		this.error = ""
		var vm = this
		let token = window.localStorage.getItem("token")
		this.advance = false;
		this.check = false;
		this.answer = []
		if (!this.req)
		{
			this.answer = []
			this.page()
		}
		else
			vm.$http.get('http://localhost:8080/search',{params : {name : this.req, token : token}} ).then((res) =>{
				if (res.body && res.body.films)
				{
					this.patiente = ""
					this.answer = res.body.films
					this.film_vue = res.body.film_vue
					this.answer.forEach(data=>{
						let val = res.body.film_vue.some(elem=>{
							return (elem.id == data.id && elem.imdb == data.imdb_code && elem.code == data.code)
						})
						data.vue = val
					})
				}
				else if (res.body.ret == "NO" || res.body.films.length == 0)
					this.patiente = auth.i18n("error.empty_film")
			}).catch(err=>{
				console.log("err ", err)
			})
	},
	// This is the number of milliseconds we wait for the
	// user to stop typing.
	500),
	init : function() {
	//	this.current_page = 0;
	//	this.res_current = 0
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
	page:
	function () {
		this.init()
		this.check= true;
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
	},
	advanced_search : function()
	{
		this.check = true;
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
				this.error = auth.i18n("error.note")
			else if (this.maxAnnee && this.minAnnee && Number(this.maxAnnee) < Number(this.minAnnee))
				this.error = auth.i18n("error.year")
			else
				this.$http.get("search", {params : {nom : this.nomFilm, genre : this.genre, minNote : this.minNote , maxNote : this.maxNote, minAnnee : this.minAnnee, maxAnnee : this.maxAnnee, sort : this.sort, order : this.order, page : this.current , av: 1}}).then(res =>{
					if (res.body.ret && res.body.ret == "FIN" || res.body.ret == "NO")
					{
						this.patiente = ""
						if (res.body.ret == "FIN")
							this.error = auth.i18n("search.end")
						else
							this.patiente = auth.i18n("error.empty_film")
					}
					else
					{
						this.answer_avance = this.answer.concat(res.body.films)
						if (res.body.size < 1)
						{
							this.patiente = auth.i18n("search.wait")
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
					}
				}).catch(err=>{
					this.current = 0;
					this.current_page = 1;
					console.log("errr ", err)
					//auth.logout();
					//app.redirect("/login")
				})
		}
	},
	_advanced : function()
	{
		this.check = false;
		this.error = ""
		this.current = 0;
		this.$http.get("search", {params : {nom : this.res_nomFilm, genre : this.res_genre, minNote : this.res_minNote , maxNote : this.res_maxNote, minAnnee : this.res_minAnnee, maxAnnee : this.res_maxAnnee, sort : this.res_sort, order : this.res_order, page : this.res_current , av: 1}}).then(res =>{

		this.answer_avance = this.answer.concat(res.body.films)
			if (res.body.size < 1)
			{
				this.patiente = auth.i18n("search.wait")
				this.res_current++;
				this.advanced_search()
			}
			else if (res.body.status == false)
				console.log("FINI")
			else
				this.answer = this.answer_avance
				this.film_vue = res.body.film_vue
				this.answer.forEach(data=>{
					let val = res.body.film_vue.some(elem=>{
						return (elem.id == data.id && elem.imdb == data.imdb_code && elem.code == data.code)
					})
					data.vue = val
				})
		}).catch(err=>{
			console.log("erreur ", err)
			auth.logout();
			app.redirect("/login")
		})
	},
	modif_profile : function ()
		{
			this.$router.push("/profile")
		}
	},
	mounted : function () {
		this.current_page = 1;
		this.res_current = 1
		this.page();
		$(window).scroll( () =>  {
			if ($(document).height() - $(window).height() == $(window).scrollTop() && this.check && $(window).scrollTop() > 0) {
				if (!this.avance)
				{
					this.current_page++
					this.res_current = 1
					this.page();
				}
				else
				{
					this.res_current++
					this.current_page = 1;
					this._advanced()
				}
			}
		});
	},
	destroyed : function(){
		$(window).off("scroll");

	}
}
</script>

