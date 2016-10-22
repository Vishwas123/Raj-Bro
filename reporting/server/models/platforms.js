

// model for mongoose

var mongoose = require('mongoose');
var reports = require('mongoose').model('reports');


var cycle = reports.schema;
module.exports = mongoose.model('platforms', {
	platform: 		String,
	project: 		String,
	cycle: 			[cycle]
 })


