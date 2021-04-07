var express = require('express');
var router = express.Router();
var path = require('path');
var musicRouter = require('./music/index');
var fileRouter = require('./file/index');
const getToken = require('../tools/token');

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, XFILENAME, XFILECATEGORY, XFILESIZE');
  next();
});

router.get('/', function(req, res, next) {
  res.redirect('/uploader/dist/uploader.html')
});

router.get('/uploader/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join(__dirname, '../public/uploader/dist', fileName);
  res.sendFile(filepath)
});

/**
 * * get token
 */
router.get('/token', function (req, res, next) {
  const token = getToken();
  res.json({
    status: 'ok',
    result: { token },
    error: {}
  })
});

/**
 * * check token
 */
router.use((req, res, next) => {
  const token = req.query.token || req.body.token;
  if (token !== getToken()) {
    res.status(403).json({
      status: 'fail',
      error: {
        code: 403,
        describe: 'bad token'
      }
    })
  } else {
    next();
  }
});

router.use('/music', musicRouter);
router.use('/file', fileRouter);

module.exports = router;
