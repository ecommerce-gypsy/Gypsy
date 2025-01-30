const mongoose = require("mongoose");

const Customization = new mongoose.Schema({
  customId: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users", 
    required: true,
  },
  orderid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  designFile: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Custom", Customization);
