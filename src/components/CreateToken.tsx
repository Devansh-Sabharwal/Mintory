import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { Coins } from "lucide-react";

import { toast } from "sonner";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useFetchTokens } from "@/hooks/useTokens";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";

import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";
export type data = {
  name: string;
  symbol: string;
  image: string;
  description: string;
};
export default function CreateToken() {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [supply, setSupply] = useState<number>(0);
  const [refresh, setRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFetchTokens(wallet.publicKey, refresh);

  async function uploadMetadataToIPFS(metadata: data): Promise<string> {
    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
    console.log(pinataApiKey, pinataSecretKey);
    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `token-metadata-${Date.now()}`,
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      } else {
        throw new Error(`Pinata upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json";
    }
  }

  const createToken = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Wallet not connected or doesn't support signing");
      return;
    }

    if (!name.trim() || !symbol.trim() || supply <= 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Starting token creation process...");

      // Generate new keypair for the mint
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;
      const decimals = 9; // Standard decimals for SPL tokens
      const mintAuthority = wallet.publicKey;
      const updateAuthority = wallet.publicKey;
      const data = {
        name: name,
        symbol: symbol,
        description: "Token created via mintory launchpad",
        image: imageUrl,
      };
      const uri = await uploadMetadataToIPFS(data);
      // Create metadata object
      const metaData: TokenMetadata = {
        updateAuthority: updateAuthority,
        mint: mint,
        name: name,
        symbol: symbol,
        uri,
        additionalMetadata: [
          ["description", "Token created via mintory launchpad"],
        ],
      };

      // Calculate required space and lamports
      const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
      const metadataLen = pack(metaData).length;
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen
      );

      console.log("Required lamports:", lamports);
      console.log("Mint address:", mint.toBase58());

      // Create transaction with all necessary instructions
      const transaction = new Transaction();

      // 1. Create account instruction
      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });

      // 2. Initialize metadata pointer
      const initializeMetadataPointerInstruction =
        createInitializeMetadataPointerInstruction(
          mint,
          updateAuthority,
          mint,
          TOKEN_2022_PROGRAM_ID
        );

      // 3. Initialize mint
      const initializeMintInstruction = createInitializeMintInstruction(
        mint,
        decimals,
        mintAuthority,
        null, // No freeze authority
        TOKEN_2022_PROGRAM_ID
      );

      // 4. Initialize metadata
      const initializeMetadataInstruction = createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority: updateAuthority,
        mint: mint,
        mintAuthority: mintAuthority,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      });

      // 5. Update field instruction for description
      const updateFieldInstruction = createUpdateFieldInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority: updateAuthority,
        field: metaData.additionalMetadata[0][0],
        value: metaData.additionalMetadata[0][1],
      });

      // Add all instructions to transaction
      transaction.add(
        createAccountInstruction,
        initializeMetadataPointerInstruction,
        initializeMintInstruction,
        initializeMetadataInstruction,
        updateFieldInstruction
      );

      // Get associated token account address
      const ata = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      console.log("Associated token account:", ata.toBase58());

      // 6. Create associated token account
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        ata, // associated token account
        wallet.publicKey, // owner
        mint, // mint
        TOKEN_2022_PROGRAM_ID
      );

      // 7. Mint tokens to the associated token account
      const mintToInstruction = createMintToInstruction(
        mint, // mint
        ata, // destination
        mintAuthority, // authority
        supply * Math.pow(10, decimals), // amount (adjust for decimals)
        [], // multi signers
        TOKEN_2022_PROGRAM_ID
      );

      // Add minting instructions
      transaction.add(createATAInstruction, mintToInstruction);

      // Set fee payer and get recent blockhash
      transaction.feePayer = wallet.publicKey;
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;

      // Sign with mint keypair first
      transaction.partialSign(mintKeypair);

      console.log("Sending transaction...");

      // Send transaction
      const signature = await wallet.sendTransaction(transaction, connection, {
        maxRetries: 3,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction sent:", signature);

      // Confirm transaction
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${confirmation.value.err.toString()}`
        );
      }

      console.log("Transaction confirmed:", signature);
      toast.success(
        `Token created successfully! TX: ${signature.slice(0, 8)}...`
      );

      // Reset form
      setName("");
      setSymbol("");
      setImageUrl("");
      setSupply(0);

      // Trigger refresh
      setRefresh(!refresh);
    } catch (error: any) {
      console.error("Error creating token:", error);

      let errorMessage = "Error creating token";
      if (error.message) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient SOL balance for transaction";
        } else if (error.message.includes("blockhash not found")) {
          errorMessage = "Transaction expired, please try again";
        } else if (error.message.includes("User rejected")) {
          errorMessage = "Transaction was rejected";
        } else {
          errorMessage = `Error: ${error.message.slice(0, 100)}`;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 px-4 sm:px-16 animate-fade-in">
      <div className="rounded-lg border border-white/10 pb-6 px-6 sm:px-8 py-6 bg-card">
        <div className="font-medium text-2xl">Create Tokens</div>
        <div className="text-white/60 py-1">Create your own MemeCoin</div>
        <div className="mt-6">
          <form onSubmit={createToken}>
            <div className="mt-4">
              <Label htmlFor="name" className="text-lg font-medium text-white">
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
                disabled={isLoading}
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
                placeholder="Enter token symbol like BTC, SOL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                required
                disabled={isLoading}
                maxLength={10}
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="image" className="text-lg font-medium text-white">
                Image URL (Optional)
              </Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                disabled={isLoading}
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
                min={1}
                max={1000000000}
                value={supply || ""}
                onChange={(e) => setSupply(parseFloat(e.target.value) || 0)}
                className="text-base! bg-accent! py-6 text-white placeholder:text-white/60 placeholder:tracking-normal mt-2"
                required
                disabled={isLoading}
              />
            </div>

            <button
              disabled={isLoading || !wallet.connected}
              type="submit"
              className={`disabled:bg-orange/70 disabled:cursor-not-allowed mt-6 w-full sm:min-w-[150px] flex justify-center ${
                isLoading ? "bg-orange/80" : "bg-orange"
              } text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-lg cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <Coins />
                {isLoading
                  ? "Creating Token..."
                  : wallet.connected
                  ? "Create Token"
                  : "Connect Wallet"}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
