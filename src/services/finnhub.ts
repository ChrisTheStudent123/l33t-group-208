const BASE_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;

export async function getStockQuote(symbol: string) {
    if (!API_KEY) {
        throw new Error("Finnhub API key is missing! Check your .env");
    }

    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
        );

        if (!res.ok) throw new Error("Failed to fetch stock quote");

        const data = await res.json();
        return {
           symbol,
           price: data.c,
           high: data.h,
           low: data.l,
           open: data.o,
           prevClose: data.pc,
           timestamp: data.t,
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
}
