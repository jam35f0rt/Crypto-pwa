const priceContainer = document.getElementById('price-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const cryptoCodes = ['BTC', 'ETH', 'LTC', 'XRP']; // Add or remove as needed

// --- Dark Mode Logic ---
function setDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Check for saved preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'enabled') {
    setDarkMode(true);
} else if (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // If no preference, use system preference
    setDarkMode(true);
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(!isDark);
});

// --- Crypto Price Fetching ---
async function fetchCryptoPrice(cryptoCode) {
  try {
    const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-USD/spot`);
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
    priceContainer.innerHTML = ''; // Clear previous prices

    for (const code of cryptoCodes) {
        const price = await fetchCryptoPrice(code);

         const card = document.createElement('div');
        card.classList.add('crypto-price');

        const title = document.createElement('h2');
        title.textContent = code;
        card.appendChild(title);

        const priceElement = document.createElement('p');

        if (price !== null) {
            priceElement.textContent = `$${price}`;
        }
        else{
             priceElement.textContent = 'N/A';
             priceElement.classList.add('error');
        }
        card.appendChild(priceElement);
        priceContainer.appendChild(card);
    }
}

// Initial price fetch and set interval
displayPrices();
setInterval(displayPrices, 30000); // Refresh every 30 seconds

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}
