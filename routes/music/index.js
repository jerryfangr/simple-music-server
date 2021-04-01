var express = require('express');
var router = express.Router();
var JsonDatabase = require('../../tools/json-database');
const musicDB = new JsonDatabase('music');


/**
 * * get all songs
 */
router.get('/', function (req, res, next) {
  musicDB.fetchAll().get((data) => {
    res.send(data)
  }, error => {
    res.send(error);
  })
});

/**
 * * get the song by id
 */
router.get('/:id', function (req, res, next) {
  let id = req.params.id;
  musicDB.fetchAll().filter({ id }).get(data => {
    console.log(data);
    res.send(data)
  }, error => {
    res.send(error);
  })
});

/**
 * * create a song
 */
router.post('/', function (req, res, next) {
  musicDB.fetchAll().add(req.body, () => {
    res.send('success');
  }, error => {
    res.send(error);
  })
});

/**
 * * update the song by id
 */
router.put('/:id', function (req, res, next) {
  let data = req.body;
  let id = req.params.id || req.body.id;
  data.id = id;
  musicDB.fetchAll().update(data, () => {
    res.send('update success');
  }, error => {
    res.send(error);
  })
});

/**
 * * delete the song by id
 */
router.delete('/:id', function (req, res, next) {
  let id = req.params.id;
  musicDB.fetchAll().remove(id, () => {
    res.send('success');
  }, error => {
    res.send(error);
  })
});

module.exports = router;