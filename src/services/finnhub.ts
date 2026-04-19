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

export async function getMarketNews() {
    if (!API_KEY) throw new Error("Finnhub API key is missing!");

    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
        );
        if (!res.ok) throw new Error("Failed to fetch market news");
        return await res.json(); 
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getCompanyNews(symbol: string, fromDate: string, toDate: string) {
    if (!API_KEY) throw new Error("Finnhub API key is missing!");

    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${API_KEY}`
        );
        if (!res.ok) throw new Error(`Failed to fetch news for ${symbol}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getEarningsCalendar(fromDate: string, toDate: string) {
    if (!API_KEY) throw new Error("Finnhub API key is missing!");

    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/calendar/earnings?from=${fromDate}&to=${toDate}&token=${API_KEY}`
        );
        if (!res.ok) throw new Error("Failed to fetch earnings calendar");
        
        const data = await res.json();
        return data.earningsCalendar || []; 
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function searchSymbols(query: string) {
    if (!API_KEY) throw new Error("Finnhub API key is missing!");
    try {
        const res = await fetch(
            `https://finnhub.io/api/v1/search?q=${query}&token=${API_KEY}`
        );
        if (!res.ok) throw new Error("Symbol search failed");
        
        const data = await res.json();
        // Finnhub returns an object with a 'result' array
        return data.result || []; 
    } catch (err) {
        console.error(err);
        return [];
    }
}

export async function getMarketStatus() {
    if (!API_KEY) {
        throw new Error("Finnhub API key is missing!");
    }

    const res = await fetch(
        `${BASE_URL}/stock/market-status?exchange=US&token=${API_KEY}`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch market status");
    }

    const data = await res.json();

    return {
        isOpen: data.isOpen,
        session: data.session, // pre-market | regular | post-market | null
        timestamp: data.t,
    };
}