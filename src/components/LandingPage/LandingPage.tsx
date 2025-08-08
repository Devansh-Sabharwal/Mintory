import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="relative h-screen overflow-y-hidden text-white font-urbanist">
      <div className="absolute inset-0 z-0 main-image" />

      <div className="relative z-10 fade-in">
        <Navbar />
        <div className="relative">
          <div className=" relative mt-16">
            <Hero />
            <div className="hidden md:block absolute -z-10 right-1/5 bottom-8">
              <img src="/coin-1.png" className="w-24 sm:w-48 animate-float" />
            </div>
          </div>
          <div className="mt-8">
            <ActionButton />
          </div>
        </div>
        <div className="mt-12 sm:mt-0">
          <div className="absolute sm:left-1/6 -translate-y-10">
            <img
              src="/coin-2.png"
              className="w-40 sm:w-48 lg:w-60 relative animate-float"
            />
            <div className="absolute left-1/3  w-20 h-4 rounded-full bg-black opacity-70 blur-sm" />
          </div>
        </div>
        <div className="absolute right-1/12 -translate-y-10 lg:right-1/3 ">
          <img
            src="/coin-3.png"
            className="w-24 sm:w-36 relative animate-float"
          />
          <div className="absolute left-1/5 w-14 h-2 sm:h-3 rounded-full bg-black opacity-60 blur-sm" />
        </div>
      </div>
    </div>
  );
}
function Navbar() {
  const { setVisible } = useWalletModal();
  const navigate = useNavigate();

  return (
    <>
      <div className="sm:px-16 px-4 flex items-center justify-between py-4">
        <div className="text-lg sm:text-3xl tracking-[-0.08em] font-Poppins font-semibold">
          <div className="flex gap-2 items-center">
            <img className="h-10" src="/mintory-logo.png" />
            <span>Mintory</span>
          </div>
        </div>
        <div
          onClick={() => {
            setVisible(true);
            navigate("/authenticate");
          }}
          className="px-3 py-2 text-xs sm:text-base rounded-lg cursor-pointer active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 bg-white text-black"
        >
          Connect Wallet
        </div>
      </div>
    </>
  );
}
function Hero() {
  return (
    <>
      <div className="justify-center flex px-4 sm:px-16">
        <div>
          <div className="text-center font-medium text-5xl sm:text-7xl lg:text-8xl tracking-[-0.05em] flex flex-col">
            <div>Build Your Coin</div>
            <div>Own the Moment</div>
          </div>
          <div className="mt-4 text-base text-center sm:text-[20px] text-[#B2B2B2] font-geist tracking-tight">
            Launch your token on Solana in minutes - no code, no devs, no
            limits.
          </div>
        </div>
      </div>
    </>
  );
}
function ActionButton() {
  const { setVisible } = useWalletModal();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-center">
        <div
          onClick={() => {
            setVisible(true);
            navigate("/authenticate");
          }}
          className="active:scale-[0.98] px-6 sm:px-10 cursor-pointer transition-all duration-300 py-3 sm:py-4 text-base sm:text-lg font-geist font-medium bg-[#D74803] text-white rounded-xl hover:scale-[1.02]"
        >
          Mint Now
        </div>
      </div>
    </>
  );
}
