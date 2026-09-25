import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, BookOpen, CreditCard, Video, CalendarCheck, Award, 
    LayoutDashboard, User, Bell, ChevronRight, GraduationCap,
    ClipboardList, FileText, PlayCircle, Download, CheckCircle, Clock,
    Settings, Shield, Lock, CheckCircle2, Play, Calendar, Star, BadgeCheck
} from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [inCall, setInCall] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [activeAssignment, setActiveAssignment] = useState(null);
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: "Hi there! I'm Nishkarsh's AI teaching assistant. I can help you understand React Hooks, debug your MERN code, or explain AI concepts. What are you working on today?" },
        { sender: 'user', text: "Can you explain how Virtual DOM works again? I got it wrong in the quiz." },
        { sender: 'ai', text: "Sure! The Virtual DOM is a lightweight JavaScript representation of the actual browser DOM. When state changes in React, it first updates the Virtual DOM, compares it with the previous version (a process called Diffing), and then only updates the exact parts of the real DOM that changed (called Reconciliation). This makes React very fast!" }
    ]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
    const profileRef = useRef(null);

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

    // Derive name from email if name is not available
    const displayName = user?.name || user?.email?.split('@')[0] || 'Student';

    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [demoPaid, setDemoPaid] = useState(false); // For presentation: temporarily updates UI to 'Paid' without affecting DB

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/student/profile', {
                    headers: { 'x-auth-token': user?.token }
                });
                setStudentProfile(res.data);
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };
        if(user?.token) fetchProfile();
    }, [user]);

    const actualFeePaid = studentProfile?.feeDetails?.amountPaid || 0;
    const actualTotalFee = studentProfile?.feeDetails?.totalFee || 0;
    
    // If demoPaid is true, simulate that they paid the full remaining balance
    const displayFeePaid = demoPaid ? actualTotalFee : actualFeePaid;
    const displayBalance = demoPaid ? 0 : (actualTotalFee - actualFeePaid);

    // Dynamic Course Info
    const rawCourseTitle = studentProfile?.enrolledCourses?.[0]?.courseId?.title || "MERN Stack Web Development";
    const displayCourseTitle = rawCourseTitle.includes('AI') ? rawCourseTitle : `${rawCourseTitle} & Generative AI`;
    const isPython = rawCourseTitle.toLowerCase().includes('python');
    const isDesign = rawCourseTitle.toLowerCase().includes('design') || rawCourseTitle.toLowerCase().includes('ui/ux');

    const studentData = {
        course: { 
            title: displayCourseTitle,
            progress: studentProfile?.enrolledCourses?.[0]?.progress || 0, 
            next: "Next Module" 
        },
        present: studentProfile?.attendance?.present || 0,
        total: studentProfile?.attendance?.totalClasses || 1,
        feeTotal: actualTotalFee,
        feePaid: displayFeePaid,
        balance: displayBalance,
        nextInstallment: studentProfile?.feeDetails?.nextInstallmentDate ? new Date(studentProfile.feeDetails.nextInstallmentDate).toLocaleDateString() : "N/A",
        liveClasses: studentProfile?.liveClasses || []
    };

    const handlePayment = () => {
        setIsPaymentModalOpen(true);
        setPaymentStatus('idle');
    };

    const handleSendChatMessage = async (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;
        
        const currentMessage = chatInput;
        const newMessages = [...chatMessages, { sender: 'user', text: currentMessage }];
        setChatMessages(newMessages);
        setChatInput('');
        
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentMessage })
            });
            
            const data = await response.json();
            
            setChatMessages(prev => [...prev, { 
                sender: 'ai', 
                text: data.reply || "Sorry, I am having trouble connecting to my brain right now." 
            }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, { 
                sender: 'ai', 
                text: "Oops, network error! Make sure the backend server is running." 
            }]);
        }
    };

    const processFakePayment = async () => {
        setPaymentStatus('processing');
        setTimeout(() => {
            // For Demo Purposes: Do NOT hit the real backend API so the DB doesn't get permanently updated to 0.
            // This allows the student to show the demo multiple times to teachers.
            setPaymentStatus('success');
            setTimeout(() => {
                setIsPaymentModalOpen(false);
                setDemoPaid(true); // Temporarily sets balance to 0 on the UI until page refresh
            }, 2000);
        }, 2000); // 2 second fake processing time
    };

    const handleDownloadCertificate = async () => {
        try {
            const response = await axios.get('/api/certificate/generate', {
                headers: { 'x-auth-token': user?.token },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${displayName}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Certificate Error:", error);
            alert("Failed to download certificate");
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await axios.get('/api/payment/invoice', {
                headers: { 'x-auth-token': user?.token },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${displayName}_Invoice.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading invoice:", error);
            alert("Error downloading invoice");
        }
    };

    // Sub-components for different views
    const OverviewTab = () => {
        if (loading) return <div className="text-white text-center mt-20 animate-pulse">Loading Live Database Records...</div>;
        
        return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Live Class Schedule */}
                <div className="luxury-glass p-7 rounded-2xl flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                            <Video className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Live Soon
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 relative z-10">{studentData.liveClasses[0]?.title || "No Upcoming Class"}</h3>
                    <p className="text-sm text-zinc-400 mb-8 flex-1 relative z-10">By {studentData.liveClasses[0]?.instructor || "N/A"}</p>
                    <button onClick={() => setInCall(true)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all relative z-10">
                        Join Meeting
                    </button>
                </div>

                {/* Financial Ledger Summary */}
                <div className="luxury-glass p-7 rounded-2xl flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 rounded-full">Ledger</span>
                    </div>
                    <div className="space-y-3 mb-6 flex-1 relative z-10">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Total Course Fee:</span>
                            <span className="text-white font-medium">₹{studentData.feeTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Amount Paid:</span>
                            <span className="text-emerald-400 font-medium">₹{studentData.feePaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Next EMI Date:</span>
                            <span className="text-amber-400 font-medium">{studentData.nextInstallment}</span>
                        </div>
                    </div>
                    <button onClick={handleDownloadInvoice} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all relative z-10 flex justify-center items-center gap-2">
                        <Download className="w-4 h-4" /> Download Invoice
                    </button>
                </div>

                {/* Fees & Payment */}
                <div className="luxury-glass p-7 rounded-2xl flex flex-col relative overflow-hidden group border-blue-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 rounded-full">{studentData.balance === 0 ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-1 relative z-10">Pending Dues</p>
                    <h3 className="text-4xl font-bold text-white mb-8 relative z-10">₹{studentData.balance.toLocaleString()}</h3>
                    {studentData.balance > 0 ? (
                        <button onClick={handlePayment} className="btn-luxury w-full py-3 rounded-xl text-sm font-semibold transition-all mt-auto relative z-10">
                            Pay with Razorpay
                        </button>
                    ) : (
                        <button disabled className="w-full py-3 bg-white/5 text-white/50 border border-white/10 rounded-xl text-sm font-semibold transition-all mt-auto relative z-10 cursor-not-allowed">
                            No Dues
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Course Progress Summary */}
                <div className="luxury-glass p-8 rounded-2xl flex items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-3xl rounded-full"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center relative shadow-inner">
                            <span className="text-2xl font-bold text-white">{studentData.course.progress}<span className="text-sm text-zinc-400">%</span></span>
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible">
                                <circle cx="48" cy="48" r="44" stroke="transparent" strokeWidth="8" fill="none" />
                                <circle cx="48" cy="48" r="44" stroke="url(#pink-gradient)" strokeWidth="8" fill="none" strokeDasharray="276" strokeDashoffset={276 - (276 * studentData.course.progress / 100)} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
                                <defs>
                                    <linearGradient id="pink-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ec4899" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Overall Progress</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">You are making steady progress in your {studentData.course.title} course. Keep up the momentum!</p>
                    </div>
                </div>

                {/* Quick Attendance */}
                <div className="luxury-glass p-8 rounded-2xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full"></div>
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <CalendarCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Attendance</h3>
                            <p className="text-sm text-emerald-400 font-medium">{Math.round((studentData.present/studentData.total)*100)}% Present</p>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <h3 className="text-4xl font-black text-white tracking-tight">{studentData.present}<span className="text-2xl text-zinc-500 font-medium tracking-normal">/{studentData.total}</span></h3>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Classes Attended</p>
                    </div>
                </div>

                {/* AI Study Assistant */}
                <div className="luxury-glass p-8 rounded-2xl flex items-center justify-between relative overflow-hidden group border-fuchsia-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full group-hover:bg-fuchsia-500/20 transition-all"></div>
                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                                <Star className="w-5 h-5 text-fuchsia-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">AI Study Assistant</h3>
                        </div>
                        <p className="text-sm text-zinc-400 mb-5 leading-relaxed">Stuck on a concept or bug? Ask Nishkarsh's AI avatar for instant help.</p>
                        <button onClick={() => setIsAIChatOpen(true)} className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                            Chat with AI
                        </button>
                    </div>
                </div>
            </div>

            {/* Gamification / Daily Streak Section */}
            <div className="luxury-glass p-8 rounded-2xl relative overflow-hidden border-orange-500/20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transform hover:scale-105 transition-all">
                            <span className="text-4xl">🔥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                7 Day Learning Streak! <span className="text-orange-400 text-sm bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">Active</span>
                            </h2>
                            <p className="text-sm text-zinc-400">You're on fire! Complete today's assignment to keep the streak going.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-32 p-4 bg-black/40 rounded-xl border border-white/5 text-center backdrop-blur-md">
                            <div className="text-sm text-zinc-500 mb-1 font-medium">Total XP</div>
                            <div className="text-2xl font-black text-amber-400">2,450</div>
                        </div>
                        <div className="flex-1 md:w-32 p-4 bg-black/40 rounded-xl border border-white/5 text-center backdrop-blur-md">
                            <div className="text-sm text-zinc-500 mb-1 font-medium">Global Rank</div>
                            <div className="text-2xl font-black text-white">#42</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const CoursesTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-2">Enrolled Courses</h2>
            
            {/* Main Course Card */}
            <div className="luxury-glass p-6 rounded-2xl">
                <div className="flex items-start gap-6">
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                        <BookOpen className="w-10 h-10 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Full Stack</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">{studentData.course.title}</h3>
                                <p className="text-sm text-zinc-400 mt-1">Batch 2026 - Up Next: {studentData.course.next}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">Active</span>
                        </div>
                        
                        <div className="mt-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-zinc-400">Course Completion</span>
                                <span className="text-blue-400 font-bold">{studentData.course.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" style={{ width: `${studentData.course.progress}%` }}></div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex gap-4">
                            <button onClick={() => setSelectedVideo({ title: 'Intro to LLMs & Prompt Engineering', id: 'zjkBMFhNj_g' })} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">Resume Learning</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Curriculum */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-400" />
                    Course Syllabus
                </h3>
                <div className="space-y-3">
                    {(isPython ? [
                        { num: 1, title: "Python Basics & Syntax", desc: "Variables, Loops, Functions", status: "completed", videoId: 'kqtD5dpn9C8' },
                        { num: 2, title: "Data Structures", desc: "Lists, Dicts, Tuples", status: "completed", videoId: 'R-HLU9Fl5ug' },
                        { num: 3, title: "Pandas & Numpy", desc: "Data Analysis, Manipulation", status: "active", progress: 60, videoId: 'vmEHCJofslg' },
                        { num: 4, title: "Machine Learning Basics", desc: "Scikit-Learn, Regression", status: "locked" },
                        { num: 5, title: "Model Evaluation", desc: "Metrics, Validation", status: "locked" }
                    ] : isDesign ? [
                        { num: 1, title: "Color Theory & Typography", desc: "UI Basics, Fonts", status: "completed", videoId: 'NX-wp6eXNWA' },
                        { num: 2, title: "Wireframing Concepts", desc: "Layouts, Spacing", status: "completed", videoId: 'k1iBf3h09-8' },
                        { num: 3, title: "Figma Shortcuts", desc: "Components, Auto-layout", status: "active", progress: 60, videoId: 'jwFiEUO43R4' },
                        { num: 4, title: "Accessibility (a11y)", desc: "Contrast, Screen Readers", status: "locked" },
                        { num: 5, title: "Prototyping & Animation", desc: "Interactions, Flows", status: "locked" }
                    ] : [
                        { num: 1, title: "HTML, CSS & UI Frameworks", desc: "Tailwind CSS, Flexbox, CSS Grid", status: "completed", videoId: 'mU6anWqZJcc' },
                        { num: 2, title: "Advanced JavaScript (ES6+)", desc: "Promises, Async/Await, Array Methods", status: "completed", videoId: 'W6NZfCO5SIk' },
                        { num: 3, title: "React.js Fundamentals", desc: "Components, Props, State, Context API", status: "active", progress: 60, videoId: 'SqcY0GlETPk' },
                        { num: 4, title: "Node.js & Express", desc: "REST APIs, Middlewares, Routing", status: "locked" },
                        { num: 5, title: "MongoDB & Mongoose", desc: "Schemas, Models, Aggregations", status: "locked" }
                    ]).concat([
                        { num: 6, title: "Generative AI Foundations", desc: "Intro to LLMs, Tokenization, Prompt Engineering", status: "locked", isAI: true, videoId: 'zjkBMFhNj_g' },
                        { num: 7, title: "Integrating AI in Web Apps", desc: "OpenAI API, RAG, LangChain, Chatbots", status: "locked", isAI: true, videoId: 'c3b-JASoPi0' }
                    ]).map((mod) => (
                        <button 
                            key={mod.num} 
                            onClick={() => {
                                if (mod.status === 'locked') {
                                    alert("This module is currently locked! Please complete previous modules first.");
                                    return;
                                }
                                setSelectedVideo({ title: mod.title, id: mod.videoId || 'zjkBMFhNj_g' })
                            }}
                            className={`w-full text-left luxury-glass p-4 rounded-xl flex items-center justify-between border-l-4 transition-all hover:scale-[1.01] ${mod.status === 'completed' ? 'border-l-emerald-500 hover:bg-emerald-500/5' : mod.status === 'active' ? 'border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10' : 'border-l-transparent opacity-60 cursor-not-allowed hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mod.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : mod.status === 'active' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : mod.isAI ? 'bg-white/5 text-fuchsia-500/50' : 'bg-white/5 text-zinc-500'}`}>
                                    {mod.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : mod.status === 'active' ? <Play className="w-5 h-5 ml-1" /> : <Lock className="w-4 h-4" />}
                                </div>
                                <div>
                                    <h4 className={`${mod.status === 'completed' || mod.status === 'active' ? 'text-white' : mod.isAI ? 'text-fuchsia-300' : 'text-zinc-300'} font-${mod.status === 'active' ? 'bold' : 'medium'} text-sm`}>
                                        Module {mod.num}: {mod.title}
                                    </h4>
                                    <p className={`text-xs ${mod.status === 'active' ? 'text-blue-300' : 'text-zinc-400'} mt-0.5`}>{mod.desc}</p>
                                </div>
                            </div>
                            <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${mod.status === 'completed' ? 'text-zinc-500 bg-black/30' : mod.status === 'active' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : mod.isAI ? 'text-fuchsia-500/50 bg-black/30' : 'text-zinc-500 bg-black/30'}`}>
                                {mod.status === 'completed' ? 'Completed' : mod.status === 'active' ? `In Progress (${mod.progress}%)` : 'Locked'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const LiveClassesTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-white">Live Classes Schedule</h2>
                <button className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> View Full Calendar
                </button>
            </div>
            
            {/* Active/Next Class */}
            <div className="luxury-glass p-6 rounded-2xl relative overflow-hidden border-pink-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full"></div>
                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-xl bg-pink-500/20 border border-pink-500/30 flex flex-col items-center justify-center text-pink-400 shrink-0 shadow-lg shadow-pink-500/20">
                        <span className="text-xs font-bold uppercase tracking-widest mb-1">TODAY</span>
                        <span className="text-3xl font-black">7 PM</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">React Hooks Deep Dive</h3>
                                <p className="text-sm text-zinc-400 mt-1">Instructor: Rohit Gupta (Senior Dev)</p>
                            </div>
                            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 text-xs font-bold rounded-full border border-pink-500/30 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span> Starting Soon
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-4 max-w-2xl">In this session, we will explore advanced concepts of useEffect, useMemo, and custom hooks for performance optimization.</p>
                        <div className="mt-6 flex items-center gap-4">
                            <button onClick={() => setInCall(true)} className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:-translate-y-0.5">Join Zoom Meeting</button>
                            <span className="text-xs text-zinc-400">Meeting ID: 812 345 6789</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Upcoming Schedule */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">This Week's Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="luxury-glass p-4 rounded-xl border-t-2 border-t-purple-500">
                        <div className="text-xs text-purple-400 font-bold mb-2">TOMORROW • 7:00 PM</div>
                        <h4 className="text-white font-medium text-sm mb-1">State Management with Redux</h4>
                        <p className="text-xs text-zinc-500">By Rohit Gupta</p>
                    </div>
                    <div className="luxury-glass p-4 rounded-xl border-t-2 border-t-blue-500">
                        <div className="text-xs text-blue-400 font-bold mb-2">FRIDAY • 7:00 PM</div>
                        <h4 className="text-white font-medium text-sm mb-1">React Router & Navigation</h4>
                        <p className="text-xs text-zinc-500">By Rohit Gupta</p>
                    </div>
                    <div className="luxury-glass p-4 rounded-xl border-t-2 border-t-emerald-500">
                        <div className="text-xs text-emerald-400 font-bold mb-2">SATURDAY • 11:00 AM</div>
                        <h4 className="text-white font-medium text-sm mb-1">Generative AI Masterclass</h4>
                        <p className="text-xs text-zinc-500">By Rohit Gupta</p>
                    </div>
                </div>
            </div>
            
            {/* Past Recordings Grid */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Past Recordings Library</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Video 1 */}
                    <div onClick={() => setSelectedVideo({ title: 'Introduction to React Components', id: 'bMknfKXIFA8' })} className="luxury-glass rounded-xl overflow-hidden group cursor-pointer">
                        <div className="h-32 bg-zinc-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-white ml-1" />
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] text-white font-medium z-10">1h 45m</div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">Introduction to React Components</h4>
                            <p className="text-xs text-zinc-500">Recorded on Oct 12, 2026</p>
                        </div>
                    </div>
                    
                    {/* Video 2 */}
                    <div onClick={() => setSelectedVideo({ title: 'Advanced JavaScript Fundamentals', id: 'W6NZfCO5SIk' })} className="luxury-glass rounded-xl overflow-hidden group cursor-pointer">
                        <div className="h-32 bg-zinc-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-white ml-1" />
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] text-white font-medium z-10">2h 10m</div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">Advanced JavaScript Fundamentals</h4>
                            <p className="text-xs text-zinc-500">Recorded on Oct 10, 2026</p>
                        </div>
                    </div>

                    {/* Video 3 */}
                    <div onClick={() => setSelectedVideo({ title: 'Intro to LLMs & Prompt Engineering', id: 'zjkBMFhNj_g' })} className="luxury-glass rounded-xl overflow-hidden group cursor-pointer">
                        <div className="h-32 bg-zinc-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-white ml-1" />
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] text-white font-medium z-10">2h 15m</div>
                        </div>
                        <div className="p-4">
                            <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">Intro to LLMs & Prompt Engineering</h4>
                            <p className="text-xs text-zinc-500">Recorded on Oct 08, 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const AssignmentsTab = () => {
        const completedCount = studentProfile?.enrolledCourses?.[0]?.assignmentsCompleted || 0;
        
        const baseAssignments = isPython 
            ? [
                { id: 1, title: "Python Data Types & Structures", course: displayCourseTitle, dueDate: "Yesterday, 11:59 PM", status: completedCount >= 1 ? "completed" : "pending", grade: completedCount >= 1 ? "95/100" : null },
                { id: 2, title: "Pandas Data Analysis", course: displayCourseTitle, dueDate: "Tomorrow, 11:59 PM", status: completedCount >= 2 ? "completed" : "pending", grade: completedCount >= 2 ? "88/100" : null },
                { id: 3, title: "Scikit-Learn ML Models", course: displayCourseTitle, dueDate: "Next Week", status: completedCount >= 3 ? "completed" : completedCount === 2 ? "pending" : "locked", grade: completedCount >= 3 ? "92/100" : null },
                { id: 4, title: "Django REST API", course: displayCourseTitle, dueDate: "In 2 Weeks", status: completedCount >= 4 ? "completed" : completedCount === 3 ? "pending" : "locked", grade: null },
                { id: 5, title: "Deploying Python App", course: displayCourseTitle, dueDate: "In 3 Weeks", status: completedCount >= 5 ? "completed" : completedCount === 4 ? "pending" : "locked", grade: null }
              ]
            : isDesign 
            ? [
                { id: 1, title: "Wireframing Basics", course: displayCourseTitle, dueDate: "Yesterday, 11:59 PM", status: completedCount >= 1 ? "completed" : "pending", grade: completedCount >= 1 ? "95/100" : null },
                { id: 2, title: "Figma Prototyping", course: displayCourseTitle, dueDate: "Tomorrow, 11:59 PM", status: completedCount >= 2 ? "completed" : "pending", grade: completedCount >= 2 ? "88/100" : null },
                { id: 3, title: "Design Systems", course: displayCourseTitle, dueDate: "Next Week", status: completedCount >= 3 ? "completed" : completedCount === 2 ? "pending" : "locked", grade: completedCount >= 3 ? "92/100" : null },
                { id: 4, title: "User Testing", course: displayCourseTitle, dueDate: "In 2 Weeks", status: completedCount >= 4 ? "completed" : completedCount === 3 ? "pending" : "locked", grade: null },
                { id: 5, title: "Final Portfolio Piece", course: displayCourseTitle, dueDate: "In 3 Weeks", status: completedCount >= 5 ? "completed" : completedCount === 4 ? "pending" : "locked", grade: null }
              ]
            : [
                { id: 1, title: "Build a REST API with Express", course: displayCourseTitle, dueDate: "Yesterday, 11:59 PM", status: completedCount >= 1 ? "completed" : "pending", grade: completedCount >= 1 ? "95/100" : null },
                { id: 2, title: "React Context API Project", course: displayCourseTitle, dueDate: "Tomorrow, 11:59 PM", status: completedCount >= 2 ? "completed" : "pending", grade: completedCount >= 2 ? "88/100" : null },
                { id: 3, title: "MongoDB Aggregation Pipeline", course: displayCourseTitle, dueDate: "Next Week", status: completedCount >= 3 ? "completed" : completedCount === 2 ? "pending" : "locked", grade: completedCount >= 3 ? "92/100" : null },
                { id: 4, title: "Authentication with JWT", course: displayCourseTitle, dueDate: "In 2 Weeks", status: completedCount >= 4 ? "completed" : completedCount === 3 ? "pending" : "locked", grade: null },
                { id: 5, title: "Deploying MERN App on AWS", course: displayCourseTitle, dueDate: "In 3 Weeks", status: completedCount >= 5 ? "completed" : completedCount === 4 ? "pending" : "locked", grade: null }
              ];

        const mockAssignments = [
            ...baseAssignments,
            { id: 6, title: "Integrate OpenAI/Gemini AI Chatbot (Complementary)", course: displayCourseTitle, dueDate: "Next Month", status: completedCount >= 6 ? "completed" : completedCount === 5 ? "pending" : "locked", grade: null },
            { id: 7, title: "AI Prompt Engineering & Fine-tuning", course: displayCourseTitle, dueDate: "Next Month", status: completedCount >= 7 ? "completed" : completedCount === 6 ? "pending" : "locked", grade: null },
            { id: 8, title: "Final Capstone AI Project", course: displayCourseTitle, dueDate: "End of Course", status: completedCount >= 8 ? "completed" : completedCount === 7 ? "pending" : "locked", grade: null }
        ];

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Assignments & Tasks</h2>
                        <p className="text-zinc-400">Complete your pending tasks to unlock your certificate.</p>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-emerald-400">{completedCount}</span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Completed</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-blue-400">{mockAssignments.filter(a => a.status === 'pending').length}</span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Pending</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {mockAssignments.map((assignment) => (
                        <div key={assignment.id} className={`luxury-glass p-6 rounded-2xl border ${assignment.status === 'completed' ? 'border-emerald-500/20' : assignment.status === 'locked' ? 'border-zinc-800' : 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'} flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/5`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0 ${assignment.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : assignment.status === 'locked' ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {assignment.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : assignment.status === 'locked' ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${assignment.status === 'locked' ? 'text-zinc-500' : 'text-zinc-200'} mb-1`}>{assignment.title}</h3>
                                    <p className="text-xs text-zinc-400 mb-3">{assignment.course}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                            <CalendarCheck className="w-4 h-4" /> Due: {assignment.dueDate}
                                        </div>
                                        {assignment.status === 'completed' && (
                                            <div className="flex items-center gap-1.5 text-emerald-500">
                                                <Star className="w-4 h-4" /> Score: {assignment.grade}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 md:min-w-[140px] justify-end">
                                {assignment.status === 'completed' ? (
                                    <span className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold border border-emerald-500/20 w-full text-center">Completed</span>
                                ) : assignment.status === 'locked' ? (
                                    <span className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-500 text-sm font-semibold w-full text-center">Locked</span>
                                ) : (
                                    <button onClick={() => setActiveAssignment(assignment)} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all w-full md:w-auto">Submit Task</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const QuizzesTab = () => {
        const quizzesCompleted = studentProfile?.enrolledCourses?.[0]?.quizzesCompleted || 0;
        
        const baseQuizzes = isPython
            ? [
                { id: 1, title: "Python Basics & Syntax", duration: "10 mins", questions: 10, status: "completed", score: "95%" },
                { id: 2, title: "Data Structures in Python", duration: "15 mins", questions: 15, status: "completed", score: "88%" },
                { id: 3, title: "Pandas & Numpy", duration: "15 mins", questions: 10, status: quizzesCompleted >= 1 ? "completed" : "pending", score: quizzesCompleted >= 1 ? "90%" : null },
                { id: 4, title: "Machine Learning Basics", duration: "20 mins", questions: 20, status: quizzesCompleted >= 2 ? "completed" : quizzesCompleted === 1 ? "pending" : "locked", score: null },
                { id: 5, title: "Model Evaluation", duration: "25 mins", questions: 25, status: quizzesCompleted >= 3 ? "completed" : quizzesCompleted === 2 ? "pending" : "locked", score: null }
              ]
            : isDesign
            ? [
                { id: 1, title: "Color Theory & Typography", duration: "10 mins", questions: 10, status: "completed", score: "95%" },
                { id: 2, title: "Wireframing Concepts", duration: "15 mins", questions: 15, status: "completed", score: "88%" },
                { id: 3, title: "Figma Shortcuts", duration: "15 mins", questions: 10, status: quizzesCompleted >= 1 ? "completed" : "pending", score: quizzesCompleted >= 1 ? "90%" : null },
                { id: 4, title: "Accessibility (a11y)", duration: "20 mins", questions: 20, status: quizzesCompleted >= 2 ? "completed" : quizzesCompleted === 1 ? "pending" : "locked", score: null },
                { id: 5, title: "Prototyping & Animation", duration: "25 mins", questions: 25, status: quizzesCompleted >= 3 ? "completed" : quizzesCompleted === 2 ? "pending" : "locked", score: null }
              ]
            : [
                { id: 1, title: "HTML5 & Web Semantics", duration: "10 mins", questions: 10, status: "completed", score: "95%" },
                { id: 2, title: "CSS Grid & Flexbox Mastery", duration: "15 mins", questions: 15, status: "completed", score: "88%" },
                { id: 3, title: "JavaScript Fundamentals", duration: "15 mins", questions: 10, status: quizzesCompleted >= 1 ? "completed" : "pending", score: quizzesCompleted >= 1 ? "90%" : null },
                { id: 4, title: "React Components & State", duration: "20 mins", questions: 15, status: quizzesCompleted >= 2 ? "completed" : quizzesCompleted === 1 ? "pending" : "locked", score: quizzesCompleted >= 2 ? "85%" : null },
                { id: 5, title: "Node.js Architecture", duration: "25 mins", questions: 20, status: quizzesCompleted >= 3 ? "completed" : quizzesCompleted === 2 ? "pending" : "locked", score: quizzesCompleted >= 3 ? "95%" : null }
              ];

        const mockQuizzes = [
            ...baseQuizzes,
            { id: 6, title: "MongoDB Queries", duration: "20 mins", questions: 15, status: "locked", score: null },
            { id: 7, title: "Generative AI in Web Dev", duration: "30 mins", questions: 20, status: "locked", score: null }
        ];

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Online MCQ Tests</h2>
                        <p className="text-zinc-400">Test your knowledge and earn XP points instantly!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockQuizzes.map((quiz) => (
                        <div key={quiz.id} className={`luxury-glass p-6 rounded-2xl border ${quiz.status === 'completed' ? 'border-emerald-500/20' : quiz.status === 'locked' ? 'border-zinc-800 opacity-60' : 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]'} relative overflow-hidden group`}>
                            {quiz.status === 'pending' && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all pointer-events-none"></div>}
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`p-3 rounded-xl ${quiz.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : quiz.status === 'locked' ? 'bg-zinc-800 text-zinc-500' : 'bg-purple-500/20 text-purple-400'}`}>
                                    {quiz.status === 'completed' ? <BadgeCheck className="w-6 h-6" /> : quiz.status === 'locked' ? <Lock className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                                </div>
                                {quiz.status === 'completed' && (
                                    <div className="text-right">
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Score</div>
                                        <div className="text-xl font-bold text-emerald-400">{quiz.score}</div>
                                    </div>
                                )}
                            </div>
                            
                            <h3 className={`text-lg font-bold ${quiz.status === 'locked' ? 'text-zinc-500' : 'text-white'} mb-2 relative z-10`}>{quiz.title}</h3>
                            
                            <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mb-6 relative z-10">
                                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {quiz.duration}</div>
                                <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {quiz.questions} Questions</div>
                            </div>
                            
                            <div className="relative z-10">
                                {quiz.status === 'completed' ? (
                                    <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-semibold transition-all">Review Answers</button>
                                ) : quiz.status === 'locked' ? (
                                    <button disabled className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm font-semibold cursor-not-allowed">Locked</button>
                                ) : (
                                    <button onClick={() => setActiveQuiz(quiz)} className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all animate-pulse hover:animate-none">Start Quiz Now</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const MentorsTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">Course Instructors & Mentors</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Instructor */}
                <div className="luxury-glass p-8 rounded-2xl relative overflow-hidden border-indigo-500/30 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-indigo-500/50 p-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop" alt="Mentor" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">Rohit Gupta</h3>
                                <BadgeCheck className="w-5 h-5 text-indigo-400" />
                            </div>
                            <p className="text-sm text-zinc-400 mb-3">Senior Full Stack Developer</p>
                            <p className="text-sm text-zinc-300 leading-relaxed mb-6">Expert in React, Node.js, and Cloud Architecture. Ex-Google engineer with 10+ years of experience.</p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2">
                                    <Video className="w-4 h-4" /> 1:1 Session
                                </button>
                                <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TA / Support Mentor */}
                <div className="luxury-glass p-8 rounded-2xl relative overflow-hidden border-zinc-800 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-700/10 blur-3xl rounded-full group-hover:bg-zinc-700/20 transition-all"></div>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-600/50 p-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" alt="Mentor" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">Sneha Gupta</h3>
                                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-sm text-zinc-400 mb-3">Teaching Assistant / Doubt Resolution</p>
                            <p className="text-sm text-zinc-300 leading-relaxed mb-6">Specializes in debugging JavaScript, MongoDB queries, and assignment support.</p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Available Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Mentor */}
                <div className="luxury-glass p-8 rounded-2xl relative overflow-hidden border-fuchsia-500/30 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full group-hover:bg-fuchsia-500/20 transition-all"></div>
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-fuchsia-500/50 p-1 shrink-0">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Mentor" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">Niskarsh</h3>
                                <BadgeCheck className="w-5 h-5 text-fuchsia-400" />
                            </div>
                            <p className="text-sm text-fuchsia-400 font-medium mb-3">Lead Generative AI Instructor</p>
                            <p className="text-sm text-zinc-300 leading-relaxed mb-6">Expert in Large Language Models, Prompt Engineering, LangChain, and integrating AI into modern web applications.</p>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <button className="px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(192,38,211,0.4)] transition-all flex items-center gap-2">
                                    <Video className="w-4 h-4" /> AI Masterclass
                                </button>
                                <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const CertificatesTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-6">My Achievements</h2>
            
            {/* Earned Certificate */}
            <div className="luxury-glass p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden border-amber-500/20 gap-6">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Award className="w-12 h-12 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">Full Stack Developer Certificate</h3>
                        <p className="text-sm text-zinc-400">Issued by Digital Byte Academy • Validated on Oct 15, 2026</p>
                        <div className="flex items-center gap-2 mt-3 text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 w-fit">
                            <CheckCircle className="w-3 h-3" /> Authentic & Verified
                        </div>
                    </div>
                </div>
                <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
                    <button onClick={handleDownloadCertificate} className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="w-full py-2 bg-transparent text-amber-400 hover:bg-amber-500/10 rounded-xl text-xs font-bold transition-colors border border-amber-500/20">
                        Share on LinkedIn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                {/* Upcoming/Locked Certificates */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-zinc-400" /> Locked Certificates
                    </h3>
                    <div className="space-y-4">
                        <div className="luxury-glass p-5 rounded-xl flex items-center gap-4 opacity-70 grayscale">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <Award className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium text-sm">Advanced React Patterns</h4>
                                <p className="text-xs text-zinc-500 mt-1">Complete Module 4 & 5 to unlock</p>
                            </div>
                        </div>
                        <div className="luxury-glass p-5 rounded-xl flex items-center gap-4 opacity-70 grayscale">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <Award className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium text-sm">Backend Architecture Expert</h4>
                                <p className="text-xs text-zinc-500 mt-1">Complete final project to unlock</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skill Badges */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-blue-400" /> Skill Badges
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="luxury-glass p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 border-b-2 border-b-blue-500">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Star className="w-5 h-5 fill-blue-500/50" />
                            </div>
                            <span className="text-xs font-semibold text-white">Frontend UI</span>
                        </div>
                        <div className="luxury-glass p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 border-b-2 border-b-emerald-500">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Star className="w-5 h-5 fill-emerald-500/50" />
                            </div>
                            <span className="text-xs font-semibold text-white">JavaScript</span>
                        </div>
                        <div className="luxury-glass p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 border-dashed opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
                                <Lock className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-zinc-400">React JS</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading Digital Byte Student Console...</div>;

    if (inCall) {
        return (
            <div className="h-screen w-screen bg-black relative">
                <button 
                    onClick={() => setInCall(false)}
                    className="absolute top-4 left-4 z-[999] bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-md font-bold transition-all flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" /> Leave Class
                </button>
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`DigitalByte_Class_${studentData.course?._id || 'general'}`}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableModeratorIndicator: true,
                        startScreenSharing: true,
                        enableEmailInStats: false
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                    }}
                    userInfo={{
                        displayName: user?.name || 'Student'
                    }}
                    getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; iframeRef.style.width = '100%'; }}
                />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Sidebar */}
            <aside className="w-72 luxury-glass border-r border-white/10 flex flex-col z-20 m-4 rounded-3xl overflow-hidden shadow-2xl relative">
                
                <div className="p-6 border-b border-white/5 relative z-10 flex flex-col items-center justify-center">
                    <div className="w-44 h-auto flex items-center justify-center mb-2">
                        <img src="/logo.png" alt="Digital Byte Logo" className="w-full h-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] hover:scale-105 transition-transform" />
                    </div>
                </div>
                
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                            <span className="font-semibold tracking-wide text-sm">Overview</span>
                        </div>
                        {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${activeTab === 'courses' ? 'bg-gradient-to-r from-purple-600/20 to-transparent border-l-4 border-l-purple-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <BookOpen className={`w-5 h-5 ${activeTab === 'courses' ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Course & Syllabus</span>
                        </div>
                        {activeTab === 'courses' && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('classes')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'classes' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <Video className={`w-5 h-5 ${activeTab === 'classes' ? 'text-pink-400' : 'group-hover:text-pink-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Live Classes</span>
                        </div>
                        {activeTab === 'classes' ? (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                        ) : (
                            <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-wider border border-pink-500/20">Live</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('assignments')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'assignments' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <ClipboardList className={`w-5 h-5 ${activeTab === 'assignments' ? 'text-emerald-400' : 'group-hover:text-emerald-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Assignments</span>
                        </div>
                        {activeTab === 'assignments' ? (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/20">{studentProfile?.enrolledCourses?.[0]?.assignmentsCompleted || 0}</span>
                        )}
                    </button>

                    <button 
                        onClick={() => setActiveTab('quizzes')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'quizzes' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <FileText className={`w-5 h-5 ${activeTab === 'quizzes' ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                            <span className="font-medium tracking-wide text-sm">MCQ Tests</span>
                        </div>
                        {activeTab === 'quizzes' ? (
                            <ChevronRight className="w-4 h-4 opacity-70" />
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold flex items-center justify-center border border-purple-500/20">{studentProfile?.enrolledCourses?.[0]?.quizzesCompleted || 0}</span>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('certificates')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'certificates' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <Award className={`w-5 h-5 ${activeTab === 'certificates' ? 'text-amber-400' : 'group-hover:text-amber-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Certificates</span>
                        </div>
                        {activeTab === 'certificates' && <ChevronRight className="w-4 h-4 opacity-70" />}
                    </button>

                    <button 
                        onClick={() => setActiveTab('mentors')}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${activeTab === 'mentors' ? 'bg-white/10 text-white border border-white/10 shadow-inner backdrop-blur-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-4">
                            <User className={`w-5 h-5 ${activeTab === 'mentors' ? 'text-indigo-400' : 'group-hover:text-indigo-400'}`} />
                            <span className="font-medium tracking-wide text-sm">Mentors</span>
                        </div>
                        {activeTab === 'mentors' && <ChevronRight className="w-4 h-4 opacity-70" />}
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
                        <h1 className="text-xl font-semibold text-zinc-200 capitalize">{activeTab === 'dashboard' ? 'Student Portal' : activeTab}</h1>
                    </div>
                    
                    <div className="flex items-center gap-6 luxury-glass px-6 py-2.5 rounded-full relative" ref={profileRef}>
                        <button className="relative text-zinc-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-[#0a0a0b]"></span>
                        </button>
                        
                        <div className="w-px h-6 bg-white/10"></div>
                        
                        {/* Profile Trigger */}
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="text-right">
                                <div className="text-sm font-bold text-white capitalize">{displayName}</div>
                                <div className="text-xs text-blue-400 capitalize">{user?.role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                                <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Professional Dropdown Popover */}
                        {isProfileOpen && (
                            <div className="absolute top-16 right-0 w-72 luxury-glass border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-4 duration-200 z-50">
                                <div className="p-4 border-b border-white/10">
                                    <p className="text-lg font-bold text-white capitalize">{displayName}</p>
                                    <p className="text-sm text-zinc-400 truncate">{user?.email || 'student@digitalbyte.com'}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 w-fit">
                                        <Shield className="w-3 h-3" />
                                        Verified {user?.role || 'Student'}
                                    </div>
                                </div>
                                <div className="p-2 space-y-1 mt-1">
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                                        <User className="w-4 h-4 text-zinc-400" /> My Profile
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                                        <Settings className="w-4 h-4 text-zinc-400" /> Account Settings
                                    </button>
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
                        
                        {/* Welcome (Only show on Dashboard) */}
                        {activeTab === 'dashboard' && (
                            <div>
                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                    Welcome back, <span className="text-gradient-luxury capitalize">{displayName}</span> 👋
                                </h2>
                                <p className="text-base text-zinc-400">Here are your pending tasks and summary for today.</p>
                            </div>
                        )}

                        {/* Render Tab Content */}
                        {activeTab === 'dashboard' && <OverviewTab />}
                        {activeTab === 'courses' && <CoursesTab />}
                        {activeTab === 'classes' && <LiveClassesTab />}
                        {activeTab === 'assignments' && <AssignmentsTab />}
                        {activeTab === 'quizzes' && <QuizzesTab />}
                        {activeTab === 'certificates' && <CertificatesTab />}
                        {activeTab === 'mentors' && <MentorsTab />}

                    </div>
                </div>
            </main>

            {/* Assignment Submit Modal */}
            {activeAssignment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl scale-in-center border border-white/10 relative">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                            <div>
                                <h3 className="text-white font-bold text-xl">Submit Assignment</h3>
                                <p className="text-blue-400 text-sm mt-1">{activeAssignment.title}</p>
                            </div>
                            <button onClick={() => setActiveAssignment(null)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        <div className="p-8">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Project Repository URL (GitHub, GitLab, etc.)</label>
                            <input type="url" placeholder="https://github.com/yourusername/project" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors mb-6" />
                            
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Live Demo URL (Vercel, Netlify, Render) - Optional</label>
                            <input type="url" placeholder="https://your-project.vercel.app" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors mb-8" />
                            
                            <button onClick={() => {
                                alert("Assignment Submitted Successfully! Your mentor will review it shortly.");
                                setActiveAssignment(null);
                            }} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Submit for Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            {activeQuiz && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-3xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl scale-in-center border border-white/10 relative">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
                            <div>
                                <h3 className="text-white font-bold text-xl">{activeQuiz.title}</h3>
                                <p className="text-zinc-400 text-sm mt-1">Question 1 of {activeQuiz.questions}</p>
                            </div>
                            <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        
                        {/* Quiz Body */}
                        <div className="p-8">
                            <h4 className="text-white text-lg font-medium mb-6 leading-relaxed">What is the primary purpose of React's Virtual DOM?</h4>
                            
                            <div className="space-y-4 mb-8">
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 cursor-pointer transition-all">
                                    <input type="radio" name="q1" className="w-5 h-5 accent-purple-500" />
                                    <span className="text-zinc-200 text-sm font-medium">To directly manipulate the browser's DOM faster</span>
                                </label>
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 cursor-pointer transition-all">
                                    <input type="radio" name="q1" className="w-5 h-5 accent-purple-500" />
                                    <span className="text-zinc-200 text-sm font-medium">To keep a lightweight in-memory representation of the UI and sync only changes</span>
                                </label>
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 cursor-pointer transition-all">
                                    <input type="radio" name="q1" className="w-5 h-5 accent-purple-500" />
                                    <span className="text-zinc-200 text-sm font-medium">To provide a virtual machine for executing JavaScript</span>
                                </label>
                                <label className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 cursor-pointer transition-all">
                                    <input type="radio" name="q1" className="w-5 h-5 accent-purple-500" />
                                    <span className="text-zinc-200 text-sm font-medium">None of the above</span>
                                </label>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <button className="px-6 py-2 rounded-xl bg-white/5 text-zinc-500 cursor-not-allowed font-medium text-sm">Previous</button>
                                <button className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">Next Question</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Chat Modal */}
            {isAIChatOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl scale-in-center border border-white/10 flex flex-col h-[600px] relative">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-fuchsia-500/50">
                                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="AI Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">Niskarsh (AI Assistant)</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-xs text-zinc-400">Online & Ready to Help</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsAIChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        
                        {/* Chat History */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent to-black/20">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.sender === 'ai' ? (
                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-fuchsia-500/30">
                                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="AI Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-purple-600 shrink-0 flex items-center justify-center text-white font-bold text-xs">
                                            YOU
                                        </div>
                                    )}
                                    <div className={`${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_15px_rgba(147,51,234,0.3)]' : 'bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm text-zinc-300'} p-4 text-sm max-w-[85%] whitespace-pre-wrap`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-black/60 border-t border-white/10">
                            <form className="relative" onSubmit={handleSendChatMessage}>
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Message Niskarsh AI..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/50 transition-colors" 
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </form>
                            <div className="text-[10px] text-zinc-500 text-center mt-3">AI Assistant can make mistakes. Consider verifying important information.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl scale-in-center border border-white/10 relative">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
                            <h3 className="text-white font-bold text-lg">{selectedVideo.title}</h3>
                            <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        
                        {/* Video Player */}
                        <div className="relative pt-[56.25%] bg-black">
                            <iframe 
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1`} 
                                title={selectedVideo.title} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {/* Fake Payment Processing Modal (Bypasses Razorpay strict KYC) */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl scale-in-center">
                        {/* Header */}
                        <div className="bg-blue-600 p-6 flex flex-col items-center justify-center text-white relative">
                            {['idle', 'upi_form', 'card_form'].includes(paymentStatus) && (
                                <button 
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                                >
                                    ✕
                                </button>
                            )}
                            {['upi_form', 'card_form'].includes(paymentStatus) && (
                                <button 
                                    onClick={() => setPaymentStatus('idle')}
                                    className="absolute top-4 left-4 text-white/70 hover:text-white text-sm flex items-center gap-1"
                                >
                                    ← Back
                                </button>
                            )}
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-inner">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold opacity-90">Digital Byte Academy</h2>
                            <p className="text-3xl font-bold mt-1 tracking-tight">₹{studentData.balance.toLocaleString()}</p>
                            <p className="text-sm opacity-80 mt-1">Fee Payment for {studentData.course?.title}</p>
                        </div>
                        
                        {/* Body */}
                        <div className="p-8 flex flex-col justify-center min-h-[300px]">
                            {paymentStatus === 'idle' ? (
                                <div className="w-full space-y-4 animate-in slide-in-from-left-4 duration-300">
                                    <p className="text-center text-sm text-gray-500 mb-6">Select a payment method to proceed.</p>
                                    <button onClick={() => setPaymentStatus('upi_form')} className="w-full py-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center gap-4 px-6 text-gray-700 font-semibold shadow-sm">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-6" alt="UPI" />
                                        Pay via UPI
                                        <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
                                    </button>
                                    <button onClick={() => setPaymentStatus('card_form')} className="w-full py-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center gap-4 px-6 text-gray-700 font-semibold shadow-sm">
                                        <CreditCard className="w-6 h-6 text-blue-500" />
                                        Pay via Credit/Debit Card
                                        <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
                                    </button>
                                </div>
                            ) : paymentStatus === 'upi_form' ? (
                                <div className="w-full animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-5" alt="UPI" />
                                        <h3 className="font-bold text-gray-800">Enter UPI Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">UPI ID or Phone Number</label>
                                            <input type="text" placeholder="e.g. 9876543210@ybl or username@upi" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium" />
                                        </div>
                                        <button onClick={processFakePayment} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-500/30 transition-all mt-4">
                                            Pay ₹{studentData.balance.toLocaleString()}
                                        </button>
                                    </div>
                                </div>
                            ) : paymentStatus === 'card_form' ? (
                                <div className="w-full animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <CreditCard className="w-6 h-6 text-blue-500" />
                                        <h3 className="font-bold text-gray-800">Enter Card Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number</label>
                                            <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-mono tracking-widest" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
                                                <input type="text" placeholder="MM/YY" maxLength="5" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-mono" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1">CVV</label>
                                                <input type="password" placeholder="•••" maxLength="3" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-mono" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Cardholder Name</label>
                                            <input type="text" placeholder="Name on card" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium" />
                                        </div>
                                        <button onClick={processFakePayment} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md shadow-blue-500/30 transition-all mt-4">
                                            Pay ₹{studentData.balance.toLocaleString()}
                                        </button>
                                    </div>
                                </div>
                            ) : paymentStatus === 'processing' ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment...</h3>
                                    <p className="text-sm text-gray-500 text-center px-4">Verifying details with your bank. Please do not close this window or press back.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                                        <CheckCircle className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                                    <p className="text-sm text-gray-500 text-center px-4 font-medium">Your ledger has been updated and a receipt has been generated.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secured by 100% Mock Demo Pay</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;


