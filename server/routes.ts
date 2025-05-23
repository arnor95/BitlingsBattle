import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBitlingSchema, insertVoteSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // API endpoint for generating Bitling images
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Enhance the prompt for better results
      const enhancedPrompt = `A cute fantasy creature character design: ${prompt}. Pixel art style, game sprite, vibrant colors, white background, centered composition.`;
      
      // Use DALL-E 3, which is confirmed to be available
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
      
      if (response.data && response.data.length > 0 && response.data[0].url) {
        res.json({ url: response.data[0].url });
      } else {
        throw new Error("Failed to generate image - no URL returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate image"
      });
    }
  });
  
  // API endpoint for generating Bitling stats
  app.post("/api/generate-stats", async (req: Request, res: Response) => {
    try {
      const { imageUrl, name, description } = req.body;
      
      if (!imageUrl || !name || !description) {
        return res.status(400).json({ 
          message: "Image URL, name, and description are required" 
        });
      }
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `You are a game designer specializing in creating fantasy creature stats and abilities for a Pokémon-like game called Bitlings. Generate balanced stats and thematically appropriate abilities based on the creature's appearance and description.

Available types: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel.

Each Bitling must have:
1. PRIMARY type and SECONDARY type (use normal as secondary if unsure)
2. Level-appropriate base stats for a level 1 creature
3. A set of moves learned at different levels (at least 6 moves)

For moves, specify:
- Name
- Type (matching one of the Bitling's types when possible)
- Power (0 for status moves, 40-120 for damage moves)
- Accuracy (0-100 percentage)
- PP (5-30 points)
- Max PP (same as PP)
- Description
- Category ("physical", "special", or "status")
- Level learned (from level 1 to 36)`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create detailed stats and abilities for a Bitling named "${name}" with this description: "${description}". 
                
                Analyze the image carefully and return the data in this JSON format:
                {
                  "types": ["primary_type", "secondary_type"],
                  "stats": {
                    "hp": 30-50,
                    "attack": 30-50,
                    "defense": 30-50,
                    "speed": 30-50
                  },
                  "description": "A brief description based on appearance (1-2 sentences)",
                  "behavior": "How the Bitling behaves in its natural habitat",
                  "moves": [
                    {
                      "name": "Move Name",
                      "type": "one of the available types",
                      "power": 0-120 (0 for status moves),
                      "accuracy": 0-100,
                      "pp": 5-30,
                      "maxPp": same as pp,
                      "description": "Brief description of the move",
                      "category": "physical/special/status",
                      "levelLearned": level at which this move is learned
                    },
                    ... at least 6 moves learned at different levels
                  ]
                }
                
                Choose types from: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel.
                
                Make sure the types, stats, and moves fit thematically with the Bitling's appearance and description. Ensure moves are learned at increasing levels (1, 5, 10, 15, 20, 25, etc.)`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content || '{}';
      let result;
      
      try {
        result = JSON.parse(content);
        
        // Ensure we have minimum valid data structure
        if (!result.types || !Array.isArray(result.types) || result.types.length === 0) {
          result.types = ["normal", "normal"];
        }
        
        if (!result.stats) {
          result.stats = {
            hp: 40,
            attack: 40,
            defense: 40,
            speed: 40
          };
        }
        
        if (!result.moves || !Array.isArray(result.moves)) {
          result.moves = [
            {
              name: "Tackle",
              type: "normal",
              power: 40,
              accuracy: 100,
              pp: 35,
              maxPp: 35,
              description: "A physical attack in which the user charges and slams into the target with its whole body.",
              category: "physical",
              levelLearned: 1
            }
          ];
        }
        
        if (!result.description) {
          result.description = "A mysterious creature with unknown origins.";
        }
        
        if (!result.behavior) {
          result.behavior = "Behaves cautiously around strangers but is friendly once it trusts you.";
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // Provide defaults in case of parsing error
        result = {
          types: ["normal", "normal"],
          stats: {
            hp: 40,
            attack: 40,
            defense: 40,
            speed: 40
          },
          moves: [
            {
              name: "Tackle",
              type: "normal",
              power: 40,
              accuracy: 100,
              pp: 35,
              maxPp: 35,
              description: "A physical attack in which the user charges and slams into the target with its whole body.",
              category: "physical",
              levelLearned: 1
            }
          ],
          description: "A mysterious creature with unknown origins.",
          behavior: "Behaves cautiously around strangers but is friendly once it trusts you."
        };
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error generating stats:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate stats" 
      });
    }
  });
  // Create a new Bitling with types, stats and moves
  app.post("/api/bitlings", async (req: Request, res: Response) => {
    try {
      const { types, stats, moves, ...bitlingData } = req.body;
      
      // Validate the basic Bitling data first
      const validatedData = insertBitlingSchema.parse(bitlingData);
      
      // Create the Bitling
      const bitling = await storage.createBitling({
        ...validatedData,
        types: types || ["normal", "normal"] // Default to normal type if none provided
      });
      
      // If stats and moves are provided, create them too
      if (stats && moves && Array.isArray(moves)) {
        // Format moves to match our schema
        const formattedMoves = moves.map(move => ({
          name: move.name,
          type: move.type || "normal",
          power: move.power || 0,
          pp: move.pp || 10,
          maxPp: move.maxPp || move.pp || 10,
          description: move.description || "",
          accuracy: move.accuracy || 100,
          levelLearned: move.levelLearned || 1,
          category: move.category || "physical"
        }));
        
        // Create Bitling stats with moves
        await storage.createBitlingStats({
          bitlingId: bitling.id,
          stats: stats,
          moves: formattedMoves
        });
        
        // Get the complete Bitling with stats and return it
        const bitlingWithStats = await storage.getBitlingById(bitling.id);
        res.status(201).json(bitlingWithStats);
      } else {
        res.status(201).json(bitling);
      }
    } catch (error) {
      console.error("Error creating bitling:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create bitling" });
    }
  });

  // Get all Bitlings with optional filters
  app.get("/api/bitlings", async (req: Request, res: Response) => {
    try {
      const statusSchema = z.enum(["proposed", "voting", "accepted", "inGame"]).optional();
      const querySchema = z.object({
        status: statusSchema,
        sort: z.enum(["newest", "topRated"]).optional().default("newest"),
        page: z.coerce.number().positive().optional().default(1),
        limit: z.coerce.number().positive().optional().default(12),
      });

      const { status, sort, page, limit } = querySchema.parse(req.query);
      const bitlings = await storage.getBitlings(status, sort, page, limit);
      res.json(bitlings);
    } catch (error) {
      console.error("Error fetching bitlings:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to fetch bitlings" });
    }
  });

  // Get a single Bitling by ID
  app.get("/api/bitlings/:id", async (req: Request, res: Response) => {
    try {
      const bitling = await storage.getBitlingById(req.params.id);
      if (!bitling) {
        return res.status(404).json({ message: "Bitling not found" });
      }
      res.json(bitling);
    } catch (error) {
      console.error("Error fetching bitling:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch bitling" });
    }
  });

  // Vote on a Bitling
  app.post("/api/vote", async (req: Request, res: Response) => {
    try {
      const voteSchema = z.object({
        bitlingId: z.string().uuid(),
        vote: z.union([z.literal(1), z.literal(-1)]),
      });

      const { bitlingId, vote } = voteSchema.parse(req.body);
      const ipAddress = req.ip || "unknown";
      
      // Create vote data
      const voteData = {
        bitlingId,
        ipAddress,
        value: vote,
      };
      
      // Check if user already voted
      const existingVote = await storage.getVoteByIpAndBitling(ipAddress, bitlingId);
      
      if (existingVote) {
        if (existingVote.value === vote) {
          return res.status(400).json({ message: "You've already voted this way" });
        }
        
        // Update existing vote
        await storage.updateVote(existingVote.id, vote);
        res.json({ message: "Vote updated successfully" });
      } else {
        // Create new vote
        await storage.createVote(voteData);
        res.json({ message: "Vote recorded successfully" });
      }
      
    } catch (error) {
      console.error("Error voting on bitling:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to vote" });
    }
  });

  // Get Bitling leaderboard
  app.get("/api/bitlings/leaderboard", async (req: Request, res: Response) => {
    try {
      const querySchema = z.object({
        timeFrame: z.enum(["weekly", "monthly", "allTime"]).optional().default("weekly"),
        limit: z.coerce.number().positive().optional().default(10),
      });

      const { timeFrame, limit } = querySchema.parse(req.query);
      const leaderboard = await storage.getLeaderboard(timeFrame, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to fetch leaderboard" });
    }
  });

  // Generate stats for a Bitling
  app.post("/api/bitlings/:id/generate-stats", async (req: Request, res: Response) => {
    try {
      const bitlingId = req.params.id;
      const bitling = await storage.getBitlingById(bitlingId);
      
      if (!bitling) {
        return res.status(404).json({ message: "Bitling not found" });
      }
      
      // Check if bitling already has stats
      const existingStats = await storage.getBitlingStats(bitlingId);
      if (existingStats) {
        return res.status(400).json({ message: "Bitling already has stats" });
      }
      
      // Generate stats using OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a game designer specializing in creating fantasy creature stats and abilities for a Pokémon-like game. Generate balanced stats and thematically appropriate abilities based on the creature's appearance and description."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create stats and abilities for a creature named "${bitling.name}" with this description: "${bitling.prompt}". 
                Return the data in this JSON format:
                {
                  "types": ["primary_type", "secondary_type"],
                  "stats": {
                    "hp": 1-100,
                    "attack": 1-100,
                    "defense": 1-100,
                    "speed": 1-100
                  },
                  "moves": [
                    {
                      "name": "MOVE_NAME",
                      "type": "move_type",
                      "power": 1-100,
                      "pp": 5-30,
                      "maxPp": 5-30,
                      "description": "Brief description of what the move does"
                    },
                    ...3 more moves
                  ]
                }
                
                For types, use: fire, water, grass, electric, psychic, ice, ghost, or normal.
                Make sure the types, stats, and moves fit thematically with the creature's description.`
              },
              {
                type: "image_url",
                image_url: {
                  url: bitling.imageUrl
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content || '{}';
      const stats = JSON.parse(content);
      
      // Save stats to database
      await storage.createBitlingStats({
        bitlingId,
        stats: stats.stats,
        moves: stats.moves
      });
      
      // Update bitling types
      await storage.updateBitlingTypes(bitlingId, stats.types);
      
      res.json({ message: "Stats generated successfully", stats });
    } catch (error) {
      console.error("Error generating stats:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate stats" });
    }
  });

  // Get user's collection
  app.get("/api/collection", async (req: Request, res: Response) => {
    try {
      // In a real app, we'd get the user ID from the authenticated session
      // For now, we'll use a hardcoded user ID for demonstration
      const userId = "demo-user-id";
      const collection = await storage.getUserCollection(userId);
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch collection" });
    }
  });

  // Get collection stats
  app.get("/api/collection/stats", async (req: Request, res: Response) => {
    try {
      // In a real app, we'd get the user ID from the authenticated session
      const userId = "demo-user-id";
      const stats = await storage.getCollectionStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching collection stats:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to fetch collection stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
