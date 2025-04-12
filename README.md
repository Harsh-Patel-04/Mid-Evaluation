# 1. Introduction

Social media is a double-edged sword: while it enables free communication, it also becomes a medium for cybercrimes, hate speech, and inappropriate content. This project aims to detect such content and predict trending crime topics using AI, NLP, and the MERN stack.

# 2. Problem Statement

Users may unknowingly post harmful content or become victims of cybercrime through social media. Manual moderation is time-consuming and ineffective. There’s a need for an automated system that:

Detects harmful images or posts.

Alerts authorities or moderators.

# 3. Objectives

Build a web app using the MERN stack.

Integrate Sightengine API to detect harmful content in images (e.g., nudity, violence).

Store all data and analysis results in Supabase (for backend/database).

# 4. Methodology

a. Frontend:
Built using React.js.

User Dashboard: Allows image and text post submission.

Admin Dashboard: Shows flagged content and visual analytics.

b. Backend:
Node.js + Express handles API requests.

Sightengine API integration for image analysis.

c. Database:
Supabase used to store:

Uploaded posts.

Sightengine response data.

User profiles & reports.

# 5. Features

🛡️ AI-powered content moderation.

📈 Crime trend dashboard for insights.

📸 Image scanning using Sightengine.

🧾 History logs & user reports in Supabase.

# 6. Technologies Used

Frontend: React.js, Tailwind CSS, Chart.js

Backend: Node.js

Database: Supabase

APIs: Sightengine API, Google Maps API

Hosting: Vercel (Frontend)

# 7. Project Flow

User submits image/text ➝

Sent to backend ➝

Image scanned by Sightengine ➝

Results saved in Supabase ➝

Dashboard updates with trend data.

# 8. Conclusion

This project blends social responsibility with technical skills to create a system capable of helping moderate harmful content online. It will serve as a prototype for digital safety and law enforcement collaboration.
