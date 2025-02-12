import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { culture, themes, tone } = await req.json();

    // Generate prompt for the LLM
    const userPrompt = `Generate an inspirational post for someone from ${culture} interested in ${themes.join(
      ", "
    )}. The tone should be ${tone}.`;

    // Call fine-tuned Meta LLM API (replace with actual API URL & Key)
    const response = await axios.post("https://your-llm-api.com/generate", {
      prompt: userPrompt,
    });

    return NextResponse.json({ message: response.data.result });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
