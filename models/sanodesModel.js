var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
   
var sanodeSchema = new Schema({
	modelId: { type: String },
	devEUI: { type: String },
	network: {
		authenMethod : {type: String },
		appEUI: { type: String },
		appKey: { type: String },
		appSKey: { type: String },
		netSKey: { type: String },
		devAddr: { type: String }
	},
	configuration: {
		keepAliveTimeout: { type: Number },
		alarmRepeatTimeout: { type: Number }
	},
	activeStatus : { type: Number , default: 0 },
	status: {
		envStatus: { type: String, default: 'Normal' },
		connectInfo: { type: Number, default: 0 },
		smkWarnInfo: { type: Number, default: 0 },
		hotWarnInfo: { type: Number, default: 0 },
		lowBatWarnInfo: { type: Number, default: 0 },
		alarmInfo: { type: Number, default: 0 },
		temperature: { type: Number, default: 0 },
		statusUpdateTime: { type: Date, default: '' },
	},
	isDelete: { type: Boolean, default: false },
	isBlock: { type: Boolean, default: false},
	expDate: { type: Date, default: '' },
	createTime: { type: Date, default: Date.now },
	createBy: { type: String, default: '' },
	updateTime: { type: Date, default: '' },
	updateBy: { type : String, default: '' },
});

module.exports = mongoose.model('sanode', sanodeSchema);