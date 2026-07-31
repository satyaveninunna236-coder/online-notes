import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Building2, MapPin, Calendar, Briefcase, ShieldCheck, 
  KeyRound, Smartphone, Monitor, Clock, CheckCircle2, Shield, Activity, Edit3, Lock, LogIn
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';

export default function Profile() {
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

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const userProfile = {
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    fullName: 'Anil Sai Nunna',
    email: 'anilsainunna@gmail.com',
    phone: '+1 (555) 019-2834',
    designation: 'Principal Frontend Engineer',
    role: 'Principal Engineer',
    organization: 'Scribyx Technologies Inc.',
    address: 'San Francisco, CA, USA',
    joinedDate: 'January 15, 2024',
    userId: 'USR-94827104',
    username: '@anilsainunna',
    lastLogin: 'Today at 09:15 AM (Mac OS / Chrome)',
    accountStatus: 'Active',
    emailVerified: true,
  };

  const activityLogs = [
    {
      id: 1,
      icon: ShieldCheck,
      title: 'Password changed successfully',
      description: 'Your account password was updated from a recognized device.',
      time: '3 days ago',
      badgeColor: darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 2,
      icon: Activity,
      title: 'New login detected',
      description: 'Login from a new Mac OS X device (IP: 192.168.1.1).',
      time: '5 days ago',
      badgeColor: darkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 3,
      icon: Mail,
      title: 'Recovery email updated',
      description: 'You updated your recovery email address.',
      time: '2 weeks ago',
      badgeColor: darkMode ? 'bg-amber-900/30 text-amber-400 border-amber-800' : 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
    }`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Profile Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Floating Toast Feedback */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-5 ${darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
            <CheckCircle2 className={`w-5 h-5 ${darkMode ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* --- Profile Header Banner Card --- */}
        <Card className={`overflow-hidden shadow-xl rounded-2xl relative border ${darkMode ? 'bg-gray-800/50 border-gray-700 backdrop-blur-lg' : 'bg-white border-gray-200'}`}>
          
          {/* Decorative Subtle Header Background */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <CardContent className="pt-0 relative px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-6">
              
              {/* User Avatar & Title Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <Avatar className={`h-28 w-28 sm:h-32 sm:w-32 border-4 shadow-sm ${darkMode ? 'border-[#1a1a1a]' : 'border-white'}`}>
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">AN</AvatarFallback>
                </Avatar>

                <div className="space-y-1 mb-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userProfile.fullName}
                    </h1>
                    
                    {/* Role Badge */}
                    <Badge variant="default" className="font-semibold bg-blue-600 text-white">
                      {userProfile.role}
                    </Badge>

                    {/* Status Badge */}
                    <Badge variant="success" className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {userProfile.accountStatus}
                    </Badge>
                  </div>

                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {userProfile.designation} • {userProfile.organization}
                  </p>
                  
                  <p className={`text-xs font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userProfile.email}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => triggerToast('Edit profile interface opened')}
                  variant="outline"
                  className={`rounded-xl shadow-xs border ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}`}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid Layout (2 Columns on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">

            {/* --- Profile Information Card --- */}
            <Card className={`shadow-xs border ${darkMode ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
              <CardHeader className={`border-b pb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Your personal details and contact info.</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</p>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.phone}</p>
                    </div>
                  </div>

                
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined Date</p>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.joinedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div className="space-y-1 sm:col-span-2">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Address</p>
                      <p className={`text-sm font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.address}</p>
                    </div>
                  </div>


                </div>
              </CardContent>
            </Card>

            {/* --- Security Settings Card --- */}
            <Card className={`shadow-xs border ${darkMode ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
              <CardHeader className={`border-b pb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${darkMode ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Manage your password and security preferences.</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                
                {/* Change Password */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:bg-gray-800/60' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'}`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Change Password</h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last updated 3 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={`h-8 rounded-lg text-xs ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-200'}`} onClick={() => triggerToast('Password update interface opened')}>
                    Update
                  </Button>
                </div>

                {/* 2FA */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:bg-gray-800/60' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'}`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication (2FA)</h4>
                        <Badge variant="success" className="h-5 px-1.5 text-[10px]">Enabled</Badge>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Authenticator app configured</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={`h-8 rounded-lg text-xs ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-200'}`} onClick={() => triggerToast('2FA settings managed')}>
                    Manage
                  </Button>
                </div>

                {/* Active Sessions */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${darkMode ? 'border-gray-800 bg-gray-800/40 hover:bg-gray-800/60' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'}`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Active Sessions</h4>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 active session on Mac OS X</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className={`h-8 rounded-lg text-xs ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-200'}`} onClick={() => triggerToast('Active session list updated')}>
                    View All
                  </Button>
                </div>

              </CardContent>
            </Card>

          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-8">

            {/* --- Account Information Card --- */}
            <Card className={`shadow-xs border ${darkMode ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
              <CardHeader className={`border-b pb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${darkMode ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800' : 'bg-cyan-50 text-cyan-600 border-cyan-200'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>System credentials & account status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>User ID</p>
                  <p className={`text-sm font-mono font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.userId}</p>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</p>
                  <p className={`text-sm font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.username}</p>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Login</p>
                  <p className={`text-sm font-medium mt-1 flex items-center gap-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {userProfile.lastLogin}
                  </p>
                </div>

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Status</p>
                  <Badge variant="success" className="text-xs">
                    {userProfile.accountStatus}
                  </Badge>
                </div>

                {/* <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email Verification</p>
                  <Badge variant="default" className={`text-xs ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                    Verified
                  </Badge>
                </div> */}
              </CardContent>
            </Card>

            {/* --- Recent Activity Card --- */}
            <Card className={`shadow-xs border ${darkMode ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
              <CardHeader className={`border-b pb-4 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${darkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</CardTitle>
                    <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Your latest actions and security events.</CardDescription>
                  </div>
                </div>
              </CardHeader>              
              <CardContent className="p-6">
                <div className={`space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 ${darkMode ? 'before:bg-gray-800' : 'before:bg-gray-200'}`}>
                  
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative flex gap-4 pl-10 group">
                      
                      {/* Timeline Dot Indicator */}
                      <div className="absolute left-1.5 top-0.5">
                        <div className={`p-1.5 rounded-full border shrink-0 z-10 ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'} ${log.badgeColor}`}>
                          <log.icon className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Log Details */}
                      <div>
                        <h5 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{log.title}</h5>
                        <p className={`text-xs leading-snug ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{log.description}</p>
                        <p className={`text-[10px] font-mono pt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  );
}
