import { useState } from "react";
import BattleArena from "@/components/BattleArena";

interface PlayTabProps {
  className?: string;
}

interface NearbyBitling {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  icon: string;
  color: string;
}

const NEARBY_BITLINGS: NearbyBitling[] = [
  {
    id: "leaflet",
    name: "LEAFLET",
    type: "grass",
    imageUrl: "/placeholder-grass.svg"
  },
  {
    id: "normie",
    name: "NORMIE",
    type: "normal",
    imageUrl: "/placeholder-normal.svg"
  },
  {
    id: "zapzap",
    name: "ZAPZAP",
    type: "electric",
    imageUrl: "/placeholder-electric.svg"
  }
];

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "potion",
    name: "POTION",
    quantity: 5,
    icon: "ri-medicine-bottle-line",
    color: "bg-red-500"
  },
  {
    id: "capture-orb",
    name: "CAPTURE ORB",
    quantity: 3,
    icon: "ri-bubble-chart-line",
    color: "bg-blue-500"
  }
];

export default function PlayTab({ className = "" }: PlayTabProps) {
  const [battleLog, setBattleLog] = useState<string>("FLAMELOX used FIRE BREATH! It's super effective!");
  
  // Actions when battle move is used
  const handleBattleAction = (moveName: string) => {
    setBattleLog(`AQUABYTE used ${moveName}!`);
    
    // Animate enemy taking damage
    const enemyBitling = document.querySelector('.enemy-bitling img');
    if (enemyBitling) {
      enemyBitling.classList.add('animate-battle-shake');
      setTimeout(() => {
        enemyBitling.classList.remove('animate-battle-shake');
      }, 500);
    }
  };

  return (
    <div className={`tab-pane ${className}`}>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h2 className="font-pixel text-lg text-primary mb-4">GAME AREA</h2>
        
        {/* Battle Arena */}
        <BattleArena />
        
        {/* Battle Controls */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-pixel text-white text-sm mb-2">ACTIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="bg-water text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition battle-action"
                  onClick={() => handleBattleAction("WATER BLAST")}
                >
                  WATER BLAST
                </button>
                <button 
                  className="bg-ice text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition battle-action"
                  onClick={() => handleBattleAction("ICE BEAM")}
                >
                  ICE BEAM
                </button>
                <button 
                  className="bg-normal text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition battle-action"
                  onClick={() => handleBattleAction("TACKLE")}
                >
                  TACKLE
                </button>
                <button 
                  className="bg-psychic text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition battle-action"
                  onClick={() => handleBattleAction("CONFUSE")}
                >
                  CONFUSE
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-pixel text-white text-sm mb-2">BATTLE OPTIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-grass text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition">
                  USE ITEM
                </button>
                <button className="bg-electric text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition">
                  SWITCH
                </button>
                <button className="bg-fire text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition">
                  CATCH
                </button>
                <button className="bg-ghost text-white font-pixel text-xs py-2 px-3 rounded-lg hover:opacity-90 transition">
                  RUN
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 bg-gray-900 p-3 rounded-lg">
            <p className="font-pixel text-white text-xs">{battleLog}</p>
          </div>
        </div>
      </div>
      
      {/* Exploration Area - Mini Map */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-pixel text-lg text-primary mb-4">EXPLORATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg p-3 dot-matrix">
            <h3 className="font-pixel text-sm mb-2">WORLD MAP</h3>
            <div className="bg-gray-200 h-48 rounded-lg relative overflow-hidden">
              {/* World map background */}
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/600x300/75A1C2/FFFFFF?text=World+Map')" }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="font-pixel text-xs bg-primary text-white py-1 px-2 rounded hover:bg-opacity-90">
                EXPLORE
              </button>
              <button className="font-pixel text-xs bg-secondary text-white py-1 px-2 rounded hover:bg-opacity-90">
                FAST TRAVEL
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="font-pixel text-sm mb-2">NEARBY BITLINGS</h3>
            <div className="grid grid-cols-3 gap-2">
              {NEARBY_BITLINGS.map((bitling) => (
                <div key={bitling.id} className={`bg-${bitling.type} bg-opacity-20 p-2 rounded-lg flex flex-col items-center`}>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="font-pixel text-xs mt-1">{bitling.name}</p>
                </div>
              ))}
            </div>
            
            <h3 className="font-pixel text-sm mt-3 mb-2">INVENTORY</h3>
            {INVENTORY_ITEMS.map((item) => (
              <div key={item.id} className="bg-gray-100 p-2 rounded-lg flex justify-between mt-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center`}>
                    <i className={`${item.icon} text-white`}></i>
                  </div>
                  <p className="font-pixel text-xs ml-2">{item.name}</p>
                </div>
                <p className="font-pixel text-xs">x{item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
