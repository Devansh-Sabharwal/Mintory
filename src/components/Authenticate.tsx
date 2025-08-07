import Navbar from "./Navbar";
import { ed25519 } from "@noble/curves/ed25519";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useCallback, useEffect } from "react";
import { useIsAuthenticationStore } from "../store/authenticate";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Authenticate() {
  const { publicKey, signMessage } = useWallet();
  const authenticated = useIsAuthenticationStore(
    (state) => state.authenticated
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate("/home");
    }
  }, [authenticated, navigate]);
  const setAuthenticated = useIsAuthenticationStore(
    (state) => state.setAuthenticated
  );
  const onClick = useCallback(async () => {
    try {
      if (!publicKey) {
        toast("Wallet not connected!");
        return;
      }
      if (!signMessage) {
        toast("Wallet does not support message signing!");
        return;
      }

      const message = new TextEncoder().encode(
        `${
          window.location.host
        } wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign in.`
      );
      const signature = await signMessage(message);

      if (!ed25519.verify(signature, message, publicKey.toBytes())) {
        toast("Message signature invalid!");
        return;
      }
      toast(`success: Message signature: ${bs58.encode(signature)}`);
      setAuthenticated(true);
      navigate("/home");
    } catch (error: any) {
      toast(`error: Sign Message failed: ${error?.message}`);
    }
  }, [publicKey, signMessage]);
  useEffect(() => {
    setAuthenticated(false);
  }, [publicKey]);
  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      <Navbar />
      <div className="h-full flex justify-center items-center">
        <div
          onClick={onClick}
          className="active:scale-[0.98] px-6 sm:px-10 cursor-pointer transition-all duration-300 py-3 sm:py-4 text-base sm:text-lg font-geist font-medium bg-[#D74803] text-white rounded-xl hover:scale-[1.02]"
        >
          Authenticate
        </div>
      </div>
    </div>
  );
}
