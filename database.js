const mongoose = require("mongoose");
require("dotenv").config();
const URL = process.env.MONGODB_URL;
exports.dbConnect = () => {
  try {
    mongoose
      .connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Database Connected Successfully !");
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log("DB Connection failed ");
  }
};
