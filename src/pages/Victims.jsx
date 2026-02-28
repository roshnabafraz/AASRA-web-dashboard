import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, UserCheck, Mail, Phone, ExternalLink, Siren } from 'lucide-react';

const Victims = () => {
    const [victims, setVictims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Fetch users with role 'victim'
        const q = query(collection(db, 'users'), where('role', '==', 'victim'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedVictims = [];
            snapshot.forEach((doc) => {
                fetchedVictims.push({ id: doc.id, ...doc.data() });
            });
            fetchedVictims.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setVictims(fetchedVictims);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching victims:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredVictims = victims.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.includes(searchTerm)
    );

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Protected Community</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Registered end-users tracked in the AASRA ecosystem.</p>
                </div>

                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Search affected accounts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-family)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Gathering registry logs...</div>
            ) : filteredVictims.length === 0 ? (
                <div className="card glass table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No victim profiles found.
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredVictims.map(victim => (
                        <div key={victim.id} className="card glass report-card">

                            <div className="card-header" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--border)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 'bold' }}>
                                        {victim.name ? victim.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '2px', color: 'var(--text-main)' }}>{victim.name || 'Anonymous User'}</h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {victim.id.slice(0, 10)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Core Data</div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                                        <Mail size={16} color="var(--primary)" />
                                        <span style={{ color: 'var(--text-main)' }}>{victim.email || 'No email attached'}</span>
                                    </div>

                                    <div style={{ width: '100%', height: '1px', background: 'var(--border)' }}></div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                                        <Phone size={16} color="var(--success)" />
                                        <span style={{ color: 'var(--text-main)' }}>{victim.phone || 'No phone attached'}</span>
                                    </div>
                                </div>
                            </div>



                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Victims;
