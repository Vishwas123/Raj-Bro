

// model for mongoose

var mongoose = require('mongoose');

module.exports = mongoose.model('nodes', {
	node_id:       		Number,
	node_name: 			String,
	node_path: 			String,
	node_qc_id:         Number,
	node_parent_path: 	String,
	node_parent_id: 	Number, // this total is Sum of(setup, testing, error, misc) not including duration_time.  
	template: 			String,
	type:               String 

});


