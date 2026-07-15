import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, LayoutDashboard, Users, BookOpen, Settings, Bell, User, 
    TrendingUp, Wallet, GraduationCap, Plus, Search, MoreVertical, Shield,
    Activity, ArrowUpRight, ChevronRight
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [tableFilter, setTableFilter] = useState('all'); // Moved up to prevent state loss
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayName = user?.name || user?.email?.split('@')[0] || 'Super Admin';

    const [recentUsers, setRecentUsers] = useState([]);
    const [activeCoursesList, setActiveCoursesList] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
                    headers: { 'x-auth-token': user?.token }
                });
                setRecentUsers(res.data.recentUsers);
                setTotalRevenue(res.data.totalRevenue);
                setActiveCoursesList(res.data.activeCoursesList);
            } catch (err) {
                console.error("Error fetching admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        if(user?.token) fetchAdminStats();
    }, [user]);

    const OverviewTab = () => {
        const filteredUsers = recentUsers.filter(u => tableFilter === 'all' || u.role === tableFilter);

        return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="luxury-glass p-6 rounded-2xl relative overflow-hidden group border-amber-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            <ArrowUpRight className="w-3 h-3" /> 12.5%
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1 relative z-10">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">₹ {(totalRevenue).toLocaleString()}</h3>
                </div>

                <div className="luxury-glass p-6 rounded-2xl relative overflow-hidden group border-blue-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            <ArrowUpRight className="w-3 h-3" /> +24
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1 relative z-10">Active Students</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">{recentUsers.filter(u => u.role === 'student').length}</h3>
                </div>

                <div className="luxury-glass p-6 rounded-2xl relative overflow-hidden group border-purple-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded">
                            Stable
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1 relative z-10">Active Courses</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">{activeCoursesList.length}</h3>
                </div>

                <div className="luxury-glass p-6 rounded-2xl relative overflow-hidden group border-pink-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                            99.9%
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1 relative z-10">System Uptime</p>
                    <h3 className="text-3xl font-bold text-white relative z-10">Optimal</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users Table */}
                <div className="lg:col-span-2 luxury-glass p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setTableFilter('all')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${tableFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>All</button>
                            <button onClick={() => setTableFilter('student')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${tableFilter === 'student' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>Students</button>
                            <button onClick={() => setTableFilter('trainer')} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${tableFilter === 'trainer' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>Trainers</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                                    <th className="pb-3 font-semibold">User Details</th>
                                    <th className="pb-3 font-semibold">Role</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{u.name}</div>
                                                    <div className="text-xs text-zinc-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`text-xs capitalize ${u.role === 'trainer' ? 'text-purple-400' : 'text-blue-400'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button className="text-zinc-500 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-zinc-500 text-sm">
                                            No {tableFilter} registrations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / System */}
                <div className="luxury-glass p-6 rounded-2xl flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white mb-2">Quick Actions</h3>
                    <button onClick={() => setActiveTab('courses')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Plus className="w-4 h-4" /></div>
                            <span className="text-sm font-medium text-zinc-200">Create New Course</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                    </button>
                    <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Users className="w-4 h-4" /></div>
                            <span className="text-sm font-medium text-zinc-200">Manage Instructors</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                    </button>
                    <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">Database Storage</span>
                            <span className="text-white font-bold">45% Full</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-amber-500 w-[45%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const UsersTab = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">User Management</h2>
                    <p className="text-sm text-zinc-400">Manage all students, trainers, and admins from here.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="text" placeholder="Search users..." className="luxury-input pl-10 pr-4 py-2 rounded-xl text-sm w-64" />
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            <div className="luxury-glass rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20">
                        <tr className="text-xs uppercase tracking-wider text-zinc-500 border-b border-white/10">
                            <th className="px-6 py-4 font-semibold">User Name & Email</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Joined Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {recentUsers.concat([{ id: 5, name: 'Admin', email: 'admin@digitalbyte.com', role: 'admin', status: 'Active', date: 'Oct 01, 2026' }]).map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800'}`}>
                                            {u.role === 'admin' ? <Shield className="w-5 h-5" /> : u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{u.name}</div>
                                            <div className="text-xs text-zinc-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                        u.role === 'trainer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-400">{u.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const CoursesTab = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Course Catalog</h2>
                    <p className="text-sm text-zinc-400">Manage existing courses or create new ones.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCoursesList.map(course => (
                    <div key={course.id} className="luxury-glass p-6 rounded-2xl flex flex-col group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${course.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                {course.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6 flex-1">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.students}</span>
                            <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {course.revenue}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                                Edit
                            </button>
                            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                                View Data
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            
            {/* Special Admin Mesh Background Overrides global CSS */}
            <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-700/10 blur-[150px] rounded-full"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-72 luxury-glass border-r border-white/10 flex flex-col z-20 m-4 rounded-3xl overflow-hidden shadow-2xl relative">
                
                <div className="p-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-16 flex items-center justify-center shrink-0">
                            <img src="/logo.png" alt="Digital Byte Logo" className="h-full w-auto object-contain drop-shadow-xl" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white block leading-tight">Admin Portal</span>
                            <span className="text-sm text-amber-400 font-medium">Digital Byte</span>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'overview' ? 'text-amber-400' : 'group-hover:text-amber-400'}`} />
                            <span className="font-semibold tracking-wide text-sm">Overview</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'users' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Users & Roles</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <BookOpen className={`w-5 h-5 ${activeTab === 'courses' ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Courses</span>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-pink-400' : 'group-hover:text-pink-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Platform Settings</span>
                        </div>
                    </button>
                </nav>

                <div className="p-6 border-t border-white/5 relative z-10">
                    <button onClick={logout} className="flex items-center gap-4 px-4 py-3 w-full text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 rounded-xl transition-all border border-transparent">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium tracking-wide text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                
                {/* Header */}
                <header className="h-24 flex items-center justify-between px-10 z-10 relative">
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-200 capitalize">{activeTab === 'overview' ? 'Super Admin Dashboard' : activeTab}</h1>
                    </div>
                    
                    <div className="flex items-center gap-6 luxury-glass px-6 py-2.5 rounded-full relative" ref={profileRef}>
                        <button className="relative text-zinc-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#0a0a0b]"></span>
                        </button>
                        
                        <div className="w-px h-6 bg-white/10"></div>
                        
                        {/* Profile Trigger */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="text-right">
                                <div className="text-sm font-bold text-white capitalize">{displayName}</div>
                                <div className="text-xs text-amber-400 capitalize">{user?.role || 'Admin'}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-[2px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Professional Dropdown Popover */}
                        {isProfileOpen && (
                            <div className="absolute top-16 right-0 w-72 luxury-glass border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                                <div className="p-4 border-b border-white/10">
                                    <p className="text-lg font-bold text-white capitalize">{displayName}</p>
                                    <p className="text-sm text-zinc-400 truncate">{user?.email || 'admin@digitalbyte.com'}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20 w-fit">
                                        <Shield className="w-3 h-3" />
                                        Super Admin
                                    </div>
                                </div>
                                <div className="p-2 border-t border-white/10 mt-1">
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors">
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Dynamic Content Area */}
                <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Welcome */}
                        {activeTab === 'overview' && (
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                    System Overview
                                </h2>
                                <p className="text-base text-zinc-400">Monitor your institute's performance and activity.</p>
                            </div>
                        )}

                        {/* Render Tab Content */}
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'users' && <UsersTab />}
                        {activeTab === 'courses' && <CoursesTab />}
                        {activeTab === 'settings' && (
                            <div className="luxury-glass p-8 rounded-2xl text-center">
                                <Settings className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white">Platform Settings</h3>
                                <p className="text-zinc-400 mt-2">Global configuration and API keys will be managed here.</p>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
