import React, { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Updated CSS for a more technical, geometric feel
const animationStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  @keyframes float-delayed {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  /* Subtle grid movement */
  @keyframes grid-move {
    0% { background-position: 0% 0%; }
    100% { background-position: 40px 40px; }
  }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite; animation-delay: 1s; }

  /* Technical Grid Background */
  .tech-grid {
    background-image: 
      linear-gradient(to right, rgba(37, 99, 235, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(37, 99, 235, 0.1) 1px, transparent 1px);
    background-size: 40px 40px;
    transform: perspective(1000px) rotateX(60deg) scale(2);
    transform-origin: top center;
    animation: grid-move 10s linear infinite;
  }
  
  /* Glowing geometric squares */
  .geo-accent {
    position: absolute;
    border: 2px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1);
    backdrop-filter: blur(2px);
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-float,
    .animate-float-delayed {
      animation: none !important;
    }
  }
`;

function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? stored === 'true' : false;
  });

  // Listen to storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('darkMode');
      setDarkMode(stored ? stored === 'true' : false);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        navigate('/online-notes');
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

return (
    <div className={`min-h-screen overflow-hidden relative transition-colors duration-300 flex flex-col justify-center ${
      darkMode 
        ? 'bg-gradient-to-br from-[#0B0F19] via-[#0E1628] to-[#0B0F19] text-slate-100' 
        : 'bg-gradient-to-br from-gray-50 via-white to-blue-100 text-gray-900'
    }`}>
      <style>{animationStyles}</style>

      {/* Background grid for all screens */}
      <div className="absolute inset-0 pointer-events-none tech-grid opacity-30 md:opacity-50 mask-image-gradient z-0"></div>
      
      {/* Navbar */}
      {/* <header className="flex items-center justify-between px-4 sm:px-6 md:px-16 py-4 sm:py-6 relative z-20">
        <div className="flex items-center gap-3">
         
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-900/20">
            S
          </div>
          <span className={`text-xl font-semibold tracking-wide ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            SCRIBYX
          </span>
        </div>


      </header> */}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between
px-4 sm:px-6 md:px-16
py-10 sm:py-12 md:py-20
gap-12 md:gap-16
relative z-20 w-full max-w-7xl mx-auto">
        
        {/* Left Content */}
        <div className="max-w-xl text-center md:text-left  max-md:mt-18 mb-5 ">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-xs font-semibold rounded-full border ${
            darkMode
              ? 'text-blue-400 bg-blue-900/30 border-blue-700'
              : 'text-blue-700 bg-blue-50 border-blue-200'
          }`}>
            <span className="w-2 h-2 bg-blue-600 rounded animate-pulse"></span>
            Version · 3.0
          </div>
          <h1 className={`text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Scribyx Notes<br />
            <span className={`text-transparent bg-clip-text ${
              darkMode
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                : 'bg-gradient-to-r from-blue-700 to-cyan-600'
            }`}>
              Think. Write. Execute.
            </span>
          </h1>

          <p className={`text-lg mb-10 leading-relaxed ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            A focused notes workspace to capture ideas, organize thoughts,
            and move forward without distraction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start w-full gap-4">
            <button
              onClick={() => navigate('/online-notes')}
              className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold shadow-md shadow-blue-700/30 hover:shadow-blue-700/50 transition-all transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Get Started
            </button>

           
          </div>

         
        </div>

        {/* Right Animation (Tech/Masculine Floating UI) */}
        <div className="relative w-full max-w-lg h-[450px] hidden md:flex items-center justify-center perspective-container">
          
          {/* --- TECH BACKGROUND ELEMENTS --- */}
          
          {/* Floating Geometric Accents instead of blobs */}
          <div className="geo-accent w-32 h-32 top-10 -right-10 rotate-12 animate-float-delayed opacity-60"></div>
          <div className="geo-accent w-24 h-24 bottom-10 -left-10 -rotate-12 animate-float opacity-60"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>


          {/* --- Main Glassmorphism Card --- */}
          <div className={`relative w-full md:w-[420px] backdrop-blur-xl rounded-2xl border shadow-2xl p-6 animate-float z-30 ${
            darkMode
              ? 'bg-[#0F172A]/80 border-white/10'
              : 'bg-white/85 border-white/70'
          }`}>
            {/* Card Header (More technical look) */}
            <div className={`flex items-center justify-between mb-6 border-b pb-4 ${
              darkMode ? 'border-white/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-2">
                <span title="Close" className="w-3 h-3 rounded-full bg-red-500 hover:brightness-110 transition"></span>
                <span title="Minimize" className="w-3 h-3 rounded-full bg-yellow-400 hover:brightness-110 transition"></span>
                <span title="Zoom" className="w-3 h-3 rounded-full bg-green-500 hover:brightness-110 transition"></span>
              </div>
              <div className={`text-xs font-mono font-semibold ${
                darkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                NOTE: DAILY_THOUGHTS
              </div>
            </div>

            {/* Card Content Skeleton (More structured) */}
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                 <div className={`h-5 rounded-sm w-1/3 ${
                   darkMode ? 'bg-white/5' : 'bg-gray-800/10'
                 }`}></div>
                 <div className={`h-auto px-2 py-1 rounded-sm text-xs font-mono ${
                   darkMode 
                     ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                     : 'bg-blue-100 text-blue-800 border border-blue-300'
                 }`}>STATUS: Active</div>
              </div>
              <div className={`h-3 rounded-sm w-full ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}></div>
              <div className={`h-3 rounded-sm w-5/6 ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}></div>
              
              {/* A code-snippet style block */}
              <div className={`mt-4 rounded-md p-4 font-mono text-xs shadow-inner ${
                darkMode
                  ? 'bg-black/60 text-emerald-400 border border-white/10'
                  : 'bg-gray-900 text-green-400'
              }`}>
                <p>• Morning thoughts</p>
                <p className="ml-4">- Goals for today</p>
                <p className="ml-4">- Tasks to complete</p>
                <p className={`ml-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>// Stay consistent</p>
              </div>
            </div>

            {/* Floating Badge 1 (Sharper, Square) */}
            <div className={`absolute -right-8 top-16 backdrop-blur-md border p-2 rounded-lg shadow-xl animate-float-delayed z-40 ${
              darkMode
                ? 'bg-[#0F172A]/90 border-white/10'
                : 'bg-white/90 border-gray-200'
            }`}>
              <div className="bg-gradient-to-tr from-green-500 to-emerald-600 p-2 rounded-sm shadow-inner">
                <LockKeyhole className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Floating Badge 2 (Sharper, Square) */}
            <div className={`absolute -left-8 bottom-16 backdrop-blur-md border p-2 rounded-lg shadow-xl animate-float z-40 ${
              darkMode
                ? 'bg-[#0F172A]/90 border-white/10'
                : 'bg-white/90 border-gray-200'
            }`} style={{ animationDelay: '1.5s' }}>
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-sm shadow-inner">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ shapeRendering: 'crispEdges' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </main>

    
      
      {/* Subtle background gradient mask so the grid fades out */}
      <div className={`absolute inset-0 z-0 pointer-events-none ${
        darkMode
          ? 'bg-gradient-to-b from-transparent via-[#020617]/30 to-[#000000]/60'
          : 'bg-gradient-to-b from-transparent via-white/30 to-gray-300'
      }`}>
      </div>

<footer className='relative z-20 flex justify-center flex-col mt-auto pb-4 items-center text-sm text-gray-700 dark:text-gray-300'>
  <p className="text-xs text-black dark:text-gray-400 flex items-center gap-1">
    Developed by
    <a
      href="https://anilsai-portfolio.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      className="relative font-semibold text-black dark:text-black transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
      title="Visit portfolio"
    >
      Anil
    </a>
  </p>
  <p className="text-xs mt-1 text-gray-300 dark:text-gray-600">
    © {new Date().getFullYear()} Scribyx. All rights reserved.
  </p>
</footer>
      
    </div>
    
  );
}

export default Home;