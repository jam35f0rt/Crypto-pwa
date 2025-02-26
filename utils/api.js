// utils/api.js
export let allCryptos = [];
export let allCurrencies = [];
export let selectedCurrency = '';

export async function fetchCryptoPrice(cryptoCode, currency = 'USD') {
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
export async function fetchAllCryptos() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/currencies');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            allCryptos = data.data
                .filter(crypto => crypto.type === 'crypto') //Filter by type
                .map(crypto => ({
                    id: crypto.code, // Use 'code' for id.
                    name: crypto.name,
                    symbol: crypto.code // Use 'code' for symbol
                }));
        } else {
            throw new Error('Invalid response format for cryptocurrencies');
        }
    } catch (error) {
        console.error('Error fetching all cryptocurrencies:', error);
        throw error; // Re-throw to be handled by the caller
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
        throw error; // Re-throw for handling
    }
}

export async function setSelectedCurrency(currency) {
    selectedCurrency = currency;
    if (selectedCurrency) {
        await fetchAllCurrencies(selectedCurrency);
    }
}
