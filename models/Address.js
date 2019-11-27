const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { Schema } = mongoose;

// const GeoSchema = new  Schema({
//   type: { type: String, default: "Point" },
//   coordinates: { type: [Number], index: "2dsphere" }
// });

const addressSchema = new Schema({
  streetOne: { type: String, required: true },
  streetTwo: { type: String, required: true },
  landmark: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  geometry: { type: Object, required: true, index: "2dsphere" },
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  addressType: { type: String, enum: ['Home', 'Office', 'Others'] },
  deletedAt: { type: Date, default: null }
});

addressSchema.plugin(timestamps);

mongoose.model('addresses', addressSchema);
