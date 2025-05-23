import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BitlingDetail from '@/components/BitlingDetail';
import StatsBar from '@/components/StatsBar';
import { Bitling, CollectedBitling } from '@shared/schema';

interface CollectionTabProps {
  className?: string;
}

type FilterType = 'ALL' | 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'ICE' | 'GHOST' | 'NORMAL';

export default function CollectionTab({ className = "" }: CollectionTabProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBitling, setSelectedBitling] = useState<CollectedBitling | null>(null);

  // Fetch user's collection
  const { data: collection = [], isLoading } = useQuery({
    queryKey: ['/api/collection'],
  });

  // Fetch collection stats
  const { data: collectionStats = {} } = useQuery({
    queryKey: ['/api/collection/stats'],
  });

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectBitling = (bitling: CollectedBitling) => {
    setSelectedBitling(bitling);
  };

  const handleAddToTeam = () => {
    // Implement team management functionality
    console.log('Add to team:', selectedBitling?.id);
  };

  const handleTrainBitling = () => {
    // Implement training functionality
    console.log('Train bitling:', selectedBitling?.id);
  };

  // Filter and search collection
  const filteredCollection = collection.filter((bitling: CollectedBitling) => {
    const matchesFilter = activeFilter === 'ALL' || bitling.types?.includes(activeFilter.toLowerCase());
    const matchesSearch = bitling.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={`tab-pane ${className}`}>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h2 className="font-pixel text-lg text-primary mb-4">YOUR BITLING COLLECTION</h2>
        
        {/* Collection Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-fire bg-opacity-10 rounded-lg p-3 text-center">
            <p className="font-pixel text-fire text-2xl">{collectionStats.total || 0}</p>
            <p className="text-sm text-gray-700">Total Bitlings</p>
          </div>
          <div className="bg-water bg-opacity-10 rounded-lg p-3 text-center">
            <p className="font-pixel text-water text-2xl">{collectionStats.types || 0}</p>
            <p className="text-sm text-gray-700">Types Collected</p>
          </div>
          <div className="bg-grass bg-opacity-10 rounded-lg p-3 text-center">
            <p className="font-pixel text-grass text-2xl">{collectionStats.rare || 0}</p>
            <p className="text-sm text-gray-700">Rare Bitlings</p>
          </div>
          <div className="bg-electric bg-opacity-10 rounded-lg p-3 text-center">
            <p className="font-pixel text-electric text-2xl">{collectionStats.completion || '0%'}</p>
            <p className="text-sm text-gray-700">Completion</p>
          </div>
        </div>
        
        {/* Collection Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['ALL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              className={activeFilter === filter ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
              size="sm"
              onClick={() => handleFilterChange(filter as FilterType)}
            >
              <span className="font-pixel text-xs">{filter}</span>
            </Button>
          ))}
          <div className="relative ml-auto">
            <Input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm"
            />
            <i className="ri-search-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
        
        {/* Collection Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-2 animate-pulse">
                <div className="h-24 bg-gray-200 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredCollection.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredCollection.map((bitling: CollectedBitling) => (
              <div 
                key={bitling.id} 
                className="bg-gray-100 rounded-lg p-2 hover:shadow-md transition cursor-pointer"
                onClick={() => handleSelectBitling(bitling)}
              >
                <div className="relative h-24 flex items-center justify-center mb-2">
                  <img 
                    src={bitling.imageUrl} 
                    alt={bitling.name} 
                    className="h-full w-auto"
                  />
                  {bitling.isRare && (
                    <div className="absolute top-0 right-0 bg-fire text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      <span>⭐</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-pixel text-xs">{bitling.name}</p>
                  <p className="text-xs text-gray-500">Lv. {bitling.level}</p>
                </div>
              </div>
            ))}
            
            {/* Undiscovered Bitling */}
            <div className="bg-gray-100 rounded-lg p-2 hover:shadow-md transition cursor-not-allowed opacity-50">
              <div className="relative h-24 flex items-center justify-center mb-2">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <i className="ri-question-mark text-2xl text-gray-500"></i>
                </div>
              </div>
              <div className="text-center">
                <p className="font-pixel text-xs">???</p>
                <p className="text-xs text-gray-500">Undiscovered</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-pixel">NO BITLINGS IN COLLECTION</p>
            <p className="text-gray-500 mt-2">Explore and catch Bitlings to build your collection!</p>
          </div>
        )}
      </div>
      
      {/* Selected Bitling Details */}
      {selectedBitling && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="font-pixel text-lg text-primary mb-4">SELECTED BITLING DETAILS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bitling Image and Basic Info */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`rounded-xl overflow-hidden h-48 w-48 bg-${selectedBitling.types?.[0] || 'normal'} bg-opacity-10 p-2`}>
                  <img 
                    src={selectedBitling.imageUrl} 
                    alt={selectedBitling.name} 
                    className="h-full w-full object-contain animate-float"
                  />
                </div>
                <div className={`absolute -bottom-3 -right-3 type-${selectedBitling.types?.[0] || 'normal'} font-pixel text-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg`}>
                  Lv.{selectedBitling.level}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <h3 className={`font-pixel text-xl text-${selectedBitling.types?.[0] || 'normal'}`}>
                  {selectedBitling.name}
                </h3>
                <div className="flex justify-center mt-2 space-x-2">
                  {selectedBitling.types?.map((type) => (
                    <span key={type} className={`type-${type} rounded-full text-xs px-3 py-1`}>
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-700">{selectedBitling.description}</p>
                {selectedBitling.creatorHandle && (
                  <p className="mt-2 text-xs text-gray-500">
                    Created by @{selectedBitling.creatorHandle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Bitling Stats and Abilities */}
            <div>
              <div className="mb-4">
                <h3 className="font-pixel text-sm text-gray-dark mb-2">STATS</h3>
                <div className="space-y-2">
                  <StatsBar name="HP" value={selectedBitling.stats.hp} max={100} color="stat-hp" />
                  <StatsBar name="ATTACK" value={selectedBitling.stats.attack} max={100} color="stat-attack" />
                  <StatsBar name="DEFENSE" value={selectedBitling.stats.defense} max={100} color="stat-defense" />
                  <StatsBar name="SPEED" value={selectedBitling.stats.speed} max={100} color="stat-speed" />
                </div>
              </div>
              
              <div>
                <h3 className="font-pixel text-sm text-gray-dark mb-2">MOVES</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBitling.moves.map((move, index) => (
                    <div 
                      key={index} 
                      className={`bg-${move.type} bg-opacity-10 p-2 rounded-lg`}
                    >
                      <h4 className={`font-pixel text-xs text-${move.type}`}>{move.name}</h4>
                      <div className="flex justify-between text-xs">
                        <span>Power: {move.power || '-'}</span>
                        <span>PP: {move.pp}/{move.maxPp}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1">{move.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="default"
                  className="bg-primary text-white font-pixel text-xs py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex-1"
                  onClick={handleAddToTeam}
                >
                  ADD TO TEAM
                </Button>
                <Button 
                  variant="default"
                  className="bg-secondary text-white font-pixel text-xs py-2 px-4 rounded-lg hover:bg-opacity-90 transition flex-1"
                  onClick={handleTrainBitling}
                >
                  TRAIN BITLING
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
