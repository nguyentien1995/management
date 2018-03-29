var mongoose = require("mongoose");
   	Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var createHash = function(password){
 	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

var customerSchema = new Schema({
    _id: { type: String },
	firstName: { type: String },
	lastName: { type: String },
    email: { type: String, default:'' },
    phone: { type: String, default:'' },
    password:{ type: String },
    location: [{
        name: { type: String, default: '' },
        phone: [{ type: String }],
        attachDevice: [{
            devEUI: { type: String, default: '' },
            attachTime: { type: Date, default: '' },
            place: { type: String, default: '' }
        }],
        address: {
            number: { type: String, default: '' },
            street: { type: String, default: '' },
            ward: { type: String, default: '' },
            district: { type: String, default: '' },
            city: { type: String, default: '' },
            province: { type: String, default: '' },
            country: { type: String, default: '' }
        }
    }],
    activeCode: { type: String },
    isActive: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    lastLoginTime: { type: Date },
    createTime: { type: Date, default: Date.now },
	createBy: { type: String },
	updateTime: { type: Date , default: Date.now },
	updateBy: { type : String, default: 'System' },
});
// Doing something with data before excuting command
customerSchema.pre('save', function(next) {
        if (this.password) {
	        this.password = createHash(this.password);
        }
        next();
    }
);
module.exports = mongoose.model('Customer', customerSchema);
