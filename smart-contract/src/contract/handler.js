const sdk = require("dragonchain-sdk");
const uuid = require("uuid/v4");

/**
 * One quick note on Logging from within a smart contract.
 * Never use STDOUT for logs. Always use STDERR to allow
 * dragonchain to split "output" and "logs" to diff streams.
 *
 * Remember:
 * `console.error` = log
 * `console.log` = output
 */

const log = console.error; // Remember that STDERR is the logging stream.

module.exports = async input => {
	const client = await sdk.createClient();

	const updatedState = {}; // create this at the top of the function, and always return it.

	const { method } = input.payload;
	if (method === "createSensor") {
		const { sensor_id } = input.payload.params;
		const sensorList = updatedState['sensor_list'] || await getHeapItemOrFail(client, 'sensor', 'list', []);
		sensorList.push(sensor_id);
		updatedState['sensor_list'] = sensorList;
		const key = `sensor_${sensor_id}`
		updatedState[key] = {
			id : sensor_id,
			temperature : null,
			timestamp : now()
		}
	} else 
	if (method === "createEquipment") {
		const { name } = input.payload.params;
		const id = uuid()
		const equipmentList = updatedState['equipment_list'] || await getHeapItemOrFail(client, 'equipment', 'list', []);
		equipmentList.push(id);
		updatedState['equipment_list'] = equipmentList;
		const key = `equipment_${id}`
		updatedState[key] = {
			id,
			name
		}
	} else 
	if (method === "createRule") {
		const { name, max, min } = input.payload.params;
		const id = uuid()
		const ruleList = updatedState['rule_list'] || await getHeapItemOrFail(client, 'rule', 'list', []);
		ruleList.push(id);
		updatedState['rule_list'] = ruleList;
		const key = `rule_${id}`
		updatedState[key] = {
			id,
			name,
			max,
			min
		}
	} else 
	if (method === "assignRule") {
		const { rule_id, equipment_id } = input.payload.params;
		const equipment = await getHeapItemOrFail(client, 'equipment', equipment_id);
		equipment.rule_id = rule_id
		const key = `equipment_${equipment_id}`
		updatedState[key] = equipment
	} else 
	if (method === "assignSensor") {
		const { sensor_id, equipment_id } = input.payload.params;
		const sensor = await getHeapItemOrFail(client, 'sensor', sensor_id);
		const equipment = await getHeapItemOrFail(client, 'equipment', equipment_id);
		equipment.sensor_id = sensor_id
		sensor.equipment_id = equipment_id
		updatedState[`equipment_${equipment_id}`] = equipment
		updatedState[`sensor_${sensor_id}`] = sensor
	} else 
	if (method === "updateTemperature") {
		const { sensor_id, temperature } = input.payload.params;
		// Pull relational items from heap as best we can with key/value
		const sensor = await getHeapItemOrFail(client, 'sensor', sensor_id);
		sensor.temperature = temperature
		sensor.timestamp = now()
		updatedState[`sensor_${sensor_id}`] = sensor
		const equipment = await getHeapItemOrFail(client, 'equipment', sensor.equipment_id);
		const rule = await getHeapItemOrFail(client, 'rule', equipment.rule_id);
		// if temp out of bounds, add new alert
		if (tempOutOfBounds(temperature, rule)) {
			await addNewAlert(client, equipment, sensor, updatedState);
		} else {
			// If the updated equipment has alerts, lets clear them
			if(equipment.alerts) await clearAlertsFromEquipment(client, equipment, updatedState);
		}
	} 
	// return the updatedState from this contract no matter what.
	return updatedState;
};

function now() {
	return parseInt((new Date().getTime() / 1000).toFixed(0))
}

/**
 * getHeapItemOrFail
 * Safely access data with some error handling.
 * @param {object} client 'Dragonchain client object'
 * @param {string} resource 'sensor' | 'equipment' | 'rule'
 * @param {string} id 'either a UUID or the string "list", which will return the list of ids'
 */
async function getHeapItemOrFail(client, resource, id, defaultValue=undefined) {
  const key = `${resource}_${id}`;
  try {
    const result = await client.getSmartContractObject({ key });
    if(result === undefined || result.status === 404) return defaultValue;
    return JSON.parse(result.response);
  } catch(e) {
	log(e)
    throw Error(`Failed to get and parse resource "${resource}" by id "${id}" at key "${key}".`);
  }
}
/**
 * tempOutOfBounds
 * @param {number} temperature
 * @param {Rule(min:number, max:number)} rule
 */
function tempOutOfBounds(temperature, rule) {
  return temperature > rule.max || temperature < rule.min
}

/**
 * addNewAlert
 * Adds a new alert to equipment (and global alert_list)
 * @param {Equipment(alerts: Alert[])} equipment
 * @param {Sensor} sensor
 * @param {Object()} updatedState
 */
async function addNewAlert(client, equipment, sensor, updatedState) {
  const alertId = uuid(); // create a new alertID
  const alertList = updatedState['alert_list'] || await getHeapItemOrFail(client, 'alert', 'list', []);
  if (equipment.alerts) {
	equipment.alerts.push(alertId)
  } else {
  	equipment.alerts = [alertId]
  }
  alertList.unshift(alertId); // add new alert to list of alerts.
  updatedState[`equipment_${equipment.id}`] = equipment; // update equipment in heap state
  updatedState['alert_list'] = alertList; //update alert_list
  updatedState[`alert_${alertId}`] = { // create new alert object
    equipment_id: equipment.id,
    rule_id: equipment.rule_id,
    timestamp: sensor.timestamp,
    temperature: sensor.temperature
  }
  return updatedState; // return new alert_list, and alert_<uuid> item.
}

async function clearAlertsFromEquipment(client, equipment, updatedState){
  const alertList = await getHeapItemOrFail(client, 'alert', 'list', []);
  equipment.alerts = [];
  updatedState['alert_list'] = alertList.filter((id)=> !equipment.alerts.includes(id));
  updatedState[`equipment_${equipment.id}`] = equipment;
  return updatedState;
}
