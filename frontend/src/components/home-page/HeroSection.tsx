/* ===================================
Hero Section Component
=================================== */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Play,
  Users,
  CheckCircle,
  Shield,
  Zap,
} from "lucide-react";
import HeroUploadBox from "./HeroUploadBox";
import Wrapper from "../Wrapper";

interface HeroSectionProps {
  user: any;
  onLogout: () => void;
}

export default function HeroSection({ user, onLogout }: HeroSectionProps) {
  return (
    <section className="pt-28 md:pt-36 pb-24">
      <Wrapper>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
            >
              Turning Resume into{" "}
              <span className="text-cyan-600">Opportunities with AI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 text-base md:text-lg text-gray-700 max-w-xl"
            >
              Analyze your resume against job descriptions and receive
              actionable feedback. Build a professionally formatted resume with
              custom inputs that helps you stand out from the competition.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link to="/login" className="group gradient-btn-lg text-lg gap-2">
                Start Free Analysis{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="group text-lg px-8 py-4 gradient-btn-outline flex items-center justify-center gap-2 font-semibold"
              >
                <Play className="w-5 h-5" /> Watch Demo
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    <Users className="w-5 h-5" />
                  </motion.div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-gray-900">10,000+</p>
                <p className="text-gray-700">Happy Users</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-10 flex flex-wrap gap-6"
            >
              {[
                { icon: CheckCircle, text: "Free to start" },
                { icon: Shield, text: "Secure & Private" },
                { icon: Zap, text: "Instant Results" },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <item.icon className="w-4 h-4 text-cyan-500" /> {item.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <HeroUploadBox />
        </div>
      </Wrapper>
    </section>
  );
}
