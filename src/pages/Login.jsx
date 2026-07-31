import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (formData.email === 'error@example.com') {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      } else {
        setSuccessMessage('Login successful! Redirecting to your workspace...');
        setTimeout(() => {
          navigate('/online-notes');
        }, 1200);
      }
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
    }`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          
          <Card className={`shadow-sm border rounded-2xl ${darkMode ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'}`}>
            <CardHeader className="space-y-3 text-center pb-6">
              
              {/* Brand Icon Pill */}
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                S
              </div>

              <div>
                <CardTitle className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back
                </CardTitle>
                <CardDescription className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sign in to your Scribyx Notes workspace
                </CardDescription>
              </div>

            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Global Success State Banner */}
                {successMessage && (
                  <div className={`flex items-center gap-2.5 p-3.5 text-sm rounded-xl border font-medium ${darkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Global Error State Banner */}
                {errorMessage && (
                  <div className={`flex items-center gap-2.5 p-3.5 text-sm rounded-xl border font-medium ${darkMode ? 'bg-red-950/40 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    EMAIL ADDRESS
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={`pl-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} ${
                        errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      PASSWORD
                    </Label>
                    <a 
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        setErrorMessage('Password reset link sent to your registered email.');
                      }}
                      className={`text-xs font-semibold hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                      Forgot password?
                    </a>
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} ${
                        errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`text-xs font-semibold cursor-pointer select-none ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Remember me on this device
                  </label>
                </div>

                {/* Login Button with Loading State */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className={`flex flex-col items-center justify-center border-t py-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className={`font-bold hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>
          
        </div>
      </main>
    </div>
  );
}
