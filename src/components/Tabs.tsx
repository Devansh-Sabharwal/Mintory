import { Plus, Send, Wallet } from "lucide-react";
import { useState } from "react";
import Portfolio from "./Portfolio/Portfolio";
import SendTokens from "./SendTokens/SendTokens";
import CreateToken from "./CreateToken";

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const tabs = [
    { id: "portfolio", label: "Portfolio", icon: Wallet },
    { id: "create", label: "Create Token", icon: Plus },
    { id: "send", label: "Send Tokens", icon: Send },
  ];
  const renderContent = () => {
    switch (activeTab) {
      case "portfolio":
        return <Portfolio />;
      case "create":
        return <CreateToken />;
      case "send":
        return <SendTokens />;
      default:
        return null;
    }
  };
  return (
    <div className="flex-1 flex flex-col">
      <nav className="text-white bg-accent border-b border-white/10 sm:px-16 px-4 flex items-center justify-between">
        <div>
          <div className="flex space-x-3 sm:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`cursor-pointer flex items-center space-x-2 px-3 py-1 sm:py-4 text-sm sm:text-lg  border-b-3 transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-orange "
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="flex-1 flex flex-col w-full">{renderContent()}</div>
    </div>
  );
}
