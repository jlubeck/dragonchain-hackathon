const sdk = require("dragonchain-sdk");
Thingy = require('./lib/thingy');
var temperature = null;

console.log('Reading temperature sensors!');

function onTemperatureData(t) {
    console.log('Temperature sensor: ' + t);
	temperature = t;
}

function onDiscover(sensor) {
  console.log('Discovered: ' + sensor);

  sensor.on('disconnect', function() {
    console.log('Disconnected!');
  });

  sensor.connectAndSetUp(function(error) {
    console.log('Connected! ' + (error ? error : ''));

    sensor.on('temperatureNotif', onTemperatureData);

    sensor.temperature_interval_set(10000, function(error) {
        if (error) {
            console.log('Temperature sensor configure! ' + error);
        }
    });

    sensor.temperature_enable(function(error) {
        console.log('Temperature sensor started! ' + ((error) ? error : ''));
    });

	setInterval(sendTemperature, 10000); //Thingy's native temperature_interval_set doesn't seem to be working
  });
}

Thingy.discover(onDiscover);

function sendTemperature(){
  if(temperature){
    console.log('Sending temperature for sensor AAAAAAAA: ',temperature); //just using hardcoded ID for hackathon
    const main = async () => {
		const client = await sdk.createClient();
		const call = await client.createTransaction({
			transactionType: "tempguard",
			payload: {
				"method": "updateTemperature",
				"params": {
					"sensor_id":"AAAAAAAA",
					"temperature":temperature
				}
			}        
		})
	
		if (call.ok) {
			console.log(call.response);
		} else {
			console.error(call)
		}
	}
	main().then(() => { console.log('success') }).catch(console.error);  
  }
}
