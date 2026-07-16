import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";

const Contact = () => {
  return (
    <section
      id="contact"
      className="py-28 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Contact Us
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900">
            Get In Touch
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600 leading-8">
            Have questions about our AI IELTS & PTE Learning Platform?
            We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>

        </div>

        {/* Content */}

        <div className="mt-20 grid lg:grid-cols-2 gap-12">

          {/* Contact Information */}

          <div className="bg-white rounded-3xl shadow-lg p-10">

            <h3 className="text-3xl font-bold mb-8">
              Contact Information
            </h3>

            <div className="space-y-8">

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Address
                  </h4>

                  <p className="text-slate-600">
                    Ahmedabad, Gujarat, India
                  </p>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaEnvelope className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Email
                  </h4>

                  <p className="text-slate-600">
                    support@flyhigh.com
                  </p>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaPhoneAlt className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Phone
                  </h4>

                  <p className="text-slate-600">
                    +91 98765 43210
                  </p>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FaClock className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg">
                    Working Hours
                  </h4>

                  <p className="text-slate-600">
                    Monday - Saturday
                    <br />
                    9:00 AM - 7:00 PM
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Contact Form */}

          <div className="bg-white rounded-3xl shadow-lg p-10">

            <form className="space-y-6">

              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                placeholder="Your Email"
                className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                rows="6"
                placeholder="Write your message..."
                className="w-full rounded-xl border border-slate-300 p-4 outline-none resize-none focus:ring-2 focus:ring-blue-500"
              ></textarea>

              <button
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;