var Report = require('../models/reports');
var Platform = require('../models/platforms');

/*
	Function to create a Report and save it to mongoDB
 */
module.exports.create = function(req, res) {

	console.log(req.body) // the bodyParser can parse the body from the request
	var report = new Report(req.body);
	report.save(function(err, result) {
		// pass the data to res so that the client can use this
		// This basically is a callback
		res.json(result); 
	});
}


/*
	Function to get the list of Platforms, Projects, Cycles for the reportsController
 */
module.exports.list = function(req, res) {
	// get data from MONGOOSE
	console.log("list function in server/reportsReportController");
	
	Platform.find({}, function(err, results) {
		res.json(results); 
		//console.log('results is  ' + results);
	});
}


