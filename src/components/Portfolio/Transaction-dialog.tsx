import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  senderPublicKey: PublicKey;
  balance: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TransactionForm({
  isOpen,
  onClose,
  senderPublicKey,
  balance,
  setRefresh,
}: TransactionFormProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const { connection } = useConnection();
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const wallet = useWallet();
  const [error, setError] = useState("");
  const sendTokens = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recipientAddress.trim()) {
      toast("Recipient address cant be empty!");
      return;
    }
    if (!senderPublicKey) {
      toast("Wallet Not connected");
      return;
    }
    if (!amount) {
      return;
    }
    setIsLoading(true);
    try {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      await wallet.sendTransaction(transaction, connection);
      toast("Transaction Completed successfully");
    } catch (e) {
      console.log(e);
      toast("error in sending tokens");
    } finally {
      setIsLoading(false);
      await new Promise((res) => setTimeout(res, 1500));
      setRefresh((prev) => !prev);
      onClose();
    }
  };
  const isFormValid =
    recipientAddress.trim() !== "" && amount > 0 && amount < balance;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border dark:bg-zinc-900 dark:border-zinc-800 text-white">
        <div className="text-red-400 flex justify-center">{error}</div>

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold text-center text-foreground">
            Send Transaction
          </DialogTitle>

          {/* Sender Address Display */}
          <div className="bg-accent rounded-lg p-3 border">
            <Label className="text-xs text-zinc-400 uppercase tracking-wide">
              From
            </Label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-mono text-accent-foreground dark:text-zinc-300 truncate pr-2">
                {senderPublicKey.toString().slice(0, 8)}...
                {senderPublicKey.toString().slice(-8)}
              </span>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={sendTokens} className="space-y-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm text-zinc-400">
              To Address
            </Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Enter recipient's public address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm text-foreground dark:text-zinc-300"
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
                if (parseFloat(value) > balance) {
                  setError("Insufficient balance");
                } else {
                  setError("");
                }
              }}
              className="dark:bg-zinc-800 dark:border-zinc-700 text-foreground dark:text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={cn(
                "flex-1 bg-orange text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
