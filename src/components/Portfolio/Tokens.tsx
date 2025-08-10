import { useWallet } from "@solana/wallet-adapter-react";
import { RefreshCcw, Send } from "lucide-react";
import { useState } from "react";
import { SplTransaction } from "../SplTransaction";
import { PublicKey } from "@solana/web3.js";
import { useFetchTokens } from "@/hooks/useTokens";
export default function Tokens() {
  const wallet = useWallet();
  const [transactionForm, setTransactionForm] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { tokens, loading } = useFetchTokens(wallet.publicKey, refresh);
  const [currBalance, setCurrBalance] = useState<number>(0);
  const [mint, setMint] = useState<string>("");
  const [type, setType] = useState<string>("");

  if (!wallet.publicKey) return <></>;
  return (
    <div className="mt-4 tracking-tighter rounded-lg border border-white/10 pb-6 px-6 sm:px-8 py-6 bg-card">
      <div className="flex gap-3 items-center pb-3">
        <div className="text-3xl font-semibold">Tokens</div>
        <span onClick={() => setRefresh(!refresh)} title="refresh balance">
          <RefreshCcw className="text-orange h-4 w-4 cursor-pointer hover:rotate-180 transition-all duration-500" />
        </span>
      </div>
      {transactionForm && (
        <SplTransaction
          isOpen={transactionForm}
          onClose={() => setTransactionForm(false)}
          senderPublicKey={wallet.publicKey!}
          balance={currBalance}
          setRefresh={setRefresh}
          mintAddress={new PublicKey(mint)}
          type={type}
        />
      )}
      <div className="w-full flex justify-center">
        {" "}
        {loading && <span className="loader mb-4"></span>}
      </div>
      <div className="flex flex-col gap-2 animate-fade-in">
        {tokens.map((e) => (
          <div key={e.mint} className="bg-accent rounded-md px-2 sm:px-4 py-2">
            <div className="flex justify-between items-center">
              {/* Left side: image + token details */}
              <div className="flex gap-3 sm:gap-4 items-center min-w-0">
                <div>
                  <img
                    className="rounded-full w-12 sm:w-16 flex-shrink-0"
                    onError={(ev) => {
                      ev.currentTarget.src = "/vite.svg";
                    }}
                    alt="logo"
                    src={e.image || ""}
                  />
                </div>

                <div className="break-all min-w-0">
                  <div className="break-all font-geist text-base sm:text-lg font-semibold truncate">
                    {e.name}
                  </div>

                  <div
                    onClick={() => {
                      window.open(
                        `https://explorer.solana.com/address/${e.mint}?cluster=devnet`,
                        "_blank"
                      );
                    }}
                    className="hover:underline hover:text-blue-300 font-mono text-xs sm:text-sm tracking-wider text-gray-300/70 cursor-pointer truncate transition-all duration-300"
                  >
                    {e.mint}
                  </div>

                  <div className="text-sm sm:text-lg font-medium mt-4 font-geist dark:text-gray-300/70 truncate">
                    {e.balance} <span>{e.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Right side: send button */}
              <div
                onClick={() => {
                  setTransactionForm(true);
                  setCurrBalance(e.balance);
                  setMint(e.mint);
                  setType(e.programType);
                }}
                className="ml-2 cursor-pointer flex-shrink-0"
              >
                <Send className="hover:scale-110 w-4 sm:w-8 transition-all duration-300" />
              </div>
            </div>
          </div>
        ))}

        {tokens.length === 0 && !loading && (
          <div className="w-full text-center">
            No SPL tokens are associated with this account.
          </div>
        )}
      </div>
    </div>
  );
}
