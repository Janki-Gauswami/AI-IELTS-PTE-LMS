import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100">

      <h1 className="text-6xl font-bold text-red-600">
        403
      </h1>

      <p className="mt-4 text-xl text-slate-700">
        You are not authorized to access this page.
      </p>

      <Link
        to="/"
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Back to Home
      </Link>

    </div>
  );
};

export default Unauthorized;