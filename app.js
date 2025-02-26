const priceContainer = document.getElementById('price-container');

async function fetchCryptoPrice(cryptoCode) {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-USD/spot`); // Fetch spot price in USD
        const data = await response.json();

        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode} price:`, error);
        return null; // Or handle the error as you see fit
    }
}

async function displayPrices() {
    const cryptoCodes = ['BTC', 'ETH', 'LTC']; // Bitcoin, Ethereum, Litecoin - Add more as needed
    priceContainer.innerHTML = ''; // Clear previous prices

    for (const code of cryptoCodes) {
        const price = await fetchCryptoPrice(code);
        if (price !== null) {
            const priceElement = document.createElement('div');
            priceElement.classList.add('crypto-price');
            priceElement.textContent = `${code}: $${price}`;
            priceContainer.appendChild(priceElement);
        }
    }
}

// Initial price fetch
displayPrices();

// Refresh prices every 30 seconds (adjust as needed)
setInterval(displayPrices, 30000);

// Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}
