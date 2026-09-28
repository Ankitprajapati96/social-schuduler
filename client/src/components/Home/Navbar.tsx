import { Link } from "react-router-dom";
import { ArrowRightIcon, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
            <Zap className="size-4 fill-white text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            PostPulse
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
          <a href="#features" className="hover:text-slate-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">
            Pricing
          </a>
        </div>

        {user ? (
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-all"
          >
            Go to Dashboard <ArrowRightIcon className="size-3.5" />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-xs transition-all"
            >
              Get Started <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}