var counterModel = require('../models/counterModel');

// Function for checking if the object is empty or not (empty = true)
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
  	return true;
}

module.exports.getNextSequenceValueForCustomer = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'customerId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho customer ' }});
				}
			}
		}
	);
}

module.exports.getNextSequenceValueForAccount = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'accountId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho account' }});
				}
			}
		}
	);
}

module.exports.getNextSequenceValueForDevice = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'deviceId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho device' }});
				}
			}
		}
	);
}

module.exports.getNextSequenceValueForDeviceModel = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'deviceModelId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho device model' }});
				}
			}
		}
	);
}

module.exports.getNextSequenceValueForDeviceCustomer = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'deviceCustomerId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho device customer' }});
				}
			}
		}
	);
}

module.exports.getNextSequenceValueForDeviceHistory = function(req, res, next) {
	counterModel.findOneAndUpdate(
		{ _id : 'deviceHistoryId' }, 
		{ $inc: { sequence_value: 1 }}, 
		{ new: true }, function (err, counter) {
			if (err) {
				res.json({ status: 'fail', onErr: { reason: "db err", message: err }});
			} else {
				if(!isEmpty(counter)){
					req.id = counter.sequence_value;
				    next();
				} else {
				    res.json({ status: 'fail', onErr: { reason: "db err", message: 'Chưa có auto increasement cho device history' }});
				}
			}
		}
	);
}