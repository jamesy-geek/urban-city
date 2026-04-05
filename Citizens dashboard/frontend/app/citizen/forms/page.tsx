"use client";

import { useState } from "react";
import { ClipboardList, MapPin, Volume2, FileText, ChevronRight, Download, CheckCircle2, Calendar } from "lucide-react";

export default function CivicFormsPage() {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const FORMS = [
    { id: "procession", title: "Procession / Public Event", desc: "Request permission for religious or cultural processions." },
    { id: "road_closure", title: "Road Closure Request", desc: "Request temporary road closure for events or works." },
    { id: "loudspeaker", title: "Loudspeaker Permission", desc: "Apply for sound system and amplifier use." },
    { id: "construction", title: "Construction Public Notice", desc: "Notify authorities of road-side construction." }
  ];

  const formIcons: Record<string, React.ReactNode> = {
    procession: <Calendar size={20} />,
    road_closure: <MapPin size={20} />,
    loudspeaker: <Volume2 size={20} />,
    construction: <FileText size={20} />,
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: "80px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <CheckCircle2 size={64} color="var(--success)" style={{ marginBottom: "24px" }} />
        <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>Form Submitted Successfully!</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "1.125rem" }}>
          Reference Number: MUIP-2026-XF8G9<br />
          Your application has been received and is being processed.
        </p>
        <button style={{ 
          padding: "16px 32px", borderRadius: "12px", backgroundColor: "var(--primary)", 
          color: "white", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px", margin: "0 auto"
        }}>
          <Download size={20} /> Download PDF for Submission
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "var(--background)" }}>
      {/* Sidebar - Form Types */}
      <div style={{ width: "320px", borderRight: "1px solid var(--border)", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
           <h2 style={{ fontSize: "1.125rem", color: "var(--text-primary)" }}>Civic Forms</h2>
           <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Mysuru Citizen Services</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
           {FORMS.map(f => (
             <button 
               key={f.id}
               onClick={() => { setSelectedForm(f.id); setStep(1); }}
               style={{ 
                 width: "100%", padding: "16px", borderRadius: "12px", 
                 display: "flex", flexDirection: "column", gap: "8px", textAlign: "left",
                 backgroundColor: selectedForm === f.id ? "rgba(29, 78, 216, 0.05)" : "white",
                 border: selectedForm === f.id ? "1px solid var(--primary)" : "1px solid transparent",
                 marginBottom: "8px", transition: "all 0.2s ease"
               }}
             >
               <div style={{ display: "flex", alignItems: "center", gap: "12px", color: selectedForm === f.id ? "var(--primary)" : "var(--text-primary)" }}>
                 {formIcons[f.id]}
                 <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{f.title}</span>
               </div>
               <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{f.desc}</p>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content - Selected Form */}
      <div style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
        {selectedForm ? (
          <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "white" }}>
             {/* Progress Bar */}
             <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
                {[1, 2, 3, 4].map(s => (
                   <div key={s} style={{ flex: 1, height: "4px", backgroundColor: s <= step ? "var(--primary)" : "#e2e8f0", borderRadius: "2px" }} />
                ))}
             </div>

             <h2 style={{ fontSize: "1.5rem", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
                {FORMS.find(f => f.id === selectedForm)?.title}
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: "normal" }}> (Ref: {selectedForm.toUpperCase()})</span>
             </h2>

             {/* Form Fields - Step 1 */}
             {step === 1 && (
                <div style={{ display: "grid", gap: "24px" }}>
                   <h3 style={{ fontSize: "1rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "8px" }}>Section A — Applicant Details</h3>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                         <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Full Name *</label>
                         <input placeholder="Enter your full name" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.9375rem" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                         <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Mobile Number *</label>
                         <input placeholder="+91" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.9375rem" }} />
                      </div>
                   </div>
                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Address Line 1 *</label>
                      <input placeholder="Street address, P.O. box, company name, c/o" style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.9375rem" }} />
                   </div>
                </div>
             )}

             {step === 2 && (
               <div style={{ display: "grid", gap: "24px" }}>
                 <h3 style={{ fontSize: "1rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "8px" }}>Section B — Details</h3>
                 <p style={{ color: "var(--text-muted)" }}>Form specific details would go here...</p>
               </div>
             )}

             {step === 3 && (
               <div style={{ display: "grid", gap: "24px" }}>
                 <h3 style={{ fontSize: "1rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "8px" }}>Section C — Declarations</h3>
                 <div style={{ display: "flex", gap: "12px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <input type="checkbox" style={{ marginTop: "4px" }} />
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                       I hereby declare that all information provided is true and correct. I agree to comply with all conditions of the license.
                    </p>
                 </div>
               </div>
             )}

             <div style={{ marginTop: "48px", display: "flex", justifyContent: "space-between" }}>
                <button onClick={handleBack} disabled={step === 1} style={{ padding: "10px 24px", color: step === 1 ? "#ccc" : "var(--text-primary)", fontWeight: 600 }}>Back</button>
                <button onClick={step === 3 ? handleSubmit : handleNext} style={{ padding: "10px 32px", backgroundColor: "var(--primary)", color: "white", borderRadius: "12px", fontWeight: "bold" }}>
                   {step === 3 ? "Submit Application" : "Continue"}
                </button>
             </div>
          </div>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <div style={{ textAlign: "center", maxWidth: "480px" }}>
                <ClipboardList size={64} color="var(--primary)" style={{ opacity: 0.2, marginBottom: "24px", margin: "0 auto" }} />
                <h1 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Choose a form to get started</h1>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>Select one of the official application forms from the left sidebar to begin your digital request process. You can download the final PDF for physical submission.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
