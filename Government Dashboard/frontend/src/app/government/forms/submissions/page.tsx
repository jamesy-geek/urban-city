"use client";

import React, { useState } from 'react';
import { 
  FileText, CheckCircle, XCircle, Clock, Search, MapPin, Filter, ArrowLeft
} from 'lucide-react';
import styles from '../Forms.module.css'; // Reuse forms styles where possible
import Link from 'next/link';

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data representing citizen submissions based on the defined schema
  const submissions = [
    {
      id: 'REQ-2026-041',
      type: 'Procession / Public Event',
      applicant: 'Ramesh Gowda',
      organization: 'Mysuru Cultural Association',
      date: '2026-04-12',
      status: 'pending',
      route: 'Ashoka Road to Palace North Gate',
      participants: 500,
      submittedAt: '2 Hours Ago'
    },
    {
      id: 'REQ-2026-040',
      type: 'Road Closure Request',
      applicant: 'Syed Ali',
      organization: 'Local Traders Union',
      date: '2026-04-10',
      status: 'approved',
      route: 'KT Street',
      participants: 'N/A',
      submittedAt: '1 Day Ago'
    },
    {
      id: 'REQ-2026-039',
      type: 'Procession / Public Event',
      applicant: 'Shwetha P',
      organization: 'None',
      date: '2026-04-15',
      status: 'rejected',
      route: 'Gokulam 3rd Stage Park Area',
      participants: 150,
      submittedAt: '2 Days Ago'
    },
    {
      id: 'REQ-2026-038',
      type: 'Procession / Public Event',
      applicant: 'Nandini K',
      organization: 'Dasara Youth Committee',
      date: '2026-04-18',
      status: 'pending',
      route: 'Irwin Road to Suburb Bus Stand',
      participants: 1200,
      submittedAt: '3 Days Ago'
    }
  ];

  const filtered = submissions.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.applicant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#f3f4f6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/government/forms" style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Citizen Form Submissions</h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.875rem' }}>Review and manage requested permissions and reports</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input 
            type="text" 
            placeholder="Search by ID or Applicant..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', 
              backgroundColor: '#1f2937', border: '1px solid #374151', 
              borderRadius: '0.5rem', color: '#f3f4f6', outline: 'none'
            }}
          />
        </div>
        <button style={{ 
          padding: '0.75rem 1.5rem', backgroundColor: '#374151', border: 'none', 
          borderRadius: '0.5rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
        }}>
          <Filter size={16} /> Filter
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #374151' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
             <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Request ID</th>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Applicant</th>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Route/Location</th>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Target Date</th>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: '500', fontSize: '0.875rem' }}>Actions</th>
             </tr>
          </thead>
          <tbody>
            {filtered.map((sub, idx) => (
              <tr key={sub.id} style={{ borderBottom: idx !== filtered.length - 1 ? '1px solid #374151' : 'none' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="#6366f1" />
                    <span style={{ fontWeight: '500' }}>{sub.id}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{sub.type}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{sub.applicant}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{sub.organization}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d1d5db', fontSize: '0.875rem' }}>
                    <MapPin size={14} color="#9ca3af" />
                    {sub.route}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Participants: {sub.participants}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                  {sub.date}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {sub.submittedAt}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {sub.status === 'pending' && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Pending</span>}
                  {sub.status === 'approved' && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> Approved</span>}
                  {sub.status === 'rejected' && <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={12} /> Rejected</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: '500' }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
