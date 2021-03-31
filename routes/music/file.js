var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var path = require('path');
const getToken = require('../../tools/token');

// router.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// })


/**
 * * check token
 */
router.use((req, res, next) => {
  const token = req.query.token || req.body.token;
  if (token !== getToken().value) {
    res.status(403).json({
      status: 'failed',
      error: {
        code: 403,
        describe: 'bad token'
      }
    })
  } else {
    next();
  }
});

/**
 * * get music file
 */
router.get('/file/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join('db/music/file', fileName);
  res.sendFile(filepath);
});

/**
 * * delete music file
 */
router.delete('/file/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  fs.unlink(filepath, () => {
    res.json({
      status: 'ok',
      result: {},
      error: {}
    });
  })
});


/**
 * * check file size
 */
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: 'db/tmp/',
  abortOnLimit: true,
  limits: {
    files: 1,
    fileSize: 50 * 1024 * 1024,
  },
  limitHandler: (req, res, next) => {
    res.writeHead(500, {
      Connection: 'close'
    });
    res.end('File is too large');
  }
}));

/**
 * * upload file
 */
router.post('/file', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files!!.');
  }

  for (const key in req.files) {
    const musicFile = req.files[key];
    const uploadPath = path.join('db/music', musicFile.name);
    musicFile.mv(uploadPath, function (err) {
      res.json({
        status: 'ok',
        result: { url: '/music/file/' + musicFile.name},
        error: {}
      });
    });
  }
});

module.exports = router;