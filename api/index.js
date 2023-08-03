const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const YOUR_MONGODB_URI_HERE =
  "mongodb+srv://ishaylevy8:m0bJKttsWypprdeL@cluster0.l4b3nhu.mongodb.net/?retryWrites=true&w=majority";
//'mongodb+srv://home:c5pFGTVgYm7VudwT@cluster0.l4b3nhu.mongodb.net/?retryWrites=true&w=majority'
app.get("/test", (req, res) => {
  res.json("test ojk");
});

app.get("/", (req, res) => {
  res.send("Rootsskks URL");
});

const cors = require("cors");

const mongoose = require("mongoose");
const User = require("./models/User.js");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "dsfkjsdhkgjsdlgfg";
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

mongoose.connect(YOUR_MONGODB_URI_HERE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect(process.env.MONGO_URL);
console.log(process.env.MONGO_URL);
console.log(YOUR_MONGODB_URI_HERE);

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { email: userDoc.email,
             id: userDoc._id
                        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        });
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);

      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});
app.listen(4000);