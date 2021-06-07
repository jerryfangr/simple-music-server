var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var path = require('path');
var JsonDatabase = require('../../tools/json-database');
const fileDB = new JsonDatabase('file');

/**
 * * options allowed
 */
router.options('/', function (req, res, next) {
  res.sendStatus(200)
})

/**
 * * get music file
 */
router.get('/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join('db/music', fileName);
  console.log('filepath', filepath);
  res.sendFile(filepath, { root: '.' });
});

/**
 * * delete music file
 */
router.delete('/:fileName', function (req, res, next) {
  let fileName = req.params.fileName;
  let filepath = path.join('db/music', fileName);
  fs.unlink(filepath, () => {
    res.json({
      status: 'fail',
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
    res.json({
      status: 'ok',
      result: {},
      error: {
        code: 400,
        describe: 'File is too large'
      }
    });
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
    const uploadFile = req.files[key];
    const uploadPath = path.join('db/music', uploadFile.name);
    uploadFile.mv(uploadPath, function (err) {
      if (err) {
        return res.json({
          status: 'fail',
          error: {
            code: 500,
            describe: 'server save failed'
          }
        });
      }

      fileDB.fetchAll().add({
        name: uploadFile.name,
        url: '/file/' + uploadFile.name
      }).send(() => {
        res.json({
          status: 'ok',
          result: { url: '/file/' + uploadFile.name },
          error: {}
        });
      }, err => {
        return res.json({
          status: 'fail',
          error: {
            code: 500,
            describe: 'record to db failed'
          }
        });
      })

    });
  }
});

module.exports = router;