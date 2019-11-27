const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { Schema } = mongoose;

const userSchema = new Schema({
  addresses: [{ type: Schema.Types.ObjectId, ref: 'addresses' }],
  menuDishes: [{ type: Schema.Types.ObjectId, ref: 'menudishes' }],
  profileId: { 
    type: String, 
    required: function() {
      return this.userType === 'Social'
    } 
  },
  userType: { type: String, enum: ['Social', 'Jwt'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return this.userType === 'Jwt'
    }
  },
  contact: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Transgender'] },
  designation: { type: String },
  profilePic: { type: String },
});

userSchema.plugin(timestamps);

mongoose.model('users', userSchema);
