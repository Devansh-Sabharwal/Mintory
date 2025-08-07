import WalletBalance from "./Balance";
import Tokens from "./Tokens";

export default function Portfolio() {
  return (
    <div className="px-4 sm:px-16">
      <WalletBalance />
      <Tokens />
    </div>
  );
}
