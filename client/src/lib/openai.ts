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

/**
 * Generates Bitling stats and abilities using OpenAI GPT-4 via our backend API
 * 
 * @param imageUrl URL of the Bitling image
 * @param name Name of the Bitling
 * @param description Description of the Bitling
 * @returns Promise with the generated stats and abilities
 */
export async function generateBitlingStats(
  imageUrl: string,
  name: string,
  description: string
) {
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
