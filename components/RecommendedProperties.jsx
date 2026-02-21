import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export default function RecommendedProperties({
  properties = [],              // ML properties
  fallbackProperties = [],      // Normal properties
  currentListingId,
}) {

  console.log("ML Properties:", properties);
  console.log("Fallback Properties:", fallbackProperties);
  console.log("Current ID:", currentListingId);

  // Remove current listing from ML results
  let recommendations = properties.filter(
    (p) => p._id !== currentListingId
  );

  let source = "ML Recommendations";

  // If ML empty → use fallback
  if (recommendations.length === 0 && fallbackProperties.length > 0) {
    recommendations = fallbackProperties.filter(
      (p) => p._id !== currentListingId
    );
    source = "Fallback Properties";
  }

  // Still empty → show message
  if (recommendations.length === 0) {
    return (
      <div className="mt-20 text-center text-gray-500">
        No recommendations available.
      </div>
    );
  }

  return (
    <section className="py-12 border-t border-gray-200">

      {/* 🔥 Debug Info UI (Remove later) */}
      <div className="mb-4 text-sm text-blue-600">
        Showing: <strong>{source}</strong> | 
        ML Count: {properties.length} | 
        Fallback Count: {fallbackProperties.length}
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold mb-8">
        More places to stay nearby
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.slice(0, 6).map((prop) => (
          <Link
            key={prop._id}
            href={`/listings/${prop._id}`}
            className="group block no-underline"
          >
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <Image
                src={
                  prop.image ||
                  prop.images?.[0] ||
                  "/placeholder-property.jpg"
                }
                alt={prop.title || "Property"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-1 px-1">
              <h3 className="font-medium text-gray-900 truncate">
                {prop.title || "Untitled"}
              </h3>

              <p className="text-gray-600 text-sm">
                {prop.location || "Unknown location"}
              </p>

              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-gray-700">
                  {prop.rating ? prop.rating.toFixed(1) : "New"}{" "}
                  {prop.reviews ? `· ${prop.reviews} reviews` : ""}
                </span>
              </div>

              <p className="font-medium text-gray-900">
                ₹{prop.price || "?"}
                <span className="text-gray-600 font-normal"> / night</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
