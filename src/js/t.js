/*var file = require("./search.js")

  file.getFile(/*"7492489"*//*"tt1596343").then((res) =>{
							  console.log(res)
							  })*/

/*file.getFile_by_page(298).then((res) =>{
  console.log(res)
  })*/
/*
   file.getFile_by_tag("suicide").then((res) =>{
   console.log(res)
   })*/
/*const sub = require("opensubtitles-api");
const test = new sub('UserAgent')
test.SearchSubtitles({sublanguageid : 'fre', imdbid : 528809}).then(s=>{
	console.log("toto ", s)
})
*/
/*
const OS = require('opensubtitles-api');
const OpenSubtitles = new OS('UserAgent');

OpenSubtitles.api.LogIn('Hypertube75', 'Hypertube972', 'en', 'Hypertube972@hotmail.com')
    .then((token) => {
		console.log("token ", token)
		OpenSubtitles.search(token.token, {
			imdbid:'528809',
			sublanguageid : "fre"
		}).then(sub=>{
			console.log("sub " , sub)
		})
	});


var opensubtitles = require("subtitler");

opensubtitles.api.login()
.then(function(token){
	console.log("token ", token)
	// got the auth token
	 opensubtitles.api.searchForTitle(token,  "fre", "The Fast and the Furious: Tokyo Drift")
	 .done(results=>{
	     //got the search results
		 console.log("resultat ", results[0].ZipDownloadLink)
	opensubtitles.api.logout(token);
	     });
	
	 });
*/
