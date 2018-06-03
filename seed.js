const mongoose = require("mongoose");

const User = require("./models/user");
 
const data = [
    {
        username: "Testuser1",
        password: "asdfjlsdfgjoij4wp5u90w5345345",
        avatar: "",
        firstName: "John",
        lastName: "Doe",
        email: "FILL IN YOUR TEST EMAIL ADRESS",
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
    },
    {
        username: "Testuser2",
        password: "asdfjlsdfgjoij4wp5u90w5345345",
        avatar: "",
        firstName: "Jane",
        lastName: "Doe",
        email: "test@gmail.com",                      //"FILL IN YOUR TEST EMAIL ADRESS",
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
    },
];
 
const seedDB = () =>{
   //Remove all campgrounds
   User.remove({}, (err) =>{
        if(err){
            console.log(err);
        }
        console.log("removed all Users!");
        data.forEach((seed) => {
                User.create(seed, (err, createdUser) => {
                    if(err){
                        console.log(err)
                    } else {
                        console.log(`added User: ${createdUser}`);
                    }
                });
            });
    });
}

module.exports = seedDB;