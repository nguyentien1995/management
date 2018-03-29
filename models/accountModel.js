var mongoose = require('mongoose'),
   	Schema = mongoose.Schema;
	var bcrypt = require('bcrypt-nodejs');
  
var createHash = function(password){
 	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

var accountSchema = new Schema({
	username: { type: String },
	password: { type: String },
	role: { type: String },
	isDelete: { type: Boolean },
	createTime: { type: Date, default: Date.now },
	createBy: { type: String },
	updateTime: { type: Date , default: null },
	updateBy: { type : String, default: null },
	status: { type: String, default: 'Disable' }, 
});
// Doing something with data before excuting command
accountSchema.pre('save', function(next) {
        if (this.password) {
	        this.password = createHash(this.password);
        }
        next();
    }
);

// accountSchema.methods.authenticate = function(password) {
//     var md5 = crypto.createHash('md5');
//     md5 = md5.update(password).digest('hex');
//     return this.password === md5;
// };

module.exports = mongoose.model('Account', accountSchema);