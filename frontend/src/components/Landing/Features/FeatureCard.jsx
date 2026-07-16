const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={`
      group
      relative
      overflow-hidden
      rounded-3xl
      bg-white
      border
      border-slate-200
      p-8
      shadow-lg
      hover:shadow-2xl
      hover:-translate-y-2
      transition-all
      duration-500
      ${className}
      `}
    >
      {/* Background Glow */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-cyan-400/20 transition-all duration-500"></div>

      {/* Icon */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg">
        <Icon className="text-3xl" />
      </div>

      <h3 className="mt-8 text-3xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-5 text-slate-600 leading-8">
        {description}
      </p>

      <button className="mt-8 font-semibold text-blue-600 group-hover:translate-x-2 transition-all">
        Explore →
      </button>
    </div>
  );
};

export default FeatureCard;