import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function Register() {
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
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms & Conditions to register';
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
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
    }`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Centered Register Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl">
          
          <Card className={`shadow-sm border rounded-2xl ${darkMode ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'}`}>
            <CardHeader className="space-y-3 text-center pb-6">
              
              {/* Brand Icon Pill */}
              <div className="mx-auto w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                S
              </div>

              <div>
                <CardTitle className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create your account
                </CardTitle>
                <CardDescription className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Join Scribyx Notes to start organizing your thoughts
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

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Anil Sai Nunna"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: null });
                      }}
                      className={`pl-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${
                        errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address
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
                        className={`pl-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${
                          errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                        className={`pl-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${
                          errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password and Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Password
                    </Label>
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
                        className={`pl-10 pr-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${
                          errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
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

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className={`font-semibold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                        }}
                        className={`pl-10 pr-10 h-11 rounded-xl border transition-all placeholder-gray-400 focus:border-blue-600 ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} ${
                          errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={(e) => {
                        setFormData({ ...formData, termsAccepted: e.target.checked });
                        if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: null });
                      }}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="termsAccepted"
                      className={`text-xs font-semibold cursor-pointer select-none leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      I agree to the{' '}
                      <a href="#terms" className={`hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="#privacy" className={`hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Privacy Policy</a>
                    </label>
                  </div>
                  {errors.termsAccepted && (
                    <p className={`text-xs flex items-center gap-1 font-medium mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>

                {/* Register Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Register Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className={`flex flex-col items-center justify-center border-t py-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-bold hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
          
        </div>
      </main>
    </div>
  );
}
