"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ListingCard from "./ListingCard";

export default function ListingsSection({ listings }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % listings.length);
    }, 1800); // 🔥 Faster auto slide

    return () => clearInterval(interval);
  }, [listings.length]);

  const getPosition = (i) => {
    const position = (i - index + listings.length) % listings.length;

    if (position === 0) return "center";
    if (position === 1) return "right";
    if (position === 2) return "farRight";
    if (position === listings.length - 1) return "left";

    return "hidden";
  };

  return (
    <section className="py-28 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-4 lg:px-12">

        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Exceptional Stays
          </h2>
          <p className="text-lg text-gray-600">
            Handpicked properties that offer extraordinary experiences
          </p>
        </div>

        {/* Slider */}
        <div className="relative h-[520px] flex justify-center items-center">

          {listings.map((listing, i) => {
            const position = getPosition(i);

            const positions = {
              center: { x: 0, scale: 1, opacity: 1, zIndex: 30 },
              left: { x: -500, scale: 0.85, opacity: 0.8, zIndex: 20 },
              right: { x: 500, scale: 0.85, opacity: 0.8, zIndex: 20 },
              farRight: { x: 950, scale: 0.7, opacity: 0.6, zIndex: 10 },
              hidden: { opacity: 0, scale: 0.6, zIndex: 0 },
            };

            return (
              <motion.div
                key={listing._id.toString()}
                animate={positions[position]}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                }}
                className="absolute w-[360px] md:w-[420px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <ListingCard listing={listing} />
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}