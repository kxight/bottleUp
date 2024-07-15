const express = require('express');
require('dotenv').config();
const app = express();
const morgan = require('morgan');
const cokieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie and file middleware
app.use(cokieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// temp check
app.set('view engine', 'ejs');

// morgan middleware
app.use(morgan("tiny"));

// import all routes
const home = require('./routes/home');
const user = require('./routes/user');
const diary = require('./routes/diary')

// router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', diary)

app.get('/signuptest', (req, res) => {
    res.render('signuptest');
});

// export app js
module.exports = app;