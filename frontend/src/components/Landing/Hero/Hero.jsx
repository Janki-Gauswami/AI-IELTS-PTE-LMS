import { Link } from "react-router-dom";
import HeroImage from "../../../assets/images/heroimg.png";
import { FaCheckCircle, FaPlayCircle } from "react-icons/fa";

const Hero = () => {
  return (
    <section
      id="home"
      className="bg-gradient-to-b from-sky-50 via-white to-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}

          <div>

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-5 py-2 text-blue-700 font-semibold text-sm">

              ⭐ Trusted by 5,000+ Students

            </div>

            {/* Heading */}

            <h1 className="mt-8 text-5xl lg:text-7xl font-black leading-tight text-slate-900">

              Master IELTS &
              <span className="text-blue-600"> PTE </span>

              <br />

              with AI-Powered
              <br />

              Learning

            </h1>

            {/* Description */}

            <p className="mt-8 text-xl text-slate-600 leading-9 max-w-xl">

              Personalized study plans, AI band prediction,
              mock examinations, analytics and expert guidance —
              everything you need to achieve your dream score.

            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-5">

              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-8 py-4 text-white font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </Link>

              <button
                className="flex items-center gap-3 rounded-xl border border-slate-300 px-8 py-4 font-semibold hover:bg-slate-100 transition"
              >
                <FaPlayCircle className="text-blue-600 text-xl" />
                Watch Demo
              </button>

            </div>

            {/* Highlights */}

            <div className="mt-10 flex flex-col gap-4 text-slate-700">

              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                AI Band Prediction
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                1000+ Practice Questions
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-500" />
                Expert Teacher Support
              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative">

            {/* Glow */}

            <div className="absolute -top-10 -left-10 h-72 w-72 rounded-full bg-blue-300/20 blur-[100px]"></div>

            <img
              src={HeroImage}
              alt="Hero"
              className="relative z-10 w-full"
            />

          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;