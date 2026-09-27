import { useState } from "react";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../../../api/axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg("Please enter your message.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/contact", formData);

      setSuccessMsg(
        res.data?.message ||
          "Thank you for contacting us! Your message has been sent to our team at gjanki410@gmail.com."
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact Form Error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Failed to send message. Please try again or reach out directly to gjanki410@gmail.com."
      );
    } finally {
      setLoading(false);
    }
  };

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
            We'd love to hear from you. Send us a message and our team will
            respond directly to you.
          </p>

        </div>

        {/* Content */}

        <div className="mt-20 grid lg:grid-cols-2 gap-12">

          {/* Contact Information */}

          <div className="bg-white rounded-3xl shadow-lg p-10">

            <h3 className="text-3xl font-bold mb-8 text-slate-900">
              Contact Information
            </h3>

            <div className="space-y-8">

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-slate-800">
                    Address
                  </h4>

                  <p className="text-slate-600">
                    Ahmedabad, Gujarat, India
                  </p>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <FaEnvelope className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-slate-800">
                    Email
                  </h4>

                  <a
                    href="mailto:gjanki410@gmail.com"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    gjanki410@gmail.com
                  </a>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <FaPhoneAlt className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-slate-800">
                    Phone
                  </h4>

                  <p className="text-slate-600">
                    +91 98765 43210
                  </p>
                </div>

              </div>

              <div className="flex gap-5">

                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <FaClock className="text-blue-600 text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-slate-800">
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

            <h3 className="text-3xl font-bold mb-3 text-slate-900">
              Send a Message
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Inquiries are forwarded directly to <span className="font-semibold text-blue-600">gjanki410@gmail.com</span>.
            </p>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm">
                <FaCheckCircle className="text-emerald-600 text-lg shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
                <FaExclamationCircle className="text-red-600 text-lg shrink-0 mt-0.5" />
                <div className="font-medium leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. IELTS Coaching Inquiry, Course Details"
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message *
                </label>
                <textarea
                  rows="5"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your inquiry or question here..."
                  className="w-full rounded-xl border border-slate-300 p-4 outline-none resize-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Sending to gjanki410@gmail.com...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;