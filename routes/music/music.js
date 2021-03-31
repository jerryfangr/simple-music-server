var express = require('express');
var router = express.Router();
var getToken = require('../../tools/token');
var JsonDatabase = require('../../tools/json-database');
const musicDB = new JsonDatabase('music');

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

router.get('/', function (req, res, next) {
  musicDB.fetchAll().get((data) => {
    res.send(data)
  }, error => {
    res.send(error);
  })
});

router.get('/:id', function (req, res, next) {
  let id = req.params.id;
  musicDB.fetchAll().filter({id}).get(data => {
    console.log(data);
    res.send(data)
  }, error => {
    res.send(error);
  })
});

router.post('/', function (req, res, next) {
  musicDB.add(req.body, () => {
    res.send('success');
  }, error => {
    res.send(error);
  })
});

router.put('/:id', function (req, res, next) {
  let data = req.body;
  let id = req.params.id || req.body.id;
  data.id = id;
  musicDB.update(data, () => {
    res.send('update success');
  }, error => {
    res.send(error);
  })
});

router.delete('/:id', function (req, res, next) {
  let id = req.params.id;
  musicDB.remove(id, () => {
    res.send('success');
  }, error => {
    res.send(error);
  })
});


module.exports = router;