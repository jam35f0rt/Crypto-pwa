// components/search.js

import { allCryptos, allCurrencies, fetchCryptoPrice, setSelectedCurrency, selectedCurrency } from '../utils/api.js';
import { addCryptoToTracking, getTrackedCryptos } from './local-storage.js'; // Import
import { displayPrices, displayFavorites } from './ui-updates.js';
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
             if(!isFavorite(crypto.symbol)) {
                addFavorite(crypto.symbol)
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
// --- Currency Search ---

function showCurrencySuggestions(suggestions) {
    currencySuggestionsList.innerHTML = '';
    if (suggestions.length === 0) {
        currencySuggestionsList.style.display = 'none';
        return;
    }

    suggestions.forEach(currency => {
        const listItem = document.createElement('li');
        listItem.classList.add('suggestions-list')
        listItem.textContent = currency.code;
        listItem.addEventListener('click', () => {
            // currencySearchInput.value = currency.code; // Don't change the input value here
            setSelectedCurrency(currency.code); // Only update the selectedCurrency
            displayPrices();
            displayFavorites();
            clearCurrencySearch();
        });
        currencySuggestionsList.appendChild(listItem);
    });
    currencySuggestionsList.style.display = 'block';
}

function clearCurrencySearch() {
    //  currencySearchInput.value = selectedCurrency; // Don't reset the input value here
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
    // currencySearchInput.value = selectedCurrency // NO - Move this to initializeCurrencyInput

    document.addEventListener('click', (event) => {
        if (!currencySearchInput.contains(event.target) && !currencySuggestionsList.contains(event.target)) {
            currencySuggestionsList.style.display = 'none';
        }
    });
}
// Add this new function to initialize the currency input:
export function initializeCurrencyInput() {
    currencySearchInput.value = selectedCurrency;
}
