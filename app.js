const priceContainer = document.getElementById('price-container');
const favoritesContainer = document.getElementById('favorites-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions-list');
const messageContainer = document.getElementById('message-container');

let allCryptos = [];  // Store all cryptocurrencies from Coinbase

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

// --- Crypto Price and List Fetching ---
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
        showMessage(`Error fetching price for ${cryptoCode}.`);
        return null;
    }
}

async function fetchAllCryptos() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/currencies');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            allCryptos = data.data.map(crypto => ({
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.id // Using ID as symbol (Coinbase uses ID)
            }));
        } else {
            throw new Error('Invalid response for currencies');
        }
    } catch (error) {
        console.error('Error fetching all cryptocurrencies:', error);
        showMessage('Error fetching cryptocurrency list.');
    }
}


// --- UI Update Functions ---

async function createCryptoCard(code, isFavorite = false) {
    const price = await fetchCryptoPrice(code);

    const card = document.createElement('div');
    card.classList.add(isFavorite ? 'crypto-favorite' : 'crypto-price'); // Different class for favorites
    card.dataset.cryptoCode = code;

    const title = document.createElement('h2');
    title.textContent = code;
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `$${price}` : 'N/A';
    card.appendChild(priceElement);

    const button = document.createElement('button');
    if (isFavorite) {
        button.innerHTML = '<i class="fas fa-star"></i>';
        button.classList.add('remove-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    } else {
        button.innerHTML = '<i class="far fa-star"></i>';
        button.classList.add('add-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    }
    card.appendChild(button);

    // Add remove button only to tracked (not favorites)
    if (!isFavorite) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => removeCrypto(code));
        card.appendChild(removeButton);
    }


    return card;
}

async function displayPrices() {
    priceContainer.innerHTML = '';
    const trackedCryptos = getTrackedCryptos();

    for (const code of trackedCryptos) {
        const card = await createCryptoCard(code);
        priceContainer.appendChild(card);
    }
}
async function displayFavorites() {
    favoritesContainer.innerHTML = '';
    const favoriteCryptos = getFavorites();

    for (const code of favoriteCryptos) {
        const card = await createCryptoCard(code, true); // isFavorite = true
        favoritesContainer.appendChild(card);
    }
}
// Show message
function showMessage(message) {
    messageContainer.textContent = message;
    messageContainer.style.display = 'block'; // Ensure it's visible
    // Hide the message after 5 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}
// --- Favorites Management ---

function getFavorites()
