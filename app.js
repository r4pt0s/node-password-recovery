const express= require('express');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');

const User = require('./models/user');

const app= express();
const PORT = process.env_PORT || 3000;
const IP = process.env_IP || 'localhost';
const MONGODBPORT= process.env.MONGODBPORT || 27017;

//require ROUTES
const pwRecover = require("./routes/pwrecover");

const seedDB= require('./seed');	//remove everything from DB and seed it with new Data

mongoose.connect(`mongodb://localhost:${MONGODBPORT}/pwRecoverTest`);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

seedDB();	// call the seeding function

app.use(function(req, res, next){
	res.locals.error= "";
	res.locals.success= "";
	next();
});

app.use(pwRecover)

app.listen(PORT, IP, () => {
	console.log(`node-password-recovery Server is listening @${PORT} on ${IP}`);
})