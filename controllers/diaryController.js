const BigPromise = require("../middlewares/bigPromise");

exports.testDiary = async (req, res) => {
    res.status(200).json({
        success: true,
        greeting: "this is test for diary"
    })
}

// exports.home = BigPromise(async(req, res) => {
//     // const db = await somthing()
//     res.status(200).json({
//         success: true,
//         message: 'Welcome to the API'
//     });
// })