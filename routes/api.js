'use strict';
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

const CONNECTION_STRING = process.env.MONGO_URI;
const client = new MongoClient(CONNECTION_STRING);

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const ip = req.ip;
      let stocks = Array.isArray(stock) ? stock : [stock];

      try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('stock_likes');

        const results = await Promise.all(stocks.map(async (symbol) => {
          const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
          const data = await response.json();

          if (!data || !data.symbol) return null;

          const stockSymbol = data.symbol;
          let doc = await collection.findOne({ stock: stockSymbol });

          if (!doc) {
            doc = { stock: stockSymbol, likes: 0, ips: [] };
            await collection.insertOne(doc);
          }

          if (like === 'true' && !doc.ips.includes(ip)) {
            doc.likes += 1;
            doc.ips.push(ip);
            await collection.updateOne({ stock: stockSymbol }, { $set: { likes: doc.likes, ips: doc.ips } });
          }

          return {
            stock: stockSymbol,
            price: data.latestPrice,
            likes: doc.likes
          };
        }));

        if (results.length === 2) {
          const rel_likes = results[0].likes - results[1].likes;
          return res.json({
            stockData: [
              { stock: results[0].stock, price: results[0].price, rel_likes },
              { stock: results[1].stock, price: results[1].price, rel_likes: -rel_likes }
            ]
          });
        } else if (results.length === 1 && results[0]) {
          return res.json({ stockData: results[0] });
        } else {
          return res.status(400).json({ error: 'Invalid stock symbol(s)' });
        }

      } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
};
