import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';
import { LogIn } from 'lucide-react';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { currentUser, isAdmin } = useAuth();

    // If already logged in and is admin, redirect to dashboard
    if (currentUser && isAdmin) {
        return <Navigate to="/" replace />;
    }

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check admin status
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists() && userDoc.data().role === 'admin') {
                navigate('/');
            } else {
                // Handled in AuthContext as well, but we can set explicit error here for UX
                auth.signOut();
                setError('Access Denied: You do not have admin privileges.');
            }
        } catch (err) {
            console.error(err);
            setError(`Login Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card glass">
                <div className="signin-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/aasra_logo.svg" alt="AASRA Logo" style={{ width: '50px', height: '50px' }} />
                        <h1 className="logo" style={{ margin: 0 }}>AASRA</h1>
                    </div>
                    <p style={{ margin: 0 }}>Admin Portal Sign In</p>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSignIn} className="signin-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@aasra.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary signin-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                <LogIn size={20} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
