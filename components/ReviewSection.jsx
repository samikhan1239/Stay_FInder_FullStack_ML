"use client";

import { useState, useMemo } from "react";
import { Star, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewSection({
  reviews = [],
  avgRating = "New",
  reviewCount = 0,
  listingId,
  currentUser = null,
}) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 8);

  // 🔥 AI Insight Grouping (basic logic, replace with API sentiment later)
  const sentimentGroups = useMemo(() => {
    return {
      positive: reviews.filter((r) => r.rating >= 4),
      neutral: reviews.filter((r) => r.rating === 3),
      negative: reviews.filter((r) => r.rating <= 2),
    };
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please sign in to leave a review");
      return;
    }

    if (form.comment.trim().length < 15) {
      alert("Comment must be at least 15 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to submit");

      alert("Review submitted successfully!");
      setForm({ rating: 5, comment: "" });
    } catch {
      alert("Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-24 border-t pt-16">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-14">
        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">
            {typeof avgRating === "number"
              ? avgRating.toFixed(1)
              : avgRating}
          </h2>
          <p className="text-gray-500">
            {reviewCount} reviews
          </p>
        </div>
      </div>

      {/* AI INSIGHTS SUMMARY */}
      {reviews.length > 0 && (
        <div className="mb-16">
          <h3 className="text-xl font-semibold mb-6">Guest Insights</h3>

          <div className="grid md:grid-cols-3 gap-8 text-sm">

            <div>
              <p className="font-medium text-green-600">
                👍 Positive ({sentimentGroups.positive.length})
              </p>
              <p className="text-gray-500 mt-1">
                Guests loved the experience and rated it highly.
              </p>
            </div>

            <div>
              <p className="font-medium text-yellow-600">
                😐 Neutral ({sentimentGroups.neutral.length})
              </p>
              <p className="text-gray-500 mt-1">
                Guests had an average stay with mixed feedback.
              </p>
            </div>

            <div>
              <p className="font-medium text-red-600">
                👎 Needs Improvement ({sentimentGroups.negative.length})
              </p>
              <p className="text-gray-500 mt-1">
                Some guests reported issues during their stay.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* REVIEWS LIST */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-lg">
          No reviews yet. Be the first to share your experience.
        </p>
      ) : (
        <div className="space-y-12">
          {visibleReviews.map((review) => (
            <div key={review._id} className="border-b pb-10 last:border-none">

              {/* User Info */}
              <div className="flex items-center gap-4 mb-3">
                {review.user?.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-900">
                    {review.user?.email?.split("@")[0] || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 leading-relaxed max-w-2xl">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SHOW MORE */}
      {reviews.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-12 text-black font-medium underline underline-offset-4 hover:opacity-70 transition"
        >
          {showAll
            ? "Show fewer reviews"
            : `Show all ${reviews.length} reviews`}
        </button>
      )}

      {/* REVIEW FORM */}
      <div className="mt-24 max-w-2xl">
        <h3 className="text-2xl font-semibold mb-8">Leave a review</h3>

        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-8">

            <select
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
              className="w-40 p-3 border-b border-gray-300 focus:outline-none focus:border-amber-500"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} stars
                </option>
              ))}
            </select>

            <textarea
              rows={5}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full border-b border-gray-300 p-3 focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Share details of your experience..."
            />

            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>

          </form>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-black font-medium underline underline-offset-4"
          >
            Sign in to leave a review
          </button>
        )}
      </div>

    </section>
  );
}