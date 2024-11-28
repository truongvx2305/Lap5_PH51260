var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "datntph51025@gmail.com",
        pass: "12345678"
    }
});
module.exports = transporter 
//dùng để sửa trên web
