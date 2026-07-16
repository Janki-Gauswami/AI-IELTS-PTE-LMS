import { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">

      <div className="max-w-7xl mx-auto h-24 flex items-center justify-between px-6 lg:px-10">

        {/* Logo */}

        <Link to="/">
          <h1 className="text-4xl lg:text-5xl font-black">
            FlyHigh
          </h1>
        </Link>

        {/* Desktop Navigation */}

        <ul className="hidden lg:flex items-center gap-12 text-xl font-medium">

          <li>
            <button
              onClick={() => scrollToSection("home")}
              className="hover:text-blue-600 transition"
            >
              Home
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-blue-600 transition"
            >
              Features
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-blue-600 transition"
            >
              About
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("faqs")}
              className="hover:text-blue-600 transition"
            >
              FAQs
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-blue-600 transition"
            >
              Contact
            </button>
          </li>

        </ul>

        {/* Desktop Buttons */}

        <div className="hidden lg:flex items-center gap-6">

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            Login
          </Link>

          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

        </div>

        {/* Mobile Button */}

        <button
          className="lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <HiOutlineX size={32} />
          ) : (
            <HiOutlineMenu size={32} />
          )}
        </button>

      </div>

      {/* Mobile Menu */}

      {isOpen && (

        <div className="lg:hidden bg-white shadow-lg border-t">

          <div className="flex flex-col p-6 gap-5">

            <button onClick={() => scrollToSection("home")}>
              Home
            </button>

            <button onClick={() => scrollToSection("features")}>
              Features
            </button>

            <button onClick={() => scrollToSection("about")}>
              About
            </button>

            <button onClick={() => scrollToSection("faqs")}>
              FAQs
            </button>

            <button onClick={() => scrollToSection("contact")}>
              Contact
            </button>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 font-semibold"
            >
              Login
            </Link>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 text-white py-3 rounded-xl text-center font-semibold"
            >
              Get Started
            </Link>

          </div>

        </div>

      )}

    </nav>
  );
};

export default Navbar;