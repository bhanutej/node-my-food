const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const { Schema } = mongoose;

const ingredientSchema = new Schema({
  menuDishes: [{ type: Schema.Types.ObjectId, ref: 'menudishes'}],
  name: { type: String, required: true }
});

// search with ingredients like, get dishes of current date only.

ingredientSchema.plugin(timestamps);

mongoose.model('ingredients', ingredientSchema);
