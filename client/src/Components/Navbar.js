import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../Context/ThemeContext';
import axios from 'axios';
import { communityURL } from '../Config/config';
import logoSymbol from '../Assets/logo_symbol.png';
import ClickSpark from './animations/ClickSpark';
import SOSButton from './Emergency/SOSButton';

function Navbar() {
    const [currentUser, setCurrentUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [learnDropdownOpen, setLearnDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setLearnDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) setCurrentUser(JSON.parse(user));

        const handleStorageChange = () => {
            const user = localStorage.getItem('currentUser');
            setCurrentUser(user ? JSON.parse(user) : null);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLogin', handleStorageChange);
        window.addEventListener('userLogout', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleStorageChange);
            window.removeEventListener('userLogout', handleStorageChange);
        };
    }, []);

    const handleLogout = async () => {
        if (currentUser) {
            try {
                await axios.patch(`${communityURL}/users/${currentUser._id}/status`, { status: 'offline' });
            } catch (error) {
                console.error('Error updating status:', error);
            }
        }
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        window.dispatchEvent(new Event('userLogout'));
        navigate('/hearaid/home');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    const isLearnActive = location.pathname.includes('/hearaid/learn-sign') || location.pathname.includes('/hearaid/alphabet-syllabus');

    const navStyle = {
        background: scrolled ? 'var(--glass-bg)' : 'transparent',
        backdropFilter: scrolled ? 'var(--glass-blur)' : 'none',
        WebkitBackdropFilter: scrolled ? 'var(--glass-blur)' : 'none',
        borderBottom: scrolled ? 'var(--glass-border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: scrolled ? '8px 0' : '16px 0',
        zIndex: 1030
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg fixed-top" style={navStyle}>
                <div className="container-fluid px-3 px-xl-5">
                    {/* Brand Logo */}
                    <ClickSpark>
                        <Link to='/hearaid/home' className="navbar-brand d-flex align-items-center" style={{ gap: '10px' }}>
                            <div className="logo-box" style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glass-shadow)', border: '1px solid var(--border-light)', transition: 'all 0.3s', overflow: 'hidden', background: 'transparent' }}>
                                <img src={logoSymbol} alt="HearAid" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                            </div>
                            <span style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: '800', fontSize: '1.65rem', letterSpacing: '-0.5px'
                            }} className="text-gradient">HearAid</span>
                        </Link>
                    </ClickSpark>

                    {/* Mobile Controls */}
                    <div className="d-flex align-items-center d-lg-none" style={{ gap: '10px' }}>
                        <SOSButton />
                        <ClickSpark>
                            <button className="btn btn-link nav-link p-0" onClick={toggleTheme} style={{ width: '38px', height: '38px' }}>
                                <i className={`fa ${theme === 'light' ? 'fa-moon-o' : 'fa-sun-o'} fs-5`} style={{ color: 'var(--text-primary)' }}></i>
                            </button>
                        </ClickSpark>
                        <ClickSpark>
                            <button className="btn p-0" onClick={toggleSidebar} style={{ width: '38px', height: '38px', background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fas fa-bars"></i>
                            </button>
                        </ClickSpark>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="collapse navbar-collapse d-none d-lg-block">
                        <ul className="navbar-nav ms-auto align-items-center" style={{ gap: '14px', fontFamily: "'Outfit', sans-serif", fontWeight: '500', fontSize: '0.95rem' }}>
                            {/* Home */}
                            <li className="nav-item">
                                <ClickSpark>
                                    <Link to="/hearaid/home" className="nav-link" style={{
                                        color: location.pathname === '/hearaid/home' || location.pathname === '/' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', position: 'relative', padding: '6px 10px'
                                    }}>
                                        Home
                                    </Link>
                                </ClickSpark>
                            </li>

                            {/* Convert */}
                            <li className="nav-item">
                                <ClickSpark>
                                    <Link to="/hearaid/convert" className="nav-link" style={{
                                        color: location.pathname === '/hearaid/convert' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', position: 'relative', padding: '6px 10px'
                                    }}>
                                        Convert
                                    </Link>
                                </ClickSpark>
                            </li>

                            {/* Live Sign */}
                            <li className="nav-item">
                                <ClickSpark>
                                    <Link to="/hearaid/live-sign" className="nav-link" style={{
                                        color: location.pathname === '/hearaid/live-sign' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', position: 'relative', padding: '6px 10px'
                                    }}>
                                        Live Sign
                                    </Link>
                                </ClickSpark>
                            </li>

                            {/* Learn Dropdown */}
                            <li
                                className="nav-item position-relative"
                                ref={dropdownRef}
                                onMouseEnter={() => setLearnDropdownOpen(true)}
                                onMouseLeave={() => setLearnDropdownOpen(false)}
                            >
                                <button
                                    onClick={() => setLearnDropdownOpen(!learnDropdownOpen)}
                                    className="btn btn-link nav-link d-flex align-items-center gap-1 text-decoration-none"
                                    style={{
                                        color: isLearnActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', padding: '6px 10px'
                                    }}
                                >
                                    <span>Learn</span>
                                    <i className={`fas fa-chevron-down ms-1`} style={{ fontSize: '0.75rem', transition: 'transform 0.2s', transform: learnDropdownOpen ? 'rotate(180deg)' : 'none' }}></i>
                                </button>

                                {learnDropdownOpen && (
                                    <div
                                        className="position-absolute start-0 mt-1 p-2 rounded-3 shadow-lg"
                                        style={{
                                            background: 'var(--glass-bg, rgba(17, 24, 39, 0.95))',
                                            backdropFilter: 'blur(16px)',
                                            border: '1px solid var(--border-light, rgba(255,255,255,0.15))',
                                            minWidth: '190px',
                                            zIndex: 1050,
                                            animation: 'fadeIn 0.2s ease'
                                        }}
                                    >
                                        <Link
                                            to="/hearaid/learn-sign"
                                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2 px-3 text-decoration-none"
                                            style={{
                                                color: location.pathname === '/hearaid/learn-sign' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                                background: location.pathname === '/hearaid/learn-sign' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => setLearnDropdownOpen(false)}
                                        >
                                            <i className="fas fa-graduation-cap text-cyan" style={{ color: 'var(--accent-cyan)' }}></i>
                                            <span>Learn Sign (3D)</span>
                                        </Link>
                                        <Link
                                            to="/hearaid/alphabet-syllabus"
                                            className="dropdown-item rounded-2 d-flex align-items-center gap-2 py-2 px-3 text-decoration-none mt-1"
                                            style={{
                                                color: location.pathname === '/hearaid/alphabet-syllabus' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                                background: location.pathname === '/hearaid/alphabet-syllabus' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                                fontSize: '0.9rem'
                                            }}
                                            onClick={() => setLearnDropdownOpen(false)}
                                        >
                                            <i className="fas fa-book text-cyan" style={{ color: 'var(--accent-cyan)' }}></i>
                                            <span>Syllabus (A-Z)</span>
                                        </Link>
                                    </div>
                                )}
                            </li>

                            {/* Community */}
                            <li className="nav-item">
                                <ClickSpark>
                                    <Link to="/hearaid/community" className="nav-link" style={{
                                        color: location.pathname === '/hearaid/community' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', position: 'relative', padding: '6px 10px'
                                    }}>
                                        Community
                                    </Link>
                                </ClickSpark>
                            </li>

                            {/* Voice AI */}
                            <li className="nav-item">
                                <ClickSpark>
                                    <Link to="/hearaid/voice-assistant" className="nav-link" style={{
                                        color: location.pathname === '/hearaid/voice-assistant' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                        whiteSpace: 'nowrap', position: 'relative', padding: '6px 10px'
                                    }}>
                                        Voice AI
                                    </Link>
                                </ClickSpark>
                            </li>

                            {/* Emergency SOS Button */}
                            <li className="nav-item">
                                <SOSButton />
                            </li>

                            {/* Profile & Auth */}
                            {currentUser ? (
                                <>
                                    <li className="nav-item">
                                        <ClickSpark>
                                            <Link to='/hearaid/profile' className="btn-premium-outline rounded-pill px-3 py-1.5" style={{ textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                                Profile
                                            </Link>
                                        </ClickSpark>
                                    </li>
                                    <li className="nav-item">
                                        <ClickSpark>
                                            <button onClick={handleLogout} className="btn-premium rounded-pill px-3 py-1.5" style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                                Logout
                                            </button>
                                        </ClickSpark>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <ClickSpark>
                                        <Link to='/hearaid/login' className="btn-premium rounded-pill px-3 py-1.5" style={{ textDecoration: 'none', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                                            Login
                                        </Link>
                                    </ClickSpark>
                                </li>
                            )}

                            {/* Theme Toggle */}
                            <li className="nav-item ms-1">
                                <ClickSpark>
                                    <button className="btn btn-link nav-link p-1" onClick={toggleTheme} title="Toggle Theme" style={{
                                        background: 'var(--bg-surface-hover)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <i className={`fa ${theme === 'light' ? 'fa-moon-o' : 'fa-sun-o'} fs-6`} style={{ color: 'var(--accent-cyan)' }}></i>
                                    </button>
                                </ClickSpark>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Premium Sidebar Mobile */}
            <div className="sidebar" style={{
                position: 'fixed', top: 0, right: 0, width: '320px', height: '100vh',
                background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(20px)',
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 1050,
                borderLeft: '1px solid var(--bg-surface-hover)', overflowY: 'auto'
            }}>
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom" style={{ borderColor: 'var(--bg-surface-hover)' }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: '1.5rem' }} className="text-gradient">Menu</span>
                    <ClickSpark>
                        <button className="btn btn-link p-0 text-decoration-none" onClick={closeSidebar}>
                            <i className="fas fa-times fs-4" style={{ color: 'var(--text-secondary)' }}></i>
                        </button>
                    </ClickSpark>
                </div>
                <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="mb-2">
                        <SOSButton variant="sidebar" />
                    </div>

                    {[
                        { name: 'Home', path: '/hearaid/home', icon: 'fa-home' },
                        { name: 'Convert', path: '/hearaid/convert', icon: 'fa-exchange-alt' },
                        { name: 'Live Sign', path: '/hearaid/live-sign', icon: 'fa-camera' },
                        { name: 'Learn Sign (3D)', path: '/hearaid/learn-sign', icon: 'fa-graduation-cap' },
                        { name: 'Syllabus (A-Z)', path: '/hearaid/alphabet-syllabus', icon: 'fa-book' },
                        { name: 'Community', path: '/hearaid/community', icon: 'fa-users' },
                        { name: 'Voice AI', path: '/hearaid/voice-assistant', icon: 'fa-microphone' }
                    ].map((item, idx) => (
                        <ClickSpark key={idx} style={{ display: 'flex', width: '100%' }}>
                            <Link to={item.path} className="nav-link" style={{
                                padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px',
                                background: location.pathname === item.path ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                                color: location.pathname === item.path ? 'var(--accent-cyan)' : 'var(--text-primary)',
                                transition: 'all 0.2s', fontWeight: '500', width: '100%'
                            }} onClick={closeSidebar}>
                                <i className={`fas ${item.icon}`} style={{ width: '20px', textAlign: 'center' }}></i> {item.name}
                            </Link>
                        </ClickSpark>
                    ))}

                    <hr style={{ borderColor: 'var(--bg-surface-hover)', margin: '10px 0' }} />

                    {currentUser ? (
                        <>
                            <ClickSpark style={{ display: 'flex', width: '100%' }}>
                                <Link to='/hearaid/profile' className="nav-link" style={{ padding: '12px 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }} onClick={closeSidebar}>
                                    <i className="fas fa-user" style={{ width: '20px', textAlign: 'center' }}></i> Profile
                                </Link>
                            </ClickSpark>
                            <ClickSpark style={{ display: 'block', width: '100%' }}>
                                <button onClick={() => { handleLogout(); closeSidebar(); }} className="btn btn-premium w-100 mt-2">
                                    <i className="fas fa-sign-out-alt me-2"></i> Logout
                                </button>
                            </ClickSpark>
                        </>
                    ) : (
                        <ClickSpark style={{ display: 'block', width: '100%' }}>
                            <Link to='/hearaid/login' className="btn btn-premium w-100 mt-2" onClick={closeSidebar}>
                                <i className="fas fa-sign-in-alt me-2"></i> Login
                            </Link>
                        </ClickSpark>
                    )}
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'var(--border-light)', backdropFilter: 'blur(4px)', zIndex: 1040,
                    animation: 'fadeIn 0.3s ease'
                }} onClick={closeSidebar}></div>
            )}
        </>
    );
}

export default Navbar;