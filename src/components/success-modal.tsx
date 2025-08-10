import React from "react";
import { X, Copy, ExternalLink, CheckCircle2 } from "lucide-react";

interface TokenSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData: {
    name: string;
    symbol: string;
    mintAddress: string;
    supply: number;
    imageUrl?: string;
  };
}

export const TokenSuccessModal: React.FC<TokenSuccessModalProps> = ({
  isOpen,
  onClose,
  tokenData,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const viewOnExplorer = (mint: string) => {
    window.open(
      `https://explorer.solana.com/address/${mint}?cluster=devnet`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-background  backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-md w-full mx-auto animate-scale-in">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X size={20} className="text-white" />
          </button>

          <div className="p-8 text-center">
            {/* Success Icon & Text */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Token Created Successfully!
              </h2>
              <p className="text-white/60">
                Your memecoin is now live on Solana
              </p>
            </div>

            {/* Rotating Badge Image */}
            <div className="mb-8 flex justify-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange rotating-yz">
                <img
                  src={tokenData.imageUrl || "/image.png"}
                  alt={tokenData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Mint Address */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Mint Address</span>
                <button
                  onClick={() => copyToClipboard(tokenData.mintAddress)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Copy size={16} className="text-white/60" />
                </button>
              </div>
              <div className="font-mono text-sm text-white break-all bg-black/20 rounded p-2">
                {tokenData.mintAddress}
              </div>
              {copied && (
                <div className="text-green-400 text-xs mt-1">
                  Copied to clipboard!
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => viewOnExplorer(tokenData.mintAddress)}
                className="transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale[0.98] w-full bg-orange text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                View on Explorer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rotation animation styles */}
      <style>{`
        @keyframes rotateYZ {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
        }

        .rotating-yz {
        animation: rotateYZ 4s linear infinite;
        transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};
