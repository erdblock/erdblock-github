/* @flow */

var fs = require("fs")
var jade = require("jade")
var is = require("is_js")
var express = require("express")
var async = require('async')
var request = require('request')
var CronJob = require('cron').CronJob

module.exports = function(){
	var app = express()

	app.locals.title = "GitHub"
	
	app.locals.configId = function(){
		return app.locals.config.username.value
	}

	app.locals.config = {
		username: {
			label: 'Username',
			value: '',
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				return null
			}
		},
		reposCount: {
			label: 'Number of reops to show',
			value: 5,
			setValue: function(v){
				this.value = parseInt(v)
			},
			type: 'text',
			isValid: function(value){
				if (is.not.number(parseInt(value))){
					return "value must be a number"
				}
				else {
					return null
				}
			}
		}
	}

	var render = jade.compileFile(__dirname + "/views/layout.jade")

	app.use("/public", express.static(__dirname + "/public", {
		maxAge: "7d"
	}))

	app.html = function() {
		return render( app.locals )
	}
	app.less = function(){
		return fs.readFileSync(__dirname + "/stylesheets/style.less").toString()
	}
	app.generate = function() {
		if (app.locals.config.username.value == null) {
			console.log("Error at erdblock-github: not all values set to generate")
			return
		}

		async.parallel(
			{
				repos: function(callback){
					get('https://api.github.com/users/'+app.locals.config.username.value+'/repos', function (body){
						callback(null, JSON.parse(body))
					})
				},
				user: function(callback){
					get('https://api.github.com/users/'+app.locals.config.username.value+'', function (body){
						callback(null, JSON.parse(body))
					})
				}
			},
			function(err, results){
				if (err != null) {
					console.log("Error at erdblock-github: "+err)
					return
				}
				results.repos.sort(function(a, b){
					return b.stargazers_count-a.stargazers_count
				})
				app.locals.results = results
			}
		)
	}

	function get(url, callback) {
		var headers = {
				'User-Agent':	  'Erdblock/0.1',
				'Content-Type':   'text/html',
				'charset':        'utf-8'
		}
		var options = {
				url:    url,
				method: 'GET',
				headers: headers,
		}
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(body)
			}
		})
	}

	new CronJob('0 31 * * * *',
		app.generate,
		null,
		true
	)

	return app
}
