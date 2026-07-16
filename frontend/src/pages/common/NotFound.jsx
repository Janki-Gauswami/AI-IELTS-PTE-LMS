import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100">

      <h1 className="text-7xl font-bold text-blue-600">
        404
      </h1>

      <p className="mt-4 text-xl text-slate-700">
        Page Not Found
      </p>

      <Link
        to="/"
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Go Home
      </Link>

    </div>
  );
};

export default NotFound;