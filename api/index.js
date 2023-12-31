const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Place = require('./models/Place.js');
app.use('/uploads', express.static(__dirname+'/uploads'));
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs =require('fs');

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
      res.status(422).json("password not ok");
    }
  } else {
    res.json("user not found");
  }
});

app.get("/profile", (req, res) => {
  const {token} = req.cookies;
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


app.post('/logout', (req,res) =>{
    res.cookie('token', '').json(true);
});
app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';

    try {
        await imageDownloader.image({
            url: link,
            dest: __dirname + '/uploads/' + newName,
        });

        res.json(newName);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Image download failed' });
    }
});

const photosMiddleware = multer({dest:'uploads'});
app.use('/uploads', express.static(__dirname + '/uploads'));

// ... (other middleware and routes)

// Remove the '/uploads' part here
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];

    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads/', '')); // No need to include 'uploads/' here
  }
  res.json(uploadedFiles);
});

app.post("/places" ,(req,res)=>{
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,}
    =req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,
      title,address,photoes:addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  });
  res.json(placeDoc);
});
});
app.get('/places',(req,res)=>{
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const {id} = userData;
    res.json(await Place.find({owner:id}));
  });
});
app.get('/places/:id',async (req,res)=> {
  const {id} = req.params;
  res.json(await Place.findById(id));
});
app.put('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.listen(4000);
