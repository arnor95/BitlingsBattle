import { pgTable, text, serial, uuid, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bitling type
export type BitlingType = "fire" | "water" | "grass" | "electric" | "psychic" | "ice" | "ghost" | "normal";

// Bitling status
export type BitlingStatus = "proposed" | "voting" | "accepted" | "inGame";

// Move structure
export interface Move {
  name: string;
  type: BitlingType;
  power: number;
  pp: number;
  maxPp: number;
  description: string;
}

// Stats structure
export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

// Bitlings table
export const bitlings = pgTable("bitlings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  creatorHandle: text("creator_handle"),
  status: text("status").notNull().default("proposed"),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  votes: integer("votes").notNull().default(0),
  types: json("types").$type<BitlingType[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bitling stats table
export const bitlingStats = pgTable("bitling_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  bitlingId: uuid("bitling_id").notNull().references(() => bitlings.id),
  stats: json("stats").$type<Stats>().notNull(),
  moves: json("moves").$type<Move[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Votes table
export const votes = pgTable("votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  bitlingId: uuid("bitling_id").notNull().references(() => bitlings.id),
  userId: uuid("user_id"), // Optional, in case we implement user authentication
  ipAddress: text("ip_address").notNull(),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Collection table 
export const collection = pgTable("collection", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  bitlingId: uuid("bitling_id").notNull().references(() => bitlings.id),
  nickname: text("nickname"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  isRare: boolean("is_rare").notNull().default(false),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

// Insert schemas
export const insertBitlingSchema = createInsertSchema(bitlings).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  votes: true,
  types: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBitlingStatsSchema = createInsertSchema(bitlingStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertCollectionSchema = createInsertSchema(collection).omit({
  id: true,
  level: true,
  experience: true,
  isRare: true,
  capturedAt: true,
});

// Types
export type InsertBitling = z.infer<typeof insertBitlingSchema>;
export type InsertBitlingStats = z.infer<typeof insertBitlingStatsSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type Bitling = typeof bitlings.$inferSelect;
export type BitlingStats = typeof bitlingStats.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type CollectionEntry = typeof collection.$inferSelect;

// Combined types
export interface BitlingWithStats extends Bitling {
  stats: Stats;
  moves: Move[];
}

export interface CollectedBitling extends BitlingWithStats {
  nickname?: string;
  level: number;
  experience: number;
  isRare: boolean;
  capturedAt: Date;
}
