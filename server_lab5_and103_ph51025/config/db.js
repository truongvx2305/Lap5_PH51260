const mongoose = require('mongoose');

const local = "mongodb+srv://admin1:TLJwjsj2tQK3kJys@cluster0.7mgrb.mongodb.net/MD19303";

const connect = async () => {
    try {
        await mongoose.connect(local);
        console.log('Connect success');
    } catch (error) {
        console.error('Connection to MongoDB failed:', error);
    }
}

module.exports = { connect };
