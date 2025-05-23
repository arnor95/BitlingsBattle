interface ImageGenerationResponse {
  url: string;
}

/**
 * Generates a Bitling image using OpenAI's DALL-E via our backend API
 * 
 * @param prompt The description of the Bitling to generate
 * @returns Promise with the URL of the generated image
 */
export async function generateBitlingImage(prompt: string): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating Bitling image:", error);
    throw error;
  }
}

interface BitlingGenerationResponse {
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  moves: Array<{
    name: string;
    type: string; 
    power: number;
    accuracy: number;
    pp: number;
    maxPp: number;
    description: string;
    category: "physical" | "special" | "status";
    levelLearned: number;
  }>;
  description: string;
  behavior: string;
}

/**
 * Generates Bitling stats, types, and moves using OpenAI GPT-4o via our backend API
 * 
 * @param imageUrl URL of the Bitling image
 * @param name Name of the Bitling
 * @param description Description of the Bitling
 * @returns Promise with the generated stats, types, and moves
 */
export async function generateBitlingStats(
  imageUrl: string,
  name: string,
  description: string
): Promise<BitlingGenerationResponse> {
  try {
    const response = await fetch("/api/generate-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageUrl,
        name,
        description
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating Bitling stats:", error);
    throw error;
  }
}
