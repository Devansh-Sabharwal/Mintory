import { CustomDisconnectButton } from "./connect-toggle";

export default function Navbar() {
  return (
    <div className="text-white bg-accent border-b border-white/10 sm:px-16 px-4 flex items-center justify-between py-4">
      <div className="text-base sm:text-2xl tracking-[-0.08em] font-Poppins font-semibold">
        Mintory
      </div>
      <div>
        <CustomDisconnectButton />
      </div>
    </div>
  );
}
