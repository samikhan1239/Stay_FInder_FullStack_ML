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
import ListingReviews from "@/components/ListingReviews";

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
    
<ListingReviews
  property={property}
  reviews={reviews}
  reviewsLoading={reviewsLoading}
  showReviews={showReviews}
  setShowReviews={setShowReviews}
  showAllReviews={showAllReviews}
  setShowAllReviews={setShowAllReviews}
  user={user}
  newReview={newReview}
  setNewReview={setNewReview}
  handleReviewSubmit={handleReviewSubmit}
  router={router}
/>
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