import { create } from "zustand";

export const useIsAuthenticationStore = create<{
  authenticated: boolean;
  setAuthenticated: (val: boolean) => void;
}>((set) => ({
  authenticated: false,
  setAuthenticated: (val) => {
    set({ authenticated: val });
  },
}));
