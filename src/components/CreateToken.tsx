import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { Coins, Send } from "lucide-react";

import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";

import { useFetchTokens } from "@/hooks/useTokens";

export default function CreateToken() {
  const wallet = useWallet();

  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [supply, setSupply] = useState<number>(0);
  const [refresh, setRefresh] = useState(false);
  useFetchTokens(wallet.publicKey, refresh);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const [error, setError] = useState("");
  const createToken = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey) {
      toast("Wallet Not connected");
      return;
    }

    setIsLoading(true);
    try {
      setIsLoading(true);

      //   toast(`Transaction Successful : ${signature}`);
    } catch (e) {
      console.log(e);
      toast("error in creating token");
    } finally {
      setIsLoading(false);

      await new Promise((res) => setTimeout(res, 5000));
      setRefresh(!refresh);
    }
  };
  return (
    <>
      <div className="mt-12 px-4 sm:px-16 animate-fade-in">
        <div className="text-red-400 flex justify-center">{error}</div>
        <div className="rounded-lg border border-white/10 pb-6 px-6 sm:px-8 py-6 bg-card">
          <div className="font-medium text-2xl">Create Tokens</div>
          <div className="text-white/60 py-1">Create your own MemeCoin</div>
          <div className="mt-6">
            <form onSubmit={createToken}>
              <div className="mt-4">
                <Label
                  htmlFor="Name"
                  className="text-lg font-medium text-white"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter Name of your token"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                  required
                />
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="symbol"
                  className="text-lg font-medium text-white"
                >
                  Symbol
                </Label>
                <Input
                  id="symbol"
                  type="text"
                  placeholder="Enter token symbol like BTC , SOL"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                  required
                />
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="image"
                  className="text-lg font-medium text-white"
                >
                  Image URL
                </Label>
                <Input
                  id="image"
                  type="text"
                  placeholder="Enter Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                  required
                />
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="supply"
                  className="text-lg font-medium text-white"
                >
                  Initial Supply
                </Label>
                <Input
                  id="supply"
                  type="number"
                  placeholder="Enter Initial Supply"
                  value={supply}
                  onChange={(e) => setSupply(parseFloat(e.target.value))}
                  className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                  required
                />
              </div>
              <button
                disabled={isLoading}
                type="submit"
                className={`disabled:bg-orange/70 disabled:cursor-not-allowed mt-6 w-full sm:min-w-[150px] flex justify-center ${
                  isLoading ? "bg-orange/80" : "bg-orange"
                } text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <Coins />
                  {isLoading ? "Creating" : "Create Token"}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
