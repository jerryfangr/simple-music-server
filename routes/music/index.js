var express = require('express');
var router = express.Router();
var fileRouter = require("./file");
var musicRouter = require("./music");

router.use('/', musicRouter);
router.use('/file', fileRouter);

module.exports = router;