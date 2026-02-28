import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, DollarSign, Calendar, Heart, Download, FileText, ArrowDownRight, ArrowUpRight, PlusCircle, List, PiggyBank } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJisIoOom2eVHs04PMBNhZW4YK-3GT3r3LdCtumq9PysfBe2417sAccYhc_vYEUoVZOg1YG8Mbo9-f/pub?output=csv";

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('donations'); // 'donations' | 'expenses'

    // Form
    const [showForm, setShowForm] = useState(false);
    const [allocAmount, setAllocAmount] = useState('');
    const [allocCategory, setAllocCategory] = useState('Food');
    const [allocDesc, setAllocDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL === "YOUR_SPREADSHEET_CSV_URL_HERE") {
            setLoading(false);
            setError("Please edit `src/pages/Donations.jsx` and replace the GOOGLE_SHEET_CSV_URL constant with your valid CSV URL.");
            return;
        }

        Papa.parse(GOOGLE_SHEET_CSV_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => setDonations(results.data),
            error: (err) => {
                console.error("Error parsing CSV:", err);
                setError("Failed to fetch data from the Google Sheet. Please check the network tab or verify the URL.");
            }
        });

        const unsub = onSnapshot(query(collection(db, 'expenses')), (snapshot) => {
            const exp = [];
            snapshot.forEach(doc => exp.push({ id: doc.id, ...doc.data() }));
            exp.sort((a, b) => (b.timestamp?.toMillis ? b.timestamp.toMillis() : 0) - (a.timestamp?.toMillis ? a.timestamp.toMillis() : 0));
            setExpenses(exp);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!allocAmount || isNaN(allocAmount) || parseFloat(allocAmount) <= 0) return alert("Valid amount required.");
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'expenses'), {
                amount: parseFloat(allocAmount),
                category: allocCategory,
                description: allocDesc,
                timestamp: serverTimestamp()
            });
            setAllocAmount('');
            setAllocDesc('');
            setShowForm(false);
            setActiveTab('expenses');
        } catch (err) {
            console.error("Failed to allocate:", err);
            alert("Failed to save expense.");
        }
        setIsSubmitting(false);
    };

    const headers = donations.length > 0 ? Object.keys(donations[0]) : [];
    const extractField = (row, partialKeys) => {
        const key = headers.find(h => partialKeys.some(pk => h.toLowerCase().includes(pk)));
        return key ? row[key] : 'Unknown';
    };

    let totalRaised = 0;
    donations.forEach(row => {
        const amtStr = extractField(row, ['amount', 'total', 'sum']);
        totalRaised += parseFloat(String(amtStr).replace(/[^0-9.]/g, '')) || 0;
    });

    let totalSpent = 0;
    expenses.forEach(exp => {
        totalSpent += parseFloat(exp.amount) || 0;
    });

    const availableBalance = totalRaised - totalSpent;

    const filteredDonations = donations.filter(d => Object.values(d).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())));
    const filteredExpenses = expenses.filter(e => e.category?.toLowerCase().includes(searchTerm.toLowerCase()) || e.description?.toLowerCase().includes(searchTerm.toLowerCase()));

    const exportCSV = () => {
        let dataToExport = [];
        if (activeTab === 'donations') {
            if (filteredDonations.length === 0) return alert("No data");
            dataToExport = filteredDonations;
        } else {
            if (filteredExpenses.length === 0) return alert("No data");
            dataToExport = filteredExpenses.map(e => ({
                ID: e.id,
                Amount: e.amount,
                Category: e.category,
                Description: e.description,
                Date: e.timestamp?.toDate ? e.timestamp.toDate().toLocaleString() : 'Unknown'
            }));
        }
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `AASRA_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`AASRA Financial Log: ${activeTab.toUpperCase()}`, 14, 15);
        let head = [];
        let body = [];

        if (activeTab === 'donations') {
            if (filteredDonations.length === 0) return alert("No data");
            head = [['Name/Donor', 'Amount', 'Date', 'Transaction Details']];
            body = filteredDonations.map(row => [
                extractField(row, ['name', 'donor', 'from', 'user']),
                "Rs " + extractField(row, ['amount', 'total', 'sum']),
                extractField(row, ['timestamp', 'date', 'time', 'when']),
                JSON.stringify(row).slice(0, 50) + "..."
            ]);
        } else {
            if (filteredExpenses.length === 0) return alert("No data");
            head = [['Category', 'Amount', 'Description', 'Date']];
            body = filteredExpenses.map(e => [
                e.category,
                "Rs " + e.amount,
                e.description,
                e.timestamp?.toDate ? e.timestamp.toDate().toLocaleDateString() : 'Unknown'
            ]);
        }

        doc.autoTable({ head, body, startY: 20, styles: { fontSize: 9 }, headStyles: { fillColor: [15, 70, 39] } });
        doc.save(`AASRA_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Financial & Resource Ledger</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track inbound donations and outbound strategic expenses.</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={showForm ? "btn-secondary" : "btn-primary"} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel Allocation' : <span><PlusCircle size={16} /> Allocate Funds</span>}
                    </button>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', width: '250px' }}>
                        <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontFamily: 'var(--font-family)' }} />
                    </div>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ padding: '1rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px' }}><ArrowDownRight size={28} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Raised</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Rs {totalRaised.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ padding: '1rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px' }}><ArrowUpRight size={28} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Payouts/Expenses</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Rs {totalSpent.toLocaleString()}</div>
                    </div>
                </div>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ padding: '1rem', background: 'rgba(15, 70, 39, 0.15)', color: 'var(--primary)', borderRadius: '12px' }}><PiggyBank size={28} /></div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>Rs {availableBalance.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Allocation Form (Expandable) */}
            {showForm && (
                <form onSubmit={handleAllocate} className="card glass animate-fade-in" style={{ padding: '1.5rem', border: '1px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><PlusCircle size={18} /> New Expense Allocation</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount (Rs)</label>
                            <input type="number" required className="input-field" placeholder="E.g. 5000" value={allocAmount} onChange={e => setAllocAmount(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
                            <select className="input-field" value={allocCategory} onChange={e => setAllocCategory(e.target.value)}>
                                <option value="Food & Rations">Food & Rations</option>
                                <option value="Shelter & Tents">Shelter & Tents</option>
                                <option value="Medical & First Aid">Medical & First Aid</option>
                                <option value="Logistics & Transport">Logistics & Transport</option>
                                <option value="Other">Other Operational</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description / Invoice Details</label>
                            <input type="text" required className="input-field" placeholder="E.g. Rice and lentils for 50 families in affected zone" value={allocDesc} onChange={e => setAllocDesc(e.target.value)} />
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '1.5rem', width: '200px' }}>
                        {isSubmitting ? 'Recording...' : 'Deduct from Balance'}
                    </button>
                </form>
            )}

            {/* Combined List View Interface */}
            <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }}>
                    <button onClick={() => setActiveTab('donations')} style={{ flex: 1, padding: '1rem', fontWeight: 600, borderBottom: activeTab === 'donations' ? '3px solid var(--success)' : '3px solid transparent', color: activeTab === 'donations' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        Inbound Donations
                    </button>
                    <button onClick={() => setActiveTab('expenses')} style={{ flex: 1, padding: '1rem', fontWeight: 600, borderBottom: activeTab === 'expenses' ? '3px solid var(--danger)' : '3px solid transparent', color: activeTab === 'expenses' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        Outbound Expenses
                    </button>
                </div>

                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '8px', background: 'var(--surface)' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportCSV}><Download size={14} /> CSV</button>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportPDF}><FileText size={14} /> PDF</button>
                </div>

                <div style={{ overflowX: 'auto', padding: '0 1rem 1rem 1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                {activeTab === 'donations' ? (
                                    <>
                                        <th style={{ padding: '1rem 0.5rem' }}>Donor</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Amount (Rs)</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Origin</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ padding: '1rem 0.5rem' }}>Category</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Amount (Rs)</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Description</th>
                                        <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'donations' ? (
                                filteredDonations.length > 0 ? filteredDonations.map((row, idx) => {
                                    const amountRaw = extractField(row, ['amount', 'total', 'sum']);
                                    const amount = String(amountRaw).replace(/[^0-9.]/g, '');
                                    const name = extractField(row, ['name', 'donor', 'from', 'user']);
                                    const date = extractField(row, ['timestamp', 'date', 'time', 'when']);
                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{name || 'Anonymous'}</td>
                                            <td style={{ padding: '1rem 0.5rem', color: 'var(--success)', fontWeight: 600 }}>+ {parseFloat(amount || 0).toLocaleString()}</td>
                                            <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{date || 'Unknown'}</td>
                                            <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Google Sheets</td>
                                        </tr>
                                    );
                                }) : <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No donations match search.</td></tr>
                            ) : (
                                filteredExpenses.length > 0 ? filteredExpenses.map((exp, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{exp.category}</td>
                                        <td style={{ padding: '1rem 0.5rem', color: 'var(--danger)', fontWeight: 600 }}>- {parseFloat(exp.amount || 0).toLocaleString()}</td>
                                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>{exp.description}</td>
                                        <td style={{ padding: '1rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{exp.timestamp?.toDate ? exp.timestamp.toDate().toLocaleDateString() : 'Unknown'}</td>
                                    </tr>
                                )) : <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses match search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Donations;
