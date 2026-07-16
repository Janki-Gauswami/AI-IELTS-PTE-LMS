import LoginBanner from "../../components/Auth/LoginBanner";
import LoginForm from "../../components/Auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center px-6 py-10">

        <div className="grid lg:grid-cols-2 gap-12 w-full">

          {/* Left Side */}

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            <LoginForm />

          </div>

          {/* Right Side */}

          <LoginBanner />

        </div>

      </div>

    </div>
  );
};

export default LoginPage;