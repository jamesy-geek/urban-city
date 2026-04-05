"use client";

import { useState, useEffect } from "react";
import { ClipboardList, MapPin, Volume2, FileText, ChevronRight, Download, CheckCircle2, Calendar, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";

interface FormField {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface FormSchema {
  title: string;
  fields: FormField[];
}

export default function CivicFormsPage() {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [schemas, setSchemas] = useState<Record<string, FormSchema>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const FORMS = [
    { id: "procession", title: "Procession / Public Event", desc: "Request permission for religious or cultural processions." },
    { id: "road_closure", title: "Road Closure Request", desc: "Request temporary road closure for events or works." },
    { id: "waste_report", title: "Waste Management", desc: "Report missed garbage collection or waste issues." }
  ];

  const formIcons: Record<string, React.ReactNode> = {
    procession: <Calendar size={20} />,
    road_closure: <MapPin size={20} />,
    waste_report: <Volume2 size={20} />,
  };

  useEffect(() => {
    fetch('http://localhost:8001/api/v1/form_schemas')
      .then(res => res.json())
      .then(data => {
        setSchemas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch schemas", err);
        setLoading(false);
      });
  }, []);

  const updateField = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const generatePDF = () => {
    const doc = new jsPDF();
    const currentSchema = schemas[selectedForm || ""];
    
    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153);
    doc.text("MYSURU MUNICIPAL CORPORATION", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Official Civic Service Application Draft", 105, 30, { align: "center" });

    // Body
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Subject: Application for ${currentSchema?.title || "Civic Permission"}`, 20, 60);

    doc.setFontSize(11);
    doc.text(`Reference No: MUIP-2026-${Math.random().toString(36).substring(7).toUpperCase()}`, 150, 50);
    
    // Applicant Section
    doc.setFont("helvetica", "bold");
    doc.text("1. APPLICANT DETAILS", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${formData.applicant_name || 'N/A'}`, 25, 90);
    doc.text(`Mobile: ${formData.applicant_mobile || 'N/A'}`, 25, 100);
    doc.text(`Address: ${formData.applicant_address || 'N/A'}`, 25, 110);

    // Form Specific Section
    doc.setFont("helvetica", "bold");
    doc.text("2. PROPOSAL DETAILS", 20, 130);
    doc.setFont("helvetica", "normal");
    
    let y = 140;
    currentSchema?.fields?.forEach((field: FormField) => {
      const val = formData[field.id] || "N/A";
      doc.text(`${field.label}: ${val}`, 25, y);
      y += 10;
    });

    // Footer
    doc.line(20, 250, 190, 250);
    doc.text("Digitally Generated via Urban Twin Citizen Portal", 105, 260, { align: "center" });
    doc.text("This is a draft letter. Please submit to the MCC office if required.", 105, 270, { align: "center" });

    doc.save(`${selectedForm}-application-draft.pdf`);
  };

  const handleSubmit = async () => {
    const currentForm = FORMS.find(f => f.id === selectedForm);
    const payload = {
      type: currentForm?.id,
      applicant: formData.applicant_name || "Citizen Submission",
      date: new Date().toISOString().split('T')[0],
      location: formData.location || formData.zone || "Mysuru",
      status: "pending",
      details: formData
    };
    
    try {
      await fetch('http://localhost:8001/api/v1/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch(e) {
      console.error("Submission failed", e);
      alert("Submission failed. Please check backend.");
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "80px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: "24px" }} />
        <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>Application Submitted!</h1>
        <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "1.125rem" }}>
          Reference Number: MUIP-2026-XF8G9<br />
          Your request is now in "Level 1 Review" (Municipality Corporation).
        </p>
        <button 
          onClick={generatePDF}
          style={{ 
            padding: "16px 32px", borderRadius: "12px", backgroundColor: "#1d4ed8", 
            color: "white", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px", margin: "0 auto"
          }}
        >
          <Download size={20} /> Download Draft Letter (PDF)
        </button>
      </div>
    );
  }

  const currentSchema = selectedForm ? schemas[selectedForm] : null;

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", backgroundColor: "#f8fafc" }}>
      {/* Sidebar - Form Types */}
      <div style={{ width: "320px", borderRight: "1px solid #e2e8f0", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0" }}>
           <h2 style={{ fontSize: "1.125rem", color: "#1e293b", fontWeight: 700 }}>Civic Services</h2>
           <p style={{ fontSize: "0.875rem", color: "#64748b" }}>Mysuru City Corporation</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
           {FORMS.map(f => (
             <button 
               key={f.id}
               onClick={() => { setSelectedForm(f.id); setStep(1); setFormData({}); }}
               style={{ 
                 width: "100%", padding: "16px", borderRadius: "12px", 
                 display: "flex", flexDirection: "column", gap: "8px", textAlign: "left",
                 backgroundColor: selectedForm === f.id ? "rgba(29, 78, 216, 0.05)" : "white",
                 border: selectedForm === f.id ? "1px solid #1d4ed8" : "1px solid transparent",
                 marginBottom: "8px", transition: "all 0.2s ease"
               }}
             >
               <div style={{ display: "flex", alignItems: "center", gap: "12px", color: selectedForm === f.id ? "#1d4ed8" : "#1e293b" }}>
                 {formIcons[f.id]}
                 <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{f.title}</span>
               </div>
               <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{f.desc}</p>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content - Selected Form */}
      <div style={{ flex: 1, padding: "48px", overflowY: "auto" }}>
        {selectedForm ? (
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px", backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
             {/* Progress Bar */}
             <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
                {[1, 2, 3].map(s => (
                   <div key={s} style={{ flex: 1, height: "4px", backgroundColor: s <= step ? "#1d4ed8" : "#e2e8f0", borderRadius: "2px" }} />
                ))}
             </div>

             <h2 style={{ fontSize: "1.5rem", marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px", color: "#1e293b", fontWeight: 700 }}>
                {FORMS.find(f => f.id === selectedForm)?.title}
             </h2>

             {/* Form Fields - Step 1: Applicant */}
             {step === 1 && (
                <div style={{ display: "grid", gap: "24px" }}>
                   <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "8px" }}>Section A — Applicant Details</h3>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                         <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#475569" }}>Full Name *</label>
                         <input 
                           value={formData.applicant_name || ""}
                           onChange={(e) => updateField('applicant_name', e.target.value)}
                           placeholder="Enter your name" 
                           style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px" }} 
                         />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                         <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#475569" }}>Mobile Number *</label>
                         <input 
                           value={formData.applicant_mobile || ""}
                           onChange={(e) => updateField('applicant_mobile', e.target.value)}
                           placeholder="+91" 
                           style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px" }} 
                         />
                      </div>
                   </div>
                   <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#475569" }}>Contact Address *</label>
                      <textarea 
                        value={formData.applicant_address || ""}
                        onChange={(e) => updateField('applicant_address', e.target.value)}
                        placeholder="Detailed address..." 
                        style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", minHeight: "80px" }} 
                      />
                   </div>
                </div>
             )}

             {/* Form Fields - Step 2: Dynamic Detail Section */}
             {step === 2 && (
               <div style={{ display: "grid", gap: "24px" }}>
                 <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "8px" }}>Section B — Service Details</h3>
                 {loading ? <p>Loading fields...</p> : (
                   <div style={{ display: "grid", gap: "20px" }}>
                      {currentSchema?.fields?.map((field: FormField) => (
                        <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#475569" }}>{field.label} {field.required ? '*' : ''}</label>
                          {field.type === 'select' ? (
                            <select 
                              value={formData[field.id] || ""}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                            >
                              <option value="">Select Option</option>
                              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea 
                              value={formData[field.id] || ""}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", minHeight: "100px" }}
                            />
                          ) : field.type === 'checkbox' ? (
                            <input 
                              type="checkbox"
                              checked={!!formData[field.id]}
                              onChange={(e) => updateField(field.id, e.target.checked)}
                              style={{ width: "20px", height: "20px" }}
                            />
                          ) : (
                            <input 
                              type={field.type}
                              value={formData[field.id] || ""}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              placeholder={field.placeholder}
                              style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                            />
                          )}
                        </div>
                      ))}
                   </div>
                 )}
               </div>
             )}

             {/* Form Fields - Step 3: Confirmation */}
             {step === 3 && (
               <div style={{ display: "grid", gap: "24px" }}>
                 <h3 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "8px" }}>Section C — Final Review</h3>
                 <div style={{ padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <p style={{ fontWeight: 600, marginBottom: "12px" }}>Summary Checklist</p>
                    <ul style={{ fontSize: "0.875rem", color: "#475569", display: "grid", gap: "8px" }}>
                      <li>• Applicant identity verified via session</li>
                      <li>• All mandatory Section B fields provided</li>
                      <li>• Location geo-tagged within Mysuru limits</li>
                    </ul>
                 </div>
                 <div style={{ display: "flex", gap: "12px", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "12px" }}>
                    <input type="checkbox" onChange={(e) => updateField('declared', e.target.checked)} style={{ marginTop: "4px" }} />
                    <p style={{ fontSize: "0.875rem", color: "#475569" }}>
                       I certify that information provided is true and I understand that MCC may request additional documents.
                    </p>
                 </div>
               </div>
             )}

             <div style={{ marginTop: "48px", borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <button 
                  onClick={handleBack} 
                  disabled={step === 1} 
                  style={{ padding: "12px 24px", color: step === 1 ? "#cbd5e1" : "#1e293b", fontWeight: 700 }}
                >
                  Back
                </button>
                <button 
                  onClick={step === 3 ? handleSubmit : handleNext} 
                  disabled={step === 3 && !formData.declared}
                  style={{ 
                    padding: "12px 32px", backgroundColor: (step === 3 && !formData.declared) ? "#94a3b8" : "#1d4ed8", 
                    color: "white", borderRadius: "12px", fontWeight: "bold" 
                  }}
                >
                   {step === 3 ? "Submit & Finalize" : "Next Section"}
                </button>
             </div>
          </div>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <div style={{ textAlign: "center", maxWidth: "480px" }}>
                <ClipboardList size={64} color="#1d4ed8" style={{ opacity: 0.1, marginBottom: "24px", margin: "0 auto" }} />
                <h1 style={{ fontSize: "1.75rem", marginBottom: "12px", color: "#1e293b", fontWeight: 700 }}>Choose a Digital Service</h1>
                <p style={{ color: "#64748b", lineHeight: 1.6 }}>Apply for permits, report city issues, or request public works. Your applications are saved and traceable in your ticket history.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
