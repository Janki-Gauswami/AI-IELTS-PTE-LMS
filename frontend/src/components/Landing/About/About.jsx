import USPCard from "./USPCard";

import {
  FaBrain,
  FaChartLine,
  FaBullseye,
  FaBookOpen,
} from "react-icons/fa";

const About = () => {
  return (
    <section
      id="about"
      className="py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}

          <div>

            <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full uppercase text-sm font-semibold tracking-widest">
              Why Choose Us
            </span>

            <h2 className="mt-8 text-6xl font-bold leading-tight">
              Learn Smarter.
              <br />
              Score Higher.
            </h2>

            <p className="mt-8 text-xl leading-9 text-slate-600">
              FlyHigh combines Artificial Intelligence,
              structured learning, mock examinations,
              performance analytics and personalized
              study plans into one powerful platform
              for IELTS and PTE preparation.
            </p>

            <button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition">
              Get Started
            </button>

          </div>

          {/* Right */}

          <div className="grid md:grid-cols-2 gap-8">

            <USPCard
              icon={FaBrain}
              title="AI Learning"
              description="Personalized recommendations based on your performance."
            />

            <USPCard
              icon={FaChartLine}
              title="Performance Analytics"
              description="Track your progress with detailed visual reports."
            />

            <USPCard
              icon={FaBullseye}
              title="Exam-Focused Practice"
              description="Real IELTS & PTE practice tests with AI feedback."
            />

            <USPCard
              icon={FaBookOpen}
              title="Complete Learning Hub"
              description="Access videos, assignments, mock tests and study materials."
            />

          </div>

        </div>

      </div>
    </section>
  );
};

export default About;