'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// ✅ Seguridad con Helmet + Content Security Policy solo desde el servidor
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  })
);

// ✅ Archivos estáticos
app.use('/public', express.static(process.cwd() + '/public'));

// ✅ CORS para FCC
app.use(cors({ origin: '*' }));

// ✅ Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Ruta principal
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// ✅ Rutas de test y API
fccTestingRoutes(app);
apiRoutes(app);

// ✅ Ruta 404
app.use(function (req, res, next) {
  res.status(404).type('text').send('Not Found');
});

// ✅ Iniciar servidor y ejecutar tests si NODE_ENV=test
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500); // Puedes subir esto a 5000 si los tests fallan por timeout
  }
});

module.exports = app;
