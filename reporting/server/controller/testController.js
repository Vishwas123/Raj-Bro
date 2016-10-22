var Report = require('../models/reports');

/**

 */
/*module.exports.reportCreate = function(req, res) {
	console.log(req.body) // the bodyParser can parse the body from the request
	var report = new Report(req.body);
	report.save(function(err, result) {
		// pass the data to res so that the client ca ncuse this
		// This basically is a callback
		console.log('reportCreate in testController');
		res.json(result); 
	});
}*/

/*
	Get all the Reports from MongoDB.
 */
module.exports.reportList = function(req, res) {
	// get data from MONGOOSE
	console.log('reportList');
	Report.find({}, function(err, results) {
		console.log('server/testController list function');

		res.json(results); 
	});
}


/**
 * Delete Report from mongoDB for a particular		 _id.
 */
module.exports.deleteReport = function(req, res) {
	
	//console.log('hhhh');
	//console.log(req.params.id);
	var requestedID = req.params.id;
	Report.remove({_id: requestedID}, function(err,results) {
		console.log("delete");
		res.json(results);
	});
	
	console.log('in removeReport function in server/controller/testController');
}

/*module.exports.updateReport = function(req, res) {
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

*/
