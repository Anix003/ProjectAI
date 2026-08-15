# 🏛️ Civic AI - AI-Powered Civic Governance Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Cloud%20%2F%20SDK-F02E65?style=flat-square&logo=appwrite)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

**Civic AI** (Project AI) is an intelligent, full-stack civic issue management and citizen grievance redressal platform. Built with Next.js, Appwrite, and a Python FastAPI AI engine, it empowers citizens to report civic issues seamlessly while providing municipal officers with AI-assisted classification, duplicate detection, severity scoring, and identity verification.

---

## 🚀 Key Features

- **🤖 Multimodal AI Complaint Analysis**: Automatically analyzes complaint titles, descriptions, and uploaded images to classify issue categories, assign priority levels, and calculate severity scores.
- **🔍 Intelligent Duplicate Detection**: Uses TF-IDF vectorization and Cosine Similarity algorithms to detect duplicate civic reports and aggregate community complaints efficiently.
- **💬 Cosmos AI Assistant**: A context-aware conversational assistant available to citizens and officers for tracking complaints, asking civic questions, and navigating municipal services.
- **🪪 AI Identity & KYC Verification**: Performs OCR document processing and facial matching (selfie vs. government ID document) for secure citizen verification.
- **🏢 Role-Based Portals**:
  - **Citizen Portal**: Submit grievances, view interactive status timelines, interact with Cosmos AI, and verify identity.
  - **Officer Portal**: Manage assigned civic tickets, review AI severity scores, inspect duplicate alerts, and update resolution statuses.
  - **Admin Portal**: System-wide analytical dashboards, user role administration, and database maintenance.
- **🗺️ Geospatial Issue Mapping**: Interactive Leaflet maps for location tagging and visual incident distribution.
- **📧 Automated Notifications**: Instant email OTP verification and complaint status update alerts via Nodemailer SMTP.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4, Framer Motion, GSAP
- **State & Data**: Redux Toolkit, TanStack React Query
- **UI Components & Icons**: Lucide React, Leaflet Maps

### **Backend & Database**
- **BaaS Platform**: Appwrite (Authentication, Database Collections, Storage)
- **Server SDK**: Node-Appwrite API Server SDK

### **AI Engine (Microservice)**
- **Framework**: Python 3.11+ with FastAPI & Uvicorn
- **AI Providers**: Configurable abstraction layer supporting **Google Gemini API**, **OpenAI GPT-4o**, and **Local Ollama** (Gemma / Llama models)
- **Algorithms**: Scikit-learn TF-IDF, Cosine Similarity, Vision-based OCR & Face verification

---

## 📁 Directory Structure

```
projectai/
├── ai/                      # Python FastAPI AI Microservice Engine
│   ├── providers/           # AI Provider Abstraction (Gemini, OpenAI, Local)
│   ├── services/            # Complaint analysis, KYC verification, & Chat services
│   ├── main.py              # FastAPI server entry point
│   └── requirements.txt     # Python dependencies
├── src/                     # Next.js Frontend Application
│   ├── app/                 # Next.js App Router (Pages, API Routes, Layouts)
│   ├── components/          # Reusable UI Components & Role Portals
│   ├── contexts/            # React Contexts (AuthContext, ThemeContext)
│   ├── hooks/               # Custom React Hooks
│   └── lib/                 # Appwrite Client & Server Utilities
├── scripts/                 # Automation Scripts
│   ├── init-db.js           # Appwrite Database Schema & Index Initializer
│   ├── setup-test-users.js  # Seeding Mock Test Users & Data
│   └── run-all.js           # Concurrent execution script for Frontend & AI Engine
├── docs/                    # Technical Reports & LaTeX Documentation
├── .github/                 # Issue & Pull Request Templates
├── .env.local               # Local Environment Variables Configuration
└── package.json             # Node.js Dependencies & NPM Scripts
```

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: v18.x or higher
- **npm** or **yarn** / **pnpm** / **bun**
- **Python**: v3.11 or higher
- **Appwrite Instance**: Appwrite Cloud account or self-hosted instance

---

### Installation & Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anix003/ProjectAI.git
   cd ProjectAI
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Set up Python Virtual Environment & Install AI dependencies**:
   ```bash
   cd ai
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   cd ..
   ```

4. **Configure Environment Variables**:
   Create a `.env.local` file in the project root with your credentials:

   ```env
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_appwrite_database_id
   NEXT_PUBLIC_APPWRITE_COLLECTION_USERS=table_users
   APPWRITE_API_KEY=your_appwrite_secret_api_key

   # Authentication & Security
   JWT_SECRET=your_jwt_secret_key

   # AI Engine Configuration (local | gemini | openai)
   AI_PROVIDER=local
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=gemma4
   # GEMINI_API_KEY=your_gemini_api_key
   # OPENAI_API_KEY=your_openai_api_key

   # SMTP Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   ```

---

## 🏃 Running the Application

### Option 1: Unified Execution (Recommended)
Run both the Next.js frontend and Python FastAPI AI engine concurrently:
```bash
npm run all
```

### Option 2: Run Services Individually

1. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   Access the web app at [http://localhost:3000](http://localhost:3000).

2. **Start the Python AI Engine**:
   ```bash
   cd ai
   python main.py
   ```
   The AI FastAPI server will run at [http://localhost:8000](http://localhost:8000). Docs available at `/docs`.

---

## 🛠️ Database Setup & Seeding

Initialize Appwrite database collections and attributes:
```bash
node scripts/init-db.js
```

Seed mock users (Citizen, Officer, Admin) for testing:
```bash
node scripts/setup-test-users.js
```

---

## 🧠 Knowledge Graph (Graphify)

This repository includes a **Graphify** knowledge graph located in `graphify-out/`.
- Run `graphify update .` after updating code files to keep the AST knowledge graph updated.
- AI subagents and developers can inspect `graphify-out/GRAPH_REPORT.md` for architecture insights.

---

## 👥 Collaborators

We welcome contributions and collaboration from developers, students, and civic tech enthusiasts!

### **Project Maintainers & Contributors**

<!-- TODO: Add your details here -->
| Name | Role | Institution / Organization | GitHub |
| :--- | :--- | :--- | :--- |
| **Anish Bar** | Project Lead & Full Stack Developer | Department of CSE, GCETTS (MAKAUT) | [@Anix003](https://github.com/Anix003) |
| **Placeholder Name 1** | Role 1 | Institution / Organization 1 | [@github1](https://github.com/github1) |
| **Placeholder Name 2** | Role 2 | Institution / Organization 2 | [@github2](https://github.com/github2) |
| **Placeholder Name 3** | Role 3 | Institution / Organization 3 | [@github3](https://github.com/github3) |
| **Placeholder Name 4** | Role 4 | Institution / Organization 4 | [@github4](https://github.com/github4) |

---

### 🤝 How to Contribute

If you'd like to collaborate on **Civic AI**, please follow these steps:

1. **Fork the Repository**: Create your personal copy of the project repository.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/your-bug-fix
   ```
3. **Commit Your Changes**: Keep commits clear, descriptive, and atomic.
   ```bash
   git commit -m "feat: add real-time notification push service"
   ```
4. **Run Code Quality Checks**:
   Ensure linting rules and format checks pass cleanly:
   ```bash
   npm run lint
   ```
5. **Push & Open a Pull Request**:
   Push your branch to GitHub and create a Pull Request against `main`. Please complete all sections of the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

### 📋 Collaboration Guidelines

- **Code Style**: Follow ESLint guidelines for Next.js/React code and PEP 8 standards for Python AI code.
- **Issue Tracking**: Search existing GitHub Issues before opening new ones. Use appropriate issue templates.
- **Communication**: Respect fellow collaborators and maintain professional, constructive discussions in PR reviews and discussions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

*Developed with ❤️ for Smart Civic Governance.*
