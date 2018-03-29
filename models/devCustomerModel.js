var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
   
var devCustomerSchema = new Schema({
	cusEmail: { type: String },
	cusPhone: { type: String },
	attachTime: { type: Date },
	detachTime: { type: Date },
	isCurrent: { type: Boolean, default: true },
	createTime: { type: Date, default: Date.now },
	createBy: { type: String, default: '' },
	updateTime: { type: Date, default: '' },
	updateBy: { type : String, default: '' }
});

module.exports = mongoose.model('devCustomer', devCustomerSchema);