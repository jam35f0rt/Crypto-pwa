// utils/api.js

export let allCryptos = [  // Pre-populate with common cryptos
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'LTC', name: 'Litecoin', symbol: 'LTC' },
    { id: 'XRP', name: 'Ripple', symbol: 'XRP' },
    { id: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH' },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL' },
    {id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE'}
];
export let allCurrencies = [];
export let selectedCurrency = 'USD';

export async function fetchCryptoPrice(cryptoCode, currency = 'USD') {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-${currency}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}-${currency}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode}-${currency} price:`, error);
        return null;
    }
}

export async function fetchAllCurrencies(baseCurrency = 'USD') { // Base currency parameter!
    try {
        const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${baseCurrency}`); // Use baseCurrency
        const data = await response.json();

        if (data.data && data.data.rates) {
            allCurrencies = Object.keys(data.data.rates).map(code => ({
                code: code,
                // name: "", // No name is available in this API
            }));
        } else {
            throw new Error('Invalid response for exchange rates');
        }
    } catch (error) {
        console.error('Error fetching all currencies:', error);
        throw error; // Re-throw for handling in the caller
    }
}

export async function setSelectedCurrency(currency) { // Make this function async
    selectedCurrency = currency;
    await fetchAllCurrencies(selectedCurrency); // Re-fetch currencies, and WAIT
}
