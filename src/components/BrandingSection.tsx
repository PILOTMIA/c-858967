
import { Heart, TrendingUp, Users, Award } from "lucide-react";

const BrandingSection = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl text-white border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Heart className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold">Why Men In Action LLC?</h2>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        Founded by a father and mentor, Men In Action LLC exists to turn everyday traders into consistent winners. 
        We combine real-time tools, mentorship, and a mindset-first approach that builds legacy — not just profits.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">Proven Track Record</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Community Focused</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">Mentorship First</span>
        </div>
      </div>
    </div>
  );
};

export default BrandingSection;
