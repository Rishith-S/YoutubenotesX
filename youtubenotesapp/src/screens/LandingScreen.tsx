import {
  ArrowRight,
  CheckCircle2,
  LayoutIcon,
  Play,
  Pause,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const LandingScreen = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsLoggedIn(!!accessToken && accessToken.length > 0);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black">
      <header className="border-b fixed border-zinc-800/50 backdrop-blur-sm w-full z-50 bg-zinc-950/80">
        <div className="mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center text-white gap-2 font-display font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            NoteTube
          </div>
          <div
            onClick={() => navigate(isLoggedIn ? "/home" : "/auth")}
            className="flex items-center cursor-pointer text-white hover:text-zinc-100 bg-red-50 hover:bg-red-700 p-2 px-4 rounded-md gap-4"
          >
            <button className="text-sm font-bold transition-colors">
              {isLoggedIn ? "Dashboard" : "Sign In"}
            </button>
          </div>
        </div>
      </header>

      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-8">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Supabase</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
              Turn Video Content <br />
              Into <span className="text-zinc-50">Knowledge</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              The minimalist workspace for serious learners. Take rich markdown
              notes on YouTube videos, organize them into playlists, and use AI
              to summarize key points instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(isLoggedIn ? "/home" : "/auth")}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:scale-105 hover:-translate-y-0.5"
              >
                {isLoggedIn ? "Go to Dashboard" : "Start Learning Now"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl font-semibold transition-all"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>

        <div className="py-24 bg-zinc-900/30 border-y border-zinc-800/50 my-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <FeatureCard
                icon={ListChecks}
                title="Progress Tracking"
                description="Mark videos as complete and track your learning journey across entire playlists. Stay organized and motivated."
              />
              <FeatureCard
                icon={LayoutIcon}
                title="Rich Notes Editor"
                description="Write in Markdown with a split-screen view. Your notes stay synced with the video for context."
              />
              <FeatureCard
                icon={Play}
                title="Smart Playlists"
                description="Organize your learning path. Group related videos into playlists and track your progress."
              />
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 justify-center gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-zinc-100 mb-6">
                Study smarter, not harder
              </h2>
              <div className="space-y-4">
                <BenefitItem text="Distraction-free YouTube playlist learning" />
                <BenefitItem text="No ads, no recommendations, pure focus" />
                <BenefitItem text="Split-screen video + notes for active learning" />
                <BenefitItem text="Custom playlists tailored to your curriculum" />
                <BenefitItem text="Track progress with checkmarks per video" />
                <BenefitItem text="Rich markdown editor with code blocks & tables" />
                <BenefitItem text="Auto-save notes synced to the cloud" />
                <BenefitItem text="Multiple view modes: theater, split, default" />
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl relative" id="demo">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-zinc-500/20 rounded-2xl blur opacity-30" />
              <div className="aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden relative z-10 group">
                <video 
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted
                  playsInline
                >
                  <source src="/youtubenotes.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={togglePlayPause}
                    className="w-16 h-16 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-700 hover:bg-black/90 transition-all hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white fill-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="py-12 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-sm mb-4">
          © {new Date().getFullYear()} NoteTube. Built with React & Supabase.
        </p>
        <div className="flex justify-center gap-6 text-sm text-zinc-600">
          <a
            href="https://github.com/Rishith-S/YoutubenotesX"
            className="hover:text-zinc-400"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-start p-0.5 bg-gradient-to-br from-red-500/30 via-red-950/20 to-zinc-800/40 rounded-2xl">
    <div className="flex flex-col items-start p-6 w-full h-full bg-black rounded-2xl transition-colors">
      <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
        <Icon className="w-6 h-6 text-red-50" />
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
    <span className="text-zinc-300">{text}</span>
  </div>
);

export default LandingScreen;
