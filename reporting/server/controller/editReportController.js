var Report = require('../models/reports');
var Platform = require('../models/platforms');

/*// By doing exports, this function can be used in other files
module.exports.create = function(req, res) {
	//console.log(req.body) // the bodyParser can parse the body from the request
	var report = new Report(req.body);
	report.save(function(err, result) {
		// pass the data to res so that the client can use this
		// This basically is a callback
		console.log("?");
		res.json(result); 
	});
}*/

/*
	Function to get Cycle Platform Project for Select Box.
 */
module.exports.list = function(req, res) {
	// get data from MONGOOSE
	console.log("list function in server/editReport");
	
	Platform.find({}, function(err, results) {
		res.json(results); 
		console.log('results is  *********************************' + results);
	});


}

module.exports.getData = function(req, res) {

	console.log("getData() in server/editReports");
	var requestedId = req.params.id;
	console.log(requestedId);
	Report.findOne({_id: requestedId}, function(err,result) {
		if(err){
			console.log(err);
		} else {
			console.log('response');
			console.log(result);
			res.json(result);
		}
	});
	//Report.findOne({'_id' : })
}

/*
	Updates the Report in mongoDB.
 */
module.exports.updateReport = function(req, res) {
	console.log('in updateREport');
	var requestedId = req.params.id;
	console.log(requestedId);
	console.log(req.body.duration_time);
	var update = {
		duration_time: req.body.duration_time,
		total_time: req.body.total_time,
		setup_time: req.body.setup_time,
		testing_time: req.body.testing_time,
		error_time: req.body.error_time,
		misc_time: req.body.misc_time,
		platform: req.body.platform,
		project: req.body.project,
		cycle: [
			   {"cycleName" : req.body.cycle.cycleName,
			    "cycleType" : req.body.cycle.cycleType,
			   }
		],
		notes:  req.body.notes
	};
	var query = {"_id":requestedId };
	var options = { new: true};



	Report.findOneAndUpdate(query,update,options, function(err, results) {
		if(err){
			console.log('error in updateReport');
		} else {
			res.json(results); 
		}
		
	});

}

