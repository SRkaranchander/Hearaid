import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-light)',
            backdropFilter: 'var(--glass-blur)',
            paddingTop: '60px',
            marginTop: '80px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Top glowing accent */}
            <div style={{
                position: 'absolute', top: 0, left: '0', width: '100%', height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-blue), transparent)',
                opacity: 0.7
            }}></div>

            <div className="container pb-5">
                <div className="row gy-5">
                    <div className="col-lg-4 col-md-6 mb-4 pe-lg-5">
                        <div className="d-flex align-items-center mb-4" style={{ gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'var(--gradient-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: 'var(--accent-glow)'
                            }}>
                                <i className="fa fa-sign-language text-primary"></i>
                            </div>
                            <h4 className="text-gradient mb-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>HearAid</h4>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                            A next-generation, premium toolkit powered by AI, containing advanced features for translating and learning American Sign Language through interactive 3D avatars.
                        </p>
                        <div className="d-flex gap-3 mt-4">
                            <a href="https://github.com/spectre900/Audio-to-Sign-Language-using-3D-Avatars" target="_blank" rel="noreferrer" style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-hover)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)',
                                transition: 'all 0.3s', border: '1px solid var(--bg-surface-hover)'
                            }} onMouseOver={e => e.currentTarget.style.background = 'var(--accent-cyan)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}>
                                <i className="fab fa-github"></i>
                            </a>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4">
                        <h5 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>Services</h5>
                        <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {['Convert', 'Learn Sign', 'Videos'].map(item => (
                                <li key={item}>
                                    <Link to={`/hearaid/${item.toLowerCase().replace(' ', '-')}`} style={{
                                        color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none'
                                    }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-cyan)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4">
                        <h5 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>Quick Links</h5>
                        <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <li>
                                <Link to='/hearaid/home' style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-cyan)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Home</Link>
                            </li>
                            <li>
                                <Link to='/hearaid/feedback' style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-cyan)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Feedback</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-4 col-md-6 mb-4">
                        <h5 className="mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}>Contact Us</h5>
                        <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-secondary)' }}>
                            <li className="d-flex align-items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                                    <i className="fa fa-map-marker-alt"></i>
                                </div>
                                <span>NITK Surathkal, Mangalore</span>
                            </li>
                            <li className="d-flex align-items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                                    <i className="fa fa-envelope"></i>
                                </div>
                                <span>contact@hearaid.edu.in</span>
                            </li>
                            <li className="d-flex align-items-center gap-3">
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                                    <i className="fa fa-phone-alt"></i>
                                </div>
                                <span>+91 9008240665</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--border-light)', borderTop: '1px solid var(--bg-surface-hover)', padding: '20px 0', textAlign: 'center' }}>
                <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} HearAid by Team HearAid. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;