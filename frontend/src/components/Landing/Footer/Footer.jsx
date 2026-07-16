import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white">

      {/* Top Footer */}

      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-4 md:grid-cols-2 gap-12">

        {/* Brand */}

        <div>

          <h2 className="text-4xl font-black text-white">
            FlyHigh
          </h2>

          <p className="mt-6 text-slate-400 leading-8">
            FlyHigh is an AI-powered IELTS & PTE Learning
            Management System that helps students prepare
            smarter with AI, analytics, mock tests and
            personalized learning.
          </p>

          <div className="flex gap-4 mt-8">

            <a
              href="#"
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="#"
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-500 transition"
            >
              <FaLinkedinIn />
            </a>

            <a
              href="#"
              className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gray-600 transition"
            >
              <FaGithub />
            </a>

          </div>

        </div>

        {/* Quick Links */}

        <div>

          <h3 className="text-2xl font-bold mb-6">
            Quick Links
          </h3>

          <ul className="space-y-4 text-slate-400">

            <li>
              <a href="#home" className="hover:text-white transition">
                Home
              </a>
            </li>

            <li>
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
            </li>

            <li>
              <a href="#about" className="hover:text-white transition">
                Why Choose Us
              </a>
            </li>

            <li>
              <a href="#faqs" className="hover:text-white transition">
                FAQs
              </a>
            </li>

            <li>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </li>

          </ul>

        </div>

        {/* Modules */}

        <div>

          <h3 className="text-2xl font-bold mb-6">
            Modules
          </h3>

          <ul className="space-y-4 text-slate-400">

            <li>IELTS Preparation</li>

            <li>PTE Preparation</li>

            <li>AI Band Prediction</li>

            <li>Mock Tests</li>

            <li>Analytics Dashboard</li>

            <li>AI Study Planner</li>

          </ul>

        </div>

        {/* Contact */}

        <div>

          <h3 className="text-2xl font-bold mb-6">
            Contact
          </h3>

          <div className="space-y-6">

            <div className="flex gap-4">

              <FaMapMarkerAlt className="text-blue-400 mt-1" />

              <p className="text-slate-400">
                Ahmedabad,
                <br />
                Gujarat, India
              </p>

            </div>

            <div className="flex gap-4">

              <FaEnvelope className="text-blue-400 mt-1" />

              <p className="text-slate-400">
                support@flyhigh.com
              </p>

            </div>

            <div className="flex gap-4">

              <FaPhoneAlt className="text-blue-400 mt-1" />

              <p className="text-slate-400">
                +91 98765 43210
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom Footer */}

      <div className="border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-slate-500 text-center">
            © {new Date().getFullYear()} FlyHigh AI IELTS & PTE LMS.
            All Rights Reserved.
          </p>

          <div className="flex gap-8 text-slate-500">

            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;