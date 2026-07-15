import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    LogOut, LayoutDashboard, Users, BookOpen, Settings, Bell, 
    Upload, FileText, Video, Link as LinkIcon, Plus, Trash2, CalendarCheck, FileVideo, Presentation
} from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TrainerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('overview');
    const [courses, setCourses] = useState([]);
    const [contents, setContents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loading, setLoading] = useState(true);
    const [inCall, setInCall] = useState(false);
    const navigate = useNavigate();

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        title: '', description: '', type: 'Video', url: '', moduleName: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // In a real app, you'd fetch courses assigned to this trainer
                const res = await axios.get('http://localhost:5000/api/courses');
                setCourses(res.data);
                if (res.data.length > 0) {
                    setSelectedCourse(res.data[0]._id);
                }
            } catch (err) {
                console.error("Error fetching courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchContents = async () => {
            if (!selectedCourse) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/content/course/${selectedCourse}`, {
                    headers: { 'x-auth-token': user?.token }
                });
                setContents(res.data);
            } catch (err) {
                console.error("Error fetching contents", err);
            }
        };
        fetchContents();
    }, [selectedCourse, user?.token]);

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/content', {
                ...uploadData,
                courseId: selectedCourse
            }, {
                headers: { 'x-auth-token': user?.token }
            });
            setContents([res.data, ...contents]);
            setUploadData({ title: '', description: '', type: 'Video', url: '', moduleName: '' });
            alert("Content uploaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this content?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/content/${id}`, {
                headers: { 'x-auth-token': user?.token }
            });
            setContents(contents.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
        }
    };

    const OverviewTab = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name || 'Instructor'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="luxury-glass p-6 rounded-2xl border-blue-500/20 group hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">My Batches</h3>
                    <p className="text-zinc-400 mb-4">Manage your assigned students and track their progress.</p>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors border border-white/10">
                        View Students
                    </button>
                </div>
                
                <div className="luxury-glass p-6 rounded-2xl border-emerald-500/20 group hover:border-emerald-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Mark Attendance</h3>
                    <p className="text-zinc-400 mb-4">Record student attendance for today's live classes.</p>
                    <button className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors">
                        Open Register
                    </button>
                </div>

                <div className="luxury-glass p-6 rounded-2xl border-purple-500/20 group hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Presentation className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 rounded-full flex items-center gap-1 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Live Action
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Start Live Class</h3>
                    <p className="text-zinc-400 mb-4">Initiate a live video session with your batch.</p>
                    <button onClick={() => setInCall(true)} className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" /> Start Meeting
                    </button>
                </div>
            </div>
        </div>
    );

    const LMSContentTab = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Course Content Manager</h2>
                    <p className="text-sm text-zinc-400">Upload and organize study materials for your students.</p>
                </div>
                <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="luxury-input py-2 px-4 rounded-xl text-white bg-black/50 border border-white/10 w-64"
                >
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <div className="luxury-glass p-6 rounded-2xl lg:col-span-1 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-400" /> New Material
                    </h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Title</label>
                            <input required type="text" value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} className="luxury-input w-full p-2.5 rounded-xl text-sm" placeholder="e.g. React Hooks Deep Dive" />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Module Name</label>
                            <input required type="text" value={uploadData.moduleName} onChange={e => setUploadData({...uploadData, moduleName: e.target.value})} className="luxury-input w-full p-2.5 rounded-xl text-sm" placeholder="e.g. Module 4" />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Material Type</label>
                            <select value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value})} className="luxury-input w-full p-2.5 rounded-xl text-sm bg-black/50">
                                <option value="Video">Video / Recorded Lecture</option>
                                <option value="PDF">PDF / Notes</option>
                                <option value="Link">External Link</option>
                                <option value="Assignment">Assignment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-400 mb-1">Resource URL (Drive/YouTube)</label>
                            <input required type="url" value={uploadData.url} onChange={e => setUploadData({...uploadData, url: e.target.value})} className="luxury-input w-full p-2.5 rounded-xl text-sm" placeholder="https://" />
                        </div>
                        <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex justify-center items-center gap-2">
                            <Plus className="w-4 h-4" /> Publish Material
                        </button>
                    </form>
                </div>

                {/* Content List */}
                <div className="luxury-glass p-6 rounded-2xl lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-4">Published Materials</h3>
                    <div className="space-y-3">
                        {contents.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">No content published for this course yet.</div>
                        ) : contents.map(content => (
                            <div key={content._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        content.type === 'Video' ? 'bg-red-500/20 text-red-400' : 
                                        content.type === 'PDF' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                        {content.type === 'Video' ? <Video className="w-5 h-5"/> : 
                                         content.type === 'PDF' ? <FileText className="w-5 h-5"/> : <LinkIcon className="w-5 h-5"/>}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{content.title}</h4>
                                        <p className="text-xs text-zinc-400">{content.moduleName} • {new Date(content.dateUploaded).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={content.url} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-white bg-black/20 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4" />
                                    </a>
                                    <button onClick={() => handleDelete(content._id)} className="p-2 text-red-400/70 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading Trainer Console...</div>;

    if (inCall) {
        return (
            <div className="h-screen w-screen bg-black relative">
                <button 
                    onClick={() => setInCall(false)}
                    className="absolute top-4 left-4 z-[999] bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl backdrop-blur-md font-bold transition-all flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" /> End Class
                </button>
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`DigitalByte_Class_${selectedCourse || 'general'}`}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        disableModeratorIndicator: false,
                        startScreenSharing: false,
                        enableEmailInStats: false
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false
                    }}
                    userInfo={{
                        displayName: user?.name || 'Instructor'
                    }}
                    getIFrameRef={(iframeRef) => { iframeRef.style.height = '100%'; iframeRef.style.width = '100%'; }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] font-['Outfit'] selection:bg-blue-500/30 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col fixed h-full z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Digital Byte</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                        <Upload className="w-5 h-5" /> Course Materials
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-inner">
                            {user?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-zinc-400 capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-20 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    <h1 className="text-lg font-medium text-white">Trainer Console</h1>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 transition-colors">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                
                <div className="p-8">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'content' && <LMSContentTab />}
                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;
