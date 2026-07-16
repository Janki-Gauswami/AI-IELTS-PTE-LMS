import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthInput = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  showPassword,
  setShowPassword,
}) => {
  return (
    <div className="mb-6">

      {/* Label */}

      <label className="block mb-2 text-sm font-semibold text-slate-700">
        {label}
      </label>

      {/* Input */}

      <div
        className={`flex items-center rounded-xl border transition-all duration-300
        ${
          error
            ? "border-red-500"
            : "border-slate-300 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
        }`}
      >

        {/* Left Icon */}

        {Icon && (
          <div className="px-4 text-slate-500">
            <Icon size={20} />
          </div>
        )}

        {/* Input Field */}

        <input
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent py-4 pr-4 outline-none"
        />

        {/* Password Toggle */}

        {type === "password" && (

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-4 text-slate-500 hover:text-blue-600 transition"
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>

        )}

      </div>

      {/* Error */}

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
};

export default AuthInput;