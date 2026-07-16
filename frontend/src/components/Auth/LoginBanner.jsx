import {
  FaBrain,
  FaChartLine,
  FaGraduationCap,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";

const LoginBanner = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-10 text-white">

      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"></div>

      {/* Top Content */}
      <div className="relative z-10">

        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur">
          <FaRobot />
          AI Powered Platform
        </span>

        <h2 className="mt-8 text-5xl font-extrabold leading-tight">
          Your AI Coach
          <br />
          for IELTS & PTE
          <br />
          Success
        </h2>

        <p className="mt-6 max-w-md text-blue-100 leading-8">
          Prepare smarter with AI Band Prediction,
          personalized study plans, mock tests,
          analytics and expert guidance.
        </p>

      </div>

      {/* Stats */}
      <div className="relative z-10 mt-12 grid grid-cols-3 gap-4">

        <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
          <h3 className="text-3xl font-bold">50K+</h3>
          <p className="mt-2 text-sm text-blue-100">
            Students
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
          <h3 className="text-3xl font-bold">7.8</h3>
          <p className="mt-2 text-sm text-blue-100">
            Avg. Band
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
          <h3 className="text-3xl font-bold">98%</h3>
          <p className="mt-2 text-sm text-blue-100">
            Success Rate
          </p>
        </div>

      </div>

      {/* Features */}
      <div className="relative z-10 mt-12 space-y-5">

        <div className="flex items-center gap-4">
          <FaBrain className="text-cyan-300 text-xl" />
          <span>AI Band Prediction</span>
        </div>

        <div className="flex items-center gap-4">
          <FaGraduationCap className="text-cyan-300 text-xl" />
          <span>Personalized Study Planner</span>
        </div>

        <div className="flex items-center gap-4">
          <FaChartLine className="text-cyan-300 text-xl" />
          <span>Performance Analytics</span>
        </div>

        <div className="flex items-center gap-4">
          <FaCheckCircle className="text-cyan-300 text-xl" />
          <span>Real IELTS & PTE Mock Tests</span>
        </div>

      </div>

      {/* Floating Card 1 */}
      <div className="absolute top-20 right-10 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur shadow-xl">
        <p className="text-sm text-blue-100">
          AI Prediction
        </p>

        <h3 className="mt-1 text-3xl font-bold">
          Band 8.5
        </h3>
      </div>

      {/* Floating Card 2 */}
      <div className="absolute bottom-16 right-12 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur shadow-xl">
        <p className="text-sm text-blue-100">
          Weekly Progress
        </p>

        <h3 className="mt-1 text-3xl font-bold">
          +32%
        </h3>
      </div>

    </div>
  );
};

export default LoginBanner;