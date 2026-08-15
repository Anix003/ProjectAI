# Contributing to Civic AI

Thank you for your interest in contributing to **Civic AI**! We welcome contributions from developers, researchers, designers, and civic tech enthusiasts.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📜 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Workflow](#development-workflow)
  - [Setting Up Your Local Environment](#setting-up-your-local-environment)
  - [Branch Naming Conventions](#branch-naming-conventions)
  - [Commit Message Format](#commit-message-format)
- [Code Quality Standards](#code-quality-standards)
  - [Frontend Standards](#frontend-standards)
  - [AI & Python Standards](#ai--python-standards)
- [Security & Disclosure](#security--disclosure)

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please search existing issues to check if the bug has already been reported.

When reporting a bug, please include:
- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Environment details (Browser, OS version, Node/Python versions).
- Relevant terminal logs or console screenshots.

### Suggesting Enhancements

Enhancement suggestions are tracked via GitHub Issues. Please provide:
- A clear summary of the feature or improvement.
- Context on why this feature would benefit citizens, officers, or developers.
- Proposed UI or technical implementation details.

### Submitting Pull Requests

1. **Fork the repository** and clone your fork locally.
2. Create a new branch off `main` following our [Branch Naming Conventions](#branch-naming-conventions).
3. Make your changes and test thoroughly.
4. Ensure linting checks pass:
   ```bash
   npm run lint
   ```
5. Commit your changes using conventional commit messages.
6. Push your branch to GitHub and submit a Pull Request.
7. Fill out the complete [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## 💻 Development Workflow

### Setting Up Your Local Environment

1. **Node.js Environment**:
   ```bash
   npm install
   ```

2. **Python Virtual Environment**:
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

3. **Running Concurrent Development Servers**:
   ```bash
   npm run all
   ```

### Branch Naming Conventions

Use the following prefixes when naming your branch:
- `feature/` for new features (e.g., `feature/live-chat-notifications`)
- `fix/` for bug fixes (e.g., `fix/kyc-base64-decoder`)
- `docs/` for documentation improvements (e.g., `docs/api-routes`)
- `refactor/` for code refactoring without behavior change (e.g., `refactor/appwrite-client`)
- `test/` for adding or modifying tests (e.g., `test/complaint-analysis`)

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

**Examples**:
- `feat(ai): add support for Claude 3.5 Sonnet provider`
- `fix(auth): resolve JWT expiration token refresh issue`
- `docs(readme): add contributing and code of conduct links`

---

## 🎨 Code Quality Standards

### Frontend Standards (Next.js & React 19)
- Write clean, modern React 19 functional components with proper React Hooks usage.
- Use Tailwind CSS v4 for component styling. Avoid hardcoded inline styles unless required for dynamic layout calculations.
- Maintain responsive design for mobile, tablet, and desktop viewports.
- Ensure light and dark mode compatibility.

### AI & Python Standards (FastAPI)
- Adhere to PEP 8 python formatting guidelines.
- Use type hints (`typing.Optional`, `typing.List`, Pydantic models) for all API endpoints and internal services.
- Ensure error handling returns appropriate HTTP status codes and structured detail messages.

---

## 🛡️ Security & Disclosure

If you discover a security vulnerability within Civic AI, please review our [Security Policy](SECURITY.md) or email **baranish2003@gmail.com** directly instead of creating a public issue.

---

Thank you for helping build a better, AI-powered civic governance platform! ❤️
