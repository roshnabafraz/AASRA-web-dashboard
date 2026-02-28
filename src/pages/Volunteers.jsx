import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Activity, Phone, Mail, Award, ShieldAlert, BadgeCheck } from 'lucide-react';

const Volunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedVolunteers = [];
            snapshot.forEach((doc) => {
                fetchedVolunteers.push({ id: doc.id, ...doc.data() });
            });
            fetchedVolunteers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setVolunteers(fetchedVolunteers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching volunteers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeactivate = async (id) => {
        try {
            const userRef = doc(db, 'users', id);
            await updateDoc(userRef, { role: 'inactive_volunteer' });
        } catch (e) {
            alert("Demotion feature depends on Firestore rules. Action failed currently.");
        }
    };

    const filteredVolunteers = volunteers.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.skills?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Responder Directory</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Organization's verified network of active volunteers.</p>
                </div>

                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Find by name, skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-family)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading volunteer profiles...</div>
            ) : filteredVolunteers.length === 0 ? (
                <div className="card glass table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No volunteers match your criteria.
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredVolunteers.map(vol => (
                        <div key={vol.id} className="card glass report-card" style={{ alignItems: 'center', textAlign: 'center', paddingTop: '2rem' }}>

                            <div style={{ position: 'relative', margin: '0 auto 1.5rem auto' }}>
                                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(15, 70, 39, 0.3)' }}>
                                    {vol.name ? vol.name.charAt(0).toUpperCase() : 'V'}
                                </div>
                                <div style={{ position: 'absolute', bottom: '2px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success)', border: '3px solid var(--surface)' }} title="Online"></div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>{vol.name || 'Unnamed Volunteer'}</h3>
                                <BadgeCheck size={18} color="var(--primary)" />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '1rem', width: '100%', background: 'var(--bg-color)', padding: '1rem', borderRadius: '12px' }}>
                                <a href={`mailto:${vol.email}`} style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <Mail size={16} color="var(--text-muted)" /> {vol.email}
                                </a>
                                {vol.phone && (
                                    <a href={`tel:${vol.phone}`} style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                        <Phone size={16} color="var(--text-muted)" /> {vol.phone}
                                    </a>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', width: '100%' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Specialized Skills</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                    {vol.skills ? vol.skills.split(',').map((skill, i) => (
                                        <span key={i} style={{ background: 'rgba(15, 70, 39, 0.1)', border: '1px solid rgba(15, 70, 39, 0.2)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 500 }}>
                                            {skill.trim()}
                                        </span>
                                    )) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', background: 'var(--border)', padding: '4px 12px', borderRadius: '16px' }}>General Hand</span>
                                    )}
                                </div>
                            </div>



                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Volunteers;
