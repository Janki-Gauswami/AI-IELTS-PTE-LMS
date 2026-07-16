import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/">
      <h1 className="text-5xl font-black text-black tracking-tight">
        FlyHigh
      </h1>
    </Link>
  );
};

export default Logo;