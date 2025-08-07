import { create } from "zustand";

export const useSolanaBalance = create<{
  balance: number;
  setBalance: (val: number) => void;
}>((set) => ({
  balance: 0,
  setBalance: (val) => {
    set({ balance: val });
  },
}));
