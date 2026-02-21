import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

/* =========================
   GET SINGLE LISTING
========================= */
export async function GET(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX

    if (!id || !ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid listing ID" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const listing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(id) });

    if (!listing) {
      return new Response(
        JSON.stringify({ message: "Listing not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(listing), { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE LISTING
========================= */
export async function PUT(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX

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

    const data = await req.json();
    const {
      title,
      description,
      location,
      price,
      image,
      amenities,
      details,
      status,
    } = data;

    const updateFields = {};

    if (title !== undefined) {
      if (typeof title !== "string")
        return new Response(JSON.stringify({ message: "Invalid title" }), { status: 400 });
      updateFields.title = title;
    }

    if (description !== undefined) {
      if (typeof description !== "string")
        return new Response(JSON.stringify({ message: "Invalid description" }), { status: 400 });
      updateFields.description = description;
    }

    if (location !== undefined) {
      if (typeof location !== "string")
        return new Response(JSON.stringify({ message: "Invalid location" }), { status: 400 });
      updateFields.location = location;
    }

    if (price !== undefined) {
      if (isNaN(price) || price <= 0)
        return new Response(JSON.stringify({ message: "Invalid price" }), { status: 400 });
      updateFields.price = parseInt(price);
    }

    if (image !== undefined) {
      if (typeof image !== "string")
        return new Response(JSON.stringify({ message: "Invalid image URL" }), { status: 400 });
      updateFields.image = image;
    }

    if (amenities !== undefined) {
      if (!Array.isArray(amenities))
        return new Response(JSON.stringify({ message: "Invalid amenities" }), { status: 400 });
      updateFields.amenities = amenities;
    }

    if (details !== undefined) {
      if (
        typeof details !== "object" ||
        isNaN(details.guests) ||
        isNaN(details.bedrooms) ||
        isNaN(details.beds) ||
        isNaN(details.bathrooms) ||
        details.guests < 1 ||
        details.bedrooms < 1 ||
        details.beds < 1 ||
        details.bathrooms < 1
      ) {
        return new Response(JSON.stringify({ message: "Invalid details" }), {
          status: 400,
        });
      }

      updateFields.details = {
        guests: parseInt(details.guests),
        bedrooms: parseInt(details.bedrooms),
        beds: parseInt(details.beds),
        bathrooms: parseInt(details.bathrooms),
      };
    }

    if (status !== undefined) {
      if (!["Active", "Draft"].includes(status))
        return new Response(JSON.stringify({ message: "Invalid status" }), { status: 400 });
      updateFields.status = status;
    }

    if (Object.keys(updateFields).length === 0) {
      return new Response(
        JSON.stringify({ message: "No fields to update" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("listings").updateOne(
      {
        _id: new ObjectId(id),
        hostId: new ObjectId(user._id),
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Listing updated successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}

/* =========================
   DELETE LISTING
========================= */
export async function DELETE(req, context) {
  try {
    const { id } = await context.params; // ✅ FIX

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

    const { db } = await connectToDatabase();

    const result = await db.collection("listings").deleteOne({
      _id: new ObjectId(id),
      hostId: new ObjectId(user._id),
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Listing deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return new Response(
      JSON.stringify({ message: "Something went wrong" }),
      { status: 500 }
    );
  }
}
