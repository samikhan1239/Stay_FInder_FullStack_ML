import { connectToDatabase } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";

/* =========================
   GET ALL LISTINGS
========================= */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const location = searchParams.get("location");
    const price = searchParams.get("price");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const hostId = searchParams.get("hostId");

    const query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (price && !isNaN(price)) {
      query.price = { $lte: parseInt(price) };
    }

    if (hostId) {
      if (!ObjectId.isValid(hostId)) {
        return new Response(
          JSON.stringify({ message: "Invalid hostId" }),
          { status: 400 }
        );
      }
      query.hostId = new ObjectId(hostId);
    }

    const { db } = await connectToDatabase();
    let listings = await db.collection("listings").find(query).toArray();

    /* ===== FILTER BOOKED DATES ===== */
    if (checkIn && checkOut) {
      const bookedListings = await db
        .collection("bookings")
        .find({
          $or: [
            {
              checkIn: { $lte: new Date(checkOut) },
              checkOut: { $gte: new Date(checkIn) },
            },
          ],
        })
        .toArray();

      const bookedIds = bookedListings.map((b) =>
        b.listingId.toString()
      );

      listings = listings.filter(
        (l) => !bookedIds.includes(l._id.toString())
      );
    }

    return new Response(JSON.stringify(listings), { status: 200 });
  } catch (error) {
    console.error("Listings GET Error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}

/* =========================
   CREATE LISTING
========================= */
export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const data = await req.json();

    const {
      title,
      description,
      location,
      price,
      image,
      amenities,
      details,
    } = data;

    if (!title || !description || !location || !price || !image) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (isNaN(price) || parseInt(price) <= 0) {
      return new Response(
        JSON.stringify({ message: "Invalid price" }),
        { status: 400 }
      );
    }

    const propertyDetails = {
      guests: parseInt(details?.guests) || 1,
      bedrooms: parseInt(details?.bedrooms) || 1,
      beds: parseInt(details?.beds) || 1,
      bathrooms: parseInt(details?.bathrooms) || 1,
    };

    const { db } = await connectToDatabase();

    const result = await db.collection("listings").insertOne({
      title,
      description,
      location,
      price: parseInt(price),
      image,
      amenities: amenities || [],
      details: propertyDetails,
      hostId: new ObjectId(user._id),
      createdAt: new Date(),
      status: "Active",
    });

    return new Response(
      JSON.stringify({
        message: "Listing created successfully",
        listingId: result.insertedId,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Listings POST Error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}
