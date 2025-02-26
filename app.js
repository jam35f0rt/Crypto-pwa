const priceContainer = document.getElementById('price-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const searchInput = document.getElementById('search-input');
const addButton = document.getElementById('add-button');
const messageContainer = document.getElementById('message-container');

// --- Dark Mode Logic ---
function setDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled'); // Store preference
}

// Initialize Dark Mode
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        setDarkMode(true);
    } else if (savedDarkMode === 'disabled') {
        setDarkMode(false);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(!isDark);
});


// --- Crypto Price Fetching and Display ---
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
        return null; // Or handle the error as you see fit.
    }
}

async function createCryptoCard(code) {
    const price = await fetchCryptoPrice(code);

    const card = document.createElement('div');
    card.classList.add('crypto-price');
    card.dataset.cryptoCode = code; // Store the code for removal

    const title = document.createElement('h2');
    title.textContent = code;
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `$${price}` : 'N/A';
    card.appendChild(priceElement);
      // Add remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'x';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', () => removeCrypto(code));
    card.appendChild(removeButton);

    return card;
}


async function displayPrices() {
  priceContainer.innerHTML = '';
  const trackedCryptos = getTrackedCryptos(); // Get from local storage

  for (const code of trackedCryptos) {
      const card = await createCryptoCard(code);
      priceContainer.appendChild(card);
  }
}

// --- Add Crypto Functionality ---
addButton.addEventListener('click', async () => {
    const code = searchInput.value.trim().toUpperCase();
    if (!code) return;
    messageContainer.textContent = "";

    if (getTrackedCryptos().includes(code)) {
       messageContainer.textContent = `${code} is already being tracked.`;
        searchInput.value = '';
        return;
    }

    const price = await fetchCryptoPrice(code); // Check if it's a valid code
    if (price !== null) {
      addCryptoToTracking(code);
      displayPrices(); // Refresh the display
      searchInput.value = ''; // Clear the input
       messageContainer.textContent = "";
    } else {
      messageContainer.textContent = `Could not find a cryptocurrency with symbol ${code}.`;
    }
});

// --- Local Storage Management ---
function getTrackedCryptos() {
  const stored = localStorage.getItem('trackedCryptos');
  return stored ? JSON.parse(stored) : ['BTC', 'ETH', 'LTC']; // Default cryptos
}

function addCryptoToTracking(code) {
  const trackedCryptos = getTrackedCryptos();
  trackedCryptos.push(code);
  localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
}

function removeCrypto(code) {
  let trackedCryptos = getTrackedCryptos();
  trackedCryptos = trackedCryptos.filter(c => c !== code);
  localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
  displayPrices(); // Update the display
}


// --- Service Worker Registration (No Changes) ---
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

// --- Initialization ---
initializeDarkMode(); // Set initial dark mode
displayPrices(); // Initial price display
setInterval(displayPrices, 30000); // Refresh prices
