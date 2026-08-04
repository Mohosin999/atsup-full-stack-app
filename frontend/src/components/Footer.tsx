import { Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-900 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                CV
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Coach
                </span>
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed max-w-md">
              AI-powered resume analysis and generation platform helping job
              seekers land their dream careers with optimized, ATS-friendly
              resumes.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-green-600">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Features", "How It Works", "Testimonials", "Pricing"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-700 hover:text-green-600 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-green-600">Legal</h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-700 hover:text-green-600 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 CVCoach. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-gray-700 hover:text-green-600 transition-colors text-sm"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
