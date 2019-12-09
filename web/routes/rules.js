const express = require('express'),
    sdk = require('dragonchain-sdk');
var app = module.exports = express.Router();
const smartContractId = 'b3177b3f-209b-487f-aacb-ab4583292c1a';

app.get('/rules', async function(req, res, next) {
	const client = await sdk.createClient();
	const call = await client.getSmartContractObject({key:`rule_list`, smartContractId: smartContractId})
	const equipmentList = JSON.parse(call.response);

    res.status(200).send(equipmentList);
});


app.get('/rules/:id', async function(req, res, next) {
    if (!req.params.id) {
        return res.status(400).send("You must send the id");
    }
	const id = req.params.id
    const client = await sdk.createClient();
	const call = await client.getSmartContractObject({key:`rule_${id}`, smartContractId: smartContractId})
	const equipment = JSON.parse(call.response);

    res.status(200).send(equipment);

});
