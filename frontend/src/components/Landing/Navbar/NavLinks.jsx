const NavLinks = () => {
  return (
    <ul className="hidden lg:flex items-center gap-12 text-2xl font-medium">
      <li>
        <a
          href="#home"
          className="hover:text-sky-500 transition duration-300"
        >
          Home
        </a>
      </li>

      <li>
        <a
          href="#features"
          className="hover:text-sky-500 transition duration-300"
        >
          Features
        </a>
      </li>

      <li>
        <a
          href="#about"
          className="hover:text-sky-500 transition duration-300"
        >
          About
        </a>
      </li>
      <li>
        <a
          href="#faqs"
          className="hover:text-sky-500 transition duration-300"
        >
          FAQs
        </a>
      </li>
      <li>
        <a
          href="#contact"
          className="hover:text-sky-500 transition duration-300"
        >
          Contact
        </a>
      </li>
    </ul>
  );
};

export default NavLinks;