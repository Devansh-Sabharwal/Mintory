import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";
import { Button } from "../ui/button";
import { Coins } from "lucide-react";
import { toast } from "sonner";

type Props = {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AirDrop({ setRefresh }: Props) {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState<number | "">(1);
  const [loading, setLoading] = useState(false);

  const reqAirdrop = async () => {
    if (!wallet.publicKey || !amount || isNaN(Number(amount))) {
      toast("Invalid amount or wallet not connected.");
      return;
    }

    try {
      setLoading(true);
      await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );

      toast(`Airdropped ${amount} SOL to ${wallet.publicKey.toBase58()}`);
      await new Promise((res) => setTimeout(res, 1500));
      setRefresh((prev) => !prev);
    } catch (e) {
      console.error("Airdrop failed:", e);
      toast("Airdrop failed. Try again.");
    } finally {
      setLoading(false);
      setAmount(0);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <input
        onChange={(e) => {
          const value = e.target.value;
          const parsed = parseFloat(value);
          setAmount(isNaN(parsed) ? "" : parsed);
        }}
        value={amount}
        className="bg-accent px-4 py-2 border rounded outline-none w-32"
        type="number"
        placeholder="Amount"
        min={0.01}
        step={0.01}
        disabled={loading}
      />
      <Button
        size="lg"
        disabled={loading || !amount}
        className="px-3 py-2 gap-2 font-inter rounded-md cursor-pointer"
        onClick={reqAirdrop}
      >
        <Coins className="w-4 h-4" />
        {loading ? "Requesting..." : "Request Airdrop"}
      </Button>
    </div>
  );
}
