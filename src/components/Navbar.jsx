import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, User, Settings, HelpCircle, LogOut, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    if (setDarkMode) {
      setDarkMode(nextMode);
    }
    localStorage.setItem('darkMode', nextMode.toString());
    document.documentElement.classList.toggle('dark', nextMode);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <header className={`w-full border-b transition-colors duration-200 ${
      darkMode ? 'bg-[#1a1a1a] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: SCRIBYX Pill Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center justify-center h-10 px-6 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
              darkMode
                ? 'bg-transparent text-white border border-gray-700 hover:bg-gray-800/40'
                : 'bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span>SCRIBYX</span>
          </button>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          
          {/* Workspace Pill Link */}
          <button
            onClick={() => navigate('/online-notes')}
            className={`hidden sm:flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition-colors ${
              location.pathname === '/online-notes'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 font-semibold'
                : darkMode
                  ? 'text-gray-300 border border-gray-700 hover:bg-gray-800'
                  : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Notes Workspace
          </button>

          {/* Theme Pill Control */}
          <div className={`flex items-center justify-center h-10 w-10 rounded-full border transition-colors ${
            darkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-200' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
          }`}>
            <button
              onClick={handleToggleDarkMode}
              aria-label="Toggle Theme"
              className="flex items-center justify-center w-full h-full"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* User Avatar Menu Dropdown Requirement */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none rounded-full ring-2 ring-transparent focus-visible:ring-blue-500 transition-all">
              <Avatar className="h-10 w-10 border border-gray-300 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" alt="User Profile" />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-xs">AN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              align="end" 
              className={`w-56 mt-2 p-1.5 rounded-xl shadow-lg border ${
                darkMode ? 'bg-[#111111] border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Anil Sai Nunna</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate">anilsainunna@gmail.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={darkMode ? 'bg-gray-800' : 'bg-gray-100'} />
              
              {/* Profile -> Navigate to /profile */}
              <DropdownMenuItem 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Profile</span>
              </DropdownMenuItem>
              
              {/* Settings */}
              <DropdownMenuItem 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Settings</span>
              </DropdownMenuItem>

              {/* Help */}
              <DropdownMenuItem 
                onClick={() => window.open('https://github.com', '_blank')} 
                className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Help</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className={darkMode ? 'bg-gray-800' : 'bg-gray-100'} />

              {/* Logout */}
              <DropdownMenuItem 
                onClick={() => navigate('/login')} 
                className="cursor-pointer flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
