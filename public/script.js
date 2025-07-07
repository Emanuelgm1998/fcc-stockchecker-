document.getElementById('stockForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const stock = document.getElementById('stock').value;
  const stock2 = document.getElementById('stock2').value;
  const like = document.getElementById('like').checked;
  const query = new URLSearchParams();
  query.append('stock', stock);
  if (stock2) query.append('stock', stock2);
  if (like) query.append('like', 'true');

  try {
    const res = await fetch('/api/stock-prices?' + query.toString());
    const data = await res.json();

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (Array.isArray(data.stockData)) {
      data.stockData.forEach(stock => {
        const p = document.createElement('p');
        p.textContent = `Stock: ${stock.stock}, Price: $${stock.price}, Relative Likes: ${stock.rel_likes}`;
        resultDiv.appendChild(p);
      });
    } else {
      const p = document.createElement('p');
      p.textContent = `Stock: ${data.stockData.stock}, Price: $${data.stockData.price}, Likes: ${data.stockData.likes}`;
      resultDiv.appendChild(p);
    }
  } catch (err) {
    console.error(err);
  }
});
