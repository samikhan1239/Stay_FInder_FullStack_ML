"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

export default function ListingReviews({
  property,
  reviews,
  reviewsLoading,
  showReviews,
  setShowReviews,
  user,
  newReview,
  setNewReview,
  handleReviewSubmit,
  router,
}) {
  const safeReviews = reviews || [];
  const rating = property?.rating?.toFixed(1) || "0.0";

  // Order: positive → neutral → negative
  const orderedReviews = [
    ...safeReviews.filter((r) => r.sentiment === "positive"),
    ...safeReviews.filter((r) => r.sentiment === "neutral"),
    ...safeReviews.filter((r) => r.sentiment === "negative"),
  ];

  // ⭐ SHOW ONLY 5 INITIALLY
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleReviews = orderedReviews.slice(0, visibleCount);

  const toggleVisibleReviews = () => {
    if (visibleCount >= orderedReviews.length) {
      setVisibleCount(5);
    } else {
      setVisibleCount(orderedReviews.length);
    }
  };

  const getSentimentStyle = (sentiment) => {
    if (sentiment === "positive")
      return "bg-green-50 text-green-700";
    if (sentiment === "negative")
      return "bg-red-50 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const getRatingLabel = (ratingValue) => {
    if (ratingValue >= 4.5) return "Excellent";
    if (ratingValue >= 4) return "Very Good";
    if (ratingValue >= 3) return "Good";
    if (ratingValue >= 2) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="border-t pt-16 mt-16">
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        
        {/* HEADER */}
        <button
          onClick={() => setShowReviews(!showReviews)}
          className="w-full flex items-center justify-between px-6 py-6 text-left hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-5">

            {/* Rating Badge */}
            <div className="flex items-center gap-1 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-sm">
              {rating}
              <Star size={18} fill="white" />
            </div>

            {/* Title + Meta */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Reviews
              </h3>
              <p className="text-gray-600 mt-1">
                {safeReviews.length} reviews •{" "}
                <span className="font-medium text-gray-800">
                  {getRatingLabel(property?.rating || 0)}
                </span>
              </p>
            </div>
          </div>

          {showReviews ? (
            <ChevronUp size={28} />
          ) : (
            <ChevronDown size={28} />
          )}
        </button>

        {/* CONTENT */}
        {showReviews && (
          <div className="px-6 pb-10 pt-2 bg-gray-50 space-y-14">

            {/* ⭐ RATING BREAKDOWN */}
           {/* ⭐ RATING BREAKDOWN - Aligned + Colorful */}
{safeReviews.length > 0 && (
  <div className="py-10">
    <div className="grid md:grid-cols-[220px_1fr] gap-12 items-center">

      {/* LEFT SIDE */}
      <div className="flex flex-col justify-center">
       <div className="flex items-center justify-center gap-3">
  <span className="text-6xl font-bold text-gray-900 leading-none">
    {rating}
  </span>
  <Star className="w-8 h-8 fill-amber-500 text-amber-500 mt-1" />
</div>

        <p className="text-gray-600 mt-3 text-lg px-11">
          {safeReviews.length} reviews
        </p>

        <p className="text-sm font-medium text-gray-500 mt-1 px-12">
          {getRatingLabel(property?.rating || 0)}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = safeReviews.filter(
            (r) => r.rating === star
          ).length;

          const percentage =
            safeReviews.length > 0
              ? (count / safeReviews.length) * 100
              : 0;

          // 🎨 Color by star level
          const colorMap = {
            5: "bg-green-500",
            4: "bg-lime-500",
            3: "bg-amber-500",
            2: "bg-orange-500",
            1: "bg-red-500",
          };

          return (
            <div key={star} className="flex items-center gap-4">

              {/* Star Label */}
              <div className="w-14 flex items-center gap-1 text-sm font-medium text-gray-700">
                {star}
                <Star className="w-4 h-4 fill-gray-700 text-gray-700" />
              </div>

              {/* Bar */}
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`${colorMap[star]} h-full rounded-full transition-all duration-700`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Count */}
              <div className="w-8 text-right text-sm font-medium text-gray-700">
                {count}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  </div>
)}
            {/* LOADING */}
            {reviewsLoading && (
              <p className="text-gray-500">Loading reviews...</p>
            )}

            {/* NO REVIEWS */}
            {!reviewsLoading && orderedReviews.length === 0 && (
              <p className="text-gray-600">
                No reviews yet. Be the first to share your experience.
              </p>
            )}
            {visibleReviews.map((review) => (
  <div
    key={review._id}
    className="pb-12"
  >
    <div className="flex justify-between items-start gap-6">

      {/* LEFT SIDE */}
      <div className="flex items-start gap-4 flex-1">
        <Image
          src={
    user?.avatar ||
    `https://api.dicebear.com/7.x/initials/png?seed=${user?.name || user?.email || "Guest"}&backgroundColor=ff385c`
  }
          alt="User"
          width={48}
          height={48}
          className="rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-semibold text-gray-900">
              {review.user?.email?.split("@")[0] || "Guest"}
            </p>

            <span className="text-sm text-gray-400">·</span>

            <p className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString(
                "en-US",
                { month: "long", year: "numeric" }
              )}
            </p>
          </div>

          <div className="flex gap-1 mt-2">
            {Array(review.rating)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-amber-500 text-amber-500"
                />
              ))}
          </div>

          <p className="text-gray-700 leading-relaxed mt-4 max-w-2xl">
            {review.comment}
          </p>
        </div>
      </div>

      {review.sentiment && (
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getSentimentStyle(
            review.sentiment
          )}`}
        >
          {review.sentiment.charAt(0).toUpperCase() +
            review.sentiment.slice(1)}
        </span>
      )}
    </div>
  </div>
))}

            {/* REVIEWS LIST */}
            {!reviewsLoading && orderedReviews.length > 0 && (
              <div className="space-y-14">
             

                {/* SHOW MORE / LESS BUTTON */}
              {orderedReviews.length > 5 && (
  <div className="text-center mt-6">
    <button
      onClick={toggleVisibleReviews}
      className="text-red-500 font-medium hover:underline transition"
    >
      {visibleCount >= orderedReviews.length
        ? "Show less"
        : `Show all ${orderedReviews.length} reviews`}
    </button>
  </div>
)}
              </div>
            )}

            {/* ADD REVIEW */}
            <div className="border-t pt-14">
              <h3 className="text-2xl font-semibold mb-8">
                Share your experience
              </h3>

              {user ? (
                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-8 max-w-2xl"
                >
                  <select
                    value={newReview.rating}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        rating: Number(e.target.value),
                      })
                    }
                    className="w-full border-b border-gray-300 pb-2 focus:outline-none focus:border-amber-500 text-gray-700"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>

                  <textarea
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Tell future guests what stood out during your stay..."
                    className="w-full border-b border-gray-300 pb-3 focus:outline-none focus:border-amber-500 resize-none"
                  />

                  <button
                    type="submit"
                   className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-sm focus:ring-2 focus:ring-red-500"
                  >
                    Submit review
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="underline text-black"
                >
                  Sign in to leave a review
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}