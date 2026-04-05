"use client";

import React, { useState } from 'react';
import { 
  ChevronRight, CheckCircle, XCircle, 
  User, MapPin, Calendar, ShieldCheck, 
  FileText, Layout, Clock, AlertCircle, Trash2,
  ArrowUp, ArrowDown, Plus, Save
} from 'lucide-react';
import styles from './Forms.module.css';

const FORM_TYPES = [
  {
    id: 'procession',
    label: 'Procession / Public Event',
    subtitle: 'Religious · Marriage · Festival',
  },
  {
    id: 'road_closure',
    label: 'Road Closure Request',
    subtitle: 'Temporary / Event-based',
  },
];

export default function GovernmentFormsPage() {
  const [selectedType, setSelectedType] = useState('procession');

  const handleSave = () => {
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.textContent = '✓ Saved';
      setTimeout(() => { btn.textContent = 'Save Layout'; }, 2000);
    }
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Citizen Forms Management</h1>
          <p className={styles.pageSubtitle}>Form Builder — Permission Letter Schema</p>
        </div>
      </div>

      {/* Builder Layout */}
      <div className={styles.builderGrid}>
        {/* Left sidebar: form type selector */}
        <div className={styles.typeSelector}>
          <p className={styles.typeSelectorLabel}>Application Type</p>
          {FORM_TYPES.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedType(f.id)}
              className={`${styles.typeBtn} ${selectedType === f.id ? styles.typeBtnActive : ''}`}
            >
              <div>
                <p className={styles.typeBtnLabel}>{f.label}</p>
                <p className={styles.typeBtnSub}>{f.subtitle}</p>
              </div>
              <ChevronRight size={16} className={styles.typeBtnArrow} />
            </button>
          ))}

          <div className={styles.infoBox}>
            <div className={styles.infoBoxHeader}>
              <FileText size={14} />
              <span>Letters Generated</span>
            </div>
            <p className={styles.infoBoxText}>
              Each submission generates <strong>2 government letters</strong>:
            </p>
            <ul className={styles.infoBoxList}>
              <li>• Karnataka Traffic Police NOC</li>
              <li>• Fire &amp; Emergency Services NOC</li>
            </ul>
          </div>
        </div>

        {/* Right: field builder */}
        <div className={styles.builderPanel}>
          <div className={styles.builderHeader}>
            <div>
              <h2 className={styles.builderTitle}>
                <Layout size={18} style={{ color: 'var(--accent-primary)' }} />
                {selectedType === 'procession'
                  ? 'Procession / Public Event'
                  : 'Road Closure Request'} — Letter Fields
              </h2>
              <p className={styles.builderMeta}>Schema V2 · Last edited 04 Apr 2026</p>
            </div>
            <button id="save-btn" onClick={handleSave} className={styles.saveBtn}>
              <Save size={14} /> Save Layout
            </button>
          </div>

          {/* Letter preview banner */}
          <div className={styles.letterBanner}>
            <FileText size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <div>
              <p className={styles.letterBannerTitle}>
                Both letters share the same field schema below
              </p>
              <p className={styles.letterBannerText}>
                <strong>Letter 1:</strong> Request to Karnataka Traffic Police (submit 10–15 days in advance)<br />
                <strong>Letter 2:</strong> NOC Application to Karnataka State Fire &amp; Emergency Services
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className={styles.sections}>
            <FieldSection title="Section A — Applicant Details" icon={User}>
              <FieldRow label="Full Name" type="text" required />
              <FieldRow label="Father's / Guardian's Name (S/o, D/o)" type="text" required />
              <FieldRow label="Complete Residential Address" type="textarea" required />
              <FieldRow label="Mobile Number" type="text" required />
              <FieldRow label="Email Address" type="email" />
              <FieldRow label="Organisation / Association Name" type="text" />
            </FieldSection>

            {selectedType === 'procession' && (
              <>
                <FieldSection title="Section B — Event Details" icon={Calendar}>
                  <FieldRow label="Name of Event / Procession" type="text" required />
                  <FieldRow label="Type of Procession" type="select" required />
                  <FieldRow label="Date of Event" type="date" required />
                  <FieldRow label="Start Time" type="time" required />
                  <FieldRow label="End Time" type="time" required />
                  <FieldRow label="Approximate Number of Participants" type="number" required />
                </FieldSection>

                <FieldSection title="Section C — Route Information" icon={MapPin}>
                  <FieldRow label="Starting Point (Road / Landmark)" type="text" required />
                  <FieldRow label="Destination (Road / Landmark)" type="text" required />
                  <FieldRow label="Route Description" type="textarea" required />
                  <FieldRow label="Alternative Diversion Route (via)" type="text" required />
                  <FieldRow label="Name of Traffic Police Station" type="text" required />
                  <FieldRow label="Area & PIN Code" type="text" required />
                </FieldSection>

                <FieldSection title="Section D — Safety & Fire NOC" icon={ShieldCheck}>
                  <FieldRow label="Minimum Emergency Vehicle Clearance (metres)" type="number" required />
                  <FieldRow label="Fire Safety Arrangements (describe)" type="textarea" required />
                  <FieldRow label="Name of Responsible Contact Person" type="text" required />
                  <FieldRow label="Address of Nearest Fire Station" type="text" />
                </FieldSection>
              </>
            )}

            {selectedType === 'road_closure' && (
              <>
                <FieldSection title="Section B — Closure Details" icon={MapPin}>
                  <FieldRow label="Road / Street Name" type="text" required />
                  <FieldRow label="Locality / Ward" type="text" required />
                  <FieldRow label="Reason for Closure" type="select" required />
                  <FieldRow label="Event / Activity Name" type="text" required />
                  <FieldRow label="Closure Start Date" type="date" required />
                  <FieldRow label="Closure Start Time" type="time" required />
                  <FieldRow label="Closure End Date" type="date" required />
                  <FieldRow label="Closure End Time" type="time" required />
                </FieldSection>

                <FieldSection title="Section C — Traffic & Safety Undertaking" icon={AlertCircle}>
                  <FieldRow label="Alternative Diversion Route (via which road)" type="text" required />
                  <FieldRow label="Minimum Emergency Vehicle Clearance (metres)" type="number" required />
                  <FieldRow label="Fire Safety Arrangements (describe)" type="textarea" required />
                  <FieldRow label="Name of Traffic Police Station" type="text" required />
                  <FieldRow label="Area & PIN Code" type="text" required />
                </FieldSection>
              </>
            )}

            <FieldSection title="Section E — Declaration (System / Required)" icon={ShieldCheck}>
              <FieldRow label="I declare all information provided is true and correct" type="checkbox" required system />
              <FieldRow label="Emergency vehicles will have unobstructed access at all times" type="checkbox" required system />
              <FieldRow label="I comply with the Karnataka Highways Act, 1964" type="checkbox" required system />
            </FieldSection>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function FieldSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className={styles.fieldSection}>
      <div className={styles.fieldSectionHeader}>
        <Icon size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <h3 className={styles.fieldSectionTitle}>{title}</h3>
      </div>
      <div className={styles.fieldList}>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, type, required, system }: { label: string; type: string; required?: boolean; system?: boolean }) {
  return (
    <div className={`${styles.fieldRow} ${styles.fieldRowGroup}`}>
      {!system ? (
        <div className={styles.reorderBtns}>
          <button className={styles.reorderBtn}><ArrowUp size={11} /></button>
          <button className={styles.reorderBtn}><ArrowDown size={11} /></button>
        </div>
      ) : <div style={{ width: '1.5rem' }} />}

      <div className={styles.fieldInner}>
        <input
          type="text"
          defaultValue={label}
          className={styles.fieldLabelInput}
        />
        <div className={styles.fieldControls}>
          <select defaultValue={type} className={styles.fieldTypeSelect}>
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
          </select>
          <label className={styles.fieldReqLabel}>
            <input type="checkbox" defaultChecked={required} className={styles.fieldReqCheck} />
            <span>Req</span>
          </label>
        </div>
      </div>

      {!system ? (
        <button className={styles.deleteBtn}><Trash2 size={13} /></button>
      ) : <div style={{ width: '2.25rem' }} />}
    </div>
  );
}
