const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    // role: {
    //     type: String,
    //     enum: ['user', 'admin'],
    //     default: 'user'
    // },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must have at least 6 characters'],
        select: false
    },
    // passwordConfirm: {
    //     type: String,
    //     required: [true, 'Please confirm your password'],
    //     validate: {
    //         // This only works on CREATE and SAVE!!!
    //         validator: function(el) {
    //             return el === this.password;
    //         },
    //         message: 'Passwords are not the same!'
    //     }
    // },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createAt: {
        type: Date,
        default: Date.now,
        // select: false
    },
    // active: {
    //     type: Boolean,
    //     default: true,
    //     select: false
    // }
});

// encrypt password before saving - HOOKS
userSchema.pre('save', async function(next){
    // only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    };

    // hash the password with cost of 10
    this.password = await bcrypt.hash(this.password, 10);

    // // delete passwordConfirm field
    // this.passwordConfirm = undefined;
    // next();
});

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function(usersendPassword) {
    return await bcrypt.compare(usersendPassword, this.password);
};

// create and return JWT token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
};

//generate forgot password token
userSchema.methods.getResetPasswordToken = function() {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // hash token and set to passwordResetToken field
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // set expire for 20 minutes
    this.passwordResetExpires = Date.now() + 20 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);