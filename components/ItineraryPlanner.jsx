"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function ItineraryPlanner({ location, listingId }) {
  const [preferences, setPreferences] = useState({
    interests: [],
    dining: [],
    duration: "1",
  });

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!location || !listingId) {
      setError("Missing location or listing ID");
      toast.error("Invalid listing data");
      setLoading(false);
      return;
    }

    if (
      preferences.interests.length === 0 ||
      preferences.dining.length === 0
    ) {
      setError("Please select at least one interest and dining preference");
      toast.error(
        "Please select at least one interest and dining preference"
      );
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          preferences: {
            ...preferences,
            duration: Number(preferences.duration),
          },
          listingId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setItinerary(data.itinerary);
        toast.success("Itinerary generated!");
      } else if (res.status === 429) {
        setError("Rate limit exceeded. Please try again later.");
        toast.error("Rate limit exceeded");
      } else if (res.status === 401) {
        setError("Invalid API configuration.");
        toast.error("Invalid API configuration");
      } else {
        setError(data.message || "Failed to generate itinerary");
        toast.error(data.message || "Failed to generate itinerary");
      }
    } catch (error) {
      console.error("ItineraryPlanner Error:", error);
      setError("Network error occurred. Please try again.");
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Plan Your Trip
      </h3>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className={`space-y-6 ${
          loading ? "pointer-events-none opacity-70" : ""
        }`}
      >
        {/* Interests */}
        <div>
          <label className="block text-gray-700 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-3">
            {["relaxation", "adventure", "history", "culture"].map(
              (interest) => (
                <label
                  key={interest}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    value={interest}
                    checked={preferences.interests.includes(
                      interest
                    )}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPreferences((prev) => ({
                        ...prev,
                        interests: prev.interests.includes(value)
                          ? prev.interests.filter(
                              (i) => i !== value
                            )
                          : [...prev.interests, value],
                      }));
                    }}
                    className="h-4 w-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="capitalize">{interest}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Dining */}
        <div>
          <label className="block text-gray-700 mb-2">
            Dining Preferences
          </label>
          <div className="flex flex-wrap gap-3">
            {["fine dining", "seafood", "local cuisine"].map(
              (dining) => (
                <label
                  key={dining}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    value={dining}
                    checked={preferences.dining.includes(
                      dining
                    )}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPreferences((prev) => ({
                        ...prev,
                        dining: prev.dining.includes(value)
                          ? prev.dining.filter(
                              (i) => i !== value
                            )
                          : [...prev.dining, value],
                      }));
                    }}
                    className="h-4 w-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="capitalize">{dining}</span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-700 mb-2">
            Trip Duration (days)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            inputMode="numeric"
            value={preferences.duration}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setPreferences({
                  ...preferences,
                  duration: "",
                });
                return;
              }

              const num = parseInt(value, 10);
              if (!isNaN(num) && num >= 1 && num <= 7) {
                setPreferences({
                  ...preferences,
                  duration: value,
                });
              }
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-200 disabled:opacity-80"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Your Trip...
            </>
          ) : (
            "Generate Itinerary"
          )}
        </button>
      </form>

      {/* Skeleton Loading */}
      {loading && (
        <div className="mt-6 space-y-6 animate-pulse">
          {[1, 2].map((day) => (
            <div
              key={day}
              className="border-t border-gray-200 pt-4 space-y-3"
            >
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Itinerary Result */}
      {itinerary && !loading && (
        <div className="mt-6 space-y-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Your Personalized Itinerary
          </h4>

          {itinerary.map((day) => (
            <div
              key={day.day}
              className="border-t border-gray-200 pt-4"
            >
              <h5 className="font-medium text-gray-900">
                {day.day}
              </h5>
              <ul className="mt-2 space-y-2">
                {day.schedule.map((item, index) => (
                  <li
                    key={index}
                    className="text-gray-700"
                  >
                    <span className="font-medium">
                      {item.time} - {item.name}
                    </span>
                    : {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}