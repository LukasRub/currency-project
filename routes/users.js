var express = require('express');
var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res) {
    var simpleObject = {
            "name": 'Lukas'
        };
    res.json(simpleObject);
});

/* GET /users/name */
router.get('/:name', function(req, res) {
    var name = req.params.name,
        simpleObject = {
            "name": name
        };
    res.json({'name': name});
});

exports.smth = function(req, res){
    res.send('...');
};

module.exports = router;
