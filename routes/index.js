var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var passport = require('passport');
var connection = mysql.createConnection({
    host     : 'sql12.freemysqlhosting.net',
    user     : 'sql12194671',
    password : 'aeTS8bpsub',
    database : 'sql12194671'
});

var app = express();

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
    res.render('register');
});

router.post('/doRegister', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var gender = req.body.gender;

    var sql = "INSERT INTO users VALUES(?,?,?,?,?)";
    var values = [null, username, password, email, gender];

    connection.query(sql,values, function(err,results){
        if(err){
            console.log(err);
            throw err;
        }

        return res.redirect('/');
    });
});

router.post('/doLogin', function(req, res, next) {
    var credential = req.body.credential;
    var password = req.body.password;

    var sql = "SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?";
    var values = [credential,credential,password];

    connection.query(sql,values, function(err, results){
        if(err){
          console.log(err);
          throw(err);
        }

        if(results.length == 0 ){
            return res.redirect('/');
        }

        req.session.user = results[0];

        return res.redirect('/home');
    })
});

router.get('/home', function (req, res, next) {
   res.render('home', {user: req.session.user});
});

router.get('/logout',function(req, res, next){
    req.session.destroy(); // hapus semua session
    //contoh hapus session tertentu req.session.destroy([KEY_SESSION]);
    res.redirect('/');
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] })); //scope untuk jadi permission agar bisa diambil emailnya

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    //req.session.user = req.user; //simpen hasil dari API facebook ke session
    //return res.redirect('/home'); //lgsung redirect ke halaman home ketika sudah berhasil login

    //cek email di fb terdaftar ato nda
    var sql = "SELECT * FROM users WHERE email = ?";
    var values = [emails[0]];

    connection.query(sql,values,function (err,results) {
        if(err){
            console.log(err);
            throw err;
        }

        if(results.length == 0){
            req.session.email = req.users.email[0].value;
            return res.redirect('/register');
        }

        req.session.user = results[0];
        return res.redirect('/home');
    });
});

module.exports = router;
