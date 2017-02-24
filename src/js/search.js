let parseTorrent = require("parse-torrent");
let PirateBay = require("thepiratebay");
let subtitle = require("./yify.js");
let RequestClient = require("reqclient").RequestClient;
let File_info = require('imdb-api');
let http = require("http");
let fs = require("fs");
let AdmZip = require("adm-zip");
let srt_to_vtt = require("srt-to-vtt-bulk")
let opensubtitles = require("subtitler");

let YTS = new RequestClient ({
	baseUrl : "https://yts.ag/api/v2/",
	debugRequest : true,
	//debugResponse : true
});

var maxYTS = 0;
let Info_file = {
	"year" : "0",
	"title" : "0",
	"imdb_code" : "0",
	"note" : "0",
	"time" : "0",
	"actors" : "0",
	"writer" : "0",
	"poster" : "0",
	"director" : "0",
	"country" : "0",
	"size" : "0",
	"seeders" : "0",
	"leechers" : "0",
	"genre" : [],
	"resume" : "0",
	"small_img" : "0",
	"medium_img" : "0",
	"large_img" : "0",
	"torrents" : [],
	"magnet" : null
}

function init_infoFile()
{
	Info_file = {
	"year" : "0",
	"title" : "0",
	"imdb_code" : "0",
	"note" : "0",
	"time" : "0",
	"actors" : "0",
	"writer" : "0",
	"poster" : "0",
	"director" : "0",
	"country" : "0",
	"size" : "0",
	"seeders" : "0",
	"leechers" : "0",
	"genre" : [],
	"resume" : "0",
	"small_img" : "0",
	"medium_img" : "0",
	"large_img" : "0",
	"torrents" : [],
	"magnet" : null
	}
}

function getSubtitle(IMDB, title)
{
	var download = function(filename, url) {
		var tmpFilePath = filename + ".zip"
			http.get(url, function(response) {
				response.on('data', function (data) {
					fs.appendFileSync(tmpFilePath, data)
				});
				response.on('end', function() {
					var zip = new AdmZip(tmpFilePath)
					zip.extractAllTo(filename)
					console.log("filename ", tmpFilePath)
					fs.unlink(tmpFilePath, (err) =>{
						if (err)
							console.log(err)
						else
						{
							setTimeout(function (){fs.readdir(filename, (err, data) => {
								var srtFile = data.filter((File) => {
									return File.endsWith('.vtt')
								})
								data.forEach((name) =>
								{
									if (name.lastIndexOf(".vtt") <= 0)
										fs.unlink(filename+"/" + name, (err) =>{
											if (err)
												console.log(err)
										})
								})
							})}, 500, srt_to_vtt(filename))
						}
					})
				})
			});
	}
	subtitle.searchSubtitles(["french", "english"], IMDB, function(data){
		fs.mkdir("./subtitles", (err)=>{
			if (err)
			console.log("rep already subtitles exits")
		})
		fs.access("./subtitles/"+IMDB, fs.constants.R_OK | fs.constants.W_OK, (err) => {
			fs.mkdir("./subtitles/"+IMDB, (err) =>{
				if (!err)
				{
					if (data[IMDB])
					{
						console.log("data")
								if (data[IMDB].french && data[IMDB].french.url)
									download("./subtitles/"+IMDB+"/fr", data[IMDB].french.url)
								if (data[IMDB].english && data[IMDB].english.url)
									download("./subtitles/"+IMDB+"/en", data[IMDB].english.url)
					}
					else
					{
						let i;
						opensubtitles.api.login().then(token =>{
							opensubtitles.api.searchForTitle(token, "fre", title).done(subFr =>{
								for (i = 0 ; i < subFr.length; i++)
									if (subFr[i].SubFileName.lastIndexOf('.srt') > 0)
										break
								if (subFr && subFr[i] && subFr[i].ZipDownloadLink)
								download("./subtitles/"+IMDB+"/fr", subFr[i].ZipDownloadLink)
							})
							opensubtitles.api.searchForTitle(token, "eng", title).done(subEn =>{
								for (i = 0 ; i < subEn.length; i++)
									if (subEn[i].SubFileName.lastIndexOf('.srt') > 0)
										break
								if (subEn && subEn[i] && subEn[i].ZipDownloadLink)
								download("./subtitles/"+IMDB+"/en", subEn[i].ZipDownloadLink)
							})
							opensubtitles.api.logout(token);
						})
					}
				}
			})
		});
	})
}

function Fill_infoFile(val, code)
{
	Info_file.released = new Date(val.released);
	Info_file.title = val.title;
	Info_file.note = val.rating;
	Info_file.resume = val.plot;
	Info_file.time = val.runtime;
	Info_file.genre = val.genres;
	Info_file.poster = val.poster;
	Info_file.writer = val.writer;
	Info_file.director = val.director;
	Info_file.actors = val.actors;
	Info_file.country = val.country;
	Info_file.imdb_code = val.imdbid;
	if (code == "Y")
	{
		//console.log("INFO MAGNET " + Object.keys(Info_file.torrents).length)
		let nb_torrent = Object.keys(Info_file.torrents).length
			Info_file.magnet = [];
		for (let i = 0 ; i < nb_torrent; i++)
		{
			let uri = parseTorrent.toMagnetURI({
				infoHash : Info_file.torrents[i].hash
			})
			Info_file.magnet[i] = uri;
		}
	}
	return Info_file; 
}

function getFile(id, code, IMDB)
{
	let tabFile = []
	init_infoFile()
	return new Promise ( (response, err) =>{

		var reg = /^tt\d{7}$/
		let reg2 = /tt\d{7}/
		//let id = parseInt(IMDB, 10);
		if (reg.exec(IMDB) && code == "Y" && id)
		{
			//console.log("test get file")
			let resp = YTS.get({ "uri" : "list_movies.json",
				"query" : {
					"query_term" : IMDB,
				}
			}).then(function (res)
			{
				if (res && res.status === "ok" && res.data.movie_count == 1)
				{
					Info_file.small_img = res.data.movies[0].small_cover_image;
					Info_file.medium_img = res.data.movies[0].medium_cover_image;
					Info_file.large_img = res.data.movies[0].large_cover_image;
					Info_file.img = res.data.movies[0].medium_cover_image;
					Info_file.torrents = res.data.movies[0].torrents;
					Info_file.size = res.data.movies[0].torrents[0].size;
					Info_file.seeders = res.data.movies[0].torrents[0].seeds;
					Info_file.leechers = res.data.movies[0].torrents[0].peers;
					Info_file.bg_image = res.data.movies[0].background_image;
					File_info.getById(IMDB).then( (val) => {
						Fill_infoFile(val, "Y")
						getSubtitle(IMDB, val.title)
						return response(Info_file);
					});
				}
			});
		}
		else if (IMDB && code == "P" && id)
		{
			PirateBay.getTorrent(id, {
				category: "video"
			}).then(data => {
				if (data.length <= 0)
					return response("AUCUN filM correspond")
				Info_file.size = data.size;
				Info_file.seeders = data.seeders;
				Info_file.leechers = data.leechers;
				Info_file.title = data.name;
				Info_file.magnet = data.magnetLink;
				Info_file.bg_image = "";
				let ID = data.id;
				IMDB = reg2.exec(data.description);
				if (IMDB)
				{
					IMDB = IMDB[0]
					Info_file.imdb_code = IMDB;
					File_info.getById(IMDB).then( (val) => { 
						Fill_infoFile(val, "P")
						getSubtitle(IMDB, val.title)
						Info_file.img = val.poster;
						return response(Info_file)
					});
				}
				else
					return response(Info_file)
			})
		}
		else
			return response("no DATA")
	})
}



function getFile_by_page(number)
{
	let tabFile = []
	let reg2 = /tt\d{7}/
	var IMDB ;
	if (!Number.isInteger(number) || number < 0)
		return "null";
	return new Promise ((response, err) => {
		let resp = YTS.get({ "uri" : "list_movies.json",
			"query" : {
				"page" : number,
			}
		}).then((res) =>{
			var i = 0;
			maxYTS = Math.trunc((res.data.movie_count / 20) + 1)
			if (res && res.data.movies)
			{
				for(; i < res.data.movies.length; i++)
				{
					let elem = "";
					elem = res.data.movies[i];
					tabFile[i] = {
						id : elem.id,
						title : elem.title,
						imdb_code : elem.imdb_code,
						note : elem.rating,
						small_img : elem.small_cover_image,
						medium_img : elem.medium_cover_image,
						large_img : elem.large_cover_image,
						img : elem.medium_cover_image,
						code : "Y"
					};
				}
			}
			if (i < 20)
			{
				if (number >= maxYTS)
					number = (number - maxYTS);
				var t = PirateBay.userTorrents('YIFY',{
					category : 'video',
					page :  number,
				}).then((result)=>{
					for (let j = i; j < 20; j++)
				{
					PirateBay.getTorrent(result[j].id).then(resultat => {
						IMDB = reg2.exec(resultat.description);
						if (IMDB)
						{
							IMDB = (IMDB) ? IMDB[0] : "null"
							let imdb_film = IMDB;
							File_info.getById(IMDB).then( (val) => { 
								tabFile.push({
									id : result[j].id,
									title : result[j].name,
									imdb_code : imdb_film,
									img : val.poster,
									code : "P"
								})
								if (j == 19)
								{
									return response(tabFile);
								}
							});
						}
						else
							return response("no films or IMDB")
					})
				}
				});
			}
			else
				return response(tabFile)
		})
	})
}

function getFile_by_tag(name){

	let tabFile = []
	let reg2 = /tt\d{7}/
	var IMDB ;
	return new Promise ( (response, err) => {

		let resp = YTS.get({ "uri" : "list_movies.json",
			"query" : {
				"query_term" : name,
			}
		}).then((res) =>{
			var i = 0;
			if (res && res.data.movies)
			{
				for (; i < res.data.movies.length; i++)
				{
					let elem = "";
					elem = res.data.movies[i];
					tabFile[i] = {
						id : elem.id,
						title : elem.title,
						imdb_code : elem.imdb_code,
						note : elem.rating,
						small_img : elem.small_cover_image,
						medium_img : elem.medium_cover_image,
						large_img : elem.large_cover_image,
						img : elem.medium_cover_image,
						code : "Y"
					}
				}
			}
			if (i < 20)
			{
				const MAX_RESULT = 20
				PirateBay.search(name, {
					category : 'video',
				}).then((result)=>{
					let res = [];
					let l = 0;
					let id ;
					if (i == 0 && result.length == 0)
					{
						response("")
					}
					for (let i = 0 ; i < result.length; i++)
					{
						id = parseInt(result[i].subcategory.id, 10);
						if (id === 205 || id === 208 || !result[i].name)
							continue;
						res[l] = result[i]
						l = res.length;
					}
					let err = 0;
					for (let j = 0 ; j < res.length; j++)
					{
						PirateBay.getTorrent(res[j].id.toString()).then(resultat => {
							IMDB = reg2.exec(resultat.description);
							if (IMDB)
							{
								IMDB = (IMDB) ? IMDB[0] : "null"
								let imdb_film = IMDB
								File_info.getById(IMDB).then( (val) => {
									tabFile.push({
										id : res[j].id,
										title : res[j].name,
										imdb_code : imdb_film,
										img : val.poster,
										code : "P"
									})
									
									if (tabFile.length == res.length + i - err 
										|| tabFile.length == MAX_RESULT)
									{
										return response(tabFile);
									}
								});
							}
							else {
								err++ ;
					//			console.log(err, res.length)
							}
							if (tabFile.length == res.length + i - err 
								|| tabFile.length == MAX_RESULT)
							{
					//			console.log("TESTiuprtghwi rtg " +j)
								return response(tabFile);
							}
						})
					}
					if ((res && res.length == 0) || !res)
						response("NO")
				}).catch((err) =>{
					console.log("err" + err);
				});
			}
			else
			{
				//console.log("TESTi34756347653476" )
				return response(tabFile)
			}
	//console.log("Hors de la fonction ")
		})
	})
}


function advance(params){

	return new Promise((response, error) =>{
		let tabFile = []
		let genre = (params['genre']) ? params['genre'] : 0
		let minNote = (params['minNote']) ? params['minNote'] : 0
		let maxNote = (params['maxNote']) ? params['maxNote'] : 10
		let minAnnee = (params['minAnnee']) ? params['minAnnee'] : 0
		let maxAnnee = (params['maxAnnee']) ? params['maxAnnee'] : -1
		let nom = (params['nom']) ? params["nom"] : 0
		let sort = (params['sort']) ? params["sort"] : 0
		let order = (params['order']) ? params["order"] : 0
		let page = (params['page']) ? params["page"] : 0
		let resp = YTS.get({ "uri" : "list_movies.json",
			"query" : {
				"genre" : genre,
				"minimum_rating" : minNote,
				"query_term" : nom,
				"sort_by" : sort,
				"order_by" : order,
				"limit" : 50,
				"page" : page
			}
		}).then(res=>{
			var i = 0;
			if (res && res.data.movies)
			{
				console.log(res.data)
				for (let j = 0; j < res.data.movies.length; j++)
				{
					let elem = res.data.movies[j];
					if (elem.rating >= minNote && elem.rating <= maxNote)
					{
						if (Number(elem.year) >= Number(minAnnee) && Number(elem.year) <= Number((maxAnnee < 0)? elem.year : maxAnnee))
						{
							//console.log("entre", elem.rating , elem.year, elem.title, elem.genres)
							tabFile.push({
								id : elem.id,
								title : elem.title,
								imdb_code : elem.imdb_code,
								note : elem.rating,
								small_img : elem.small_cover_image,
								medium_img : elem.medium_cover_image,
								large_img : elem.large_cover_image,
								img : elem.medium_cover_image,
								code : "Y",
								year : elem.year
							})
						}
					}
				}
				//console.log("test advance ",tabFile.length)
				if (tabFile.length <= 0)
				{
					if ((res.data.movie_count / page) < 50)
					{
						//console.log("FFFFFFFFFFFFFFIIIIIIIIIIIIINNNNNNNNNNNNNNNN")
						response("FIN")
					}
					else
						error(tabFile)
				}
				else
					response(tabFile)
			}
			response("NO")
		})
	
	})

}

exports.search_sub = (params, path) =>{
	let imdb = params['imdb']
	const Paths = 'subtitles/' + imdb
	const lang = ['en', 'fr']
	let tab = [];
	return new Promise ((yes , no) =>{
		var filename = path.join(process.cwd(), Paths);
		fs.exists(filename, exists => {
				if(!exists)
					yes("") 
			new Promise ((response, error) =>{
				let lang_path = path.join(filename, 'en') 
				fs.exists(lang_path, exists => {
					if(!exists)
						return response("")
					fs.readdir(lang_path, (err, files) => {
					response(files)
					})
				})
			}).then(data =>{
				//console.log("data sub ", data)
				new Promise ((res, err) =>{
					let lang_path = path.join(filename, 'fr') 
					fs.exists(lang_path, exists => {
						if(!exists)
						{ 
							if (data)
								return res({"en" : data})
							else
								return res("")
						}
						fs.readdir(lang_path, (err, files) => {
						res({"fr" : files, "en" : data})
						})
					})
				}).then(data =>{
					tab = data
					//console.log("response ", tab)
					yes(tab)
				})
			
			})
		})
	})
}

exports.getFile = getFile;
exports.getFile_by_page = getFile_by_page;
exports.getFile_by_tag = getFile_by_tag;
exports.advance = advance;
