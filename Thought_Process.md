Queue Cure – Thought Process
Understanding the Problem

Traditional clinics often rely on paper token systems. Patients experience uncertainty and frustration due to long waiting times and lack of visibility.

The goal was to design a simple, beginner-friendly solution that improves transparency without increasing workload for receptionists.

Design Decisions
Separate Interfaces

Two interfaces were created:

Reception Dashboard
Patient Waiting Display

This mimics real-world clinic workflows.

Estimated Wait Time

Estimated wait times are calculated using:

Estimated Wait = Position in Queue × Average Consultation Time

Average consultation time can be updated by reception staff.

Real-Time Synchronization

Socket.IO was chosen to instantly synchronize updates across screens.

Benefits:

No manual refresh
Improved patient experience
Better receptionist efficiency
Edge Cases Considered
Empty Queue

Displays:

No patients waiting

instead of blank screens.

Invalid Inputs

Prevented:

Empty patient names
Missing phone numbers
Invalid consultation times
Double Clicking

Handled repeated actions gracefully to reduce receptionist errors.

First Token Generation

Queue starts from:

101

to create familiarity with traditional token systems.

Concurrency Considerations

Potential issues:

Multiple receptionists calling patients simultaneously.
Duplicate token generation.

Future versions could use database transactions and locking mechanisms.

Future Scope
SMS notifications
Doctor dashboards
Appointment scheduling
Multi-clinic support
Predictive wait-time analytics
