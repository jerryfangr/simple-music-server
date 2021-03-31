var express = require('express');
var router = express.Router();
const getToken = require('../tools/token');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * * get token
 */
router.get('/token', function (req, res, next) {
  const token = getToken().value;
  res.json({
    status: 'ok',
    result: { token },
    error: {}
  })
});

module.exports = router;
