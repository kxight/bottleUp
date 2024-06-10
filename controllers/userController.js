const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');

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

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({ success: true, message: "Logout success" });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body;

    const user = await User.findOne({email})

    if (!user) {
        return next(new CustomError('Email does not exist', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await mailHelper({
            email: user.email,
            subject: 'Password reset token',
            message: message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new CustomError(error.message, 500));
    }
});

exports.resetPassword = BigPromise(async (req, res, next) => {
    const token = req.params.token;
    const { password, passwordConfirm } = req.body;

    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({passwordResetToken, passwordResetExpires: { $gt: Date.now() }});

    if (!user) {
        return next(new CustomError('Invalid token', 400));
    }

    if (password !== passwordConfirm) {
        return next(new CustomError('Passwords are not the same!', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    cookieToken(user, res);
});
    
