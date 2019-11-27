const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { Schema } = mongoose;

const menuDishesSchema = new Schema({
  ingredients: [{ type: Schema.Types.ObjectId, ref: 'ingredients' }],
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  name: { type: String, required: true },
  ingredients: { type: Array, required: true },
  description: { type: String, required: true },
  quantity: { type: String, enum: ['100gms', '150gms', '200gms', '250gms', '500gms'] },
  price: { type: Number, required: true, min: 0, max: 100, default: 0 },
  dishType: { type: String, enum: ['combo', 'single'] },
  dishPics: { type: Array },
  address: { type: Schema.Types.ObjectId, ref: 'addresses' }
});

menuDishesSchema.plugin(timestamps);

mongoose.model('menudishes', menuDishesSchema);
