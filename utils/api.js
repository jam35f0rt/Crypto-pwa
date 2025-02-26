// utils/api.js
export async function fetchCryptoPrice(cryptoBasePair) {
    try {
        // No default currency needed, it's part of the pair
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoBasePair}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoBasePair}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoBasePair} price:`, error);
        return null; // Return null on error, handle in UI
    }
}
