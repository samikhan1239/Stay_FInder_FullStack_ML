// app/listings/[id]/page.jsx
"use client";
import RecommendedProperties from "../../../components/RecommendedProperties";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import BookingForm from "../../../components/BookingForm";
import ItineraryPlanner from "../../../components/ItineraryPlanner";
import {
  Star,
  Heart,
  Share,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Utensils,
  Car,
  Users,
  BedDouble,
  Bath,
  ChevronDown,
  ChevronUp,
  Waves,
  Dumbbell,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Skeleton Components ────────────────────────────────────────────────

function GallerySkeleton() {
  return (
    <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[21/9] mb-10 shadow-xl bg-gray-200 animate-pulse" />
  );
}

function HeaderSkeleton() {
  return (
    <div className="mb-6 space-y-5 animate-pulse">
      <div className="h-12 w-4/5 bg-gray-200 rounded" />
      <div className="flex flex-wrap gap-6">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded ml-auto" />
      </div>
    </div>
  );
}

function InfoSkeleton() {
  return (
    <div className="flex flex-wrap gap-6 lg:gap-8 pb-8 border-b border-gray-200 animate-pulse">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="h-8 w-32 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

function SectionTitleSkeleton({ width = "w-64" }) {
  return <div className={`h-10 ${width} bg-gray-200 rounded mb-5 animate-pulse`} />;
}

function ReviewsHeaderSkeleton() {
  return (
    <div className="px-8 py-7 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
        <div className="space-y-3">
          <div className="h-10 w-32 bg-gray-300 rounded" />
          <div className="h-5 w-64 bg-gray-300 rounded" />
        </div>
      </div>
      <div className="w-10 h-10 bg-gray-300 rounded-full" />
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="mt-20">
      <div className="h-10 w-72 bg-gray-200 rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function ListingDetails() {
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);                    // main + host
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [allListings, setAllListings] = useState([]);

  const router = useRouter();
  const params = useParams();

  // Fetch all listings for fallback
  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => setAllListings(data))
      .catch(() => console.log("Failed to load listings"));
  }, []);

  // Fetch ML recommendations
  useEffect(() => {
    if (!params?.id) return;
    setRecLoading(true);

    fetch(`/api/ml/recommendations/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("ML Recommendations:", data);
        if (Array.isArray(data)) {
          setRecommended(data);
        }
      })
      .catch(() => console.log("Failed to load ML recommendations"))
      .finally(() => setRecLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!params?.id) {
      setError("Invalid listing ID");
      setLoading(false);
      return;
    }

    fetch(`/api/listings/${params.id}`)
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (res.ok) setListing(data);
        else setError(data.message || "Failed to load listing");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));

    setReviewsLoading(true);
    fetch(`/api/listings/${params.id}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setUser(data))
        .catch(() => {});
    }
  }, [params.id]);

  useEffect(() => {
    if (!listing?.hostId) return;
    fetch(`/api/users/${listing.hostId}`)
      .then((res) => res.json())
      .then(setHost)
      .catch(() => toast.error("Failed to load host"));
  }, [listing]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to leave a review");
      router.push("/login");
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    try {
      const res = await fetch(`/api/listings/${params.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(newReview),
      });

      const data = await res.json();

      if (res.ok) {
        setReviews([...reviews, { ...data, user: { email: user.email } }]);
        setNewReview({ rating: 5, comment: "" });
        toast.success("Review submitted!");
        setShowReviews(true);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // ─── Loading / Error states ────────────────────────────────────────────
const isStillLoading = loading || (listing && !host);

  if (isStillLoading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-8 pt-8 pb-20">
          <HeaderSkeleton />
          <GallerySkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
            <div className="lg:col-span-8 xl:col-span-9 space-y-12">
              <InfoSkeleton />
              <div>
                <SectionTitleSkeleton />
                <div className="space-y-4 animate-pulse">
                  <div className="h-6 w-full bg-gray-200 rounded" />
                  <div className="h-6 w-full bg-gray-200 rounded" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
              <div>
                <SectionTitleSkeleton width="w-80" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-pulse">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="h-8 w-40 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
              <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                <ReviewsHeaderSkeleton />
              </div>
            </div>
          </div>
          <RecommendationSkeleton />
        </div>
      </div>
    );
  }

  // Only after everything important finished → check for real errors
  if (error) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center text-red-600 text-xl font-medium px-6">
          {error}
        </div>
      </div>
    );
  }

  // Only show this when we know listing & host both exist (or definitively don't)
  if (!listing || !host) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center text-gray-700 text-xl font-medium">
          Listing not found
        </div>
      </div>
    );
  }
  const property = {
    ...listing,
    host: {
      name: host.name || "Host",
      avatar:
        host.avatar ||
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
      verified: host.verified || false,
    },
    amenities:
      listing.amenities?.map((n, i) => ({
        name: n,
        icon: [Waves, Wifi, Utensils, Car, Dumbbell][i % 5] || Wifi,
      })) || [
        { name: "Wi-Fi", icon: Wifi },
        { name: "Kitchen", icon: Utensils },
        { name: "Parking", icon: Car },
      ],
    details: {
      guests: listing.details?.guests || 4,
      bedrooms: listing.details?.bedrooms || 1,
      beds: listing.details?.beds || 1,
      bathrooms: listing.details?.bathrooms || 1,
    },
    images: listing.images?.length ? listing.images : ["/fallback-house.jpg"],
    rating:
      typeof listing.rating === "number"
        ? listing.rating
        : null,
    reviewsCount: listing.reviews || reviews.length,
  };

  const safeReviews = reviews || [];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-8 pt-8 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            {property.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-700">
            {property.rating !== "New" && (
              <div className="flex items-center gap-1.5 font-medium">
                <Star className="w-5 h-5 fill-current text-amber-500" />
                {property.rating}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5" />
              {property.location}
            </div>
            <div className="ml-auto flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Share size={18} />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Heart size={18} />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden aspect-[4/3] lg:aspect-[21/9] mb-10 shadow-xl">
          {property?.images?.[0] ? (
            <Image
              src={property.image} // fixed typo: was property.image
              alt={property?.title || "Property image"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-500 text-sm">No Image Available</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          {/* Main content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-12">
            {/* Basics */}
            <div className="flex flex-wrap gap-6 lg:gap-8 text-lg text-gray-700 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Users size={20} />
                {property.details.guests} guests
              </div>
              <div className="flex items-center gap-2">
                <BedDouble size={20} />
                {property.details.bedrooms} bedroom{property.details.bedrooms !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                <Bath size={20} />
                {property.details.bathrooms} bathroom{property.details.bathrooms !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-3xl font-bold mb-5">About this place</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-3xl font-bold mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 text-base">
                    <item.icon className="w-6 h-6 text-gray-600" />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews – collapsible section, before Itinerary */}
            <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="w-full flex items-center justify-between px-8 py-7 text-left hover:bg-gray-50 transition"
              >
                {reviewsLoading ? (
                  <div className="flex items-center gap-5 w-full animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-9 w-32 bg-gray-300 rounded" />
                      <div className="h-5 w-48 bg-gray-300 rounded" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <Star className="w-8 h-8 fill-amber-500 text-amber-500" />
                      <span className="text-3xl font-bold text-gray-900">
                        {typeof property.rating === "number"
                          ? property.rating.toFixed(1)
                          : "5"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {safeReviews.length} Reviews
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Real experiences from verified guests
                      </p>
                    </div>
                  </div>
                )}

                {showReviews ? (
                  <ChevronUp size={30} className="text-gray-500" />
                ) : (
                  <ChevronDown size={30} className="text-gray-500" />
                )}
              </button>

              {showReviews && (
                <div className="px-8 pb-12 pt-4 bg-gray-50">
                  {/* RATING SUMMARY SECTION */}
                  <div className="grid md:grid-cols-3 gap-12 mb-14">
                    {/* LEFT BIG RATING */}
                    <div className="flex flex-col items-center justify-center border-r md:pr-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-10 h-10 fill-amber-500 text-amber-500" />
                        <span className="text-6xl font-extrabold text-gray-900">
                          {property.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-lg">
                        Overall Rating
                      </p>
                    </div>

                    {/* RIGHT BREAKDOWN */}
                    <div className="md:col-span-2 space-y-4">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = safeReviews.filter(r => r.rating === star).length
                        const percent =
                          safeReviews.length > 0
                            ? (count / safeReviews.length) * 100
                            : 0

                        return (
                          <div key={star} className="flex items-center gap-4">
                            <span className="w-14 text-sm font-medium text-gray-700">
                              {star} ★
                            </span>

                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-3 bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            <span className="w-8 text-sm text-gray-600 text-right">
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* REVIEWS GRID */}
                  {safeReviews.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg py-10">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-12">
                      {(showAllReviews ? safeReviews : safeReviews.slice(0, 6)).map((review) => (
                        <div
                          key={review._id}
                          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <Image
                              src={
                                review.user?.avatar ||
                                "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
                              }
                              alt=""
                              width={56}
                              height={56}
                              className="rounded-full object-cover"
                            />

                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                {review.user?.email?.split("@")[0] || "Guest"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Stars */}
                          <div className="flex gap-1 mb-4">
                            {Array(review.rating)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-5 h-5 fill-amber-500 text-amber-500"
                                />
                              ))}
                          </div>

                          <p className="text-gray-700 leading-relaxed text-base">
                            {review.comment}
                          </p>

                          {/* AI Sentiment Badge */}
                          {review.sentiment && (
                            <span
                              className={`inline-block mt-5 px-4 py-1.5 text-xs font-medium rounded-full ${
                                review.sentiment === "positive"
                                  ? "bg-green-100 text-green-700"
                                  : review.sentiment === "negative"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              AI Insight: {review.sentiment}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {safeReviews.length > 6 && (
                    <div className="text-center mt-10">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="px-6 py-2.5 border border-amber-600 text-amber-700 rounded-lg hover:bg-amber-50 transition font-medium"
                      >
                        {showAllReviews
                          ? "Show fewer reviews"
                          : `Show all ${safeReviews.length} reviews`}
                      </button>
                    </div>
                  )}

                  {/* ADD REVIEW CARD */}
                  <div className="mt-16 bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
                    <h4 className="text-2xl font-bold text-gray-900 mb-8">
                      Share Your Experience
                    </h4>

                    {user ? (
                      <form onSubmit={handleReviewSubmit} className="space-y-8 max-w-3xl">
                        <div>
                          <label className="block mb-3 font-medium text-gray-800">
                            Your Rating
                          </label>
                          <select
                            value={newReview.rating}
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                rating: Number(e.target.value),
                              })
                            }
                            className="w-full sm:w-60 px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                          >
                            {[5, 4, 3, 2, 1].map((n) => (
                              <option key={n} value={n}>
                                {n} stars
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block mb-3 font-medium text-gray-800">
                            Your Review
                          </label>
                          <textarea
                            rows={5}
                            value={newReview.comment}
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                comment: e.target.value,
                              })
                            }
                            placeholder="Tell future guests what stood out during your stay..."
                            className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-sm"
                        >
                          Submit Review
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-700 text-lg mb-6">
                          Sign in to leave a review
                        </p>
                        <button
                          onClick={() => router.push("/login")}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
                        >
                          Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Itinerary */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowItinerary(!showItinerary)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="text-2xl font-bold">Plan your itinerary</h3>
                  <p className="text-gray-600 mt-1">Get ideas for activities, transport & more</p>
                </div>
                {showItinerary ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
              </button>

              {showItinerary && (
                <div className="px-6 pb-6 pt-2 bg-gray-50">
                  <ItineraryPlanner location={property.location} listingId={listing._id} />
                </div>
              )}
            </div>

            {/* Booking form – after itinerary */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 lg:p-8 mt-12">
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <span className="text-4xl lg:text-5xl font-bold text-gray-900">
                    ₹{property.price}
                  </span>
                  <span className="text-xl text-gray-600"> / night</span>
                </div>
                {property.rating !== "New" && (
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-current text-amber-500" />
                    <span className="text-2xl font-semibold">{property.rating}</span>
                  </div>
                )}
              </div>

              <BookingForm
                listingId={listing._id}
                price={listing.price}
                maxGuests={property.details.guests}
              />

              <p className="text-center text-sm text-gray-500 mt-6">
                You won't be charged yet • Secure booking • Free cancellation available
              </p>
            </div>
          </div>

          {/* Right sidebar – empty or optional small content */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-8">
              {/* You can add small trust badges or host info here if needed */}
            </div>
          </div>
        </div>

        {/* Recommended Properties */}
        <h1 className="text-4xl font-bold text-gray-900 mt-20 mb-8">More places to explore</h1>

        {recLoading ? (
          <RecommendationSkeleton />
        ) : (
          <RecommendedProperties 
            properties={recommended}
            currentListingId={listing?._id}
            fallbackProperties={allListings}
          />
        )}
      </div>
    </div>
  );
}