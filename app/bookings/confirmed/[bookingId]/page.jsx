"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";
import {
  CheckCircle2,
  CalendarDays,
  Clock3,
  UsersRound,
} from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function BookingConfirmed() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (booking) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, [booking]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please sign in to view this booking.");

        const bookingRes = await fetchWithAuth(`/api/bookings/${bookingId}`);
        if (!bookingRes.ok) {
          const err = await bookingRes.json();
          throw new Error(err.message || "Could not load booking");
        }
        const bookingData = await bookingRes.json();
        setBooking(bookingData);

        const listingRes = await fetchWithAuth(
          `/api/listings/${bookingData.listingId}`
        );
        if (!listingRes.ok) {
          const err = await listingRes.json();
          throw new Error(err.message || "Could not load property");
        }
        setListing(await listingRes.json());
      } catch (err) {
        setError(err.message || "Something went wrong");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) fetchData();
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <p className="text-gray-900 text-xl animate-pulse">
          Loading confirmation...
        </p>
      </div>
    );
  }

  if (error || !booking || !listing) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Something went wrong
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed 🎉
          </h1>

          <p className="text-lg text-gray-600">
            Your stay at{" "}
            <span className="font-semibold text-gray-900">
              {listing.title}
            </span>{" "}
            is successfully reserved.
          </p>
        </motion.div>

        {/* PROPERTY CARD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-16"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <img
              src={listing.image}
              alt={listing.title}
              className="w-full md:w-80 h-56 object-cover rounded-xl"
            />

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {listing.title}
              </h2>
              <p className="text-gray-600 mb-3">{listing.location}</p>
              <p className="text-xl font-bold text-gray-900">
                ₹{Number(booking.price).toLocaleString("en-IN")}
                <span className="text-sm font-normal text-gray-500">
                  {" "}total
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: CalendarDays,
              label: "Check-in",
              value: new Date(booking.checkIn).toLocaleDateString("en-IN"),
            },
            {
              icon: Clock3,
              label: "Check-out",
              value: new Date(booking.checkOut).toLocaleDateString("en-IN"),
            },
            {
              icon: UsersRound,
              label: "Guests",
              value: `${booking.guests} ${
                booking.guests === 1 ? "guest" : "guests"
              }`,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-200 p-6 rounded-2xl shadow-md"
            >
              <item.icon className="w-6 h-6 text-red-500 mb-3" />
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {item.label}
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            Go to Dashboard →
          </button>

          <button
            onClick={() => alert("Calendar integration coming soon")}
            className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
          >
            Add to Calendar
          </button>
        </div>

        <p className="text-center text-gray-500 mt-16">
          Confirmation email sent • Need help? Contact support anytime.
        </p>
      </div>
    </div>
  );
}