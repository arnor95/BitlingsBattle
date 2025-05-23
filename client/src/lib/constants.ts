// Bitling types and their corresponding colors
export const BITLING_TYPES = {
  FIRE: {
    id: "fire",
    label: "FIRE",
    color: "#FF5722"
  },
  WATER: {
    id: "water",
    label: "WATER",
    color: "#2196F3"
  },
  GRASS: {
    id: "grass",
    label: "GRASS",
    color: "#4CAF50"
  },
  ELECTRIC: {
    id: "electric",
    label: "ELECTRIC",
    color: "#FFEB3B"
  },
  PSYCHIC: {
    id: "psychic",
    label: "PSYCHIC",
    color: "#9C27B0"
  },
  ICE: {
    id: "ice",
    label: "ICE",
    color: "#00BCD4"
  },
  GHOST: {
    id: "ghost",
    label: "GHOST",
    color: "#7E57C2"
  },
  NORMAL: {
    id: "normal",
    label: "NORMAL",
    color: "#9E9E9E"
  }
};

// Bitling status values
export const BITLING_STATUS = {
  PROPOSED: "proposed",
  VOTING: "voting",
  ACCEPTED: "accepted",
  IN_GAME: "inGame"
};

// Battle backgrounds
export const BATTLE_BACKGROUNDS = [
  "/battle-bg-grass.svg",
  "/battle-bg-cave.svg",
  "/battle-bg-water.svg",
  "/battle-bg-mountain.svg"
];

// Battle message templates
export const BATTLE_MESSAGES = {
  ATTACK: "{attacker} used {move}!",
  SUPER_EFFECTIVE: "It's super effective!",
  NOT_EFFECTIVE: "It's not very effective...",
  CRITICAL: "A critical hit!",
  MISSED: "{attacker}'s attack missed!",
  FAINTED: "{defender} fainted!",
  CAPTURE_ATTEMPT: "Attempting to capture {defender}...",
  CAPTURE_SUCCESS: "Gotcha! {defender} was caught!",
  CAPTURE_FAIL: "Oh no! {defender} broke free!",
  RUN_SUCCESS: "Got away safely!",
  RUN_FAIL: "Can't escape!"
};

// Voting thresholds
export const VOTING = {
  THRESHOLD_FOR_APPROVAL: 10,
  LEADERBOARD_LIMIT: 20
};
