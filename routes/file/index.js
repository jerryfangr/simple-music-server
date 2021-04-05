var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var path = require('path');

/**
 * * options allowed
 */
router.options('', function (req, res, next) {
  res.sendStatus(200)
})

/**
 * * get music file
 */
router.get('/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join('db/music/file', fileName);
  res.sendFile(filepath);
});

/**
 * * delete music file
 */
router.delete('/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join('db/music/file', fileName);
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
router.post('/', function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files!!.');
  }

  for (const key in req.files) {
    const musicFile = req.files[key];
    const uploadPath = path.join('db/music', musicFile.name);
    musicFile.mv(uploadPath, function (err) {
      if (err) {
        res.json({
          status: 'fail',
          error: {
            code: 500,
            describe: 'server save fail'
          }
        });
        console.log(err);

      }
      res.json({
        status: 'ok',
        result: { url: '/file/' + musicFile.name},
        error: {}
      });
    });
  }
});

module.exports = router;