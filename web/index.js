const express = require('express'),
    app = express(),
	errorhandler = require('errorhandler'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
	http = require('http'),
	rules = require('./routes/rules'),
	sensors = require('./routes/sensors'),
	alerts = require('./routes/alerts'),
	equipment = require('./routes/equipment');

http.createServer(app).listen(8001, function () {
    console.log('Started HTTP on port: ' + 8001);
});

app.get('/', function(req, res, next) {
	const html = `
		<li><a href="/equipment">Equipment</a></li>
		<li><a href="/sensors">Sensors</a></li>
		<li><a href="/rules">Rules</a></li>
		<li><a href="/alerts">Alerts</a></li>
	`
    res.status(200).send(html);
});

// Setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to API using morgan
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(rules);
app.use(sensors);
app.use(alerts);
app.use(equipment);
app.use(errorhandler());
