import HeroSlider from "../components/HeroSlider";
import { connectToDatabase } from "../lib/db";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedDestinationsSection from "@/components/FeaturedDestinationSection";
import CallToActionSection from "@/components/CallToActionSection";
import ListingsSection from "@/components/ListingsSection";

export default async function Home() {
  const { db } = await connectToDatabase();

  const listings = await db
    .collection("listings")
    .find({})
    .limit(6)
    .toArray();

  // ✅ SERIALIZE MONGODB DATA
  const safeListings = listings.map((item) => ({
    ...item,
    _id: item._id.toString(),
    hostId: item.hostId?.toString(),
    createdAt: item.createdAt?.toISOString(),
  }));

  return (
    <div className="overflow-hidden">
      <HeroSlider />
      <CategoriesSection />
      <FeaturedDestinationsSection />
      <ListingsSection listings={safeListings} />
      <CallToActionSection />
    </div>
  );
}