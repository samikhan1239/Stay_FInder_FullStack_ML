import { connectToDatabase } from "../../../../../lib/db";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  console.log("🔥 ML Recommendation Route Hit");

  try {
    // ✅ Required for Next 15
    const { id } = await context.params;
    console.log("👉 Extracted ID:", id);

    // Validate ID
    if (!id || !ObjectId.isValid(id)) {
      console.log("❌ Invalid ID");
      return new Response(JSON.stringify([]), { status: 400 });
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    console.log("✅ Connected to DB");

    const currentListing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(id) });

    if (!currentListing) {
      console.log("❌ Listing not found in DB");
      return new Response(JSON.stringify([]), { status: 404 });
    }

    console.log("👉 Listing Found:", currentListing.title);

    // 🔥 Call Flask ML service
    const flaskUrl = `https://sami123.pythonanywhere.com/recommend-api/${id}`;
    console.log("🚀 Calling Flask:", flaskUrl);

    const mlResponse = await fetch(flaskUrl);

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.log("❌ Flask Error:", errorText);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const mlData = await mlResponse.json();

    console.log("🎯 ML Response:", mlData);

    const recommendations = mlData?.recommendations || [];

    console.log("🎯 Recommendation Count:", recommendations.length);

    return new Response(JSON.stringify(recommendations), {
      status: 200,
    });

  } catch (error) {
    console.error("🔥 Recommendation Route Error:", error);
    return new Response(JSON.stringify([]), { status: 200 });
  }
}