const BigPromise = require('../middlewares/bigPromise');

exports.home = BigPromise(async(req, res) => {
    // const db = await somthing()
    res.status(200).json({
        success: true,
        message: 'Welcome to the API'
    });
})

exports.homeDummy = async (req, res) => {
    try{
        // const db = await somthing()
        res.status(200).json({
            success: true,
            message: 'This is another message from the API'
        });
    } catch(err) {
        console.log(err);
    }
}