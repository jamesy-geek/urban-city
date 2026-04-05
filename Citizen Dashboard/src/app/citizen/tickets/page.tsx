"use client";

import { useState, useEffect } from "react";
import { Ticket, Search, Filter, ChevronRight, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface Submission {
  id: string;
  type: string;
  applicant: string;
  date: string;
  status: string;
  location: string;
  submittedAt: string;
}

export default function TicketsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/forms/submissions')
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tickets", err);
        setLoading(false);
      });
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return { color: '#d97706', bg: '#fef3c7', icon: <Clock size={14} /> };
      case 'approved': return { color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle2 size={14} /> };
      case 'rejected': return { color: '#dc2626', bg: '#fee2e2', icon: <AlertCircle size={14} /> };
      default: return { color: '#64748b', bg: '#f1f5f9', icon: <Clock size={14} /> };
    }
  };

  const filteredTickets = filter === "all" ? submissions : submissions.filter(s => s.status === filter);

  return (
    <div style={{ padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>Track Submissions</h1>
          <p style={{ color: "#64748b", fontSize: "1.125rem" }}>Monitor the real-time status of your civic applications and tickets.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={18} />
            <input 
              placeholder="Search by ID or service..." 
              style={{ padding: "12px 16px 12px 40px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", width: "300px" }}
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: "12px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", color: "#1e293b", fontWeight: 600 }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>Loading tickets...</div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px", backgroundColor: "white", borderRadius: "24px", border: "1px dashed #e2e8f0" }}>
           <Ticket size={64} style={{ opacity: 0.1, marginBottom: "24px", margin: "0 auto" }} />
           <h2 style={{ fontSize: "1.25rem", color: "#1e293b", fontWeight: 700 }}>No Submissions Found</h2>
           <p style={{ color: "#64748b" }}>You haven't submitted any applications yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredTickets.map(ticket => {
             const style = getStatusStyle(ticket.status);
             return (
               <div key={ticket.id} style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                     <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#1d4ed8" }}>
                        <FileText size={24} />
                     </div>
                     <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                           <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1e293b" }}>{ticket.type.replace('_',' ').toUpperCase()}</h3>
                           <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#94a3b8", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{ticket.id}</span>
                        </div>
                        <div style={{ display: "flex", gap: "16px", color: "#64748b", fontSize: "0.875rem" }}>
                           <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={14} /> Submitted {ticket.submittedAt}</span>
                           <span>•</span>
                           <span>{ticket.location}</span>
                        </div>
                     </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                     <div style={{ 
                        padding: "6px 14px", borderRadius: "99px", backgroundColor: style.bg, color: style.color, 
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" 
                     }}>
                        {style.icon} {ticket.status}
                     </div>
                     <ChevronRight size={20} color="#cbd5e1" />
                  </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
