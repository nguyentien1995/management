// var Turbo_TBS100_Model = require('../models').Turbo_TBS100;
var Models = require('../models/indexModel');
var request = require('request');

var alarmQueue = [];

module.exports = {
	sa: function(req, res) {
		console.log('\nTRACE | RECEIVE NEW POST REQUEST:');
		// Parsing the payload
		var parsing = function(bufHexString, device) {
			var devid = device.DevEUI;
			var model = device.model;

			buf = Buffer.from(bufHexString.toString(), 'hex');
				    
			var mes = {};
			// Parsing data of Turbo TBS100
			if(model == 'TBS-100') {
				switch (buf[0]) {
	            	case 0xA1:	// Uplink Status Frame
						console.log('TRACE | ' + 'Received Alarm information (A1) from ' + devid);
						if (buf[4] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 1;
						mes.TempAlarm = buf[1] & 0x01;
						mes.LBAlarm = (buf[1] & 0x02) >>> 1;
						mes.FaultAlarm = (buf[1] & 0x04) >>> 2;
						mes.FireAlarm = (buf[1] & 0x08) >>> 3;
						mes.FrameCount = (buf[1] & 0xF0) >>> 4; 
						mes.Temperature = buf[2];

						if (mes.FireAlarm) {
							mes.devStatus = 'Emergency';
							mes.reason = 'Smoke';
						} else if (mes.TempAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'High Temprature';
						} else if (mes.FaultAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'Device Fault';
						} else if (mes.LBAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'Low Battery';
						}

						console.log('TRACE | Create new timeout for ' + devid);
						var timer = setTimeout(function(dev) {
							var devId = dev.DevEUI;
							// This function is called when timeout is fired
							// this means no more Alarm message received
							console.log('TRACE | Timeout fires of ' + devId);
							// looking for devId in the queue, remove it from the queue and send alarm stop
							for (var i=0; i < alarmQueue.length; i++) {
								if (alarmQueue[i].deveui == devId) {
									// found, send alarm stop
									sendAlarm(dev, false, mes.FireAlarm, mes.TempAlarm, mes.LBAlarm, mes.FaultAlarm, mes.Temperature);
									
									// Update device status TTTTTT
									console.log('TRACE | Update device status for ' + devId + ' dev.status: ' + dev.status + ' dev.reason: ' + dev.reason);
									dev.status = 'Normal';
									dev.reason = 'Safe';
									dev.save();
									
									// remove alarm from the queue
									alarmQueue.splice(i,1);
									console.log('TRACE | The queue has :' + alarmQueue.length + ' element(s)');
									for (var j=0; j < alarmQueue.length; j++) {
										console.log('TRACE | ' + j + ': ' + alarmQueue[j].deveui);
									}
									return;
								}
							}
						}, 45000, device);
							
						// Check if devid is already on queue?
						for (var i=0; i < alarmQueue.length; i++) {
							if (alarmQueue[i].deveui == devid) {
								// found, stop timeout function
								console.log('TRACE | Alarm is found in the queue, remove the current Timeout');
								clearTimeout(alarmQueue[i].timer);
								console.log('TRACE | and update the new Timeout');
								alarmQueue[i].timer = timer;
								return;
							}
						}
						console.log('TRACE | Push new alarm into the queue');
						var alarm = {
							deveui: devid,
							type: mes.type,
							timer: timer
						};
						alarmQueue.push(alarm);
						
						console.log('TRACE | The queue has ' + alarmQueue.length + ' element(s)');
						for (var i=0; i < alarmQueue.length; i++) {
							console.log('TRACE | ' + i + ': ' + alarmQueue[i].deveui);
						}

						sendAlarm(device, true, mes.FireAlarm, mes.TempAlarm, mes.LBAlarm, mes.FaultAlarm, mes.Temperature);
						break;

					case 0xA2:	// Another Uplink Status Frame
						console.log('TRACE | ' + 'Received Working status information (A2)');
						if (buf[4] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 2;
						mes.TempAlarm = buf[1] & 0x01;
						mes.LBAlarm = (buf[1] & 0x02) >>> 1;
						mes.FaultAlarm = (buf[1] & 0x04) >>> 2;
						mes.FireAlarm = (buf[1] & 0x08) >>> 3;
						mes.FrameCount = (buf[1] & 0xF0) >>> 4; 
						mes.Temperature = buf[2];
						break;
					case 0xA3:	// Uplink Parameters Frame
						console.log('TRACE | ' + 'Received Startup information (A3)');
						if (buf[8] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 3;
						//T Viet tiep sau
						break;
					default:
						console.log('TRACE | ' + 'Message error: No Frame Type ', + buf[0]);
						return null;
				}
				return mes;
			// Parsing data of Turbo TBS110
			} else if (model == 'TBS-110') {
				// 1st byte
				switch (buf[0]) {
	            	// Uplink Status Frame, indicates alarm information
	            	case 0xB1:
	            		/**
		            	 *	we haven't use 3rd byte yet.
		            	 *	the 5th byte is reserves of devices
	            		**/
						console.log('TRACE | ' + 'Received Alarm information (B1) of ' + devid);
						// 6th byte
						if (buf[5] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 1;
						// 2nd byte
						mes.TempAlarm = (buf[1] & 0x01);
						mes.LBAlarm = (buf[1] & 0x02) >>> 1;
						mes.FaultAlarm = (buf[1] & 0x04) >>> 2;
						mes.FireAlarm = (buf[1] & 0x08) >>> 3;
						mes.FrameCount = (buf[1] & 0xF0) >>> 4; 
						if (mes.TempAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'High Temprature';
						} else if (mes.LBAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'Low Battery';
						} else if (mes.FaultAlarm) {
							mes.devStatus = 'Warning';
							mes.reason = 'Device Fault';
						} else if (mes.FireAlarm) {
							mes.devStatus = 'Emergency';
							mes.reason = 'Smoke';
						}
						// 4th byte
						mes.Temperature = buf[3];
						console.log('TRACE | Create new timeout for ' + devid);
						var timer = setTimeout(function(dev) {
							var devId = dev.DevEUI;
							// This function is called when timeout (after 45s) is fired
							// means that no more Alarm message received
							console.log('TRACE | Timeout fires of ' + devId);
							// looking for devId in the queue, remove it from the queue and send stop alarm
							for (var i=0; i < alarmQueue.length; i++) {
								if (alarmQueue[i].deveui == devId) {
									// found, send alarm stop
									sendAlarm(dev, false, mes.FireAlarm, mes.TempAlarm, mes.LBAlarm, mes.FaultAlarm, mes.Temperature);
									// Update device status 
									console.log('TRACE | Update device status for ' + devId + 
										' dev.status: ' + dev.status + ' dev.reason: ' + dev.reason);
									dev.status = 'Normal';
									dev.reason = 'Safe';
									dev.save();
									
									// remove alarm from the queue
									alarmQueue.splice(i,1);
									console.log('TRACE | The queue has :' + alarmQueue.length + ' element(s)');
									for (var j=0; j < alarmQueue.length; j++) {
										console.log('TRACE | ' + j + ': ' + alarmQueue[j].deveui);
									}
									return;
								}
							}
						}, 45000, device);
						// Check if devid is already on queue?
						for (var i=0; i < alarmQueue.length; i++) {
							// if device alarm is already in queue
							if (alarmQueue[i].deveui == devid) {
								console.log('TRACE | Alarm is found in the queue, remove the current Timeout');
								// prevent timeout of timer
								clearTimeout(alarmQueue[i].timer);
								console.log('TRACE | and update the new Timeout');
								alarmQueue[i].timer = timer;
								return;
							}
						}
						console.log('TRACE | Push new alarm into the queue');
						var alarm = {
							deveui: devid,
							type: mes.type,
							timer: timer
						};
						alarmQueue.push(alarm);
						
						console.log('TRACE | The queue has ' + alarmQueue.length + ' element(s)');
						for (var i=0; i < alarmQueue.length; i++) {
							console.log('TRACE | ' + i + ': ' + alarmQueue[i].deveui);
						}

						sendAlarm(device, true, mes.FireAlarm, mes.TempAlarm, mes.LBAlarm, mes.FaultAlarm, mes.Temperature);
						break;
					// to do
	            	// Another Uplink Status Frame, indicates working status information
					case 0xB2:
						/**
		            	 *	we haven't use 3rd byte yet.
		            	 *	the 5th byte is reserves of devices
	            		**/
						console.log('TRACE | ' + 'Received Working status information (B2) of ' + devid);
						// 6th byte
						if (buf[5] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 2;
						// 2nd byte
						mes.TempAlarm = buf[1] & 0x01;
						mes.LBAlarm = (buf[1] & 0x02) >>> 1;
						mes.FaultAlarm = (buf[1] & 0x04) >>> 2;
						mes.FireAlarm = (buf[1] & 0x08) >>> 3;
						mes.FrameCount = (buf[1] & 0xF0) >>> 4; 
						// 4th byte
						mes.Temperature = buf[3];
						break;
					// Uplink Parameters Frame
					case 0xB3:	
						console.log('TRACE | ' + 'Received Startup information (A3)');
						if (buf[8] != 0xE1) {
							console.log('TRACE | ' + 'Message error: No FrameEnd of Message');
							return null;
						}
						mes.type = 3;
						// do something with data
						//T Viet tiep sau
						break;
					default:
						console.log('TRACE | ' + 'Message error: No Frame Type ', + buf[0]);
						return null;
				}
				return mes;
			}
		}
		
		// Send Alarm
		var sendAlarm = function(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem) {
			
			// Request to send SMS message
			// sendAlarm2SMS(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem);

			// Send Alarm to Nagios
			sendAlarm2Nagios(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem);

			// send Alarm to oneSignal for push 
			sendAlarm2Push(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem)
		}

		var getDate = function() {
			var timeNow = new Date(Date.now());
			/* // Cach nay khong hien thu duoc ngay theo trat tu dd/mm/yyyy
			var options = { year: 'numeric', month: '2-digit', day: '2-digit',
								 hour: '2-digit', minute: '2-digit', second: '2-digit',
								 hour12: false, formatMatcher: "basic"};
			var viDateTime = new Intl.DateTimeFormat('en-SG', options).format;
			console.log(viDateTime(timeNow)); */
			var yyyy = timeNow.getFullYear();
			var mm = timeNow.getMonth() + 1;
			mm = (mm < 10) ? '0' + mm : mm;
			var dd = timeNow.getDate();
			dd = (dd < 10) ? '0' + dd : dd;
			var hh = timeNow.getHours();
			hh = (hh < 10) ? '0' + hh : hh;
			var MM = timeNow.getMinutes();
			MM = (MM < 10) ? '0' + MM : MM;
			var ss= timeNow.getSeconds();
			ss = (ss < 10) ? '0' + ss : ss;
			var timeStr = dd + '/' + mm + '/' + yyyy + '+'
							+ hh + ':' + MM + ':' + ss;
			return timeStr;
		}
		
		// Send alarm message via SMS
		var sendAlarm2SMS = function(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem) {
			console.log('TRACE | Send SMS to: ' + device.phone
							+ ' for device ' + device.DevEUI);
			if (AlarmState) {
				var url;

				if (FireAlarm)
						url = 'http://192.168.2.8:9710/http/send-message?username=admin&password=digicomm&to=%2B' 
							+ device.phone 
							+ '&message-type=sms.automatic&message='
							+ device.address + '%2C+'
							+ getDate()
							//+ ', PHÁT HIỆN KHÓI';
							+ '%2C+PH%C3%81T+HI%E1%BB%86N+KH%C3%93I';
				if (TempAlarm)
						url = 'http://192.168.2.8:9710/http/send-message?username=admin&password=digic0m&to=%2B' 
							+ device.phone 
							+ '&message-type=sms.automatic&message='
							+ device.address + '%2C+'
							+ getDate()
							// + ', PHÁT HIỆN NHIỆT ĐỘ CAO';
							+ '%2C+PH%C3%81T+HI%E1%BB%86N+NHI%E1%BB%86T+%C4%90%E1%BB%98+CAO';
				//console.log('*****************************');
				console.log(url);
				if (FireAlarm || TempAlarm)
					request(
						{ method: 'GET',
							// Format of uri: 'http://192.168.2.8:9710/http/send-message?username=admin&password=digicomm&to=+84912815618&message-type=sms.automatic&message=Cảnh báo cháy'
							uri: url
						},
						function(error, response, body) {
							if (error) { throw error; }
							console.log('ERROR | ' + body);
					}
				)
			} else {
				var url;
				var timeNow = new Date(Date.now());
				var timeStr = timeNow.getHours() + ':' + timeNow.getMinutes() + ':' + timeNow.getSeconds() + ' '
								+ timeNow.getDate() + '-' + timeNow.getMonth() + '-' + timeNow.getFullYear();
				if (FireAlarm)
						url = 'http://192.168.2.8:9710/http/send-message?username=admin&password=digicomm&to=%2B' 
							+ device.phone 
							+ '&message-type=sms.automatic&message='
							+ device.address + '%2C+'
							+ getDate()
							// + ', HẾT KHÓI';
							+ '%2C+H%E1%BA%BET+KH%C3%93I';
							
				if (TempAlarm)
						url = 'http://192.168.2.8:9710/http/send-message?username=admin&password=digic0m&to=%2B' 
							+ device.phone 
							+ '&message-type=sms.automatic&message='
							+ device.address + '%2C+'
							+ getDate()
							// + ', NHIỆT ĐỘ BÌNH THƯỜNG';
							+ '%2C+NHI%E1%BB%86T+%C4%90%E1%BB%98+B%C3%8CNH+TH%C6%AF%E1%BB%9CNG';
				if (FireAlarm || TempAlarm)
					request(
						{ method: 'GET',
							// Format of uri: 'http://192.168.2.8:9710/http/send-message?username=admin&password=digicomm&to=+84912815618&message-type=sms.automatic&message=Cảnh báo cháy'
							uri: url
						},
						function(error, response, body) {
							if (error) { throw error; }
							console.log('ERROR | ' + body);
					}
				)
			}
		}

		// Send information to Nagios
		var sendAlarm2Nagios = function(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem) {
			var devid = device.DevEUI;

			if (!(FireAlarm || TempAlarm || LBAlarm || FaultAlarm)) {
				console.log("TRACE | function sendAlarm2Nagios: Something wrong!!!");
				return;
			}

			var http = require('http');
			var querystring = require('querystring');

			// form data
			var hostname = devid.substr(0,4) + '-'
								+ devid.substr(4,4) + '-'
								+ devid.substr(8,4) + '-'
								+ devid.substr(12,4);
			
			var xmldata;
			if (AlarmState) {
				xmldata = "<checkresults>/r/n/t<checkresult type='host'>/r/n/t/t<hostname>" + hostname + "</hostname>/r/n"
									+ "/t/t<state>0</state>/r/n"
									+ "/t/t<output>Alarm!|perfdata</output>/r/n"
									+ "/t</checkresult>/r/n";
				if (FireAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>FireAlarm</servicename>/r/n"
								+ "/t/t<state>2</state>/r/n"
								+ "/t/t<output>ALARM: Smoke Detected!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (TempAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>TempAlarm</servicename>/r/n"
								+ "/t/t<state>2</state>/r/n"
								+ "/t/t<output>ALARM: High Temperature (" + Tem + ")!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (LBAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>LBAlarm</servicename>/r/n"
								+ "/t/t<state>2</state>/r/n"
								+ "/t/t<output>ALARM: Low Battery!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (FaultAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>FaultAlarm</servicename>/r/n"
								+ "/t/t<state>2</state>/r/n"
								+ "/t/t<output>ALARM: Unknown!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
			} else {
				xmldata = "<checkresults>/r/n/t<checkresult type='host'>/r/n/t/t<hostname>" + hostname + "</hostname>/r/n"
									+ "/t/t<state>0</state>/r/n"
									+ "/t/t<output>Normal!|perfdata</output>/r/n"
									+ "/t</checkresult>/r/n";
				if (FireAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>FireAlarm</servicename>/r/n"
								+ "/t/t<state>0</state>/r/n"
								+ "/t/t<output>NORMAL: No Smoke|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (TempAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>TempAlarm</servicename>/r/n"
								+ "/t/t<state>0</state>/r/n"
								+ "/t/t<output>NORMAL: Temperature (" + Tem + ")!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (LBAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>LBAlarm</servicename>/r/n"
								+ "/t/t<state>0</state>/r/n"
								+ "/t/t<output>NORMAL: Battery OK!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
				if (FaultAlarm) {
					xmldata += "/t<checkresult type='service'>/r/n"
								+ "/t/t<hostname>" + hostname + "</hostname>/r/n"
								+ "/t/t<servicename>FaultAlarm</servicename>/r/n"
								+ "/t/t<state>0</state>/r/n"
								+ "/t/t<output>NORMAL: Unknown!|perfdata</output>/r/n"
								+ "/t</checkresult>/r/n</checkresults>";
				}
			}
			
			// form data
			var postData = querystring.stringify({
				cmd: "submitcheck",
				token: "duanlctoken",
				XMLDATA: xmldata
            // XMLDATA: "<checkresults>/r/n/t<checkresult type='host'>/r/n/t/t<hostname>somehost</hostname>/r/n/t/t<state>0</state>/r/n/t/t<output>Everything looks okay!|perfdata</output>/r/n/t</checkresult>/r/n/t<checkresult type='service'>/r/n/t/t<hostname>somehost</hostname>/r/n/t/t<servicename>someservice</servicename>/r/n/t/t<state>1</state>/r/n/t/t<output>WARNING: Danger Will Robinson!|perfdata</output>/r/n/t</checkresult>/r/n</checkresults>",
            // btnSubmit: "Submit Check Data"
			});
			 
			// request option
			var options = {
				host: '118.107.85.23',
				port: 80,
				method: 'POST',
				path: '/nrdp/',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': postData.length
				}
			};
			 
			console.log('TRACE | Send request to Nagios for ' + devid);
			// request object
			var req = http.request(options, function (res) {
				var result = '';
				res.on('data', function (chunk) {
					result += chunk;
				});
				res.on('end', function () {
					// console.log(result);
				});
				res.on('error', function (err) {
					console.log(err);
				})
			});
			 
			// req error
			req.on('error', function (err) {
				console.log(err);
			});
			 
			//send request witht the postData form
			req.write(postData);
			req.end();
		}
      	
      	// send information to oneSignal (for pushing notify)
      	var sendAlarm2Push = function(device, AlarmState, FireAlarm, TempAlarm, LBAlarm, FaultAlarm, Tem) {
      		console.log('TRACE | Send data to oneSignal ' + device.DevEUI);
			var headers = {
			    "Content-Type": "application/json; charset=utf-8",
			    // author IProtect
			    "Authorization": "Basic ZDU0ODIwYzYtMTk1Ny00OTMwLWI0MDgtZGQyMGNhYTAxMjE1"
			    // // author test app
			    // "Authorization": "Basic OWU1ZWIzNGItM2U2Ni00N2QwLWE1MWEtYzU0MDEwNWFmODc5"
			    
			};
			  
			var options = {
			    host: "onesignal.com",
			    port: 443,
			    path: "/api/v1/notifications",
			    method: "POST",				    
			    headers: headers
		  	};
			
			var https = require('https');
			var message;

			if (AlarmState) {
				if (FireAlarm)
					message = { 
						priority: 10,
						// IProtect
						app_id: "4654291d-ec00-46aa-b7b0-d57a40b8d265",
						// // Test app
						// app_id: "8bf1c0e9-95f3-462a-a868-a5ec083694c8",
						contents: {"en":  device.address+": Smoke alarm (" + getDate() + ")"},
						included_segments: ["All"],
						priority: 10,
						android_sound: "alarm",
						data: {"devEui":  device.DevEUI}
					};
				if (TempAlarm)
					message = {
						priority: 10, 
						app_id: "4654291d-ec00-46aa-b7b0-d57a40b8d265",
						contents: {"en":  device.address+": High temperature (" + getDate() + ")"},
						included_segments: ["All"],
						priority: 10,
						android_sound: "alarm",
                        data: {"devEui":  device.DevEUI}
					};

				if (FireAlarm || TempAlarm){
					var req = https.request(options, function(res) {
						res.on('data', function(message) {
							console.log("TRACE | Response: ");
							console.log(JSON.parse(message));
					   });
					});
					req.on('error', function(e) {
						console.log("ERROR: ");
						console.log(e);
					});
					//console.log(message);
					req.write(JSON.stringify(message));
					req.end();
				}
			} else {
				if (FireAlarm)
					message = {
						priority: 10, 
						app_id: "4654291d-ec00-46aa-b7b0-d57a40b8d265",
						contents: {"en":  ""+device.address+": Smoke clears (" + getDate() + ")"},
						included_segments: ["All"],
						priority: 10,
						android_sound: "alarm",
                        data: {"devEui":  device.DevEUI}
					};
				if (TempAlarm)
					message = {
						priority: 10, 
						app_id: "4654291d-ec00-46aa-b7b0-d57a40b8d265",
						contents: {"en":  device.address+": Normal temperature (" + getDate() + ")"},
						included_segments: ["All"],
						priority: 10,
						android_sound: "alarm",
						data: {"devEui":  device.DevEUI}
					};	
				if (FireAlarm || TempAlarm) {

					var req = https.request(options, function(res) {  
						res.on('message', function(message) {
							console.log("TRACE | Response: ");
							console.log(JSON.parse(message));
						});
					});

					req.on('error', function(e) {
						console.log("ERROR: ");
						console.log(e);
					});
					req.write(JSON.stringify(message));
					req.end();
				}
			}
		}
		// ***************************************************************************************************
		// START FROM HERE
		
		// // Check if DevEUI has been defined in DB
		// Models.sanodes.findOne({ DevEUI: { $regex: req.body.DevEUI_uplink.DevEUI } },
		// 	function(err, dev) {
		// 		if (err) { throw err; }
		// 		if (!dev) {
		// 			res.status(404).json("Not Found");
		// 			return;	// Ignore the POST request
		// 		} else {
		// 			// Parsing the message
		// 			/// var message = parsing(new Buffer(req.body.DevEUI_uplink.payload_hex), req.body.DevEUI_uplink.DevEUI);

		// 			var message = parsing(new Buffer(req.body.DevEUI_uplink.payload_hex), dev);
		// 			if (!message) {
		// 				res.status(500).json("Internal Server Error")
		// 				return;
		// 			}

		// 			// update dev status
		// 			dev.updateTime = Date.now();
		// 			dev.status = message.devStatus;
		// 			dev.reason = message.reason;
		// 			dev.temperature = message.Temperature;
		// 			dev.save();
					
		// 			// store data into Database
		// 			var dataModel = new Models.Turbo_TBS100 ({
		// 				Time: req.body.DevEUI_uplink.Time,
		// 				DevEUI: req.body.DevEUI_uplink.DevEUI,
		// 				FPort: req.body.DevEUI_uplink.FPort,
		// 				FCntUp: req.body.DevEUI_uplink.FCntUp,
		// 				MType: req.body.DevEUI_uplink.MType,
		// 				FCntDn: req.body.DevEUI_uplink.FCntDn,
		// 				payload_hex: req.body.DevEUI_uplink.payload_hex,
		// 				mic_hex: req.body.DevEUI_uplink.mic_hex,
		// 				Lrcid: req.body.DevEUI_uplink.Lrcid,
		// 				LrrRSSI: req.body.DevEUI_uplink.LrrRSSI,
		// 				LrrSNR: req.body.DevEUI_uplink.LrrSNR,
		// 				SpFact: req.body.DevEUI_uplink.SpFact,
		// 				SubBand: req.body.DevEUI_uplink.SubBand,
		// 				Channel: req.body.DevEUI_uplink.Channel,
		// 				DevLrrCnt: req.body.DevEUI_uplink.DevLrrCnt,
		// 				Lrrid: req.body.DevEUI_uplink.Lrrid,
		// 				Late: req.body.DevEUI_uplink.Late,
		// 				CustomerID: req.body.DevEUI_uplink.CustomerID,
		// 				CustomerLocLat: req.body.DevEUI_uplink.CustomerData.loc.lat,
		// 				CustomerLocLon: req.body.DevEUI_uplink.CustomerData.loc.lon,
		// 				CustomerPro: req.body.DevEUI_uplink.CustomerData.alr.pro + ' ver ' + req.body.DevEUI_uplink.CustomerData.alr.ver,
		// 				ModelCfg: req.body.DevEUI_uplink.ModelCfg,
		// 				AppSKey: req.body.DevEUI_uplink.AppSKey,
		// 				DevAddr: req.body.DevEUI_uplink.DevAddr,
		// 				messagetype: message.type,
		// 				TemAlarm: message.TempAlarm,
		// 				LBAlarm: message.LBAlarm,
		// 				FaultAlarm: message.FaultAlarm,
		// 				FireAlarm: message.FireAlarm,
		// 				FrameCount: message.FrameCount,
		// 				Temperature: message.Temperature
		// 			});
		// 			dataModel.save(function(err, data) {
		// 				if (err) { throw err; }
		// 				console.log('TRACE | ' + 'Successfully inserted data to log for ' + req.body.DevEUI_uplink.DevEUI);
		// 				// Response
		// 				res.status(200).json("OK")
		// 				return;
		// 			});
		// 		}
		// 	}
		// )
   	},
	
	getDevices: function(req, res) {
		console.log('TRACE | Request getDevices from ' + req.headers.host);
		Models.sanodes.find(
			{ }, 
			{ DevEUI: 1, address: 1, temperature: 1, reason: 1, status: 1, updateTime: 1},  
			{},
			function(err, devices){
				console.log('hello');
				if (err) { throw err; }
				res.json(devices);
			}
		)
	},
	
	getDeviceStatus: function(req, res) {
		console.log('TRACE | Request getDeviceStatus from ' + req.headers.host);
		Models.sanodes.findOne( { DevEUI: { $regex: req.params.device_eui } },
			function(err, dev) {
				if (err) { throw err; }
				res.json(dev);
			}
		)
	},
	
	getDeviceAlarms: function(req, res) {
		console.log('TRACE | Request getDeviceAlarms from ' + req.headers.host);
		Models.Turbo_TBS100.find(
			{ DevEUI: req.params.device_eui, messagetype: 1 },
			{ DevEUI: 1, messagetype: 1, Temperature: 1, FireAlarm: 1, FaultAlarm: 1, LBAlarm: 1, TemAlarm: 1, Time: 1},  
			{ sort: { 'Time': -1 }},	// limit: 10
			function(err, messages){
				if (err) { throw err; }
				console.log('TRACE | Found ' + messages.length + ' alarms');
				res.json(messages);
			}
		)
	},
	
	getDeviceEvents: function(req, res) {
		console.log('TRACE | Request getDeviceEvents from ' + req.headers.host);
		Models.Turbo_TBS100.find(
			{ DevEUI: req.params.device_eui },
			{ DevEUI: 1, messagetype: 1, Temperature: 1, FireAlarm: 1, FaultAlarm: 1, LBAlarm: 1, TemAlarm: 1, Time: 1},  
			{ sort: { 'Time': -1 }},	// limit: 10
			function(err, messages){
				if (err) { throw err; }
				console.log('TRACE | Found ' + messages.length + ' events');
				res.json(messages);
			}
		)
	}
}
