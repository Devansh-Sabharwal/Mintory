import { useTokenStore, type Token } from "@/store/getTokens";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import { Send } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { sendSPLToken } from "@/lib/sendToken";
import { useFetchTokens } from "@/hooks/useTokens";

export default function SendTokens() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const wallet = useWallet();
  const tokens = useTokenStore((state) => state.tokens);
  const [selectedToken, setSelectedToken] = useState<string>();

  const selectedTokenInfo = tokens.find((t) => t.mint === selectedToken);

  const [amount, setAmount] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [refresh, setRefresh] = useState(false);
  useFetchTokens(wallet.publicKey, refresh);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const [error, setError] = useState("");
  const sendTokens = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipientAddress.trim()) {
      toast("Recipient address cant be empty!");
      return;
    }
    if (!wallet.publicKey) {
      toast("Wallet Not connected");
      return;
    }
    if (!selectedTokenInfo || !amount) return;

    setIsLoading(true);
    try {
      setIsLoading(true);
      let recipientPublicKey = new PublicKey(recipientAddress);
      let mintAddress = new PublicKey(selectedTokenInfo.mint);
      const signature = await sendSPLToken({
        senderPublicKey: wallet.publicKey,
        recipientPublicKey,
        mintAddress,
        amount,
        connection,
        wallet,
        type: selectedTokenInfo?.programType,
      });
      toast(`Transaction Successful : ${signature}`);
    } catch (e) {
      console.log(e);
      toast("error in sending tokens");
    } finally {
      setIsLoading(false);
      setRecipientAddress("");
      setSelectedToken("");
      setAmount(0);
      await new Promise((res) => setTimeout(res, 5000));
      setRefresh(!refresh);
    }
  };
  return (
    <>
      <div className="mt-12 px-4 sm:px-16 animate-fade-in">
        <div className="text-red-400 flex justify-center">{error}</div>
        <div className="rounded-lg border border-white/10 pb-6 px-6 sm:px-8 py-6 bg-card">
          <div className="font-medium text-2xl">Transfer Tokens</div>
          <div className="text-white/60 py-1">
            Send tokens to another wallet address
          </div>
          <div className="mt-6">
            <div className="font-medium text-lg ">From</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-lg font-mono rounded-lg bg-accent p-3 py-2.5 w-full text-white/80 truncate pr-2">
                {wallet.publicKey?.toString().slice(0, 8)}...
                {wallet.publicKey?.toString().slice(-8)}
              </span>
            </div>

            <form onSubmit={sendTokens} className="mt-4">
              <Label
                htmlFor="recipient"
                className="text-lg font-medium text-white"
              >
                Recipient Address
              </Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Enter recipient's public address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                required
              />
              <div className="mt-4">
                <Label
                  htmlFor="choose-token"
                  className="text-lg font-medium text-white"
                >
                  Choose Token
                </Label>
                <div className="relative mt-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDropdownOpen((prev) => !prev);
                    }}
                    className="w-full bg-accent text-white text-left px-4 py-3 rounded-lg flex justify-between items-center"
                  >
                    {selectedTokenInfo ? (
                      <span>{selectedTokenInfo.symbol}</span>
                    ) : (
                      <span className="text-white/60">Select a token</span>
                    )}
                    <ChevronDown className="w-5 h-5 ml-2" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-accent border border-white/10 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {tokens.length > 0 ? (
                        tokens.map((token: Token) => (
                          <div
                            key={token.mint}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedToken(token.mint);
                              setIsDropdownOpen(false);
                            }}
                            className="px-4 flex justify-between items-center py-3 cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center">
                              <span className="mr-3">
                                <img
                                  src={token.image || "/image.png"}
                                  className="h-8 rounded-full"
                                />
                              </span>
                              {token.symbol}
                            </div>
                            <span>{token.balance.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-white/60">
                          No tokens available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Label
                  htmlFor="amount"
                  className="text-lg font-medium text-white"
                >
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000001"
                  min="0"
                  placeholder={`0.00`}
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAmount(parseFloat(value));
                    if (parseFloat(value) > (selectedTokenInfo?.balance ?? 0)) {
                      setError("Insufficient balance");
                    } else {
                      setError("");
                    }
                  }}
                  className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                  required
                />
              </div>
              <button
                disabled={
                  isLoading ||
                  amount === 0 ||
                  amount > (selectedTokenInfo?.balance ?? 0)
                }
                type="submit"
                className={`disabled:bg-orange/70 disabled:cursor-not-allowed mt-6 w-full sm:min-w-[150px] flex justify-center ${
                  isLoading ? "bg-orange/80" : "bg-orange"
                } text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <Send />
                  {isLoading ? "Sending" : "Send"}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
