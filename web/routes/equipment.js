const express = require('express'),
	request = require('request');
var app = module.exports = express.Router();
const smartContractId = 'b3177b3f-209b-487f-aacb-ab4583292c1a';

app.get('/equipment', function(req, res, next) {
	request('http://127.0.0.1:8000/equipment', function (error, response, body) {
		const equipment = JSON.parse(body)
		var html = ``
		equipment.map((e) => {
			html += `<li><a href="/equipment/${e}">${e}</a></li>`
		})		
    	res.status(200).send(html);
	});
});


app.get('/equipment/:id', async function(req, res, next) {
	request(`http://127.0.0.1:8000/equipment/${req.params.id}`, function (error, response, body) {
		const equipment = JSON.parse(body)
		var html = ``
		html += `<h1>${equipment.name}</h1>`
		if(equipment.alerts && equipment.alerts.length > 0){
			html += `<h2>Alerts</h2>`
			equipment.alerts.map((a) => {
				html += `<li><a href="/alerts/${a}">${a}</a></li>`
			})
		}
		html += `<p><a href="/equipment/${req.params.id}/history">History</a></p>`
    	res.status(200).send(html);
	});
});

app.get('/equipment/:id/history', async function(req, res, next) {
	request(`http://127.0.0.1:8000/equipment/${req.params.id}/history`, function (error, response, body) {
		const history = JSON.parse(body)
    	res.status(200).send(history);
	});


});
