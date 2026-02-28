import React, { useState, useEffect } from 'react';
import { collection, serverTimestamp, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Radio, Send, Bell, Clock, Search, ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, info) { this.setState({ info }); }
    render() {
        if (this.state.hasError) return <div style={{ padding: '2rem', color: 'red' }}><h1>Error:</h1><pre>{this.state.error.toString()}</pre><pre>{this.state.info?.componentStack}</pre></div>;
        return this.props.children;
    }
}

const BroadcastContent = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all'); // all, volunteers, victims
    const [isSending, setIsSending] = useState(false);

    const [pastBroadcasts, setPastBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'notifications'));
        const unsub = onSnapshot(q, (snapshot) => {
            const history = [];
            snapshot.forEach(doc => {
                // only show broadcast types here
                if (doc.data().type === 'broadcast') {
                    history.push({ id: doc.id, ...doc.data() });
                }
            });
            history.sort((a, b) => (b.timestamp?.toMillis ? b.timestamp.toMillis() : 0) - (a.timestamp?.toMillis ? a.timestamp.toMillis() : 0));
            setPastBroadcasts(history);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return alert("Title and Message are required.");
        setIsSending(true);
        try {
            let androidTarget = "all";
            if (target === "volunteer") androidTarget = "all_volunteers";
            if (target === "victim") androidTarget = "all_victims";

            const newDocRef = doc(collection(db, 'notifications'));
            await setDoc(newDocRef, {
                notificationId: newDocRef.id,
                title,
                message,
                targetUserId: androidTarget,
                read: false,
                type: 'broadcast',
                timestamp: serverTimestamp(),
            });
            setTitle('');
            setMessage('');
            setTarget('all');
            alert("Broadcast sent successfully! Devices will be notified.");
        } catch (error) {
            console.error("Broadcast failed:", error);
            alert("Failed to send broadcast.");
        }
        setIsSending(false);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Network Broadcasts</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Send high-priority alerts across the entire AASRA application.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <ShieldAlert size={20} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Emergency Siren Ready</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Compose Form */}
                <form className="card glass" onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}><Radio size={18} /> Compose Alert</h3>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Broadcast Title</label>
                        <input type="text" className="input-field" required placeholder="E.g. Flash Flood Warning in Zone A" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Message Payload</label>
                        <textarea className="input-field" required rows="5" placeholder="Enter emergency protocol instructions or general alert..." value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical' }}></textarea>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Audience Targeting</label>
                        <select className="input-field" value={target} onChange={e => setTarget(e.target.value)}>
                            <option value="all">Everyone (Volunteers & Victims)</option>
                            <option value="volunteer">Volunteers Only</option>
                            <option value="victim">Victims Only</option>
                        </select>
                    </div>

                    <button type="submit" disabled={isSending} className="btn-primary" style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1rem', width: '100%' }}>
                        {isSending ? 'Transmitting...' : <><Send size={18} /> Dispatch Broadcast Alert</>}
                    </button>
                </form>

                {/* History */}
                <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} /> Transmission History</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
                        {loading ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading logs...</div>
                        ) : pastBroadcasts.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>No broadcasts history found.</div>
                        ) : (
                            pastBroadcasts.map(b => (
                                <div key={b.id} style={{ background: 'var(--bg-color)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{b.title}</h4>
                                        <span className="badge warning-bg text-warning" style={{ fontSize: '0.65rem' }}>{(b.targetUserId || b.target || 'ALL').toUpperCase()}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{b.message}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Clock size={12} /> {b.timestamp?.toDate ? b.timestamp.toDate().toLocaleString() : 'Unknown Time'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Broadcast = () => (
    <ErrorBoundary>
        <BroadcastContent />
    </ErrorBoundary>
);

export default Broadcast;
