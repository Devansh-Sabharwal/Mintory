import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticationStore } from "../store/authenticate";

export default function ConnectWallet() {
  return (
    <div>
      <ConnectWalletButton />
    </div>
  );
}

export const CustomDisconnectButton = () => {
  const { disconnect } = useWallet();
  const navigate = useNavigate();
  const setAuthenticated = useIsAuthenticationStore(
    (state) => state.setAuthenticated
  );
  return (
    <button
      onClick={() => {
        navigate("/");
        setAuthenticated(false);
        disconnect();
      }}
      className="dark:bg-red-900 bg-red-500 text-white hover:bg-red-600 px-4 py-2.5 rounded-md transition-all duration-300 font-medium font-inter text-xs sm:text-sm h-fit hover:scale-105"
    >
      Disconnect
    </button>
  );
};

export const ConnectWalletButton = () => {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const handleOpenWalletModal = () => {
    setVisible(true);
  };

  return (
    <div>
      {!publicKey ? (
        <div
          onClick={handleOpenWalletModal}
          className="active:scale-[0.98] px-6 sm:px-10 cursor-pointer transition-all duration-300 py-3 sm:py-4 text-base sm:text-lg font-geist font-medium bg-[#D74803] text-white rounded-xl hover:scale-[1.02]"
        >
          Mint Now
        </div>
      ) : (
        <CustomDisconnectButton />
      )}
    </div>
  );
};
