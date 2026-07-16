import FAQItem from "./FAQItem";

const faqs = [
  {
    question: "What is FlyHigh AI LMS?",
    answer:
      "FlyHigh is an AI-powered IELTS & PTE Learning Management System that helps students prepare smarter using AI-based learning, practice tests, analytics, and personalized study plans.",
  },
  {
    question: "Which exams are supported?",
    answer:
      "Our platform currently supports IELTS Academic, IELTS General Training, and PTE Academic preparation.",
  },
  {
    question: "How does AI Band Prediction work?",
    answer:
      "The platform analyzes your mock test performance, practice history, and skill-wise scores to estimate your expected IELTS or PTE band score.",
  },
  {
    question: "Can I practice Speaking and Writing?",
    answer:
      "Yes. Students can submit speaking recordings and writing responses. AI-assisted evaluation and teacher feedback help improve performance.",
  },
  {
    question: "Can teachers manage students?",
    answer:
      "Yes. Teachers can create batches, upload study materials, monitor progress, assign tests, and review student performance from their dashboard.",
  },
  {
    question: "Will my progress be saved?",
    answer:
      "Absolutely. Your tests, study plans, analytics, and learning progress are securely stored and available whenever you log in.",
  },
];

const FAQ = () => {
  return (
    <section
      id="faqs"
      className="bg-gradient-to-b from-slate-50 to-white py-28"
    >
      <div className="max-w-4xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
            FAQs
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-600">
            Everything you need to know about FlyHigh AI LMS and
            how it helps you prepare for IELTS and PTE.
          </p>

        </div>

        {/* FAQ List */}

        <div className="mt-16 space-y-5">

          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}

        </div>

      </div>
    </section>
  );
};

export default FAQ;