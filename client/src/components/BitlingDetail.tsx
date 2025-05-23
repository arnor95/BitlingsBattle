import { Bitling, BitlingWithStats } from "@shared/schema";
import StatsBar from "@/components/StatsBar";

interface BitlingDetailProps {
  bitling: Bitling | BitlingWithStats;
}

export default function BitlingDetail({ bitling }: BitlingDetailProps) {
  // Check if bitling has stats
  const hasStats = 'stats' in bitling && bitling.stats;
  const hasMoves = 'moves' in bitling && bitling.moves?.length > 0;
  
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Bitling Image */}
        <div className="flex flex-col items-center">
          <div className={`rounded-xl overflow-hidden bg-${bitling.types?.[0] || 'normal'} bg-opacity-10 p-2 w-full max-w-[200px] h-[200px]`}>
            <img 
              src={bitling.imageUrl} 
              alt={bitling.name} 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center mt-3">
            <h3 className="font-pixel text-lg">{bitling.name}</h3>
            <div className="flex justify-center mt-2 gap-2">
              {bitling.types?.map((type, index) => (
                <span key={index} className={`type-${type} rounded-full text-xs px-2 py-1`}>
                  {type.toUpperCase()}
                </span>
              ))}
            </div>
            {bitling.creatorHandle && (
              <p className="text-xs text-gray-500 mt-2">
                Created by @{bitling.creatorHandle}
              </p>
            )}
          </div>
        </div>

        {/* Bitling Details */}
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-4">{bitling.prompt}</p>
          
          {hasStats && (
            <div className="mb-4">
              <h4 className="font-pixel text-sm mb-2">STATS</h4>
              <div className="space-y-2">
                <StatsBar name="HP" value={(bitling as BitlingWithStats).stats.hp} max={100} color="stat-hp" />
                <StatsBar name="ATTACK" value={(bitling as BitlingWithStats).stats.attack} max={100} color="stat-attack" />
                <StatsBar name="DEFENSE" value={(bitling as BitlingWithStats).stats.defense} max={100} color="stat-defense" />
                <StatsBar name="SPEED" value={(bitling as BitlingWithStats).stats.speed} max={100} color="stat-speed" />
              </div>
            </div>
          )}

          {hasMoves && (
            <div>
              <h4 className="font-pixel text-sm mb-2">MOVES</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(bitling as BitlingWithStats).moves.map((move, index) => (
                  <div 
                    key={index} 
                    className={`bg-${move.type} bg-opacity-10 p-2 rounded-lg`}
                  >
                    <h5 className={`font-pixel text-xs text-${move.type}`}>{move.name}</h5>
                    <div className="flex justify-between text-xs">
                      <span>Power: {move.power || '-'}</span>
                      <span>Type: {move.type.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">{move.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If no stats or moves are available */}
          {!hasStats && !hasMoves && (
            <div className="text-center py-3 bg-gray-100 rounded-lg mt-2">
              <p className="text-sm font-medium">This Bitling is still awaiting approval.</p>
              <p className="text-xs text-gray-500 mt-1">Once approved, it will receive stats and moves!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
