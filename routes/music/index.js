var express = require('express');
var router = express.Router();
var JsonDatabase = require('../../tools/json-database');
const musicDB = new JsonDatabase('music');

/**
 * * options allowed
 */
router.options('/', function (req, res, next) {
  res.sendStatus(200)
});

/**
 * * get all songs
 */
router.get('/', function (req, res, next) {
  musicDB.fetchAll().get((data) => {
    res.json({
      status: 'ok',
      result: data,
      error: {}
    });
  }, error => {
    res.json({
      status: 'fail',
      result: {},
      error: {
        code: 500,
        describe: 'json db error'
      }
    });
  })
});

/**
 * * get the song by file name
 */
router.get('/:name', function (req, res, next) {
  let name = req.params.name;
  name = name.replace('*', '\\\\*');
  musicDB.fetchAll().filter({ name: new RegExp(name, 'im') }).get(datas => {
    res.json({
      status: 'ok',
      result: datas,
      error: {}
    });
  }, error => {
    res.json({
      status: 'fail',
      result: {},
      error: {
        code: 500,
        describe: 'json db error'
      }
    });
  })
});

/**
 * * create a song
 */
router.post('/', function (req, res, next) {
  musicDB.fetchAll().add(req.body).send(() => {
    res.json({
      status: 'ok',
      result: {message: 'create success'},
      error: {}
    });
  }, error => {
    res.json({
      status: 'fail',
      result: {},
      error: {
        code: 500,
        describe: 'json db error'
      }
    });
  })
});

/**
 * * update the song by id
 */
router.put('/:id', function (req, res, next) {
  let data = req.body;
  let id = req.params.id || req.body.id;
  data.id = id;
  musicDB.fetchAll().update(data).send(() => {
    res.json({
      status: 'ok',
      result: { message: 'update success' },
      error: {}
    });
  }, error => {
    res.json({
      status: 'fail',
      result: {},
      error: {
        code: 500,
        describe: 'json db error'
      }
    });
  })
});

/**
 * * delete the song by id
 */
router.delete('/:id', function (req, res, next) {
  let id = req.params.id;
  musicDB.fetchAll().remove(id).send(() => {
    res.json({
      status: 'ok',
      result: { message: 'delete success' },
      error: {}
    });
  }, error => {
    res.json({
      status: 'fail',
      result: {},
      error: {
        code: 500,
        describe: 'json db error'
      }
    });
  })
});

module.exports = router;