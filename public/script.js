document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stockForm');
  const result = document.getElementById('result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const stock1 = document.getElementById('stock1').value.trim();
    const stock2 = document.getElementById('stock2').value.trim();
    const like = document.getElementById('like').checked;

    if (!stock1) {
      result.textContent = 'Please enter at least one stock symbol.';
      return;
    }

    let url = `/api/stock-prices?stock=${encodeURIComponent(stock1)}`;
    if (stock2) url += `&stock=${encodeURIComponent(stock2)}`;
    if (like) url += `&like=true`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      result.textContent = 'Error fetching stock data.';
      console.error(err);
    }
  });
});
