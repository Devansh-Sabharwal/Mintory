import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import MainDapp from "./MainDapp";
import LandingPage from "./LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authenticate from "./Authenticate";

// const rpcUrl = import.meta.env.VITE_RPC_URL;

export default function LaunchPad() {
  return (
    <ConnectionProvider
      // endpoint={`${rpcUrl}`}
      endpoint="https://api.devnet.solana.com"
    >
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<MainDapp />} />
              <Route path="/authenticate" element={<Authenticate />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
