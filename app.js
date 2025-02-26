const priceContainer = document.getElementById('price-container');
const favoritesContainer = document.getElementById('favorites-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const cryptoSearchInput = document.getElementById('crypto-search-input');
const cryptoSuggestionsList = document.getElementById('crypto-suggestions-list');
const currencySearchInput = document.getElementById('currency-search-input');
const currencySuggestionsList = document.getElementById('currency-suggestions-list');
const messageContainer = document.getElementById('message-container');

let allCryptos = [];
let allCurrencies = []; // To store available currencies
let selectedCurrency = 'USD'; // Default currency

// --- Dark Mode Logic --- (No Changes Here)
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

// --- Fetching Data ---

async function fetchCryptoPrice(cryptoCode, currency = 'USD') { // Add currency parameter
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-${currency}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode} price:`, error);
        showMessage(`Error fetching price for ${cryptoCode} in ${currency}.`);
        return null;
    }
}
// Fetch all crypto
async function fetchAllCryptos() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/currencies');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            allCryptos = data.data.map(crypto => ({
                id: crypto.id,  //Keep id
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

async function fetchAllCurrencies() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD'); // Get exchange rates relative to USD
        const data = await response.json();
        if (data.data && data.data.rates) {
            allCurrencies = Object.keys(data.data.rates).map(code => ({
                code: code,
                //  name:  "",  No name available in this API response.
            }));

        } else {
            throw new Error('Invalid response for exchange rates');
        }

    } catch (error) {
        console.error('Error fetching all currencies:', error);
        showMessage('Error fetching currency list.');
    }
}
// --- UI Update Functions ---

async function createCryptoCard(code, isFavorite = false) {
    const price = await fetchCryptoPrice(code, selectedCurrency); // Use selected currency

    const card = document.createElement('div');
    card.classList.add(isFavorite ? 'crypto-favorite' : 'crypto-price');
    card.dataset.cryptoCode = code;

    const title = document.createElement('h2');
    title.textContent = code;
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `${price} ${selectedCurrency}` : 'N/A';  // Display currency
    card.appendChild(priceElement);


    const button = document.createElement('button');
    if (isFavorite) {
        button.innerHTML = '<i class="fas fa-star"></i>';
        button.classList.add('remove-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    } else {
         button.innerHTML = '<i class="far fa-star"></i>'; // Use regular star for non-favorites
        button.classList.add('add-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    }
    card.appendChild(button);

      // Add remove button only to tracked (not favorites)
    if (!isFavorite) {
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
        const card = await createCryptoCard(code, true);
        favoritesContainer.appendChild(card);
    }
}

function showMessage(message) {
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// --- Favorites Management --- (No Changes Here)

function getFavorites() {
    const stored = localStorage.getItem('favoriteCryptos');
    return stored ? JSON.parse(stored) : [];
}

function isFavorite(code) {
    return getFavorites().includes(code);
}

function addFavorite(code) {
    const favorites = getFavorites();
    if (!favorites.includes(code)) {
        favorites.push(code);
        localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
    }
}

function removeFavorite(code) {
    let favorites = getFavorites();
    favorites = favorites.filter(c => c !== code);
    localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
}

function toggleFavorite(code, button) {
    if (isFavorite(code)) {
        removeFavorite(code);
        button.innerHTML = '<i class="far fa-star"></i>'; // Change to outline star
        // If it's in the favorites section, remove the card
        const favoriteCard = favoritesContainer.querySelector(`[data-crypto-code="${code}"]`);
        if (favoriteCard) {
            favoriteCard.remove();
        }
        //Update button on price container.
        const priceCardButton = priceContainer.querySelector(`[data-crypto-code="${code}"] .add-favorite-button`);

        if (priceCardButton) {
            priceCardButton.innerHTML = '<i class="far fa-star"></i>'
        }


    } else {
        addFavorite(code);
        button.innerHTML = '<i class="fas fa-star"></i>'; // Change to solid star
        // If it's not in the favorites section, add the card
        displayFavorites()
        const priceCardButton = priceContainer.querySelector(`[data-crypto-code="${code}"] .add-favorite-button`);
        if (priceCardButton) {
            priceCardButton.innerHTML = '<i class="fas fa-star"></i>'
        }
    }

}


// --- Local Storage Management (for Tracked Cryptos) --- (No Changes Here)

function getTrackedCryptos() {
    const stored = localStorage.getItem('trackedCryptos');
    return stored ? JSON.parse(stored) : ['BTC', 'ETH', 'LTC'];
}

function addCryptoToTracking(code) {
    const trackedCryptos = getTrackedCryptos();
    if (!trackedCryptos.includes(code)) {
        trackedCryptos.push(code);
        localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
    }
}

function removeCrypto(code) {
    let trackedCryptos = getTrackedCryptos();
    trackedCryptos = trackedCryptos.filter(c => c !== code);
    localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
    displayPrices();
}

// --- Search and Suggestions (for Cryptos) ---

function showCryptoSuggestions(suggestions) {
    cryptoSuggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        cryptoSuggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(crypto => {
        const listItem = document.createElement('li');
        listItem.classList.add('suggestions-list')
        listItem.textContent = `${crypto.name} (${crypto.symbol})`;

        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-favorite-button');
        addButton.addEventListener('click', (event) => {
            event.stopPropagation();
            addCryptoToTracking(crypto.symbol);
            if (!isFavorite(crypto.symbol)) {
                addFavorite(crypto.symbol);
            }
            displayPrices();
            displayFavorites();
            clearCryptoSearch();
        });
        listItem.appendChild(addButton);

        listItem.addEventListener('click', () => {
            cryptoSearchInput.value = crypto.symbol;
            addCryptoToTracking(crypto.symbol);
            if (!isFavorite(crypto.symbol)) {
                addFavorite(crypto.symbol);
            }
            displayPrices();
            displayFavorites();
            clearCryptoSearch();
        });
        cryptoSuggestionsList.appendChild(listItem);
    });
    cryptoSuggestionsList.style.display = 'block';
}

function clearCryptoSearch() {
    cryptoSearchInput.value = '';
    cryptoSuggestionsList.innerHTML = '';
    cryptoSuggestionsList.style.display = 'none';
}

function handleCryptoSearchInput() {
    const searchTerm = cryptoSearchInput.value.trim().toLowerCase();
    if (searchTerm.length === 0) {
        clearCryptoSearch();
        return;
    }

    const filteredCryptos = allCryptos.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm) ||
        crypto.symbol.toLowerCase().includes(searchTerm)
    );
    showCryptoSuggestions(filteredCryptos);
}

cryptoSearchInput.addEventListener('input', handleCryptoSearchInput);

// --- Search and Suggestions (for Currencies) ---

function showCurrencySuggestions(suggestions) {
    currencySuggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        currencySuggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(currency => {
        const listItem = document.createElement('li');
        listItem.classList.add('suggestions-list')
        listItem.textContent = currency.code; // Display currency code
        listItem.addEventListener('click', () => {
            currencySearchInput.value = currency.code;
            selectedCurrency = currency.code; // Update selected currency
            displayPrices();          // Refresh prices with new currency
            displayFavorites()
            clearCurrencySearch();    // Hide suggestions
        });
        currencySuggestionsList.appendChild(listItem);
    });
    currencySuggestionsList.style.display = 'block';
}

function clearCurrencySearch() {
    currencySearchInput.value = selectedCurrency;
    currencySuggestionsList.innerHTML = '';
    currencySuggestionsList.style.display = 'none';
}

function handleCurrencySearchInput() {
    const searchTerm = currencySearchInput.value.trim().toUpperCase();
    if (searchTerm.length === 0) {
        clearCurrencySearch();
        return;
    }

    const filteredCurrencies = allCurrencies.filter(currency =>
        currency.code.includes(searchTerm)
    );
    showCurrencySuggestions(filteredCurrencies);
}

currencySearchInput.addEventListener('input', handleCurrencySearchInput);

// Hide suggestions when clicking outside (for both lists)
document.addEventListener('click', (event) => {
    if (!cryptoSearchInput.contains(event.target) && !cryptoSuggestionsList.contains(event.target)) {
        cryptoSuggestionsList.style.display = 'none';
    }
     if (!currencySearchInput.contains(event.target) && !currencySuggestionsList.contains(event.target)) {
        currencySuggestionsList.style.display = 'none';
    }
});
// --- Service Worker Registration --- (No Changes)
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
async function initializeApp() {
    initializeDarkMode();
    await fetchAllCryptos();
    await fetchAllCurrencies(); // Fetch currency list
    displayPrices();
    displayFavorites();
    setInterval(displayPrices, 30000);
      // Set the initial value for the currency input
    currencySearchInput.value = selectedCurrency;
}

initializeApp();

