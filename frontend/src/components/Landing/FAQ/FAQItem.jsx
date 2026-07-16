import { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <h3 className="text-xl font-semibold text-slate-900">
          {question}
        </h3>

        <div className="text-blue-600 text-lg">
          {open ? <FaMinus /> : <FaPlus />}
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ${
          open
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 text-slate-600 leading-8">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;