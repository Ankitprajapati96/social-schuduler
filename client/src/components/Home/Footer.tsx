import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const footerLinks = {
  Product: ["Features", "How it works", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export default function Footer() {
  return (
    <footer style={{ background: "#fafafa", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs">
                <Zap className="size-4 fill-white text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">PostPulse</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The modern social media pipeline that helps creators and teams automate, schedule, and grow with confidence.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-5 text-gray-600">{category}</div>
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} PostPulse. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Terms of Service
            </a>
            <Link to="/login" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}