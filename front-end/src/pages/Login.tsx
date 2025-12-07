import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../components/common/PageMeta";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bgUrl = `${
    import.meta.env.BASE_URL
  }images/background/login_background.jpg`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: call auth service
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // <-- CHANGED: compute active states to adjust input padding so floated label has space -->
  const isUsernameActive = focusedField === "username" || !!username;
  const isPasswordActive = focusedField === "password" || !!password;

  return (
    <>
      <PageMeta
        title="Đăng nhập | NetBrew"
        description="Đăng nhập vào NetBrew"
      />
      <div
        className="min-h-screen flex items-center justify-center relative bg-center bg-cover"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-10 sm:p-12">
            <div className="flex flex-col items-center mb-8">
              <img
                src={`${import.meta.env.BASE_URL}images/logo/logo-icon.svg`}
                alt="NetBrew logo"
                className="w-24 h-24 object-contain mb-4"
              />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Welcome to NetBrew
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username field */}
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full h-12 px-6 rounded-full border border-[#d6c7ba] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#7a3e20] focus:border-[#7a3e20] transition-all ${
                    isUsernameActive ? "pt-5" : "pt-3"
                  }`}
                />
                <label
                  htmlFor="username"
                  className={`absolute left-6 transition-all duration-150 pointer-events-none select-none ${
                    isUsernameActive
                      ? "top-2 text-xs font-medium text-[#7a3e20] translate-y-0"
                      : "top-1/2 text-base text-gray-500 -translate-y-1/2"
                  }`}
                >
                  Username
                </label>
              </div>

              {/* Password field */}
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={`w-full h-12 px-6 rounded-full border border-[#d6c7ba] placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#7a3e20] focus:border-[#7a3e20] transition-all ${
                    isPasswordActive ? "pt-5" : "pt-3"
                  }`}
                />
                <label
                  htmlFor="password"
                  className={`absolute left-6 transition-all duration-150 pointer-events-none select-none ${
                    isPasswordActive
                      ? "top-2 text-xs font-medium text-[#7a3e20] -translate-y-0"
                      : "top-1/2 text-base text-gray-500 -translate-y-1/2"
                  }`}
                >
                  Password
                </label>
              </div>

              <div className="flex items-center justify-end text-sm">
                <Link
                  to="/forgot-password"
                  className="text-[#6a2f12] hover:underline"
                >
                  Quên mật khẩu
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 rounded-full bg-[#452302] text-white font-semibold hover:bg-[#5a2f03] transition-colors disabled:opacity-60"
              >
                {loading ? "Đang đăng nhập..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
