import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stock } from "../types/Stock";

const KEY = "WATCHLIST";

export async function loadStocks(): Promise<Stock[]> {
    const res = await AsyncStorage.getItem(KEY);
    return res ? JSON.parse(res) : [];
}

export async function saveStocks(stocks: Stock[]) {
    await AsyncStorage.setItem(KEY, JSON.stringify(stocks));
}

export async function refreshStocksWithPrices(stocks: Stock[], newPrices: Record<string, number>): Promise<Stock[]> {
    const updated = stocks.map(s =>
        newPrices[s.symbol]
            ? { ...s, lastPrice: s.price, price: newPrices[s.symbol] }
            : s
    );
    await saveStocks(updated);
    return updated;
}