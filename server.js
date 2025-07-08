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

// Seguridad con Helmet + CSP básica
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

// Middleware
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta principal
app.route('/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Rutas FCC y API
fccTestingRoutes(app);
apiRoutes(app);

// Ruta 404
app.use((req, res) => {
  res.status(404).type('text').send('Not Found');
});

// Iniciar servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.error('Tests are not valid:', e);
      }
    }, 3500);
  }
});

module.exports = app;
