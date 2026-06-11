# Queue Cure '26

Queue Cure is a real-time clinic queue management system designed to replace paper token slips and chaotic waiting rooms with a transparent and efficient digital experience.

## Problem Statement

76% of India's 1.5 million clinics still rely on paper token systems. Patients wait for hours without knowing when they'll be called, while receptionists manually manage queues.

Queue Cure solves this problem by providing live queue updates, estimated wait times, and separate interfaces for receptionists and patients.

---

## Features

### Reception Dashboard
- Add new patients
- Generate queue tokens
- View current token being served
- Call the next patient
- View waiting queue
- Set average consultation time

### Patient Waiting Room Display
- Shows current token being served
- Displays upcoming patients
- Calculates estimated wait times
- Handles empty queue states

### Live Synchronization
- Real-time updates across screens using Socket.IO
- No page refresh required

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios

### Backend
- Express.js
- Node.js
- Socket.IO

### Database
- Supabase

---

## Screens

### Reception Dashboard
- Add Patient
- Call Next Patient
- Manage Queue

### Patient Display
- NOW SERVING
- UP NEXT
- Estimated Wait Time

---

## Future Improvements

- SMS notifications
- Multi-doctor support
- Appointment booking
- Analytics dashboard
- Voice announcements

