// components/search.js

import { allCryptos, allCurrencies, fetchCryptoPrice, setSelectedCurrency, selectedCurrency } from '../utils/api.js';
import { addCryptoToTracking, getTrackedCryptos } from './local-storage.js';
import { displayPrices, displayFavorites, showMessage } from './ui-updates.js';
import { addFavorite, isFavorite } from './favorites.js';

const cryptoSearchInput = document.getElementById('crypto-search-input');
const cryptoSuggestionsList = document.getElementById('crypto-suggestions-list');
const currencySearchInput = document.getElementById('currency-search-input');
const currencySuggestionsList = document.getElementById('currency-suggestions-list');

// --- Crypto Search ---

function showCryptoSuggestions(suggestions) {
    cryptoSuggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        cryptoSuggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(crypto => {
        const listItem = document.createElement('li');
        listItem.classList.add('suggestions-list');
        listItem.textContent = `${crypto.name} (${crypto.symbol})`;

        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-favorite-button');
        addButton.addEventListener('click', (event) => {
            event.stopPropagation();
            addCryptoAndRefresh(crypto.symbol);
        });
        listItem.appendChild(addButton);

        listItem.addEventListener('click', () => {
            cryptoSearchInput.value = crypto.symbol;
            addCryptoAndRefresh(crypto.symbol);
        });
        cryptoSuggestionsList.appendChild(listItem);
    });
    cryptoSuggestionsList.style.display = 'block';
}

async function addCryptoAndRefresh(symbol) {
    // No need to check the price here.  displayPrices() will handle that.
    addCryptoToTracking(symbol);
    if (!isFavorite(symbol)) {
        addFavorite(symbol);
    }
    displayPrices();
    displayFavorites();
    clearCryptoSearch();
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

// --- Currency Search ---

function showCurrencySuggestions(suggestions) {
    currencySuggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        currencySuggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(currency => {
        const listItem = document.createElement('li');
        listItem.classList.add('suggestions-list');
        listItem.textContent = currency.code;
        listItem.addEventListener('click', async () => {
            try {
                await setSelectedCurrency(currency.code);
                currencySearchInput.value = selectedCurrency;
                displayPrices();
                displayFavorites();
                clearCurrencySearch();
            } catch (error) {
                showMessage("Failed to update currencies. Check your internet connection.");
            }
        });
        currencySuggestionsList.appendChild(listItem);
    });
    currencySuggestionsList.style.display = 'block';
}

function clearCurrencySearch() {
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

// --- Setup ---

export function setupCryptoSearch() {
    cryptoSearchInput.addEventListener('input', handleCryptoSearchInput);
    document.addEventListener('click', (event) => {
        if (!cryptoSearchInput.contains(event.target) && !cryptoSuggestionsList.contains(event.target)) {
            cryptoSuggestionsList.style.display = 'none';
        }
    });
}

export function setupCurrencySearch() {
    currencySearchInput.addEventListener('input', handleCurrencySearchInput);
    document.addEventListener('click', (event) => {
        if (!currencySearchInput.contains(event.target) && !currencySuggestionsList.contains(event.target)) {
            currencySuggestionsList.style.display = 'none';
        }
    });
}

export function initializeCurrencyInput() {
    currencySearchInput.value = selectedCurrency;
}
