var nodemailer = require('nodemailer');
//controllers functions
const config = require('../../data.js')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.maxim_email,
    pass: config.maxim_pass
  }
});


//to send an email
const email = (to, msg, subject, callback) => {
    var mailOptions = {
        from: config.maxim_email,
        to: to,
        subject: subject,
        html: msg
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
           callback(false, error);
        } else {
            callback(true)
        }
      });
}
exports.email = email