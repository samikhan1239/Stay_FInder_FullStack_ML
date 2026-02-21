"use client";

import { useState } from "react";
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

  const visibleReviews = showAll ? reviews : reviews.slice(0, 6);

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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to submit");
      }

      alert("Review submitted successfully!");
      setForm({ rating: 5, comment: "" });
    } catch (err) {
      alert("Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20 border-t pt-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
        <h2 className="text-3xl font-semibold text-gray-900">
          {typeof avgRating === "number" ? avgRating.toFixed(1) : avgRating}
          <span className="text-gray-500 font-normal ml-2">
            · {reviewCount} reviews
          </span>
        </h2>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="bg-gray-50 border rounded-2xl p-10 text-center">
          <p className="text-gray-600 text-lg font-medium">
            No reviews yet
          </p>
          <p className="text-gray-500 mt-2">
            Be the first to share your experience.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-14">
          {visibleReviews.map((review) => (
            <div key={review._id} className="space-y-4">
              {/* User */}
              <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-1">
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
              <p className="text-gray-700 leading-relaxed text-[15px]">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Show More */}
      {reviews.length > 6 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-10 px-6 py-3 border border-gray-900 rounded-xl font-medium hover:bg-gray-900 hover:text-white transition"
        >
          {showAll ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      )}

      {/* Review Form */}
      <div className="mt-20 max-w-2xl">
        <h3 className="text-2xl font-semibold mb-6">Leave a review</h3>

        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className="w-40 p-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                rows={5}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Share details of your experience..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 border rounded-2xl p-8 text-center">
            <p className="text-gray-600 mb-4">
              Please sign in to leave a review
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
