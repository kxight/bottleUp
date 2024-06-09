const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

exports.signup = BigPromise(async (req, res, next) => {
    let result; 

    if (req.files) {
        let file = req.files.photo;
        result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })
    }

    const { name, email, password } = req.body;

    if(!email || !password || !name) {
        return next(new CustomError('Name, email and password are required', 400));
    }

    const user = await User.create({ 
        name,
        email,
        password ,
        photo: { id: result.public_id, secure_url: result.secure_url } 
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body;

    // check if email and password exist
    if(!email || !password) {
        return next(new CustomError('Email and password are required', 400));
    }

    // check if user exists
    const user= await User.findOne({email}).select("+password")

    if (!user) {
        return next(new CustomError('Email or password does not match or exist', 400));
    }

    // check if password is correct
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
        return next(new CustomError('Incorrect password', 400));
    }

    cookieToken(user, res); 
});
