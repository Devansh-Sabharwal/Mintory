import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

interface Props {
  senderPublicKey: PublicKey;
  recipientPublicKey: PublicKey;
  mintAddress: PublicKey;
  connection: Connection;
  amount: number;
  wallet: WalletContextState;
  type: string;
}

export async function sendSPLToken({
  senderPublicKey,
  recipientPublicKey,
  mintAddress,
  amount,
  connection,
  wallet,
  type,
}: Props) {
  try {
    const transaction = new Transaction();

    // Choose the correct token program ID
    const programId =
      type === "Token-22" ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

    const senderTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      senderPublicKey,
      false,
      programId
    );

    // Validate that sender's token account exists
    const senderAccountInfo = await connection.getAccountInfo(
      senderTokenAccount
    );
    if (!senderAccountInfo) {
      throw new Error("Sender's token account does not exist.");
    }

    // Get recipient's ATA
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      recipientPublicKey,
      false,
      programId
    );

    // If recipient ATA doesn't exist, create it
    const recipientAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );
    if (!recipientAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          senderPublicKey, // Payer
          recipientTokenAccount,
          recipientPublicKey,
          mintAddress,
          programId
        )
      );
    }

    // Fetch mint info for decimals
    const mintInfo = await getMint(
      connection,
      mintAddress,
      undefined,
      programId
    );
    const rawAmount = BigInt(amount * 10 ** mintInfo.decimals);

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderPublicKey,
        rawAmount,
        [],
        programId
      )
    );

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    return signature;
  } catch (e: any) {
    console.log("[SPL Send Error]", e);
    throw new Error("An error occurred while sending the token.");
  }
}
