
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import BrandingSection from "@/components/BrandingSection";
import ClientSignup from "@/components/ClientSignup";

const Community = () => {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-gray-300">Join our trading community and learn from experts</p>
        </div>

        {/* Branding */}
        <BrandingSection />

        {/* Testimonials */}
        <TestimonialsCarousel />

        {/* Signup CTA */}
        <div className="bg-gray-900 p-8 rounded-lg text-center border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
          <p className="text-gray-300 mb-6">Get access to premium signals, analysis, and mentorship</p>
          <ClientSignup />
        </div>
      </div>
    </div>
  );
};

export default Community;
