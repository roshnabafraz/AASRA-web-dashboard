import React from 'react';
import './About.css';
import { Shield, Smartphone, Globe, HeartHandshake } from 'lucide-react';

const About = () => {
    return (
        <div className="about-container animate-fade-in">
            <div className="about-header">
                <h1>About AASRA</h1>
                <p>Empowering communities through technology and compassion</p>
            </div>

            <div className="about-content">
                <div className="about-section card glass">
                    <h2>Our Mission</h2>
                    <p>
                        AASRA is dedicated to bridging the gap between victims in need and willing volunteers.
                        Through our comprehensive mobile application and this administrative dashboard, we facilitate
                        rapid response, resource allocation, and sustained support for those impacted by crises.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card card glass">
                        <div className="feature-icon"><Smartphone size={32} /></div>
                        <h3>Mobile First</h3>
                        <p>Direct access for victims and volunteers via our dedicated Android application.</p>
                    </div>

                    <div className="feature-card card glass">
                        <div className="feature-icon"><Globe size={32} /></div>
                        <h3>Web Oversight</h3>
                        <p>Centralized control, analytics, and verification through the Admin Dashboard.</p>
                    </div>

                    <div className="feature-card card glass">
                        <div className="feature-icon"><Shield size={32} /></div>
                        <h3>Secure & Verified</h3>
                        <p>Robust authentication and role-based access ensure data privacy and operational integrity.</p>
                    </div>

                    <div className="feature-card card glass">
                        <div className="feature-icon"><HeartHandshake size={32} /></div>
                        <h3>Community Driven</h3>
                        <p>Powered by the generosity of donors and the dedication of our active volunteers.</p>
                    </div>
                </div>

                <div className="about-footer card glass">
                    <p>© {new Date().getFullYear()} AASRA Initiative. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default About;
