

// model for mongoose

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cycle = new Schema( {
	cycleName: 	 String,
	cycleType:   String, // comprehensive, regression
	startDate:   String,	// Ex. "05/01/2016"
	dateRange:   String,    // Ex. "12/18/2015 - 01/11/2016"
	endDate: 	 String		// Ex. "06/17/2016" 
});

module.exports = mongoose.model('reports', {
	testname:       String,
	testid: 		Number,
	runid: 			Number,
	testerid:       String,
	duration_time: 	Number,
	total_time: 	Number, // this total is Sum of(setup, testing, error, misc) not including duration_time.  
	setup_time: 	Number,
	testing_time: 	Number,
	error_time: 	Number,
	misc_time: 		Number,
	platform:       String,
	project:  		String,
	cycle: 			[cycle],
	notes: 			String,
	date: 			Date,
	test_instance_id: Number

});




