import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Menu,
  Timer,
  Target,
  Flag,
  BarChart3,
  LayoutTemplate
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-[100dvh] w-full overflow-x-hidden font-sans bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center justify-center">
              <FileText className="h-6 w-6 text-slate-800" />
              <span className="ml-2 text-[22px] font-bold tracking-tight text-slate-900 font-serif">MockPDF</span>
            </Link>
            <nav className="hidden md:flex gap-8 items-center mt-1">
              <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="#how-it-works">How it works</Link>
              <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="#features">Features</Link>
              <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="#pricing">Pricing</Link>
              <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="#contact">Contact</Link>
            </nav>
          </div>
          
          <div className="hidden md:flex items-center gap-5">
            <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50" href="/demo">Try Demo</Link>
            {session?.user ? (
              <>
                <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="/dashboard">Dashboard</Link>
                <Link href="/dashboard/create" className={buttonVariants({ variant: "default", className: "bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-5 h-[42px] text-[15px]" })}>
                  Create Mock Test
                </Link>
              </>
            ) : (
              <>
                <Link className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors" href="/login">Login</Link>
                <Link href="/login" className={buttonVariants({ variant: "default", className: "bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-5 h-[42px] text-[15px]" })}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger render={
              <button className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden text-slate-600" })}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </button>
            } />
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link className="text-lg font-semibold" href="#how-it-works">How it works</Link>
                <Link className="text-lg font-semibold" href="#features">Features</Link>
                <Link className="text-lg font-semibold" href="#pricing">Pricing</Link>
                <hr className="my-4" />
                <Link className="text-lg font-semibold" href="/demo">Try Demo</Link>
                {session?.user ? (
                  <>
                    <Link className="text-lg font-semibold" href="/dashboard">Dashboard</Link>
                    <Link href="/dashboard/create" className={buttonVariants({ variant: "default", className: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg mt-4 w-full" })}>
                      Create Mock Test
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="text-lg font-semibold" href="/login">Login</Link>
                    <Link href="/login" className={buttonVariants({ variant: "default", className: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm rounded-lg mt-4 w-full" })}>
                      Get Started
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
        
        {/* Hero Section */}
        <section className="w-full max-w-[1320px] px-6 lg:px-8 pt-16 md:pt-24 pb-16 flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-8 relative z-10">
          
          {/* Left Column: Text & CTA */}
          <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left mt-0 lg:mt-6">
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 mb-6">
              <span className="text-sm font-semibold text-blue-600">Smart. Fast. Exam Ready.</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-slate-900 font-serif leading-[1.05] max-w-[620px] mb-6">
              Turn Any Question Paper PDF Into a Mock Test
            </h1>
            
            <p className="text-lg text-slate-500 max-w-[500px] mb-8 leading-[1.6]">
              Upload your paper and answer key. Set the timer. Start practicing in a realistic exam environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
              <Link 
                href="/dashboard" 
                className={buttonVariants({ size: "lg", className: "bg-slate-900 hover:bg-slate-800 text-white h-[50px] px-8 rounded-xl text-base shadow-md w-full sm:w-auto transition-transform hover:-translate-y-0.5" })}
              >
                Create Mock Test <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                href="/demo" 
                className={buttonVariants({ size: "lg", variant: "outline", className: "h-[50px] px-8 rounded-xl text-base bg-white w-full sm:w-auto border-slate-200 hover:bg-slate-50 text-slate-700" })}
              >
                Try Demo
              </Link>
            </div>

            {/* Benefit Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:max-w-none">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900 mb-1">Upload any PDF</h4>
                <p className="text-[12px] text-slate-500 leading-tight">Upload your existing paper</p>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-3">
                  <Timer className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900 mb-1">Set your own timer</h4>
                <p className="text-[12px] text-slate-500 leading-tight">Practice under exam conditions</p>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900 mb-1">Custom marking</h4>
                <p className="text-[12px] text-slate-500 leading-tight">Positive + negative marks</p>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-[13px] font-semibold text-slate-900 mb-1">Instant results</h4>
                <p className="text-[12px] text-slate-500 leading-tight">Know how you performed</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Preview */}
          <div className="w-full lg:w-[60%] xl:w-[65%] max-w-[900px]">
            <div className="w-full rounded-[20px] border border-slate-200/80 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
              {/* Browser chrome */}
              <div className="h-[52px] bg-white border-b flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-700 font-serif font-bold text-[15px]">
                    <FileText className="h-4 w-4" /> MockPDF
                  </div>
                  <div className="h-4 w-px bg-slate-200 mx-1"></div>
                  <div className="text-[13px] font-medium text-slate-600 hidden sm:block">GATE CSE 2025 - Mock Test 1</div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
                    Question 15 of 65
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden ml-1"><div className="h-full bg-blue-500 w-[23%]"></div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-slate-400" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 leading-none">Time Remaining</span>
                      <span className="text-[13px] font-bold text-slate-700 leading-none mt-0.5">02:55:20</span>
                    </div>
                  </div>
                  <button className="bg-red-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded flex-shrink-0">Submit Test</button>
                </div>
              </div>
              
              {/* Simulated UI */}
              <div className="h-auto sm:h-[550px] w-full flex flex-col sm:flex-row bg-[#f8f9fa] relative overflow-hidden">
                {/* Left PDF Area */}
                <div className="flex-1 bg-[#323639] h-[250px] sm:h-auto flex flex-col items-center overflow-hidden shrink-0">
                  <div className="h-10 w-full bg-[#202124] flex items-center px-4 justify-between text-xs text-white/80 shrink-0">
                    <span>Page 12 / 34</span>
                    <div className="flex items-center gap-3 bg-black/20 px-2 py-1 rounded">
                      <span>-</span> <span>120%</span> <span>+</span>
                    </div>
                  </div>
                  <div className="w-[90%] max-w-xl bg-white mt-4 shadow-sm h-full flex flex-col p-4 sm:p-8 opacity-95 relative border-t border-x overflow-hidden">
                    {/* Watermark simulation */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                      <div className="text-[80px] font-bold text-slate-900 -rotate-12 border-8 border-slate-900 rounded-full w-64 h-64 flex items-center justify-center">G</div>
                    </div>
                    {/* Fake Content */}
                    <div className="flex mb-6 text-sm font-medium">
                      <span className="w-12 text-slate-600">Q.15</span>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 rounded mb-4"></div>
                        <div className="space-y-0.5 border border-slate-200 rounded">
                          <div className="p-3 border-b border-slate-200 flex"><span className="w-8">(A)</span> <div className="h-3 w-16 bg-slate-200 rounded"></div></div>
                          <div className="p-3 border-b border-slate-200 flex"><span className="w-8">(B)</span> <div className="h-3 w-16 bg-slate-200 rounded"></div></div>
                          <div className="p-3 border-b border-slate-200 flex"><span className="w-8">(C)</span> <div className="h-3 w-16 bg-slate-200 rounded"></div></div>
                          <div className="p-3 flex"><span className="w-8">(D)</span> <div className="h-3 w-16 bg-slate-200 rounded"></div></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex mb-6 text-sm font-medium">
                      <span className="w-12 text-slate-600">Q.16</span>
                      <div className="flex-1">
                        <div className="h-8 w-2/3 bg-slate-200 rounded mb-4"></div>
                        <div className="space-y-0.5 border border-slate-200 rounded">
                          <div className="p-3 border-b border-slate-200 flex"><span className="w-8">(A)</span> <div className="h-3 w-12 bg-slate-200 rounded"></div></div>
                          <div className="p-3 flex"><span className="w-8">(B)</span> <div className="h-3 w-12 bg-slate-200 rounded"></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Panel */}
                <div className="w-full sm:w-[340px] bg-white border-t sm:border-t-0 sm:border-l flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] h-[400px] sm:h-auto">
                  <div className="p-5 border-b">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-slate-900 text-lg">Question 15</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-medium">MCQ <span className="text-green-600">+1.00</span> / <span className="text-red-500">-0.33</span></span>
                    </div>
                    <div className="text-xs font-medium text-slate-500 mb-3">Select your answer</div>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="h-[52px] border rounded-lg flex items-center justify-center font-bold text-slate-600 text-sm hover:border-slate-300 cursor-pointer shadow-sm"><div className="w-4 h-4 rounded-full border border-slate-300 mr-2"></div> A</div>
                      <div className="h-[52px] border border-blue-200 bg-blue-50/50 rounded-lg flex items-center justify-center font-bold text-blue-600 text-sm cursor-pointer shadow-sm"><div className="w-4 h-4 rounded-full border-4 border-blue-500 mr-2"></div> B</div>
                      <div className="h-[52px] border rounded-lg flex items-center justify-center font-bold text-slate-600 text-sm hover:border-slate-300 cursor-pointer shadow-sm"><div className="w-4 h-4 rounded-full border border-slate-300 mr-2"></div> C</div>
                      <div className="h-[52px] border rounded-lg flex items-center justify-center font-bold text-slate-600 text-sm hover:border-slate-300 cursor-pointer shadow-sm"><div className="w-4 h-4 rounded-full border border-slate-300 mr-2"></div> D</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-[42px] flex-1 border rounded-lg bg-white flex items-center justify-center text-xs font-semibold text-slate-600 cursor-pointer shadow-sm">Clear Answer</div>
                      <div className="h-[42px] flex-1 border rounded-lg bg-white flex items-center justify-center text-xs font-semibold text-slate-600 cursor-pointer shadow-sm"><Flag className="w-3 h-3 mr-1.5" /> Mark for Review</div>
                    </div>
                  </div>
                  <div className="p-5 bg-white flex-1 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-bold text-slate-800">Question Palette</div>
                      <div className="text-slate-400">^</div>
                    </div>
                    <div className="flex gap-2 text-[9px] font-medium text-slate-500 mb-4 justify-between px-1">
                      <span className="flex items-center"><div className="w-2 h-2 rounded bg-green-500 mr-1"></div> Answered</span>
                      <span className="flex items-center"><div className="w-2 h-2 rounded bg-orange-500 mr-1"></div> Marked</span>
                      <span className="flex items-center"><div className="w-2 h-2 rounded border mr-1"></div> Not Visited</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1 pb-4">
                      {[...Array(25)].map((_, i) => (
                        <div key={i} className={`h-9 rounded-md border flex items-center justify-center text-xs font-semibold ${
                          i === 14 ? 'border-blue-500 border-2 text-slate-800 bg-white' : 
                          i < 5 ? 'bg-green-500 text-white border-green-600' : 
                          i === 7 || i === 11 ? 'bg-orange-500 text-white border-orange-600' :
                          'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full max-w-[1280px] px-6 lg:px-8 py-20 lg:py-28 relative z-10 border-t border-slate-100">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3 font-serif">
              How it works
            </h2>
            <p className="text-[17px] text-slate-500 max-w-[500px]">
              Turn a PDF into a mock test in 3 simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-[68px] left-[20%] right-[20%] h-px border-t-2 border-dashed border-slate-200 z-0"></div>
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative z-10 hover:shadow-md transition-shadow">
              <div className="h-[60px] w-[60px] bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-blue-600 mb-1 tracking-wide">01</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">Upload your question paper PDF.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative z-10 hover:shadow-md transition-shadow">
              <div className="h-[60px] w-[60px] bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-emerald-600 mb-1 tracking-wide">02</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Add Answer Key</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">Paste or map the correct answers.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative z-10 hover:shadow-md transition-shadow">
              <div className="h-[60px] w-[60px] bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <Timer className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-purple-600 mb-1 tracking-wide">03</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Start Testing</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed">Set the timer and attempt the paper like a real exam.</p>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="w-full bg-[#f8f9fa] py-20 lg:py-28 border-t border-slate-200/50">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-serif">
                Everything you need for realistic practice
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 max-w-6xl mx-auto">
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">PDF-Based Tests</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Attempt the original question paper without manually recreating every question.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Timer className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">Built-in Timer</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Practice under real exam conditions with a fully customizable timer.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Target className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">Custom Marking</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Set positive, negative, or custom marking schemes as per your exam pattern.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">Question Palette</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Navigate between questions quickly and never lose your place.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                  <Flag className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">Mark for Review</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Flag important questions and return to them anytime.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[17px] font-bold text-slate-900 mb-2">Instant Results</h3>
                  <p className="text-slate-500 text-[15px] leading-relaxed">Get detailed performance analytics immediately after submission.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Differentiator Section */}
        <section className="w-full max-w-[1280px] px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          <div className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">NO MANUAL QUESTION ENTRY</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-serif mb-2">
            Already have a question paper?
          </h2>
          <h3 className="text-2xl text-slate-500 font-serif mb-6">
            You don't need to recreate it.
          </h3>
          <p className="text-lg text-slate-600 max-w-2xl mb-10">
            Upload the PDF, add the answer key, set your timer, and start practicing.
          </p>
          <Link 
            href="/dashboard" 
            className={buttonVariants({ size: "lg", className: "bg-slate-900 hover:bg-slate-800 text-white h-14 px-10 rounded-xl text-lg font-semibold shadow-md" })}
          >
            Create Your First Mock Test →
          </Link>
        </section>

        {/* Competitive Exam Targeting */}
        <section className="w-full bg-slate-50 px-6 lg:px-8 py-16 flex flex-col items-center text-center border-t border-slate-200">
          <p className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-8">Built for serious exam preparation</p>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
            {['GATE', 'UPSC', 'JEE', 'SSC', 'CAT', 'Banking', 'Other Competitive Exams'].map(exam => (
              <span key={exam} className="px-5 py-2.5 bg-white text-slate-700 rounded-lg text-[15px] font-medium border border-slate-200 shadow-sm">{exam}</span>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white pt-16 pb-8 px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-5">
              <FileText className="h-6 w-6 text-slate-800" />
              <span className="ml-2 text-[22px] font-bold tracking-tight text-slate-900 font-serif">MockPDF</span>
            </Link>
            <p className="text-slate-500 max-w-sm text-[15px] leading-relaxed">
              Turn any question paper PDF into a realistic mock test. Built for serious exam preparation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-5">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#how-it-works" className="text-slate-500 hover:text-slate-900 text-[15px]">How it works</Link></li>
              <li><Link href="#features" className="text-slate-500 hover:text-slate-900 text-[15px]">Features</Link></li>
              <li><Link href="#pricing" className="text-slate-500 hover:text-slate-900 text-[15px]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-5">Support</h4>
            <ul className="space-y-4">
              <li><Link href="#contact" className="text-slate-500 hover:text-slate-900 text-[15px]">Contact</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-slate-900 text-[15px]">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-slate-900 text-[15px]">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto pt-8 border-t border-slate-200">
          <p className="text-[14px] text-slate-400">
            © {new Date().getFullYear()} MockPDF. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
