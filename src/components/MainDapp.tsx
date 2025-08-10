import { useNavigate } from "react-router-dom";
import { useIsAuthenticationStore } from "../store/authenticate";
import Navbar from "./Navbar";
import { useEffect } from "react";
import Tabs from "./Tabs";
import { useWallet } from "@solana/wallet-adapter-react";

export default function MainDapp() {
  const wallet = useWallet();
  const authenticated = useIsAuthenticationStore(
    (state) => state.authenticated
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate("/authenticate");
    }
  }, []);

  useEffect(() => {
    if (!wallet.publicKey) {
      navigate("/");
    }
  }, [wallet.publicKey]);
  return (
    <div className="bg-background flex flex-col min-h-screen text-white">
      <Navbar />
      <Tabs />
    </div>
  );
}
