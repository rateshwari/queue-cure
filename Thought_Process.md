# 🧠 Queue Cure – Thought Process Sheet

## Problem Understanding

Most neighborhood clinics in India still rely on paper token systems and verbal announcements. Patients often spend long periods waiting without any visibility into the queue, while receptionists repeatedly answer the same questions regarding waiting times and token status.

The objective was to create a digital queue management system that improves transparency for patients while reducing the operational burden on clinic staff.

---

# User Identification

Queue Cure was designed around three primary users:

### 1. Receptionist

* Registers patients.
* Generates queue tokens.
* Calls the next patient.
* Updates consultation settings.

### 2. Patient

* Wants to know when their turn will arrive.
* Needs estimated waiting time.
* Should not repeatedly ask the receptionist.

### 3. Clinic Owner

* Wants smoother operations.
* Wants fewer reception bottlenecks.
* Wants better patient experience.

---

# Why Two Screens?

The system intentionally separates information into two interfaces.

### Reception Dashboard

Contains administrative controls:

* Add patient
* Call next patient
* Complete consultation
* Configure consultation time

### Patient Display

Contains only patient-facing information:

* Current token being served
* Upcoming tokens
* Estimated wait times

This separation reduces confusion and creates a cleaner user experience.

---

# Why Real-Time Updates?

Refreshing pages manually in a clinic environment is impractical.

Queue Cure uses Socket.IO so that:

* Reception actions update instantly.
* Display screens synchronize automatically.
* Patients always see current information.

This eliminates the need for repeated announcements.

---

# Wait Time Calculation

Estimated waiting time is calculated using:

Estimated Wait = Position in Queue × Average Consultation Time

The receptionist can configure average consultation duration based on the clinic's workflow.

This approach avoids hardcoded waiting times and allows different clinics to use the system according to their own consultation patterns.

---

# Concurrency Handling

Only one patient can have:

status = "in_consultation"

Before assigning the next patient, the system checks whether an active consultation already exists.

This prevents:

* Duplicate calls
* Multiple active patients
* Queue inconsistencies

---

# Edge Cases Considered

### No Patients Waiting

The display shows:

"Queue Clear"

instead of an empty screen.

---

### No Active Consultation

The patient display shows:

"--"

and indicates that no consultation is currently active.

---

### Duplicate Call Next Actions

The system prevents receptionists from calling another patient until the current consultation is completed.

---

### Invalid Inputs

Patient registration requires mandatory fields.

Empty submissions are rejected.

---

### Browser Refresh

Queue state is stored inside Supabase.

Refreshing the browser does not lose data.

---

# Design Decisions

### TV-Friendly Display

The patient screen was designed for televisions and waiting rooms:

* Large typography
* Minimal information
* No scrolling
* High contrast

---

### Mistake-Proof Workflow

The receptionist interface prioritizes:

* Simplicity
* Fast patient registration
* Reduced clicks
* Clear actions

---

# Tradeoffs Considered

Several design tradeoffs were considered during development.

### Manual Consultation Time vs Automatic Learning

The system currently allows the receptionist to configure average consultation time manually.

While automatic learning from historical consultations would improve prediction accuracy, manual configuration was chosen to keep the solution simple, reliable, and easy to deploy in small neighborhood clinics.

### Two-Screen Architecture

A separate patient display was chosen instead of showing all information on the receptionist screen.

This reduces crowding at the reception desk and allows patients to independently track queue progress.

### Real-Time Synchronization vs Polling

Socket.IO was selected instead of periodic API polling because it provides immediate updates and reduces unnecessary network requests.

---


# Future Improvements

* Automatic consultation time learning.
* WhatsApp notifications.
* Voice announcements.
* Multi-doctor support.
* Appointment scheduling.
* Analytics dashboard.

---

# Key Takeaway

Queue Cure demonstrates how a simple real-time system can reduce uncertainty for patients, simplify reception workflows, and improve clinic operations without requiring expensive infrastructure.
