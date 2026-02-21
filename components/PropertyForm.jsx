"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../utils/api";
import {
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon, // Rename to avoid conflict with next/image
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Flame,
  Shield,
} from "lucide-react";

export default function PropertyForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    image: "",
    amenities: [],
    details: {
      guests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const amenitiesOptions = [
    { name: "WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Kitchen", icon: Utensils },
    { name: "Pool", icon: Waves },
    { name: "Gym", icon: Dumbbell },
    { name: "Fireplace", icon: Flame },
    { name: "Security", icon: Shield },
  ];
  const [predictedPrice, setPredictedPrice] = useState(null);
const [predictionReason, setPredictionReason] = useState("");
const [isPredicting, setIsPredicting] = useState(false);

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name.includes("details.")) {
    const field = name.split(".")[1];

    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value === "" ? "" : Number(value),
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

const handlePredictPrice = async () => {
  try {
    setIsPredicting(true);

    const response = await fetch("/api/ml/predict-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: formData.location,
        guests: formData.details.guests,
        bedrooms: formData.details.bedrooms,
        beds: formData.details.beds,
        bathrooms: formData.details.bathrooms,
        wifi: formData.amenities.includes("WiFi") ? 1 : 0,
        parking: formData.amenities.includes("Parking") ? 1 : 0,
        kitchen: formData.amenities.includes("Kitchen") ? 1 : 0,
        pool: formData.amenities.includes("Pool") ? 1 : 0,
        gym: formData.amenities.includes("Gym") ? 1 : 0,
        fireplace: formData.amenities.includes("Fireplace") ? 1 : 0,
        security: formData.amenities.includes("Security") ? 1 : 0,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Prediction failed");
    }

    // ✅ Update price field
    setFormData((prev) => ({
      ...prev,
      price: data.predicted_price,
    }));

    // ✅ Store explanation separately
    setPredictedPrice(data.predicted_price);
    setPredictionReason(data.reason || "Price estimated using location demand, property size, and selected amenities.");

    toast.success("AI Price Predicted Successfully!");

  } catch (error) {
    console.error(error);
    toast.error(error.message);
  } finally {
    setIsPredicting(false);
  }
};




  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.price ||
      !formData.image
    ) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
    if (isNaN(parseInt(formData.price)) || parseInt(formData.price) <= 0) {
      toast.error("Price must be a valid positive number");
      setIsLoading(false);
      return;
    }

    try {
      console.log("PropertyForm: Submitting form data:", formData);
      const res = await fetchWithAuth("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
        }),
      });
      const data = await res.json();
      console.log("PropertyForm: Listing creation response:", {
        status: res.status,
        data,
      });
      if (res.ok) {
        toast.success("Listing created successfully!");
        router.push("/dashboard/my-listings");
      } else {
        toast.error(data.message || "Failed to create listing");
      }
    } catch (error) {
      console.error("PropertyForm: Listing creation error:", error.message);
      toast.error("Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Property Details
      </h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <div className="relative">
          <Home
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt=""
          />
          <input
            type="text"
            name="title"
            placeholder="e.g., Luxury Villa with Ocean View"
            value={formData.title}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Describe your property..."
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32"
          required
        />
      </div>

      {/* Location */}
     <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Location
  </label>

  <div className="relative">
    <MapPin
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
    />

    <select
      name="location"
      value={formData.location}
      onChange={handleChange}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
      required
    >
      <option value="">Select Location</option>
      <option value="Mumbai">Mumbai</option>
      <option value="Delhi">Delhi</option>
      <option value="Bangalore">Bangalore</option>
      <option value="Hyderabad">Hyderabad</option>
      <option value="Chennai">Chennai</option>
      <option value="Kolkata">Kolkata</option>
    </select>
  </div>
</div>


   

      {/* Image URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <div className="relative">
          <ImageIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt="" // Add alt="" for decorative icon
          />
          <input
            type="text"
            name="image"
            placeholder="e.g., https://example.com/image.jpg"
            value={formData.image}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-4">
          {amenitiesOptions.map((amenity) => (
            <label key={amenity.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity.name)}
                onChange={() => handleAmenityChange(amenity.name)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <amenity.icon className="w-5 h-5 text-gray-600" alt="" />
              <span className="text-sm text-gray-700">{amenity.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Details
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Guests</label>
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.guests"
                value={formData.details.guests || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bedrooms</label>
            <div className="relative">
              <Bed
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.bedrooms"
                value={formData.details.bedrooms || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Beds</label>
            <div className="relative">
              <Bed
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.beds"
                value={formData.details.beds || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Bathrooms
            </label>
            <div className="relative">
              <Bath
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.bathrooms"
                value={formData.details.bathrooms || ""}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
        </div>
      </div>
   {/* Price */}
   <div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Price per Night (₹)
  </label>

  <div className="relative">
    <DollarSign
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
    />

    <input
      type="number"
      name="price"
      placeholder="e.g., 450"
      value={formData.price}
      onChange={handleChange}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      required
      min="1"
    />
  </div>

  {/* AI Predict Button */}
  <button
    type="button"
    onClick={handlePredictPrice}
    disabled={isPredicting}
    className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
  >
    {isPredicting ? "🤖 Predicting with AI..." : "✨ Predict Price with AI"}
  </button>

  {/* AI Result Section */}
  {predictedPrice && (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-700">
        🤖 AI Suggested Price: ₹{predictedPrice}
      </h3>

      <p className="text-sm text-gray-600 mt-2">
        {predictionReason ||
          "Price estimated based on location demand, property size, and selected amenities."}
      </p>
    </div>
  )}
</div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}
