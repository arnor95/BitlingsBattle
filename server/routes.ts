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
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
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
            content: "You are a game designer specializing in creating fantasy creature stats and abilities for a Pokémon-like game. Generate balanced stats and thematically appropriate abilities based on the creature's appearance and description."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create stats and abilities for a creature named "${name}" with this description: "${description}". 
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
                  url: imageUrl
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0].message.content || '{}');
      res.json(result);
    } catch (error) {
      console.error("Error generating stats:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate stats" 
      });
    }
  });
  // Create a new Bitling
  app.post("/api/bitlings", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBitlingSchema.parse(req.body);
      const bitling = await storage.createBitling(validatedData);
      res.status(201).json(bitling);
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
      
      const stats = JSON.parse(response.choices[0].message.content);
      
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
