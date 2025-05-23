import { 
  Bitling, 
  BitlingStats, 
  BitlingType, 
  BitlingWithStats, 
  CollectedBitling, 
  Move, 
  InsertBitling, 
  InsertBitlingStats, 
  InsertVote, 
  Vote, 
  Stats, 
  BitlingStatus 
} from '@shared/schema';
import { BITLING_TYPES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  // Bitling CRUD
  createBitling(bitling: InsertBitling): Promise<Bitling>;
  getBitlingById(id: string): Promise<BitlingWithStats | null>;
  getBitlings(status?: BitlingStatus, sort?: string, page?: number, limit?: number): Promise<Bitling[]>;
  updateBitlingTypes(id: string, types: BitlingType[]): Promise<Bitling>;
  updateBitlingStatus(id: string, status: BitlingStatus): Promise<Bitling>;
  
  // Stats CRUD
  createBitlingStats(stats: InsertBitlingStats): Promise<BitlingStats>;
  getBitlingStats(bitlingId: string): Promise<BitlingStats | null>;
  
  // Voting system
  createVote(vote: Omit<InsertVote, 'userId'>): Promise<Vote>;
  getVoteByIpAndBitling(ipAddress: string, bitlingId: string): Promise<Vote | null>;
  updateVote(id: string, value: number): Promise<Vote>;
  getLeaderboard(timeFrame: string, limit: number): Promise<Bitling[]>;
  
  // Collection management
  getUserCollection(userId: string): Promise<CollectedBitling[]>;
  getCollectionStats(userId: string): Promise<{
    total: number;
    types: number;
    rare: number;
    completion: string;
  }>;
}

export class MemStorage implements IStorage {
  private bitlings: Map<string, Bitling>;
  private bitlingStats: Map<string, BitlingStats>;
  private votes: Map<string, Vote>;
  private collection: Map<string, CollectedBitling>;
  
  constructor() {
    this.bitlings = new Map();
    this.bitlingStats = new Map();
    this.votes = new Map();
    this.collection = new Map();
    
    // Initialize with some demo bitlings
    this.initializeDemoData();
  }
  
  private initializeDemoData() {
    // Some demo bitlings for initial display
    const demoBitlings: Partial<Bitling>[] = [
      {
        id: uuidv4(),
        name: "AQUABYTE",
        prompt: "A sleek aquatic creature with shimmering scales and fin-like ears.",
        imageUrl: "https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Aquabyte",
        creatorHandle: "watertrainer",
        status: "accepted",
        upvotes: 24,
        downvotes: 3,
        votes: 21,
        types: ["water"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "FLAMELOX",
        prompt: "A fox-like creature with fiery fur and ember-tipped tail that glows in the dark.",
        imageUrl: "https://via.placeholder.com/400x300/FF5722/FFFFFF?text=Flamelox",
        creatorHandle: "flamecreator",
        status: "accepted",
        upvotes: 42,
        downvotes: 7,
        votes: 35,
        types: ["fire"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "LEAFLET",
        prompt: "A small plant-based creature with leaf-like appendages and flower buds on its back.",
        imageUrl: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Leaflet",
        creatorHandle: "naturelover",
        status: "accepted",
        upvotes: 18,
        downvotes: 2,
        votes: 16,
        types: ["grass"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "ZAPZAP",
        prompt: "A small electric rodent with lightning bolt markings and static-charged fur.",
        imageUrl: "https://via.placeholder.com/400x300/FFEB3B/212121?text=ZapZap",
        creatorHandle: "shockmaster",
        status: "accepted",
        upvotes: 31,
        downvotes: 5,
        votes: 26,
        types: ["electric"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "PSYCAT",
        prompt: "A feline creature with glowing purple eyes and telepathic abilities.",
        imageUrl: "https://via.placeholder.com/400x300/9C27B0/FFFFFF?text=PsyCat",
        creatorHandle: "mindmaster",
        status: "voting",
        upvotes: 15,
        downvotes: 2,
        votes: 13,
        types: ["psychic"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: "FROSTBITE",
        prompt: "A small ice fox with crystals forming on its tail and ears.",
        imageUrl: "https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Frostbite",
        creatorHandle: "icecaster",
        status: "voting",
        upvotes: 12,
        downvotes: 3,
        votes: 9,
        types: ["ice"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        updatedAt: new Date()
      }
    ];
    
    // Add demo bitlings to storage
    demoBitlings.forEach(bitling => {
      if (bitling.id) {
        this.bitlings.set(bitling.id, bitling as Bitling);
        
        // Add stats for accepted bitlings
        if (bitling.status === "accepted") {
          this.generateDemoStats(bitling.id, bitling.types?.[0] || "normal");
        }
        
        // Add to user collection if accepted
        if (bitling.status === "accepted") {
          this.addToCollection("demo-user-id", bitling.id);
        }
      }
    });
  }
  
  private generateDemoStats(bitlingId: string, type: BitlingType): void {
    const statsVariation = Math.floor(Math.random() * 30) - 15; // -15 to +15
    
    // Base stats by type
    const baseStats: Record<BitlingType, Stats> = {
      fire: { hp: 65, attack: 85, defense: 60, speed: 90 },
      water: { hp: 70, attack: 65, defense: 80, speed: 85 },
      grass: { hp: 75, attack: 70, defense: 75, speed: 80 },
      electric: { hp: 60, attack: 75, defense: 60, speed: 95 },
      psychic: { hp: 65, attack: 95, defense: 60, speed: 90 },
      ice: { hp: 70, attack: 80, defense: 70, speed: 80 },
      ghost: { hp: 60, attack: 85, defense: 75, speed: 85 },
      normal: { hp: 75, attack: 75, defense: 75, speed: 75 }
    };
    
    // Adjust stats based on variation
    const stats: Stats = {
      hp: Math.max(30, Math.min(100, baseStats[type].hp + statsVariation)),
      attack: Math.max(30, Math.min(100, baseStats[type].attack + statsVariation)),
      defense: Math.max(30, Math.min(100, baseStats[type].defense + statsVariation)),
      speed: Math.max(30, Math.min(100, baseStats[type].speed + statsVariation))
    };
    
    // Generate moves based on type
    const moves: Move[] = this.generateMovesByType(type);
    
    const bitlingStatsData: BitlingStats = {
      id: uuidv4(),
      bitlingId,
      stats,
      moves,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.bitlingStats.set(bitlingId, bitlingStatsData);
  }
  
  private generateMovesByType(type: BitlingType): Move[] {
    // Type-specific moves
    const typeMovesMap: Record<BitlingType, Partial<Move>[]> = {
      fire: [
        { name: "FIRE BREATH", type: "fire", power: 75, description: "Unleashes a powerful stream of fire at the opponent." },
        { name: "EMBER TAIL", type: "fire", power: 60, description: "Whips opponent with its ember-tipped tail, may cause burn." },
        { name: "HEAT WAVE", type: "fire", power: 85, description: "Creates a wave of intense heat that damages all opponents." }
      ],
      water: [
        { name: "WATER BLAST", type: "water", power: 75, description: "Shoots a powerful jet of water at high pressure." },
        { name: "BUBBLE BEAM", type: "water", power: 65, description: "Fires a stream of bubbles that may lower speed." },
        { name: "TIDAL CRASH", type: "water", power: 85, description: "Summons a small tidal wave to crash into the opponent." }
      ],
      grass: [
        { name: "VINE WHIP", type: "grass", power: 70, description: "Strikes the opponent with vine-like appendages." },
        { name: "SEED BOMB", type: "grass", power: 80, description: "Launches explosive seeds that burst on impact." },
        { name: "PETAL DANCE", type: "grass", power: 90, description: "Unleashes a furious dance of petals, but causes confusion." }
      ],
      electric: [
        { name: "THUNDER SHOCK", type: "electric", power: 75, description: "Zaps opponent with an electric jolt, may cause paralysis." },
        { name: "SPARK", type: "electric", power: 65, description: "Charges with electricity and tackles, may cause paralysis." },
        { name: "VOLT TACKLE", type: "electric", power: 90, description: "Powerful electric tackle that also damages the user." }
      ],
      psychic: [
        { name: "MIND BLAST", type: "psychic", power: 75, description: "Emits a psychic shock wave that damages the opponent." },
        { name: "CONFUSION", type: "psychic", power: 60, description: "Mentally assaults the foe, may cause confusion." },
        { name: "PSYCHIC WAVE", type: "psychic", power: 85, description: "Sends a powerful psychic wave that may lower defense." }
      ],
      ice: [
        { name: "ICE BEAM", type: "ice", power: 75, description: "Fires a freezing beam that may freeze the opponent." },
        { name: "FROST BITE", type: "ice", power: 65, description: "Bites with freezing fangs, may cause frostbite." },
        { name: "BLIZZARD", type: "ice", power: 90, description: "Summons a powerful snowstorm that hits all opponents." }
      ],
      ghost: [
        { name: "SHADOW BALL", type: "ghost", power: 75, description: "Hurls a shadowy blob that may lower defense." },
        { name: "PHANTOM FORCE", type: "ghost", power: 85, description: "Disappears and strikes on the next turn." },
        { name: "SPIRIT SHACKLE", type: "ghost", power: 80, description: "Stitches the opponent to their shadow, preventing escape." }
      ],
      normal: [
        { name: "TACKLE", type: "normal", power: 50, description: "A physical attack in which the user charges and slams into the target." },
        { name: "QUICK ATTACK", type: "normal", power: 40, description: "An extremely fast attack that always strikes first." },
        { name: "HYPER BEAM", type: "normal", power: 95, description: "A powerful attack that requires rest afterward." }
      ]
    };
    
    // Always include a quick attack
    const normalMove = {
      name: "QUICK DASH",
      type: "normal" as BitlingType,
      power: 40,
      pp: 30,
      maxPp: 30,
      description: "Dashes at high speed to strike the opponent first."
    };
    
    // Get 3 type-specific moves
    const typeMoves = typeMovesMap[type].map(move => ({
      ...move,
      pp: move.power ? Math.floor(130 / (move.power || 50)) : 15,
      maxPp: move.power ? Math.floor(130 / (move.power || 50)) : 15,
    } as Move)).slice(0, 3);
    
    // Return 4 moves total
    return [...typeMoves, normalMove];
  }
  
  private addToCollection(userId: string, bitlingId: string): void {
    const bitling = this.bitlings.get(bitlingId);
    const stats = this.bitlingStats.get(bitlingId);
    
    if (!bitling || !stats) return;
    
    // Random level between 5 and 15
    const level = Math.floor(Math.random() * 11) + 5;
    
    const collectedBitling: CollectedBitling = {
      ...bitling,
      stats: stats.stats,
      moves: stats.moves,
      id: `collection-${uuidv4()}`,
      level,
      experience: level * 100,
      isRare: Math.random() > 0.8, // 20% chance of being rare
      capturedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // Random time in last 30 days
    };
    
    this.collection.set(`${userId}-${bitlingId}`, collectedBitling);
  }

  // Implement IStorage interface methods
  
  async createBitling(bitlingData: InsertBitling): Promise<Bitling> {
    const id = uuidv4();
    const now = new Date();
    
    const bitling: Bitling = {
      id,
      ...bitlingData,
      upvotes: 0,
      downvotes: 0,
      votes: 0,
      status: "proposed" as BitlingStatus,
      createdAt: now,
      updatedAt: now
    };
    
    this.bitlings.set(id, bitling);
    return bitling;
  }
  
  async getBitlingById(id: string): Promise<BitlingWithStats | null> {
    const bitling = this.bitlings.get(id);
    if (!bitling) return null;
    
    const stats = this.bitlingStats.get(id);
    
    if (stats) {
      return {
        ...bitling,
        stats: stats.stats,
        moves: stats.moves
      };
    }
    
    return bitling;
  }
  
  async getBitlings(
    status?: BitlingStatus, 
    sort: string = "newest", 
    page: number = 1, 
    limit: number = 12
  ): Promise<Bitling[]> {
    let bitlings = Array.from(this.bitlings.values());
    
    // Filter by status if provided
    if (status) {
      bitlings = bitlings.filter(b => b.status === status);
    }
    
    // Sort by creation date or votes
    if (sort === "newest") {
      bitlings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === "topRated") {
      bitlings.sort((a, b) => b.votes - a.votes);
    }
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return bitlings.slice(startIndex, endIndex);
  }
  
  async updateBitlingTypes(id: string, types: BitlingType[]): Promise<Bitling> {
    const bitling = this.bitlings.get(id);
    if (!bitling) {
      throw new Error(`Bitling with ID ${id} not found`);
    }
    
    const updatedBitling = {
      ...bitling,
      types,
      updatedAt: new Date()
    };
    
    this.bitlings.set(id, updatedBitling);
    return updatedBitling;
  }
  
  async updateBitlingStatus(id: string, status: BitlingStatus): Promise<Bitling> {
    const bitling = this.bitlings.get(id);
    if (!bitling) {
      throw new Error(`Bitling with ID ${id} not found`);
    }
    
    const updatedBitling = {
      ...bitling,
      status,
      updatedAt: new Date()
    };
    
    this.bitlings.set(id, updatedBitling);
    return updatedBitling;
  }
  
  async createBitlingStats(statsData: InsertBitlingStats): Promise<BitlingStats> {
    const id = uuidv4();
    const now = new Date();
    
    const stats: BitlingStats = {
      id,
      ...statsData,
      createdAt: now,
      updatedAt: now
    };
    
    this.bitlingStats.set(statsData.bitlingId, stats);
    return stats;
  }
  
  async getBitlingStats(bitlingId: string): Promise<BitlingStats | null> {
    return this.bitlingStats.get(bitlingId) || null;
  }
  
  async createVote(voteData: Omit<InsertVote, 'userId'>): Promise<Vote> {
    const id = uuidv4();
    const now = new Date();
    
    const vote: Vote = {
      id,
      ...voteData,
      userId: undefined,
      createdAt: now
    };
    
    this.votes.set(id, vote);
    
    // Update bitling vote counts
    const bitling = this.bitlings.get(voteData.bitlingId);
    if (bitling) {
      const updatedBitling = {
        ...bitling,
        upvotes: voteData.value > 0 ? bitling.upvotes + 1 : bitling.upvotes,
        downvotes: voteData.value < 0 ? bitling.downvotes + 1 : bitling.downvotes,
        votes: bitling.votes + voteData.value,
        updatedAt: new Date()
      };
      
      this.bitlings.set(bitling.id, updatedBitling);
      
      // Check if bitling should be promoted to accepted
      if (updatedBitling.status === "voting" && updatedBitling.votes >= 10) {
        this.updateBitlingStatus(bitling.id, "accepted");
      }
    }
    
    return vote;
  }
  
  async getVoteByIpAndBitling(ipAddress: string, bitlingId: string): Promise<Vote | null> {
    const votes = Array.from(this.votes.values());
    const existingVote = votes.find(vote => 
      vote.ipAddress === ipAddress && vote.bitlingId === bitlingId
    );
    
    return existingVote || null;
  }
  
  async updateVote(id: string, value: number): Promise<Vote> {
    const vote = this.votes.get(id);
    if (!vote) {
      throw new Error(`Vote with ID ${id} not found`);
    }
    
    // Get the old value to calculate the difference
    const oldValue = vote.value;
    const difference = value - oldValue;
    
    const updatedVote = {
      ...vote,
      value
    };
    
    this.votes.set(id, updatedVote);
    
    // Update bitling vote counts
    const bitling = this.bitlings.get(vote.bitlingId);
    if (bitling) {
      const updatedBitling = {
        ...bitling,
        upvotes: value > 0 && oldValue <= 0 ? bitling.upvotes + 1 : 
                  value <= 0 && oldValue > 0 ? bitling.upvotes - 1 : 
                  bitling.upvotes,
        downvotes: value < 0 && oldValue >= 0 ? bitling.downvotes + 1 : 
                    value >= 0 && oldValue < 0 ? bitling.downvotes - 1 : 
                    bitling.downvotes,
        votes: bitling.votes + difference,
        updatedAt: new Date()
      };
      
      this.bitlings.set(bitling.id, updatedBitling);
      
      // Check if bitling should be promoted to accepted
      if (updatedBitling.status === "voting" && updatedBitling.votes >= 10) {
        this.updateBitlingStatus(bitling.id, "accepted");
      }
    }
    
    return updatedVote;
  }
  
  async getLeaderboard(timeFrame: string, limit: number): Promise<Bitling[]> {
    let bitlings = Array.from(this.bitlings.values());
    
    // Filter by time frame
    const now = new Date();
    if (timeFrame === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      bitlings = bitlings.filter(b => b.createdAt >= weekAgo);
    } else if (timeFrame === "monthly") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      bitlings = bitlings.filter(b => b.createdAt >= monthAgo);
    }
    
    // Sort by votes and limit
    return bitlings
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }
  
  async getUserCollection(userId: string): Promise<CollectedBitling[]> {
    const collection = Array.from(this.collection.values())
      .filter(entry => entry.id.startsWith(`collection-`))
      .sort((a, b) => b.level - a.level);
    
    return collection;
  }
  
  async getCollectionStats(userId: string): Promise<{
    total: number;
    types: number;
    rare: number;
    completion: string;
  }> {
    const collection = await this.getUserCollection(userId);
    
    // Count unique types
    const uniqueTypes = new Set<string>();
    collection.forEach(bitling => {
      bitling.types?.forEach(type => uniqueTypes.add(type));
    });
    
    // Count rare bitlings
    const rareCount = collection.filter(b => b.isRare).length;
    
    // Calculate completion percentage (assuming there are 100 total bitlings in the game)
    const totalPossible = Object.keys(BITLING_TYPES).length * 5; // 5 bitlings per type
    const completionPercentage = Math.floor((collection.length / totalPossible) * 100);
    
    return {
      total: collection.length,
      types: uniqueTypes.size,
      rare: rareCount,
      completion: `${completionPercentage}%`
    };
  }
}

export const storage = new MemStorage();
