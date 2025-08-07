import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getTokenMetadata,
} from "@solana/spl-token";
import { useTokenStore } from "@/store/getTokens";

const connection = new Connection(
  "https://solana-devnet.g.alchemy.com/v2/j4QvjEP5_bfvPn-9H-jZl7ZpoN25GO4l"
);

export interface TokenInfo {
  mint: string;
  balance: number;
  decimals: number;
  programType: string;
  name: string;
  symbol: string;
  image: string | null;
  uri: string | null;
}

export function useFetchTokens(
  publicKey: PublicKey | null,
  refreshTrigger: boolean
) {
  const setTokens = useTokenStore((state) => state.setTokens);
  const tokens = useTokenStore((state) => state.tokens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setTokens([]);
      return;
    }

    const fetchTokens = async () => {
      setLoading(true);
      setError(null);

      try {
        const splTokens = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        const token22Accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_2022_PROGRAM_ID,
          }
        );

        const allTokens: TokenInfo[] = [];

        // SPL Tokens
        for (const tokenAccount of splTokens.value) {
          const data = tokenAccount.account.data.parsed.info;
          allTokens.push({
            mint: data.mint,
            balance: data.tokenAmount.uiAmount,
            decimals: data.tokenAmount.decimals,
            programType: "SPL Token",
            name: "Unknown Token",
            symbol: "UNKNOWN",
            image: "/image.png",
            uri: null,
          });
        }

        // Token-22
        for (const tokenAccount of token22Accounts.value) {
          const data = tokenAccount.account.data.parsed.info;
          const mintAddress = new PublicKey(data.mint);

          let name = "Unknown Token";
          let symbol = "UNKNOWN";
          let image: string | null = null;
          let uri: string | null = null;

          try {
            const metadata = await getTokenMetadata(
              connection,
              mintAddress,
              "confirmed",
              TOKEN_2022_PROGRAM_ID
            );

            if (metadata) {
              name = metadata.name || "Unknown Token";
              symbol = metadata.symbol || "UNKNOWN";
              uri = metadata.uri || null;

              if (metadata.uri) {
                try {
                  const response = await fetch(metadata.uri);
                  const jsonMetadata = await response.json();
                  image = jsonMetadata.image || null;
                } catch (e) {
                  console.warn(
                    `⚠️ Failed to fetch metadata JSON from ${metadata.uri}`
                  );
                }
              }
            }
          } catch (e) {
            console.warn(
              `⚠️ Token-22 metadata not found for ${mintAddress.toBase58()}:`,
              e
            );
          }

          allTokens.push({
            mint: data.mint,
            balance: data.tokenAmount.uiAmount,
            decimals: data.tokenAmount.decimals,
            programType: "Token-22",
            name,
            symbol,
            image,
            uri,
          });
        }

        setTokens(allTokens);
      } catch (e: any) {
        console.error(e);
        setError("Failed to fetch tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [publicKey, refreshTrigger]);

  return { tokens, loading, error };
}
