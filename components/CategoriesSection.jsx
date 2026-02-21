"use client";

export default function CategoriesSection() {
  const categories = [
    { name: "Beach", icon: "🏖️", count: "2,500+" },
    { name: "Mountains", icon: "⛰️", count: "1,800+" },
    { name: "Cities", icon: "🏙️", count: "3,200+" },
    { name: "Countryside", icon: "🌾", count: "1,200+" },
    { name: "Desert", icon: "🏜️", count: "800+" },
    { name: "Lake", icon: "🏞️", count: "950+" },
    { name: "Tropical", icon: "🌴", count: "1,600+" },
    { name: "Arctic", icon: "🏔️", count: "400+" },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white w-full">

      <div className="w-full px-8">

        {/* Header */}
   <div className="mb-16 text-center">
  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
    Explore by Category
  </h2>

  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
    Find stays that match your travel vibe — from peaceful mountains
    to vibrant city escapes.
  </p>
</div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {categories.map((category) => (
            <div
              key={category.name}
              className="group relative rounded-3xl p-8 cursor-pointer 
              bg-white/70 backdrop-blur-lg 
              border border-gray-200
              hover:shadow-2xl hover:-translate-y-3
              transition-all duration-500"
            >
              {/* Soft Glow Background */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-100/40 to-orange-100/40 opacity-0 group-hover:opacity-100 transition duration-500"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-6 transition-transform duration-500 group-hover:scale-125">
                  {category.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {category.count} stays
                </p>

                {/* Animated underline */}
                <div className="mt-5 h-[2px] w-0 bg-gray-900 transition-all duration-500 group-hover:w-12"></div>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}