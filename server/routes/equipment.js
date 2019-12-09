const express = require('express'),
    sdk = require('dragonchain-sdk');
var app = module.exports = express.Router();
const smartContractId = 'b3177b3f-209b-487f-aacb-ab4583292c1a';

app.get('/equipment', async function(req, res, next) {
	const client = await sdk.createClient();
	const call = await client.getSmartContractObject({key:`equipment_list`, smartContractId: smartContractId})
	const equipmentList = JSON.parse(call.response);

    res.status(200).send(equipmentList);
});


app.get('/equipment/:id', async function(req, res, next) {
    if (!req.params.id) {
        return res.status(400).send("You must send the id");
    }
	const id = req.params.id
    const client = await sdk.createClient();
	const call = await client.getSmartContractObject({key:`equipment_${id}`, smartContractId: smartContractId})
	const equipment = JSON.parse(call.response);

    res.status(200).send(equipment);

});

app.get('/equipment/:id/history', async function(req, res, next) {
    if (!req.params.id) {
        return res.status(400).send("You must send the id");
    }
	const id = req.params.id
    const client = await sdk.createClient();
	const call = await client.getSmartContractObject({key:`equipment_${id}`, smartContractId: smartContractId})
	const equipment = JSON.parse(call.response);

	const callHistory = await client.queryTransactions({ transactionType: "tempguard", "sortBy": "block_id", "redisearchQuery": "@method:updateTemperature @sensor_id:AAAAAAAA", "sortAscending": false })

	console.log(callHistory.response)

	var response = { 
		total: callHistory.response.total,
		results: []
	}

	callHistory.response.results.map((transaction) => {
		let reading = {
			sensor_id: transaction.payload.params.sensor_id,
			temperature: transaction.payload.params.temperature,
			timestamp: transaction.header.timestamp
		}
		response.results.push(reading)
	})

    res.status(200).send(response);

});
