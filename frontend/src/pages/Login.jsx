import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, ShieldCheck, Info, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });
    const navigate = useNavigate();
    const { login, logout } = useContext(AuthContext);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('logout') === 'true') {
            if (typeof logout === 'function') {
                logout();
            }
        }
        
        const autoLogin = params.get('autologin');
        
        if (autoLogin === 'true') {
            const urlEmail = params.get('email');
            const urlPassword = params.get('password');
            const urlRemember = params.get('remember') === 'true';
            
            if (urlEmail && urlPassword) {
                setEmail(urlEmail);
                setPassword(urlPassword);
                setRememberMe(urlRemember);
                
                // Auto login from landing page
                performLogin(urlEmail, urlPassword, urlRemember);
            }
        } else {
            const savedEmail = localStorage.getItem('rememberedEmail');
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        }
    }, []);

    const performLogin = async (loginEmail, loginPassword, isRememberMe) => {
        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: loginEmail,
                password: loginPassword
            });
            
            login(response.data);
            
            if (isRememberMe) {
                localStorage.setItem('rememberedEmail', loginEmail);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            if (response.data.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (response.data.role === 'trainer') {
                navigate('/trainer/dashboard');
            } else {
                navigate('/student/dashboard');
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        performLogin(email, password, rememberMe);
    };

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
        const rotateY = ((x - centerX) / centerX) * 10;
        
        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-out'
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
            {/* Dynamic Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]" style={{ animation: 'orb-float-1 20s infinite ease-in-out' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[120px]" style={{ animation: 'orb-float-2 25s infinite ease-in-out reverse' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]" style={{ animation: 'orb-float-3 15s infinite ease-in-out' }}></div>
            </div>

            <div 
                className="w-full max-w-md relative z-20"
                style={{ ...tiltStyle, transformStyle: 'preserve-3d' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                
                <div className="text-center mb-8" style={{ transform: 'translateZ(30px)' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
                        <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-zinc-400 text-sm">Sign in to your Digital Byte Academy portal</p>
                </div>

                <form 
                    onSubmit={handleLogin} 
                    className="bg-[#1a1a24]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group"
                    style={{ transform: 'translateZ(10px)' }}
                >
                    {/* Dynamic Glow inside form */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>    {/* Top gradient border highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3 backdrop-blur-md">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <div>{error}</div>
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        <div className="group focus-within:scale-[1.02] transition-transform duration-300">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="luxury-input w-full pl-11 pr-4 py-3 rounded-xl text-sm" 
                                    placeholder="student@digitalbyte.com"
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="group focus-within:scale-[1.02] transition-transform duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-zinc-300">Password</label>
                                <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="luxury-input w-full pl-11 pr-12 py-3 rounded-xl text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`relative flex items-center justify-center w-4 h-4 rounded border transition-colors overflow-hidden ${rememberMe ? 'border-blue-500 bg-blue-500' : 'border-zinc-600 bg-black/20 group-hover:border-blue-500'}`}>
                                    <input 
                                        type="checkbox" 
                                        className="absolute opacity-0 cursor-pointer w-full h-full z-10" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    {rememberMe && (
                                        <svg className="w-3 h-3 text-white relative z-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn-luxury w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 font-semibold shadow-lg"
                        >
                            {isLoading ? (
                                <span>Authenticating...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="text-center text-sm text-zinc-400">
                            Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign Up</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
