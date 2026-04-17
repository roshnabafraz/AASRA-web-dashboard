import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Search, Clock, Phone, User, Info, CheckCircle, XCircle, UserPlus, Archive, Download, FileText, Component } from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const timeAgo = (timestamp) => {
    if (!timestamp) return 'Time unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [selectedVolunteers, setSelectedVolunteers] = useState({});
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        const qReports = query(collection(db, 'reports'));
        const unsubReports = onSnapshot(qReports, (snapshot) => {
            const fetchedReports = [];
            snapshot.forEach((doc) => {
                fetchedReports.push({ id: doc.id, ...doc.data() });
            });
            fetchedReports.sort((a, b) => {
                const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
                return timeB - timeA;
            });
            setReports(fetchedReports);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setLoading(false);
        });

        const qVols = query(collection(db, 'users'), where('role', '==', 'volunteer'));
        const unsubVols = onSnapshot(qVols, (snapshot) => {
            const fetchedVols = [];
            snapshot.forEach(doc => {
                fetchedVols.push({ id: doc.id, ...doc.data() });
            });
            setVolunteers(fetchedVols);
        });

        return () => {
            unsubReports();
            unsubVols();
        };
    }, []);

    const handleAssign = async (reportId) => {
        const volId = selectedVolunteers[reportId];
        if (!volId) return alert("Please select a volunteer from the dropdown first.");

        const volunteer = volunteers.find(v => v.id === volId);
        if (!volunteer) return alert("Volunteer not found in database.");

        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, {
                status: 'accepted',
                volunteerId: volunteer.id,
                volunteerName: volunteer.name || 'Unnamed Volunteer',
                volunteerPhone: volunteer.phone || ''
            });
            setSelectedVolunteers(prev => ({ ...prev, [reportId]: '' }));
        } catch (error) {
            console.error("Error assigning:", error);
            alert("Failed to assign report.");
        }
    };

    const updateReportStatus = async (reportId, newStatus) => {
        try {
            const reportRef = doc(db, 'reports', reportId);
            await updateDoc(reportRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update report status.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <span className="badge warning-bg text-warning">Pending</span>;
            case 'accepted': return <span className="badge success-bg text-success">Assigned</span>;
            case 'resolved': return <span className="badge primary-bg text-primary">Resolved</span>;
            case 'deleted': return <span className="badge danger-bg text-danger">Rejected</span>;
            default: return <span className="badge" style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>Unknown</span>;
        }
    };

    const filteredReports = reports.filter(r => {
        const txtMatch = r.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.victimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.volunteerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const catMatch = categoryFilter === '' || r.category?.toLowerCase() === categoryFilter.toLowerCase();

        let dateMatch = true;
        if (startDate || endDate) {
            if (!r.timestamp) {
                dateMatch = false;
            } else {
                const rDate = r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp);
                if (startDate && rDate < new Date(startDate)) dateMatch = false;
                if (endDate && rDate > new Date(endDate + "T23:59:59")) dateMatch = false;
            }
        }

        return txtMatch && catMatch && dateMatch;
    });

    const exportCSV = () => {
        if (filteredReports.length === 0) return alert("No reports to export");
        const csv = Papa.unparse(filteredReports.map(r => ({
            ID: r.id,
            Category: r.category || 'N/A',
            Status: r.status || 'N/A',
            VictimName: r.victimName || 'Anonymous',
            VictimPhone: r.victimPhone || 'N/A',
            Description: r.description || 'N/A',
            Latitude: r.latitude || 'N/A',
            Longitude: r.longitude || 'N/A',
            AssignedVolunteer: r.volunteerName || 'None',
            Date: r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : 'Unknown'
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `AASRA_Reports_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        if (filteredReports.length === 0) return alert("No reports to export");
        const doc = new jsPDF();
        doc.text("AASRA Emergency Reports Directory", 14, 15);
        const tableData = filteredReports.map(r => [
            r.id.slice(0, 8),
            r.category || 'N/A',
            r.status || 'N/A',
            r.victimName || 'Unknown',
            r.volunteerName || 'None',
            r.timestamp?.toDate ? r.timestamp.toDate().toLocaleDateString() : 'Unknown'
        ]);
        autoTable(doc, {
            head: [['ID', 'Category', 'Status', 'Victim', 'Assignee', 'Date']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [15, 70, 39] }
        });
        doc.save(`AASRA_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Get unique categories for dropdown
    const uniqueCategories = [...new Set(reports.map(r => r.category).filter(Boolean))];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Live Emergency Board</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Actionable feed of all incoming and assigned distress signals.</p>
                </div>

                <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-family)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Filters:</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From</span>
                    <input type="date" className="input-field" style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To</span>
                    <input type="date" className="input-field" style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>

                <select className="input-field" style={{ width: '180px', padding: '0.4rem 0.6rem', fontSize: '0.85rem', cursor: 'pointer' }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <div style={{ flex: 1 }}></div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportCSV}>
                        <Download size={14} /> CSV
                    </button>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportPDF}>
                        <FileText size={14} /> PDF
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live feed...</div>
            ) : filteredReports.length === 0 ? (
                <div className="card glass table-container" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reports found matching your criteria.
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredReports.map(report => (
                        <div key={report.id} className="card glass report-card" style={{ borderTop: `4px solid ${report.status === 'pending' ? 'var(--warning)' : report.status === 'accepted' ? 'var(--success)' : report.status === 'deleted' ? 'var(--danger)' : 'var(--primary)'}` }}>

                            <div className="card-header">
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>{report.category || 'Emergency'}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <Clock size={12} /> {timeAgo(report.timestamp)}
                                    </div>
                                </div>
                                {getStatusBadge(report.status)}
                            </div>

                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} color="var(--primary)" /> {report.victimName || 'Anonymous Request'}</span>
                                    {report.victimPhone && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {report.victimPhone}</span>}
                                </div>

                                {report.description && (
                                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.4, background: 'var(--bg-color)', padding: '0.6rem', borderRadius: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                                        <Info size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
                                        <span style={{ color: 'var(--text-main)' }}>{report.description}</span>
                                    </div>
                                )}

                                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(15, 70, 39, 0.05)', padding: '0.5rem', borderRadius: '6px' }}>
                                    {report.latitude && report.longitude ? (
                                        <>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500, width: '100%', textDecoration: 'none', marginBottom: '4px' }}>
                                                <MapPin size={14} /> Open Location in Maps
                                            </a>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Component size={12} /> Lat: {report.latitude.toFixed(4)}, Lng: {report.longitude.toFixed(4)}
                                            </span>
                                        </>
                                    ) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location coordinates pending</span>}
                                </div>

                                {report.imageUrl && (
                                    <div style={{ marginTop: '0.5rem', borderRadius: '6px', overflow: 'hidden', height: '100px', border: '1px solid var(--border)' }}>
                                        <img src={report.imageUrl} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                                {report.status === 'accepted' && report.volunteerName && (
                                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '2px' }}>Assigned Responder</span>
                                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>{report.volunteerName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                {report.status === 'pending' && (
                                    <>
                                        <div style={{ position: 'relative' }}>
                                            <select
                                                className="input-field"
                                                style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}
                                                value={selectedVolunteers[report.id] || ''}
                                                onChange={(e) => setSelectedVolunteers({ ...selectedVolunteers, [report.id]: e.target.value })}
                                            >
                                                <option value="">-- Assign a Volunteer --</option>
                                                {volunteers.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name || 'Unnamed'} • {v.skills?.split(',')[0] || 'General'}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn-success" onClick={() => handleAssign(report.id)}>
                                                <UserPlus size={14} /> Assign
                                            </button>
                                            <button className="btn-danger" onClick={() => updateReportStatus(report.id, 'deleted')}>
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    </>
                                )}
                                {report.status === 'accepted' && (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn-success" style={{ flex: 1.5 }} onClick={() => updateReportStatus(report.id, 'resolved')}>
                                            <CheckCircle size={14} /> Resolve
                                        </button>
                                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => updateReportStatus(report.id, 'pending')}>
                                            Revoke
                                        </button>
                                    </div>
                                )}
                                {(report.status === 'resolved' || report.status === 'deleted') && (
                                    <button className="btn-secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} disabled>
                                        <Archive size={14} /> {report.status === 'resolved' ? 'Archived safely' : 'Rejected signal'}
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reports;
