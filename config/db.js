const mongoose = require('mongoose');

const connectwithDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
            // useFindAndModify: false
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log('DB connection failed')
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectwithDB;