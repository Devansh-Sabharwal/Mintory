import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Send } from "lucide-react";
import { TransactionForm } from "./Transaction-dialog";
import { useSolanaBalance } from "../../store/balance";
export default function SendTokens({
  setRefresh,
}: {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const balance = useSolanaBalance((state) => state.balance);
  const [transactionForm, setTransactionForm] = useState(false);
  const wallet = useWallet();

  return (
    <div className="">
      {transactionForm && (
        <TransactionForm
          isOpen={transactionForm}
          onClose={() => setTransactionForm(false)}
          senderPublicKey={wallet.publicKey!}
          balance={balance}
          setRefresh={setRefresh}
        />
      )}
      <div onClick={() => setTransactionForm(true)} className="space-y-3">
        <button className="w-full sm:min-w-[150px] flex justify-center bg-orange text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg cursor-pointer">
          <div className="flex items-center gap-3">
            <Send /> Send
          </div>
        </button>
      </div>
    </div>
  );
}
