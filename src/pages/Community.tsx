import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import BrandingSection from "@/components/BrandingSection";
import ClientSignup from "@/components/ClientSignup";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Community</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Join our trading community and learn from experts
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-12">
        <BrandingSection />
        <TestimonialsCarousel />

        {/* CTA */}
        <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display-hero text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to Join?</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto font-light">
              Get access to premium signals, analysis, and mentorship
            </p>
            <ClientSignup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
