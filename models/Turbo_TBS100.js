var mongoose = require('mongoose'),
   Schema = mongoose.Schema;
   
var TurboTBS100Schema = new Schema({
   Time: { type: Date, 'default': Date.now },
   DevEUI: { type: String },
	FPort: { type: Number },
	FCntUp: { type: Number },
	MType: { type: Number },
	FCntDn: { type: Number },
	payload_hex: { type: String },
	mic_hex: { type: String },
   Lrcid: { type: String },
   LrrRSSI: { type: Number },
   LrrSNR: { type: Number },
   SpFact: { type: Number },
   SubBand: { type: String },
   Channel: { type: String },
   DevLrrCnt: { type: Number },
   Lrrid: { type: String },
   Late: { type: Number },
	// Lrrs: { Lrr: [Object] }, Cac LRR ma device ket noi toi duoc
		// Tam khong luu tham so nay vi chua biet cach xu ly array o day
   CustomerID: { type: String },
	// CustomerData: { loc: [Object], alr: [Object] },
		CustomerLocLat: { type: Number },
		CustomerLocLon: { type: Number },
		CustomerPro: { type: String },
   ModelCfg: { type: Number },
   AppSKey: { type: String },
   DevAddr: { type: String },
   messagetype: {type: Number},
   TemAlarm: {type: Boolean, 'default': false },
   LBAlarm: {type: Boolean, 'default': false },
   FaultAlarm: {type: Boolean, 'default': false },
   FireAlarm: {type: Boolean, 'default': false },
   FrameCount: {type: Number},
   Temperature: {type: Number}
});

module.exports = mongoose.model('TurboTBS100', TurboTBS100Schema);