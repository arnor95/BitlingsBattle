import { useState } from "react";
import { useLocation } from "wouter";

const tabs = [
  { id: "play", label: "PLAY", color: "bg-accent" },
  { id: "create", label: "CREATE", color: "bg-secondary" },
  { id: "vote", label: "VOTE", color: "bg-purple-700" },
  { id: "collection", label: "COLLECTION", color: "bg-gray-dark" },
];

type HeaderProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div 
            className="w-12 h-12 mr-3 bg-white rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <svg 
              className="w-10 h-10" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#5E35B1" />
              <circle cx="8" cy="10" r="2" fill="white" />
              <circle cx="16" cy="10" r="2" fill="white" />
              <path d="M7 14C7 16.2091 9.23858 18 12 18C14.7614 18 17 16.2091 17 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 
            className="font-pixel text-lg sm:text-xl cursor-pointer"
            onClick={() => setLocation('/')}
          >
            BITLINGS
          </h1>
        </div>
        <nav className="flex space-x-1 sm:space-x-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`font-pixel text-xs sm:text-sm py-2 px-3 sm:px-4 ${tab.color} hover:bg-opacity-80 transition rounded-lg`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
