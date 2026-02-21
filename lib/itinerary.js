import { GoogleGenerativeAI } from "@google/generative-ai";

// Utility delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateItinerary({ location, preferences, duration }) {
  const maxRetries = 3;
  let retryCount = 0;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!location || !preferences || !duration) {
    throw new Error(
      "Missing required parameters: location, preferences, or duration"
    );
  }

  const prompt = `
Generate a ${duration}-day travel itinerary for ${location}.

Requirements:
- 1 Morning activity
- 1 Afternoon activity
- 1 Dinner restaurant
- Activities and restaurants must be unique
- Specific to ${location}
- 1-2 sentence description for each

Interests: ${preferences?.interests?.join(", ") || "general sightseeing"}
Dining preferences: ${preferences?.dining?.join(", ") || "local cuisine"}

Format EXACTLY like this:

Day 1:
- Morning: Activity Name - Description
- Afternoon: Activity Name - Description
- Dinner: Restaurant Name - Description

Day 2:
...
`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  while (retryCount <= maxRetries) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview", // ✅ Stable production model
      });

      const result = await model.generateContent(prompt);

      const response = result.response;
      const itineraryText = response.text();

      if (!itineraryText) {
        throw new Error("Empty response from Gemini");
      }

      return parseItinerary(itineraryText.trim());
    } catch (error) {
      const statusCode = error?.status || error?.response?.status;

      // 🔁 Rate limit handling
      if (statusCode === 429 && retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000;
        await delay(waitTime);
        retryCount++;
        continue;
      }

      if (statusCode === 429) {
        throw new Error(
          "Gemini rate limit exceeded. Please try again later."
        );
      }

      if (statusCode === 401 || statusCode === 403) {
        throw new Error(
          "Invalid Gemini API key or insufficient permissions."
        );
      }

      throw new Error("Failed to generate itinerary: " + error.message);
    }
  }

  throw new Error("Maximum retry attempts reached.");
}

function parseItinerary(text) {
  try {
    const dayBlocks = text.split(/Day\s+\d+:/).slice(1);

    const days = dayBlocks.map((block, index) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-"));

      const schedule = lines.map((line) => {
        // Remove "- "
        const cleanLine = line.replace(/^- /, "");

        const [timePart, rest] = cleanLine.split(": ");
        if (!rest) return null;

        const [name, description] = rest.split(" - ");

        return {
          time: timePart.trim(),
          name: name?.trim() || "Unnamed",
          description: description?.trim() || "No description provided",
        };
      }).filter(Boolean);

      return {
        day: `Day ${index + 1}`,
        schedule,
      };
    }).filter((day) => day.schedule.length > 0);

    if (!days.length) {
      throw new Error("No valid itinerary parsed");
    }

    return days;
  } catch (error) {
    console.error("Parse error:", error);
    throw new Error("Failed to parse itinerary format");
  }
}