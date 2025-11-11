# TeamGPT  
### Collaborative AI Chat Platform — Built with Next.js + TypeScript + OpenAI  

🎥 **[Watch the Demo on YouTube](https://www.youtube.com/watch?v=fVEfi5YIJ3A)**  

**TeamGPT** is a real-time, collaborative AI chat workspace designed for teams.  
It enables multiple users to brainstorm, chat with AI, and manage projects together — all in one beautifully designed interface.  

---

## 🚀 Inspiration

AI chat tools like ChatGPT are great individually — but when working in teams, collaboration becomes fragmented.  
We built **TeamGPT** to bridge that gap: a shared space where teams can talk, plan, and create together with the help of AI.  

The goal?  
A workspace where your *team* and *AI* can think together — syncing ideas, context, and creativity in real time.

---

## 💡 What It Does

**TeamGPT** transforms the way teams collaborate with AI by offering:  

1. 💬 **Shared AI Workspaces**  
   - Create, join, and collaborate in dedicated chat spaces.  
   - Every message is visible in real time to all members.  

2. ⚡ **Real-Time Collaboration**  
   - Messages, edits, and deletions sync instantly across users via Pusher.  
   - No refresh required — everything updates live.  

3. 🧠 **AI-Powered Conversations**  
   - Chat with OpenAI’s GPT-4o-mini model.  
   - Each workspace remembers context for smarter responses.  

4. 🧑‍💼 **Team Management**  
   - Invite members using unique workspace codes.  
   - Admins can remove users or transfer control.  

5. 🔍 **Search & Highlight**  
   - Instantly search past messages with real-time highlighting.  
   - Use navigation arrows to jump through matches easily.  

6. ✏️ **Edit / Delete Messages**  
   - Users can edit or delete their own messages for clarity.  

7. 🌙 **Dark / Light Themes**  
   - Seamless theme switching across the entire app.  

8. 🎨 **Modern UI/UX**  
   - Built with Tailwind CSS + Framer Motion for smooth animations.  
   - Includes background video, animated cards, and clean gradients.  

---

## 🛠️ How We Built It

**Tech Stack**

- **Framework**: Next.js (App Router)  
- **Language**: TypeScript  
- **Authentication**: NextAuth (Google & GitHub OAuth)  
- **Database**: PostgreSQL + Prisma ORM  
- **AI Model**: OpenAI GPT-4o-mini (Streaming API)  
- **Realtime Sync**: Pusher Channels  
- **UI**: Tailwind CSS + Framer Motion  
- **Deployment**: Vercel  

**Architecture Overview**

1. Each **workspace** is stored in PostgreSQL with memberships and messages.  
2. When a message is created:  
   - It’s stored in Prisma.  
   - Broadcast instantly to all connected clients using **Pusher**.  
3. When an AI reply is triggered:  
   - GPT-4o-mini streams text in real time.  
   - The frontend progressively renders tokens for a live typing effect.  
4. Users can join workspaces via invite codes and collaborate live.  

---

## ⚙️ Features

- 🧑‍🤝‍🧑 Team-based shared workspaces  
- 💬 Real-time synced chat using **Pusher**  
- 🤖 Live AI responses from **OpenAI GPT-4o-mini**  
- 🔍 Search + highlight + navigate through old messages  
- ✏️ Edit or delete your own messages  
- 📱 Responsive & mobile-friendly UI  
- 🎥 Background video landing page  
- 🌙 Dark & light themes with persistent toggle  
- 🪄 Clean animations via **Framer Motion**  
- 🔐 Secure login with Google/GitHub OAuth  
- ⚙️ Prisma + NextAuth integrated backend  

---

## 🧩 Challenges We Faced

- **Real-time synchronization:** Ensuring no duplicate AI responses while keeping all clients in sync.  
- **Streaming AI replies:** Managing token streaming and UI rendering simultaneously.  
- **Multi-user state management:** Handling concurrent edits/deletions without race conditions.  
- **Theme persistence:** Keeping dark/light mode consistent across all pages.  
- **UI scaling:** Maintaining consistent design across large and small viewports.  

---

## 🏆 Accomplishments

- Built a fully functional **real-time multi-user AI chat app**.  
- Implemented seamless OpenAI streaming with token updates.  
- Designed a highly responsive, gradient-based UI with animations.  
- Added dark mode, search, and edit/delete to make it feel like a polished product.  

---

## 📚 What We Learned

- How to combine **Next.js server routes**, **NextAuth**, and **Prisma** effectively.  
- The power of **Pusher Channels** for real-time experiences.  
- Optimizing OpenAI streaming for UI updates without lag.  
- Managing UI state across multiple authenticated users.  
- Designing production-grade UIs using **Framer Motion** and **Tailwind**.  

---

## 🔮 What’s Next for TeamGPT

- 💼 Add project-based threads for task-specific AI chats.  
- 🧑‍💻 Introduce role-based permissions (admin/editor/viewer).  
- 🧠 Integrate vector-based memory using Supabase or Pinecone.  
- 📎 Upload and chat with files (PDFs, Docs, etc.).  
- 🔔 Add notifications and AI “mention” summaries for teams.  
- ☁️ Expand to a cloud-synced SaaS model with billing.  

---

## 🧱 Built With

- **Framework**: Next.js (App Router)  
- **Language**: TypeScript  
- **UI**: Tailwind CSS + Framer Motion  
- **Realtime**: Pusher  
- **AI**: OpenAI GPT-4o-mini  
- **Auth**: NextAuth (Google, GitHub)  
- **ORM**: Prisma  
- **Database**: PostgreSQL  
- **Deployment**: Vercel  

## 🧩 Installation & Run Locally

```bash
# Clone the repo
git clone https://github.com/SujeetJawale/TeamGPT.git
cd TeamGPT

# Install dependencies
npm install

# Create an .env file and add:
# OPENAI_API_KEY=your_openai_key
# DATABASE_URL=your_postgres_url
# NEXTAUTH_SECRET=your_secret
# NEXTAUTH_URL=http://localhost:3000
# GITHUB_ID=your_github_client_id
# GITHUB_SECRET=your_github_client_secret
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# PUSHER_APP_ID=...
# PUSHER_KEY=...
# PUSHER_SECRET=...
# PUSHER_CLUSTER=...

# Run the dev server
npm run dev
