var express 	= require('express'),
	app			= express(),
	bodyParser	= require('body-parser'),
	mongoose	= require('mongoose'),
	reportsController = require('./server/controller/reportsController'),
	tableController = require('./server/controller/tableController'),
	avgController = require('./server/controller/avgController'),
	testController = require('./server/controller/testController'),
	editReportController = require('./server/controller/editReportController'),
	trendController = require('./server/controller/trendController'),
	caseviewController = require('./server/controller/caseviewController'),
	progressController = require('./server/controller/progressController'),
	planningController = require('./server/controller/planningController');	


	// connection to mongoose
	mongoose.connect('mongodb://localhost:27017/reportsDB');




	// declaring the bodyParser
	app.use(bodyParser.urlencoded( { extended: true }));
	app.use(bodyParser.json());

	// the default main page
	app.get('/', function(req, res){
		res.sendFile(__dirname + '/client/views/index.html');
	});

	app.get('/reports', function(req, res){
		res.sendFile(__dirname + '/client/views/reports.html');
	});


	app.get('/tableview', function(req, res){
		res.sendFile(__dirname + '/client/views/tableview.html');
	});

	app.get('/avgview', function(req, res) {
		res.sendFile(__dirname + '/client/views/avgview.html')
	})

	app.get('/testview', function(req, res){
		res.sendFile(__dirname + '/client/views/testview.html');
	});

	app.get('/editreport', function(req, res){
		res.sendFile(__dirname + '/client/views/editreport.html');
	});

	app.get('/trendview', function(req, res){
		res.sendFile(__dirname + '/client/views/trendview.html');
	});

	app.get('/caseview', function(req, res){
		res.sendFile(__dirname + '/client/views/caseview.html');
	});

	app.get('/progressview', function(req, res){
		res.sendFile(__dirname + '/client/views/progressview.html');
	});

	app.get('/planningview', function(req, res){
		res.sendFile(__dirname + '/client/views/planningview.html');
	});


	// doing this to make it easier to write /js  instead of /client/js
	app.use('/js', express.static(__dirname + '/client/js'));
	app.use('/node_modules', express.static(__dirname + '/node_modules/'));

	// POST and GET for the api to save/retrieve data from the DB


	// routes for reportsController
	/*app.post('/api/reports/', reportsController.create);
	app.get('/api/reports/', reportsController.list);
*/
	app.post('/reports/api/reports/', reportsController.create);
	app.get('/reports/api/reports/', reportsController.list);
                                   
    // routes for tableView                                                                                                                                                                                                                                                                                                                                                       
	app.get ('/tableview/api/reports/', tableController.reportList);
	//app.post('/tableview/api/reports/', tableController.reportCreate);
	app.delete('/tableview/api/reports/:id', tableController.deleteReport);

	// routes for avgView
	app.get('/avgview/api/reports/', avgController.avgList);
	
	// routes for testView                                                                                                                                                                                                                                                                                                                                                       
	app.get ('/testview/api/reports/', testController.reportList);
	//app.post('/testview/api/reports/', testController.reportCreate);
	app.delete('/testview/api/reports/:id', testController.deleteReport);
	//app.post('/testview/api/reports/update/:id', testController.updateReport);

	// routes for editReport
	app.get('/editreport/api/reports/', editReportController.list);
	app.get('/editreport/api/reports/:id', editReportController.getData)
	app.post('/editreport/api/reports/update/:id', editReportController.updateReport);

	// routes for trendView
	app.get('/trendview/api/reports/:platform', trendController.trendList);

	// routes for caseview
	app.get('/caseview/api/cases/:cyclename', caseviewController.getCases);
	app.get('/caseview/api/cycles/', reportsController.list);

	// routes for progressview
	app.get('/progressview/api/cycles/', reportsController.list);
	app.post('/progressview/api/reports/', progressController.getTestInfo);
	app.post('/progressview/api/avg/', progressController.getAvgInfo);
	app.get('/progressview/api/tests/:cyclename', progressController.getTests);

	// routes for planningView
	app.get('/planningview/api/nodes/', planningController.getNodes);
	app.post('/planningview/api/nodes/', planningController.saveNodes);
	app.get('/planningview/api/folders/', planningController.getTestFolders);
	app.get('/planningview/api/testsets/', planningController.getTestSets);
	app.get('/planningview/api/tests/', planningController.getTests);
	app.post('/planningview/api/avg/', planningController.getAvg);
	app.get('/planningview/api/qctests/', planningController.getAllTests);
	app.get('/planningview/api/templates/', planningController.getTemplatesList);
		


	app.listen(3000, function() {
		console.log('I am listening...');
	});

	//app.put('/deleteReport/:id', tableController.deleteReport);
