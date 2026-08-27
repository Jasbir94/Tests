# MockPDF

MockPDF is a modern, AI-ready web application that transforms any question paper PDF into an interactive, timed mock test. 

It is built to help students practice in a realistic exam environment by uploading their own PDFs and answer keys, setting a custom timer, and getting instant, rich feedback upon completion.

---

## 🚀 Live Demo

**[MockPDF Live Application](https://tests-ten-mu.vercel.app)** *(Replace with your final domain if it changes)*

---

## 🌟 Key Features

- **PDF to Exam Interface:** Upload any question paper PDF and instantly take the test in a split-pane, distraction-free environment.
- **Customizable Exams:** Define your own answer key (MCQ, MSQ, NAT) and set a custom timer (e.g., 180 mins for GATE/JEE).
- **Interactive Palette:** Track your progress with a dynamic question palette (Answered, Not Visited, Marked for Review).
- **Rich Analytics & Feedback:** Receive an instant score, accuracy percentage, time-taken analysis, section-wise breakdowns, and AI-style performance feedback upon submission.
- **Authentication:** Secure login using Email/Password or Google OAuth (via Auth.js v5).
- **Personal Dashboard:** View all your past tests, attempt history, average scores, and best scores.

---

## 💻 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Database:** PostgreSQL (via [Prisma Postgres](https://www.prisma.io/data-platform/postgres))
- **ORM:** [Prisma ORM v7](https://www.prisma.io/)
- **Authentication:** [Auth.js v5 (NextAuth)](https://authjs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** Zustand
- **Deployment:** Vercel

---

## 🛠️ Local Development Setup

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Jasbir94/Tests.git
cd Tests
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add the following:
```env
# Database
DATABASE_URL="postgresql://user:password@db.prisma.io:5432/postgres?sslmode=require"

# Authentication
AUTH_SECRET="your-generated-secret-here" # Generate one using: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Setup the Database
Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📦 Deployment (Vercel)

This app is optimized for Vercel deployment. 

1. Push your code to GitHub.
2. Import the project into Vercel.
3. In the **Environment Variables** settings on Vercel, ensure you add:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (Set to your live Vercel domain, e.g., `https://tests-ten-mu.vercel.app`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Deploy!

*Note: The `postinstall` script in `package.json` automatically runs `prisma generate` during the Vercel build process to ensure the database client is ready.*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.
