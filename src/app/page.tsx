import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, GraduationCap, School, ChevronRight, BarChart3, ShieldCheck, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden font-sans selection:bg-primary/20">
      {/* Complex Gradient Background */}
      <div className="fixed inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-300/30 via-red-200/30 to-green-200/30 dark:from-blue-900/20 dark:via-red-900/20 dark:to-green-900/20 blur-3xl opacity-80" />
      <div className="fixed inset-0 -z-10 h-full w-full bg-white/30 dark:bg-black/30 backdrop-blur-[2px]" />

      <header className="px-6 h-16 flex items-center justify-between border-b border-white/20 bg-white/10 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-2 font-bold text-xl drop-shadow-sm">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 text-white">
            <School className="h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            SmartSchool
          </span>
        </div>
        <nav className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hover:bg-white/20">Login</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 relative">
          {/* Decorative blobs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

          <div className="space-y-6 max-w-4xl relative z-10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 bg-white/5 shadow-2xl transition-all hover:shadow-purple-500/10 hover:bg-white/10 duration-500">
            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-green-500/10 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4 border border-blue-200 dark:border-blue-800 animate-fade-in-up">
              Running a school made simple
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-purple-700 to-red-600 dark:from-blue-300 dark:via-purple-300 dark:to-red-300 animate-in slide-in-from-bottom-4 duration-700 drop-shadow-sm">
              Transform Your School Management
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300 animate-in slide-in-from-bottom-8 duration-700 delay-100 font-medium">
              A comprehensive platform to manage students, attendance, classes, and performance with ease.
              Designed for modern education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-in slide-in-from-bottom-12 duration-700 delay-200">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-xl shadow-green-500/20 transition-transform hover:-translate-y-1">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-transform hover:-translate-y-1">
                  Teacher Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container px-4 py-16 md:py-24 mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Student Management"
              description="Track student profiles, academic history, and contact details in one secure place."
              delay="0"
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-green-600" />}
              title="Smart Attendance"
              description="Mark and track attendance efficiently. Get automated reports and monthly insights."
              delay="100"
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-purple-600" />}
              title="Insightful Analytics"
              description="Visualize class performance and attendance trends with beautiful interactive charts."
              delay="200"
            />
          </div>
        </section>

        {/* Stats Section with Glowing Frames */}
        <section className="border-y border-white/20 bg-white/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse delay-500" />
          <div className="container px-4 py-16 mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <Stat number="1000+" label="Students" color="from-blue-500 via-blue-400 to-blue-500" />
              <Stat number="50+" label="Teachers" color="from-purple-500 via-purple-400 to-purple-500" />
              <Stat number="99%" label="Uptime" color="from-green-500 via-green-400 to-green-500" />
              <Stat number="24/7" label="Support" color="from-orange-500 via-orange-400 to-orange-500" />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/20 bg-white/20 backdrop-blur-lg">
        <div className="container px-4 mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} SmartSchool Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <div
      className="group p-6 rounded-2xl border border-white/40 bg-white/20 hover:bg-white/40 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="mb-4 p-3 rounded-full bg-white/50 w-fit group-hover:scale-110 transition-transform relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors relative z-10">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">{description}</p>
    </div>
  );
}

function Stat({ number, label, color }: { number: string, label: string, color: string }) {
  return (
    <div className="group relative p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/40 hover:shadow-lg hover:shadow-white/10">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
      <div className="space-y-2 relative z-10">
        <div className={`text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b ${color} drop-shadow-sm`}>
          {number}
        </div>
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">{label}</div>
      </div>
    </div>
  );
}
