import { create } from "zustand";

export type Token = {
  mint: string;
  balance: number;
  decimals: number;
  programType: string;
  name: string;
  symbol: string;
  image: string | null;
  uri: string | null;
};
type setToken = {
  tokens: Token[];
  setTokens: (tokens: Token[]) => void;
};
export const useTokenStore = create<setToken>((set) => ({
  tokens: [],
  setTokens: (tokens: Token[]) => set({ tokens }),
}));
