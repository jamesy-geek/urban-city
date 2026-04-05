"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ClipboardList, User, MapPin, Clock, ShieldCheck,
  CheckCircle, Send, Calendar, Cone, Info
} from 'lucide-react';
import styles from './CitizenForms.module.css';

const FORMS = [
  {
    id: 'procession',
    title: 'Procession / Public Event',
    subtitle: 'Religious · Marriage · Festival · Strike',
    icon: Calendar,
    color: 'red',
    letters: ['Karnataka Traffic Police NOC', 'Fire & Emergency Services NOC'],
    advance: '10–15 days',
  },
  {
    id: 'road_closure',
    title: 'Road Closure Request',
    subtitle: 'Temporary / Emergency / Event-based',
    icon: Cone,
    color: 'blue',
    letters: ['Karnataka Traffic Police NOC', 'Fire & Emergency Services NOC'],
    advance: '10–15 days',
  },
];

export default function CitizenFormsPage() {
  const [selectedForm, setSelectedForm] = useState('procession');
  const [isSubmitted,  setIsSubmitted]  = useState(false);
  const [refNumber]  = useState(`MYS-${Math.floor(400 + Math.random() * 99)}`);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const form   = FORMS.find(f => f.id === selectedForm)!;
  const FormIcon = form.icon;

  const onSubmit = (data: any) => {
    console.log('Submitted:', data);
    setIsSubmitted(true);
    setTimeout(() => { setIsSubmitted(false); reset(); }, 5000);
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <ClipboardList size={24} color="#fff" />
        </div>
        <div>
          <h1 className={styles.pageTitle}>Mysuru City Public Services</h1>
          <p className={styles.pageSubtitle}>
            Submit applications for event permissions, road closures &amp; civic services
          </p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* ── Left: form selector ─────────────────────── */}
        <div className={styles.selectorCol}>
          <p className={styles.selectorHeading}>Application Type</p>

          {FORMS.map(f => (
            <button
              key={f.id}
              onClick={() => { setSelectedForm(f.id); setIsSubmitted(false); }}
              className={`${styles.typeCard} ${selectedForm === f.id ? styles.typeCardActive : ''}`}
            >
              <div className={`${styles.typeCardIcon} ${f.color === 'red' ? styles.iconRed : styles.iconBlue}`}>
                <f.icon size={18} />
              </div>
              <div className={styles.typeCardText}>
                <p className={styles.typeCardTitle}>{f.title}</p>
                <p className={styles.typeCardSub}>{f.subtitle}</p>
              </div>
            </button>
          ))}

          {/* Info note */}
          <div className={styles.noteBox}>
            <div className={styles.noteHeader}>
              <Info size={13} />
              <span>Submission Note</span>
            </div>
            <p className={styles.noteText}>
              Submit at least <strong>{form.advance}</strong> in advance.
              Your details automatically generate <strong>2 government letters</strong>:
            </p>
            <ul className={styles.noteList}>
              {form.letters.map((l, i) => (
                <li key={i}>• {l}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: form ─────────────────────────────── */}
        <div className={styles.formPanel}>
          {/* Form header strip */}
          <div className={styles.formPanelHeader}>
            <div className={`${styles.formTypeTag} ${form.color === 'red' ? styles.tagRed : styles.tagBlue}`}>
              <FormIcon size={12} />
              <span>{form.title}</span>
            </div>
            <h2 className={styles.formPanelTitle}>Application Form</h2>
            <p className={styles.formPanelSub}>
              These details will generate <strong>{form.letters.length} official letters</strong> — {form.letters.join(' and ')}.
            </p>
          </div>

          {/* ── Success screen ── */}
          {isSubmitted ? (
            <div className={styles.successScreen}>
              <div className={styles.successIcon}>
                <CheckCircle size={40} color="#16a34a" />
              </div>
              <h3 className={styles.successTitle}>Submission Received</h3>
              <p className={styles.successLabel}>Reference Number</p>
              <p className={styles.successRef}>{refNumber}</p>
              <p className={styles.successNote}>
                Your application is under review. You will receive confirmation within 24 hours.
              </p>
              <button onClick={() => setIsSubmitted(false)} className={styles.successBtn}>
                New Submission
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

              {/* ═══════════════════════════════════
                  SECTION A: Applicant Details
              ═══════════════════════════════════ */}
              <FormSection title="Section A — Applicant Details" icon={User}>
                <div className={styles.fieldGrid2}>
                  <Field label="Full Name" required error={!!errors.full_name}>
                    <input {...register('full_name', { required: true })}
                      className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                      placeholder="e.g. Arjun Gowda" />
                  </Field>
                  <Field label="Father's / Guardian's Name" required error={!!errors.parent_name}>
                    <input {...register('parent_name', { required: true })}
                      className={`${styles.input} ${errors.parent_name ? styles.inputError : ''}`}
                      placeholder="S/o or D/o" />
                  </Field>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Complete Residential Address" required error={!!errors.address}>
                      <textarea {...register('address', { required: true })} rows={2}
                        className={`${styles.input} ${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                        placeholder="House No, Street, Area, City, Karnataka – PIN" />
                    </Field>
                  </div>
                  <Field label="Mobile Number" required error={!!errors.mobile}>
                    <input {...register('mobile', { required: true, pattern: /^[0-9]{10}$/ })}
                      className={`${styles.input} ${errors.mobile ? styles.inputError : ''}`}
                      placeholder="10-digit number" maxLength={10} />
                  </Field>
                  <Field label="Email Address">
                    <input {...register('email', { pattern: /^\S+@\S+$/i })}
                      type="email" className={styles.input} placeholder="Optional" />
                  </Field>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Organisation / Association Name">
                      <input {...register('org_name')} className={styles.input} placeholder="If applicable" />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* ═══════════════════════════════════
                  PROCESSION SECTIONS
              ═══════════════════════════════════ */}
              {selectedForm === 'procession' && (
                <>
                  <FormSection title="Section B — Event Details" icon={Calendar}>
                    <div className={styles.fieldGrid2}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Name of Event / Procession" required>
                          <input {...register('event_name', { required: true })}
                            className={styles.input} placeholder="e.g. Ganesh Chaturthi Procession 2026" />
                        </Field>
                      </div>
                      <Field label="Type of Procession" required>
                        <select {...register('procession_type')} className={styles.input}>
                          <option>Religious / Idol Immersion</option>
                          <option>Marriage Procession</option>
                          <option>Festival / Parade</option>
                          <option>Strike / Public March</option>
                        </select>
                      </Field>
                      <Field label="Approximate Participants" required>
                        <input {...register('participants', { required: true })} type="number"
                          className={styles.input} placeholder="e.g. 500" />
                      </Field>
                      <Field label="Date of Event" required>
                        <input {...register('date', { required: true })} type="date" className={styles.input} />
                      </Field>
                      <Field label="Start Time" required>
                        <input {...register('start_time', { required: true })} type="time" className={styles.input} />
                      </Field>
                      <Field label="End Time" required>
                        <input {...register('end_time', { required: true })} type="time" className={styles.input} />
                      </Field>
                    </div>
                  </FormSection>

                  <FormSection title="Section C — Route Information" icon={MapPin}>
                    <div className={styles.fieldGrid2}>
                      <Field label="Starting Point" required>
                        <input {...register('start_point', { required: true })}
                          className={styles.input} placeholder="e.g. Mysuru Palace South Gate" />
                      </Field>
                      <Field label="Destination" required>
                        <input {...register('destination', { required: true })}
                          className={styles.input} placeholder="e.g. Bannimantap Ground" />
                      </Field>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Route Description" required>
                          <textarea {...register('route_description', { required: true })} rows={2}
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Describe the full route of the procession" />
                        </Field>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Alternative Diversion Route (via)" required>
                          <input {...register('diversion_route', { required: true })}
                            className={styles.input} placeholder="e.g. Sayyaji Rao Road" />
                        </Field>
                      </div>
                    </div>
                  </FormSection>

                  <FormSection title="Section D — Safety Details" icon={ShieldCheck}>
                    <div className={styles.fieldGrid2}>
                      <Field label="Traffic Police Station" required>
                        <input {...register('police_station', { required: true })}
                          className={styles.input} placeholder="e.g. Mandi Mohalla Traffic PS" />
                      </Field>
                      <Field label="Emergency Vehicle Clearance (metres)" required>
                        <input {...register('clearance_m', { required: true })} type="number"
                          className={styles.input} placeholder="e.g. 3" />
                      </Field>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Fire Safety Arrangements" required>
                          <textarea {...register('fire_safety')} rows={2}
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Fire extinguishers, water buckets, responsible persons..." />
                        </Field>
                      </div>
                    </div>
                  </FormSection>
                </>
              )}

              {/* ═══════════════════════════════════
                  ROAD CLOSURE SECTIONS
              ═══════════════════════════════════ */}
              {selectedForm === 'road_closure' && (
                <>
                  <FormSection title="Section B — Closure Details" icon={Clock}>
                    <div className={styles.fieldGrid2}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Road / Street Name" required>
                          <input {...register('road_name', { required: true })}
                            className={styles.input} placeholder="e.g. Sayyaji Rao Road, KR Circle area" />
                        </Field>
                      </div>
                      <Field label="Locality / Ward" required>
                        <input {...register('locality', { required: true })}
                          className={styles.input} placeholder="e.g. Mandi Mohalla" />
                      </Field>
                      <Field label="Reason for Closure" required>
                        <select {...register('closure_reason')} className={styles.input}>
                          <option>Public Event / Festival</option>
                          <option>Construction / Infrastructure</option>
                          <option>Emergency Utility Work</option>
                          <option>Wedding Function</option>
                        </select>
                      </Field>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Event / Activity Name" required>
                          <input {...register('event_name', { required: true })}
                            className={styles.input} placeholder="e.g. Dasara Procession 2026" />
                        </Field>
                      </div>
                      <Field label="Closure Start Date" required>
                        <input {...register('start_date', { required: true })} type="date" className={styles.input} />
                      </Field>
                      <Field label="Start Time" required>
                        <input {...register('start_time', { required: true })} type="time" className={styles.input} />
                      </Field>
                      <Field label="Closure End Date" required>
                        <input {...register('end_date', { required: true })} type="date" className={styles.input} />
                      </Field>
                      <Field label="End Time" required>
                        <input {...register('end_time', { required: true })} type="time" className={styles.input} />
                      </Field>
                    </div>
                  </FormSection>

                  <FormSection title="Section C — Safety & Traffic Undertaking" icon={ShieldCheck}>
                    <div className={styles.fieldGrid2}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Alternative Diversion Route (via)" required>
                          <input {...register('diversion_route', { required: true })}
                            className={styles.input} placeholder="Name of alternative road" />
                        </Field>
                      </div>
                      <Field label="Traffic Police Station" required>
                        <input {...register('police_station', { required: true })}
                          className={styles.input} placeholder="e.g. Devaraja Traffic PS" />
                      </Field>
                      <Field label="Emergency Vehicle Clearance (m)" required>
                        <input {...register('clearance_m', { required: true })} type="number"
                          className={styles.input} placeholder="e.g. 3" />
                      </Field>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Field label="Fire Safety Arrangements" required>
                          <textarea {...register('fire_safety')} rows={2}
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder="Fire extinguishers, water buckets, safety persons..." />
                        </Field>
                      </div>
                    </div>
                  </FormSection>
                </>
              )}

              {/* ═══════════════════════════════════
                  DECLARATION
              ═══════════════════════════════════ */}
              <div className={styles.declaration}>
                <div className={styles.declarationHeader}>
                  <ShieldCheck size={15} style={{ color: 'var(--text-muted)' }} />
                  <h4 className={styles.declarationTitle}>Declaration</h4>
                </div>
                <div className={styles.checkList}>
                  {[
                    'I declare that all information provided is true and correct to the best of my knowledge.',
                    'I undertake to provide unobstructed emergency vehicle access (Ambulance, Fire Brigade, Police) at all times.',
                    'I agree to comply with all conditions set by the Mysuru City Police and Local Administration, including the Karnataka Highways Act, 1964.',
                  ].map((text, i) => (
                    <label key={i} className={styles.checkLabel}>
                      <input type="checkbox" required className={styles.checkBox} />
                      <span className={styles.checkText}>{text}</span>
                    </label>
                  ))}
                </div>

                <button type="submit" className={styles.submitBtn}>
                  <Send size={15} />
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────── */

function FormSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIconWrap}>
          <Icon size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: boolean; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label}{required && <span style={{ color: 'var(--accent-red)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
      {error && <p className={styles.errorMsg}>This field is required</p>}
    </div>
  );
}
