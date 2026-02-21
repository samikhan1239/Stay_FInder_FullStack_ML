"use client";

import { Heart } from "lucide-react";
import Image from "next/image";

export default function FeaturedDestinationsSection() {
  const featuredDestinations = [
    {
      id: 1,
      name: "Mumbai, India",
      image:
        "https://images.pexels.com/photos/13371115/pexels-photo-13371115.jpeg",
      properties: "2,000+ stays",
      description: "The city that never sleeps",
    },
    {
      id: 2,
      name: "Bangalore, India",
      image:
        "https://images.pexels.com/photos/1809808/pexels-photo-1809808.jpeg",
      properties: "1,500+ stays",
      description: "India’s Silicon Valley",
    },
    {
      id: 3,
      name: "Hyderabad, India",
      image:
        "https://images.pexels.com/photos/21382500/pexels-photo-21382500.jpeg",
      properties: "1,800+ stays",
      description: "City of pearls and heritage",
    },
    {
      id: 4,
      name: "Delhi, India",
      image:
        "https://images.pexels.com/photos/6776756/pexels-photo-6776756.jpeg",
      properties: "2,500+ stays",
      description: "Historic capital with modern vibes",
    },
    {
      id: 5,
      name: "Chennai, India",
      image:
        "https://images.pexels.com/photos/4553622/pexels-photo-4553622.jpeg",
      properties: "1,200+ stays",
      description: "Coastal charm and rich culture",
    },
    {
      id: 6,
      name: "Kolkata, India",
      image:
        "https://images.pexels.com/photos/12504366/pexels-photo-12504366.jpeg",
      properties: "1,300+ stays",
      description: "City of joy and heritage",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Trending Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Popular places our guests love to explore, handpicked for
            unforgettable experiences
          </p>
        </div>

        {/* Moving Row */}
        <div className="relative">
          <div className="flex gap-8 animate-scroll w-max">
            {[...featuredDestinations, ...featuredDestinations].map(
              (destination, index) => (
                <div
                  key={index}
                  className="min-w-[280px] group"
                >
                  <div className="relative overflow-hidden rounded-3xl aspect-[4/5]">
                    <Image
                      src={destination.image}
                      alt={destination.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="280px"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-bold mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {destination.description}
                      </p>
                    </div>

                    <div className="absolute top-6 right-6">
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Animation Style */}
      <style jsx>{`
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }

        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}