# Tempguard Smart Contract

This is the smart contract that lives as a Dragonchain L1 and is in charge of ledgering temperature updates and creating alerts

## Smart Contract and data creation

`dctl contract create tempguard jlubeck/tempguard:latest node index.js --customIndexes '[{"fieldName":"sensor_id","path":"params.sensor_id","type":"text"},{"fieldName":"method","path":"method","type":"text"}]'`
`dctl transaction create tempguard '{"method":"createSensor","params":{"sensor_id":"AAAAAAAA"}}'` 
`dctl transaction create tempguard '{"method":"createEquipment","params":{"name":"Kitchen Cooler"}}'` 
`dctl transaction create tempguard '{"method":"createRule","params":{"name":"Cooler not cooling", "max": 10, "min" : null }}'`
`dctl transaction create tempguard '{"method":"assignRule","params":{"rule_id":"{taken from previous step}", "equipment_id": "{taken from previous step}" }}'`
`dctl transaction create tempguard '{"method":"assignSensor","params":{"sensor_id":"AAAAAAAA", "equipment_id": "{taken from previous step}" }}'`
`dctl transaction create tempguard '{"method":"updateTemperature","params":{"sensor_id":"AAAAAAAA","temperature":20}}'`