const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const routes = require('./routes/routes.js');
const cors = require ('cors');
const exphbs = require('express-handlebars')

const app = express();


const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname + '/uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 	extended:false,
 }))
 app.engine('.hbs', exphbs({
	defaulLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}))


app.set('view engine','.hbs')
app.set('views', path.join(__dirname, 'views'))

routes(app);

app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

 //start server
 const server = app.listen (port, (error) => {
	if (error) return console.log ('Error:  ${error}');
	
	console.log ('Server listening on port ', server.address().port);
 })


 //#region error handlers
 function logErrors(err, req, res, next) {
	console.error(err.stack);
	next(err);
  }

  function clientErrorHandler(err, req, res, next) {
	if (req.xhr) {
	  res.status(500).send({ error: 'Something failed!' });
	} else {
	  next(err);
	}
  }
  function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('error', {
		 error: err })
  }
  //#endregion