var Report = require('../models/reports');

// By doing exports, this function can be used in other files
module.exports.reportCreate = function(req, res) {

	//console.log(req.body) // the bodyParser can parse the body from the request

	var report = new Report(req.body);
	report.save(function(err, result) {
		// pass the data to res so that the client can use this
		// This basically is a callback
		res.json(result); 
	});
}

module.exports.reportList = function(req, res) {
	// get data from MONGOOSE
	Report.find({}, function(err, results) {
		console.log('server/tableController list function');

		res.json(results); 
	});
}



module.exports.deleteReport = function(req, res) {
	

	//console.log(req.params.id);
	var requestedID = req.params.id;
	Report.remove({_id: requestedID}, function(err,results) {
		console.log("delete");
		res.json(results);
	});
	
	console.log('in removeReport function in server/controller/tablecontroller');
	
}

