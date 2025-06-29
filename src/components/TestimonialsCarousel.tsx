
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  profit: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Marcus Johnson",
    location: "Atlanta, GA",
    text: "Men In Action changed my trading game completely. From losing money to consistent 15% monthly returns. The mentorship is unmatched.",
    rating: 5,
    profit: "+$23,400"
  },
  {
    name: "David Rodriguez",
    location: "Phoenix, AZ",
    text: "Finally found a group that actually cares about your success. The signals are spot-on and the education is world-class.",
    rating: 5,
    profit: "+$18,750"
  },
  {
    name: "James Williams",
    location: "Dallas, TX",
    text: "Been trading for 3 years with mediocre results. 6 months with MIA and I'm already seeing 6-figure potential.",
    rating: 5,
    profit: "+$31,200"
  },
  {
    name: "Michael Chen",
    location: "Seattle, WA",
    text: "The community support and real-time analysis helped me turn my $5k account into $42k in 8 months.",
    rating: 5,
    profit: "+$37,000"
  }
];

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Client Success Stories</h3>
      <div className="relative">
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(currentTestimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-300 text-sm italic mb-3">"{currentTestimonial.text}"</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-semibold text-sm">{currentTestimonial.name}</p>
              <p className="text-gray-400 text-xs">{currentTestimonial.location}</p>
            </div>
            <div className="text-green-400 font-bold text-lg">
              {currentTestimonial.profit}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          <button 
            onClick={prevTestimonial}
            className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-sm px-2 py-1">
            {currentIndex + 1} / {testimonials.length}
          </span>
          <button 
            onClick={nextTestimonial}
            className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
