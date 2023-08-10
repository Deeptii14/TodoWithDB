const mongoose = require("mongoose");
const TodoSchema = new mongoose.Schema({
  useremail: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
  },
});
module.exports = mongoose.model("todo", TodoSchema);
