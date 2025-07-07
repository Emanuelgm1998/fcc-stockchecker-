const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// ✅ Content Security Policy estricto (solo 'self')
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"]
    }
  }
}));

app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true); // Para detectar IP real

// ✅ Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Likes almacenados por IP en memoria
const likesDB = {};

// ✅ Obtener precio de acción desde API de FCC
async function fetchStock(stock) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data;
}

// ✅ API de precios
app.get('/api/stock-prices', async (req, res) => {
  try {
    let stocks = req.query.stock;
    const like = req.query.like === 'true';
    const ip = req.ip;

    if (!stocks) return res.json({ error: 'No stock provided' });

    if (!Array.isArray(stocks)) stocks = [stocks];
    stocks = stocks.map(s => s.toUpperCase());

    if (like) {
      stocks.forEach(s => {
        if (!likesDB[s]) likesDB[s] = new Set();
        likesDB[s].add(ip);
      });
    }

    const results = await Promise.all(stocks.map(async (stock) => {
      const data = await fetchStock(stock);
      return {
        stock,
        price: data.latestPrice?.toString() || '0',
        likes: likesDB[stock] ? likesDB[stock].size : 0
      };
    }));

    if (results.length === 2) {
      const [a, b] = results;
      res.json({
        stockData: [
          { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
          { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes }
        ]
      });
    } else {
      res.json({ stockData: results[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
