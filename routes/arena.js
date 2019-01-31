let express = require("express");
let router = express.Router();

router.get("/arena", (req, res)=>{
    res.render("arena",{
        pageTitle: "Pokemon Arena"
    })
})

module.exports = router;