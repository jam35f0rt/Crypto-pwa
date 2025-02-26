// utils/api.js

export let allCryptos = [
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'LTC', name: 'Litecoin', symbol: 'LTC' },
    { id: 'XRP', name: 'Ripple', symbol: 'XRP' },
    { id: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH' },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL' },
    { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE' }
];
export let allCurrencies = [];
export let selectedCurrency = ''; // Initialize as empty string

export async function fetchCryptoPrice(cryptoCode, currency = 'USD') {
    // Default to USD if currency is empty
    const usedCurrency = currency || 'USD';
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-${usedCurrency}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}-${usedCurrency}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode}-${usedCurrency} price:`, error);
        return null;
    }
}

export async function fetchAllCurrencies(baseCurrency = 'USD') {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${baseCurrency}`);
        const data = await response.json();

        if (data.data && data.data.rates) {
            allCurrencies = Object.keys(data.data.rates).map(code => ({
                code: code,
            }));
        } else {
            throw new Error('Invalid response for exchange rates');
        }
    } catch (error) {
        console.error('Error fetching all currencies:', error);
        throw error;
    }
}

export async function setSelectedCurrency(currency) {
    selectedCurrency = currency;
    if (selectedCurrency) { // Only fetch if a currency is selected
        await fetchAllCurrencies(selectedCurrency);
    }
}
