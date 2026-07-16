const USPCard = ({ icon: Icon, title, description }) => {
  return (
    <div
      className="
      bg-white
      rounded-3xl
      p-8
      border
      border-slate-200
      shadow-md
      hover:shadow-xl
      hover:-translate-y-2
      transition-all
      duration-300
      "
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
        <Icon className="text-3xl text-blue-600" />
      </div>

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-4 text-slate-600 leading-7">
        {description}
      </p>
    </div>
  );
};

export default USPCard;