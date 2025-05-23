import { useState, useEffect } from "react";

interface BattleProps {
  className?: string;
}

interface BattleCharacter {
  name: string;
  hp: number;
  maxHp: number;
  imageUrl: string;
}

export default function BattleArena({ className = "" }: BattleProps) {
  const [playerCharacter, setPlayerCharacter] = useState<BattleCharacter>({
    name: "AQUABYTE",
    hp: 70,
    maxHp: 100,
    imageUrl: "/placeholder-water.svg" // Will be replaced with actual image
  });
  
  const [enemyCharacter, setEnemyCharacter] = useState<BattleCharacter>({
    name: "FLAMELOX",
    hp: 85,
    maxHp: 100,
    imageUrl: "/placeholder-fire.svg" // Will be replaced with actual image
  });

  // This effect simulates battle damage for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly reduce HP for demo
      if (Math.random() > 0.7) {
        setPlayerCharacter(prev => ({
          ...prev,
          hp: Math.max(prev.hp - Math.floor(Math.random() * 5), 0)
        }));
      }
      
      if (Math.random() > 0.8) {
        setEnemyCharacter(prev => ({
          ...prev,
          hp: Math.max(prev.hp - Math.floor(Math.random() * 5), 0)
        }));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden mb-4 ${className}`} style={{ height: "280px" }}>
      {/* Battle arena background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://via.placeholder.com/1200x400/75A1C2/FFFFFF?text=Battle+Arena')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* Battle characters */}
      <div className="relative h-full flex items-center justify-between px-8">
        {/* Player Bitling */}
        <div className="player-bitling flex flex-col items-center">
          <div className="h-24 w-24 flex items-center justify-center mb-2">
            <div className="w-24 h-24 bg-[#2196F3] bg-opacity-20 rounded-full flex items-center justify-center animate-float">
              <svg className="w-20 h-20 text-[#2196F3]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <circle cx="8" cy="9" r="2"/>
                <circle cx="16" cy="9" r="2"/>
                <path d="M12 16c-1.9 0-3.5-1.1-4.2-2.7-.2-.3.1-.7.4-.8.3-.1.6.1.8.4.5 1.1 1.7 1.9 3 1.9s2.5-.8 3-1.9c.1-.3.5-.5.8-.4.3.1.6.4.4.8-.7 1.6-2.2 2.7-4.2 2.7z"/>
              </svg>
            </div>
          </div>
          <div className="bg-dark bg-opacity-70 rounded-lg p-2 w-32">
            <p className="font-pixel text-xs text-white mb-1">{playerCharacter.name}</p>
            <div className="bg-gray-700 rounded-full h-2 w-full">
              <div 
                className="bg-green-500 rounded-full h-2" 
                style={{ width: `${(playerCharacter.hp / playerCharacter.maxHp) * 100}%` }}
              ></div>
            </div>
            <p className="font-pixel text-xs text-white text-right">{playerCharacter.hp}/{playerCharacter.maxHp}</p>
          </div>
        </div>
        
        {/* Enemy Bitling */}
        <div className="enemy-bitling flex flex-col items-center">
          <div className="h-24 w-24 flex items-center justify-center mb-2">
            <div className="w-24 h-24 bg-[#FF5722] bg-opacity-20 rounded-full flex items-center justify-center animate-float">
              <svg className="w-20 h-20 text-[#FF5722]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M7 9.5C7 8.67 7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5zm8 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>
              </svg>
            </div>
          </div>
          <div className="bg-dark bg-opacity-70 rounded-lg p-2 w-32">
            <p className="font-pixel text-xs text-white mb-1">{enemyCharacter.name}</p>
            <div className="bg-gray-700 rounded-full h-2 w-full">
              <div 
                className="bg-green-500 rounded-full h-2" 
                style={{ width: `${(enemyCharacter.hp / enemyCharacter.maxHp) * 100}%` }}
              ></div>
            </div>
            <p className="font-pixel text-xs text-white text-right">{enemyCharacter.hp}/{enemyCharacter.maxHp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
