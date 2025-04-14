import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import FacilitiesSection from "@/components/home/FacilitiesSection";

export default function home() {
    return (
        <div className="min-h-screen">
            <HeroSection />
            <ServicesSection />
            <UpcomingEvents />
            <FacilitiesSection />
        </div>
    );
}
