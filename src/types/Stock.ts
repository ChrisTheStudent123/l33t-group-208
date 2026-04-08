export type Stock = {
    symbol: string;
    price: number;       // current price
    lastPrice: number;   // last recorded price
    high: number;        // high pric of the day
    low: number;         // low price of the day
    open: number;        // opening price
    prevClose: number;   // previous close
    timestamp: number;   // last update timestamp
};