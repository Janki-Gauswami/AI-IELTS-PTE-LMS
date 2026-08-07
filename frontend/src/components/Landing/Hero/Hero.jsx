import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaPlay,
  FaBrain,
  FaChartLine,
  FaMicrophoneAlt,
  FaBookOpen,
  FaRobot,
} from "react-icons/fa";
import "./Hero.css";

const Hero = () => {
  return (
    <section
      id="home"
      className="hero-section relative overflow-hidden bg-white"
    >
      {/* Background */}

      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>
      <div className="hero-grid"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 min-h-[calc(100vh-80px)] flex items-center">

        <div className="grid lg:grid-cols-2 gap-20 items-center w-full">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-5 py-2">

              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>

              <span className="font-medium text-blue-700">

                AI Powered IELTS & PTE Platform

              </span>

            </div>

            <h1 className="mt-8 text-5xl lg:text-7xl font-black leading-tight text-slate-900">

              Learn Smarter

              <br />

              with

              <span className="hero-gradient">

                {" "}Artificial Intelligence

              </span>

            </h1>

            <p className="mt-8 max-w-xl text-lg leading-9 text-slate-600">

              Personalized study plans, AI Band Prediction,
              Speaking Evaluation, Analytics and Expert Mentorship—
              everything you need to achieve your dream score.

            </p>

            <div className="mt-10 flex flex-wrap gap-5">

              <Link
                to="/login"
                className="group rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl"
              >

                Get Started

                <FaArrowRight className="inline ml-2 transition-transform group-hover:translate-x-1" />

              </Link>

              <button
                className="rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold transition hover:bg-slate-50"
              >

                <FaPlay className="inline mr-2 text-blue-600" />

                Watch Demo

              </button>

            </div>

            {/* Stats */}

            <div className="mt-14 grid grid-cols-3 gap-8">

              <div>

                <h2 className="text-3xl font-bold text-blue-600">

                  50K+

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Practice Questions

                </p>

              </div>

              <div>

                <h2 className="text-3xl font-bold text-cyan-600">

                  8.5+

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Avg. Band Score

                </p>

              </div>

              <div>

                <h2 className="text-3xl font-bold text-purple-600">

                  95%

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  Success Rate

                </p>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="relative flex justify-center items-center">

            {/* AI Core */}

            <div className="hero-core">

              <div className="hero-ring hero-ring-1"></div>

              <div className="hero-ring hero-ring-2"></div>

              <div className="hero-ring hero-ring-3"></div>

              <div className="hero-center">

                <FaRobot className="text-6xl text-white" />

              </div>

            </div>

            {/* Card */}

            <div className="feature-card card-top-left">

              <FaBrain className="text-blue-600 text-3xl" />

              <h3>AI Prediction</h3>

              <span>Band 8.5</span>

            </div>

            <div className="feature-card card-top-right">

              <FaChartLine className="text-green-600 text-3xl" />

              <h3>Analytics</h3>

              <span>82% Progress</span>

            </div>

            <div className="feature-card card-bottom-left">

              <FaMicrophoneAlt className="text-red-500 text-3xl" />

              <h3>Speaking</h3>

              <span>Realtime Feedback</span>

            </div>

            <div className="feature-card card-bottom-right">

              <FaBookOpen className="text-purple-600 text-3xl" />

              <h3>Study Planner</h3>

              <span>Daily Goals</span>

            </div>

          </div>

        </div>

      </div>

      {/* Scroll */}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">

        <div className="scroll-indicator"></div>

      </div>

    </section>
  );
};

export default Hero;