import { connectToDatabase } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

const FLASK_URL =
  process.env.ML_API_URL || "https://sami123.pythonanywhere.com/sentiment-api";

/* ==========================
   GET REVIEWS
========================== */
export async function GET(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ IMPORTANT FIX

    if (!id || !ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid listing ID" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const reviews = await db
      .collection("reviews")
      .aggregate([
        { $match: { listingId: new ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            "user.password": 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return new Response(JSON.stringify(reviews), { status: 200 });
  } catch (error) {
    console.error("GET reviews error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}

/* ==========================
   POST REVIEW
========================== */
export async function POST(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ IMPORTANT FIX

    if (!id || !ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid listing ID" }),
        { status: 400 }
      );
    }

    const user = await getUserFromToken(req);
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { rating, comment } = await req.json();

    if (
      !rating ||
      rating < 1 ||
      rating > 5 ||
      !comment ||
      comment.trim().length < 10
    ) {
      return new Response(
        JSON.stringify({ message: "Invalid input" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    /* 🧠 CALL ML API */
    let sentiment = "neutral";

    try {
      const mlResponse = await fetch(FLASK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: comment }),
      });

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        sentiment = mlData?.sentiment || "neutral";
      }
    } catch (err) {
      console.error("ML API error:", err.message);
    }

    /* SAVE REVIEW */
    const review = {
      listingId: new ObjectId(id),
      userId: new ObjectId(user._id),
      rating: parseInt(rating),
      comment: comment.trim(),
      sentiment,
      createdAt: new Date(),
    };

    const result = await db.collection("reviews").insertOne(review);

    /* UPDATE LISTING STATS */
    const stats = await db
      .collection("reviews")
      .aggregate([
        { $match: { listingId: new ObjectId(id) } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const avgRating = stats[0]?.avgRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    await db.collection("listings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          rating: Number(avgRating.toFixed(1)),
          reviews: totalReviews,
        },
      }
    );

    return new Response(
      JSON.stringify({
        _id: result.insertedId,
        rating: review.rating,
        comment: review.comment,
        sentiment: review.sentiment,
        createdAt: review.createdAt,
        user: { email: user.email },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST review error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}
