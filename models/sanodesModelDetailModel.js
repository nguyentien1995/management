var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
   
var sanodesModelSchema = new Schema({
	brandname: { type: String },
	model: { type: String },
	firmwareVersion: { type: String },
	description : { type: String },
	photos: [],
	isDelete: { type: Boolean },
	createBy: { type: String },
	createTime: { type: Date, 'default': Date.now },
	updateBy: { type: String },
	updateTime: { type: Date, 'default': Date.now }
});

module.exports = mongoose.model('sanodeModel', sanodesModelSchema);