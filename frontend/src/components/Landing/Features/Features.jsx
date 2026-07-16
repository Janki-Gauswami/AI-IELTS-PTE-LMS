import FeatureCard from "./FeatureCard";

import {
  FaBrain,
  FaChartLine,
  FaBookOpen,
  FaHeadphones,
  FaClipboardCheck,
  FaRobot,
} from "react-icons/fa";

const Features = () => {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-28"
    >
      {/* Background Blur */}

      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-300/20 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-sky-700">
            AI Powered Platform
          </span>

          <h2 className="mt-8 text-6xl font-bold text-slate-900">
            Everything You Need
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-slate-600">
            One intelligent platform for IELTS & PTE preparation,
            combining AI, analytics, practice tests, and personalized
            learning into a single experience.
          </p>

        </div>

        {/* Bento Grid */}

        <div className="mt-24 grid auto-rows-[280px] gap-8 lg:grid-cols-3">

          <FeatureCard
            icon={FaBrain}
            title="AI Band Prediction"
            description="Predict your IELTS & PTE score with machine learning."
            className="lg:row-span-2"
          />

          <FeatureCard
            icon={FaHeadphones}
            title="IELTS Practice"
            description="Listening, Reading, Writing & Speaking in one place."
          />

          <FeatureCard
            icon={FaClipboardCheck}
            title="PTE Practice"
            description="Practice with AI-powered instant feedback."
          />

          <FeatureCard
            icon={FaBookOpen}
            title="Learning Management"
            description="Videos, notes, assignments and mock tests."
            className="lg:col-span-2"
          />

          <FeatureCard
            icon={FaRobot}
            title="AI Study Planner"
            description="Daily personalized study schedule."
          />

          <FeatureCard
            icon={FaChartLine}
            title="Analytics Dashboard"
            description="Track strengths, weaknesses and performance trends."
          />

        </div>

      </div>
      {/* Target Countries */}

<div className="mt-28">

  <div className="text-center">

    <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
      Study Abroad
    </span>

    <h2 className="mt-6 text-5xl font-bold text-slate-900">
      Target Countries
    </h2>

    <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
      Prepare for English proficiency exams required for studying,
      working, and immigrating to the world's most popular destinations.
    </p>

  </div>

  <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

    {[
      "Canada",
      "Australia",
      "United Kingdom",
      "United States",
      "New Zealand",
    ].map((country) => (
      <div
        key={country}
        className="
          group
          rounded-2xl
          bg-white
          border
          border-slate-200
          shadow-md
          p-6
          text-center
          hover:-translate-y-2
          hover:border-blue-500
          hover:shadow-xl
          transition-all
          duration-300
        "
      >
        <div className="text-5xl mb-4">
          {{
            Canada: "🇨🇦",
            Australia: "🇦🇺",
            "United Kingdom": "UK",
            "United States": "🇺🇸",
            "New Zealand": "🇳🇿",
          }[country]}
        </div>

        <h3 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition">
          {country}
        </h3>
      </div>
    ))}

  </div>

</div>
    </section>
    
  );
};

export default Features;