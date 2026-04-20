import React, { createContext, useContext, useEffect, useState } from "react";
import { Stock } from "../types/Stock";
import { getStockQuote } from "../services/finnhub";
import { loadStocks, saveStocks } from "../hooks/usePersistedStocks";

type StocksContextType = {
  stocks: Stock[];
  addStock: (symbol: string) => Promise<void>;
  removeStock: (symbol: string) => void;
  refreshStocks: () => Promise<void>;
  refreshStock: (symbol: string) => Promise<Stock | null>;
};

const StocksContext = createContext<StocksContextType | null>(null);

export function StocksProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Load async stocklist
  useEffect(() => {
    (async () => {
      const loaded = await loadStocks();
      setStocks(loaded);
    })();
  }, []);

  const save = async (newStocks: Stock[]) => {
    setStocks(newStocks);
    await saveStocks(newStocks);
  };

  // Add stock using full quote
  const addStock = async (symbol: string) => {
    //for testing, please remember to remove

    if (stocks.some((s) => s.symbol === symbol)) return;
    const quote = await getStockQuote(symbol);
    if (!quote) return;

    const newStock: Stock = {
      symbol,
      price: quote.price,
      lastPrice: quote.price,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      prevClose: quote.pc,
      timestamp: quote.t,
    };

    await save([...stocks, newStock]);
  };

  const removeStock = (symbol: string) => {
    save(stocks.filter((s) => s.symbol !== symbol));
  };

  // Refresh all stocks
  const refreshStocks = async () => {
    const updated: Stock[] = await Promise.all(
      stocks.map(async (s) => {
        try {

          const quote = await getStockQuote(s.symbol);

          if (!quote) return s;
          return {
            ...s,
            lastPrice: s.price,
            price: quote.price,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            prevClose: quote.pc,
            timestamp: quote.t,
          };
        } catch {
          return s;
        }
      }),
    );
    await save(updated);
  };

  // Refresh a single stock, returns updated Stock
  const refreshStock = async (symbol: string): Promise<Stock | null> => {
    const existing = stocks.find((s) => s.symbol === symbol);
    if (!existing) return null;

    try {
      const quote = await getStockQuote(symbol);
      if (!quote) return existing;

      const updated: Stock = {
        ...existing,
        lastPrice: existing.price,
        price: quote.price,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        prevClose: quote.pc,
        timestamp: quote.t,
      };

      await save(stocks.map((s) => (s.symbol === symbol ? updated : s)));
      return updated;
    } catch {
      return existing;
    }
  };

  return (
    <StocksContext.Provider value={{ stocks, addStock, removeStock, refreshStocks, refreshStock }}>
      {children}
    </StocksContext.Provider>
  );
}

export function useStocksContext() {
  const ctx = useContext(StocksContext);
  if (!ctx) throw new Error("useStocksContext must be used inside StocksProvider");
  return ctx;
}
