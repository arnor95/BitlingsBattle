import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BitlingCard from '@/components/BitlingCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BitlingDetail from '@/components/BitlingDetail';
import { Bitling } from '@shared/schema';

interface VoteTabProps {
  className?: string;
}

type SortOption = 'newest' | 'topRated';
type TimeFrame = 'weekly' | 'monthly' | 'allTime';

export default function VoteTab({ className = "" }: VoteTabProps) {
  const { toast } = useToast();
  const [sortOption, setSortOption] = useState<SortOption>('topRated');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('weekly');
  const [selectedBitling, setSelectedBitling] = useState<Bitling | null>(null);
  const [page, setPage] = useState(1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch bitlings for voting
  const { data: bitlings = [], isLoading: isLoadingBitlings } = useQuery({
    queryKey: ['/api/bitlings', { status: 'voting', sort: sortOption, page }],
  });

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/bitlings/leaderboard', { timeFrame }],
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ bitlingId, vote }: { bitlingId: string, vote: 1 | -1 }) => {
      return await apiRequest('POST', '/api/vote', { bitlingId, vote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bitlings/leaderboard'] });
    },
    onError: (error) => {
      toast({
        title: 'Vote Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVote = (bitlingId: string, vote: 1 | -1) => {
    voteMutation.mutate({ bitlingId, vote });
  };

  const handleViewDetails = (bitling: Bitling) => {
    setSelectedBitling(bitling);
    setIsDetailOpen(true);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setPage(1); // Reset to first page when changing sort
  };

  const handleTimeFrameChange = (frame: TimeFrame) => {
    setTimeFrame(frame);
  };

  return (
    <div className={`tab-pane ${className}`}>
      <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-pixel text-lg text-primary">VOTE ON BITLINGS</h2>
          <div className="flex space-x-2">
            <Button
              variant={sortOption === 'newest' ? 'default' : 'outline'}
              className={sortOption === 'newest' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
              size="sm"
              onClick={() => handleSortChange('newest')}
            >
              <span className="font-pixel text-xs">NEWEST</span>
            </Button>
            <Button
              variant={sortOption === 'topRated' ? 'default' : 'outline'}
              className={sortOption === 'topRated' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
              size="sm"
              onClick={() => handleSortChange('topRated')}
            >
              <span className="font-pixel text-xs">TOP RATED</span>
            </Button>
          </div>
        </div>
        
        {/* Bitling Gallery Grid */}
        {isLoadingBitlings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg overflow-hidden shadow animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bitlings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bitlings.map((bitling: Bitling) => (
              <BitlingCard
                key={bitling.id}
                bitling={bitling}
                onUpvote={() => handleVote(bitling.id, 1)}
                onDownvote={() => handleVote(bitling.id, -1)}
                onViewDetails={() => handleViewDetails(bitling)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-pixel">NO BITLINGS AVAILABLE FOR VOTING</p>
            <p className="text-gray-500 mt-2">Be the first to create and submit a Bitling!</p>
          </div>
        )}
        
        {/* Load More Button */}
        {bitlings.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="default" 
              className="bg-primary text-white font-pixel py-2 px-6 rounded-lg hover:bg-opacity-90 transition inline-flex items-center"
              onClick={handleLoadMore}
            >
              LOAD MORE
              <i className="ri-arrow-down-s-line ml-2"></i>
            </Button>
          </div>
        )}
      </div>
      
      {/* Leaderboard Section */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h2 className="font-pixel text-lg text-primary mb-4">TOP BITLINGS LEADERBOARD</h2>
        
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button 
              className={`font-pixel text-sm py-2 px-4 ${timeFrame === 'weekly' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTimeFrameChange('weekly')}
            >
              WEEKLY
            </button>
            <button 
              className={`font-pixel text-sm py-2 px-4 ${timeFrame === 'monthly' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTimeFrameChange('monthly')}
            >
              MONTHLY
            </button>
            <button 
              className={`font-pixel text-sm py-2 px-4 ${timeFrame === 'allTime' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTimeFrameChange('allTime')}
            >
              ALL TIME
            </button>
          </div>
        </div>
        
        {isLoadingLeaderboard ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center bg-gray-50 p-3 rounded-lg animate-pulse">
                <div className="font-pixel text-xl text-primary mr-4 w-6 text-center">{i + 1}</div>
                <div className="h-12 w-12 rounded-full bg-gray-200 mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((bitling: Bitling, index: number) => (
              <div 
                key={bitling.id} 
                className="flex items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => handleViewDetails(bitling)}
              >
                <div className="font-pixel text-xl text-primary mr-4 w-6 text-center">{index + 1}</div>
                <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                  <img 
                    src={bitling.imageUrl} 
                    alt={bitling.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-pixel text-sm">{bitling.name}</h3>
                    <span className={`type-${bitling.types?.[0] || 'normal'} rounded-full text-xs px-2 py-0.5`}>
                      {bitling.types?.[0]?.toUpperCase() || 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {bitling.creatorHandle ? `@${bitling.creatorHandle}` : 'Anonymous'}
                    </span>
                    <span className="font-medium text-green-600">+{bitling.votes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="font-pixel">NO LEADERBOARD DATA</p>
            <p className="text-gray-500 mt-2">Vote on Bitlings to see them here!</p>
          </div>
        )}
        
        {/* View Full Leaderboard Button */}
        {leaderboard.length > 3 && (
          <div className="mt-4 text-center">
            <button className="font-pixel text-sm text-primary hover:underline">
              VIEW FULL LEADERBOARD →
            </button>
          </div>
        )}
      </div>

      {/* Bitling Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-pixel">BITLING DETAILS</DialogTitle>
          </DialogHeader>
          {selectedBitling && <BitlingDetail bitling={selectedBitling} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
