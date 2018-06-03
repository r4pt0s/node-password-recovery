const express    = require("express"),
      crypto     = require("crypto"),
      nodemailer = require("nodemailer"),
      bcrypt     = require("bcrypt-nodejs");      

const User= require("../models/user");
const router= express.Router();


router.get("/forgot", (req, res) => {
	res.render("forgot");
});

router.post("/forgot", async (req, res, next) => {

    try{
        const resolvedPromise= await Promise.all([
                                            User.findOne({email: req.body.email})
                                        ]);

        const token = crypto.randomBytes(20).toString('hex');
        const handleUser= resolvedPromise[0];                                 

        const mailOptions= {
            to: handleUser.email,
            from: process.env.NODEMAILER_EMAIL,
            subject: '"Node Password Recovery Sample" is here',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password
                Please Click the following link below, or copy and paste it into your browser to reset your password
                \n\n http://${req.headers.host}/reset/${token}  \n\n
                If you did not request this, please ignore this mail and your password  will remain unchanged`
        };

        handleUser.resetPasswordToken= token;
        handleUser.resetPasswordExpires= Date.now()+3600000;// +1 Hour
                    
        handleUser.save((err) => {
            if(err){
                console.log(err);
            }else{
				sendMailOut(mailOptions);
                
                debugTable("PASSWORD RECOVERY MAIL IS SENT", handleUser.toJSON());
				res.render("../views/forgot", {success: "You got an Email with Password recovery Information!"});
            }
        });
    }catch(err){
        console.log(`REACHED CATCH BLOCK. RESPONSE: ${err}`);
    }

});

router.get("/reset/:token", (req, res) => {
	User.findOne({
		resetPasswordToken: req.params.token, 
		resetPasswordExpires: { $gt: Date.now() }
	}, (err, foundUser) => {
		if(!foundUser){
            res.render("../views/forgot", {error: "Password reset token is invalid or has expired!"});
		}
		res.render('reset', {token: req.params.token});
	});
});

router.post("/reset/:token", (req, res) => {
	
	User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now()}
	}, (err, foundUser) => {
		if(!foundUser){
			return res.redirect("back");
		}
		if(req.body.newPassword === req.body.confirmPassword){
			foundUser.password= bcrypt.hashSync(req.body.newPassword);
            const mailOptions= {
                to: foundUser.email,
                from: process.env.NODEMAILER_EMAIL,
                subject: 'Your password has been changed for "Node Password Recovery Sample"',
                text: `You reseted your password successfully. Have fun and try again
                    \n\n http://${req.headers.host}/forgot  \n\n`
            };
            foundUser.resetPasswordToken= undefined;
            foundUser.resetPasswordExpires= undefined;

            foundUser.save((err) => {
                if(err){
                    console.log(`ERROR while saving Userdata. RESPONSE: ${err}`);
                }else{
                    debugTable("Password successfully changed",foundUser.toJSON());
                    res.status(200).send('Password changed Successfully');
                }
            });
            
            sendMailOut(mailOptions);
                
		}else{
			return res.redirect("back");
		}
	});
		
});

const sendMailOut= (mailOptions) => {
    const smtpTransport= nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASS
        }
    });

    smtpTransport.sendMail(mailOptions, (err) => {
        if(err){
            console.log(err);
            return { status: 500,
                text: err
            };   
        }else{
            console.log('mail sent');
            return { status: 200,
                     text: "mail sent"
            };  
        }
    });
};

// Beautify Debug OUTPUT
const debugTable= (title, obj) => {

    let beautify= Object.keys(obj).map((key) => `${key}: ${obj[key]}`);

    console.log("===============================");
    console.log(`${title}`);
    console.log("===============================");

    console.log(beautify.join("\n"));
}

module.exports= router;