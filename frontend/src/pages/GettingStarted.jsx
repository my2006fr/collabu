import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import {
  IconHexLogo, IconRocket, IconProjects, IconUsers, IconTask,
  IconChat, IconGithub, IconGallery, IconPost, IconGlobe, IconGuide,
  IconBolt, IconKey, IconSettings, IconProfile, IconEmail, IconLock,
  IconCheck, IconChevronRight, IconCode, IconSkill, IconHandshake,
  IconNumber1, IconNumber2, IconNumber3, IconNumber4, IconNumber5, IconNumber6,
  IconFeed, IconEdit,
} from '../components/Icons'

/* ── Design tokens ──────────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    background: 'var(--bg)',
    padding: 'clamp(20px,4vw,48px) clamp(14px,5vw,32px)',
  },
  inner: { maxWidth: 900, margin: '0 auto' },

  /* Hero */
  hero: {
    background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--bg-card) 60%)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(28px,5vw,52px) clamp(22px,5vw,48px)',
    marginBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 260, height: 260,
    background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
    opacity: 0.08, pointerEvents: 'none',
  },
  heroTitle: {
    fontFamily: 'var(--font-d)',
    fontSize: 'clamp(26px,5vw,40px)',
    fontWeight: 900,
    lineHeight: 1.2,
    marginBottom: 12,
  },
  heroSub: { color: 'var(--txt2)', fontSize: 16, lineHeight: 1.6, maxWidth: 560 },

  /* Section header */
  sectionLabel: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 20, marginTop: 40,
  },
  sectionTitle: {
    fontFamily: 'var(--font-d)',
    fontSize: 'clamp(17px,3vw,22px)',
    fontWeight: 800, color: 'var(--txt1)',
  },

  /* Cards */
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16, marginBottom: 8,
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 10,
    transition: 'border-color .18s, transform .18s',
    cursor: 'default',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  cardTitle: { fontFamily: 'var(--font-d)', fontSize: 15, fontWeight: 700 },
  cardDesc:  { color: 'var(--txt2)', fontSize: 13, lineHeight: 1.55 },

  /* Steps */
  stepRow: {
    display: 'flex', gap: 18, alignItems: 'flex-start',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '18px 22px', marginBottom: 12,
  },
  stepContent: { flex: 1 },
  stepTitle: { fontFamily: 'var(--font-d)', fontSize: 15, fontWeight: 700, marginBottom: 5 },
  stepDesc: { color: 'var(--txt2)', fontSize: 13, lineHeight: 1.6 },

  /* Tips */
  tip: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent)',
    borderRadius: 10, padding: '14px 18px',
    display: 'flex', gap: 12, alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: { color: 'var(--txt1)', fontSize: 13, lineHeight: 1.6 },

  /* FAQ accordion */
  faqItem: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, marginBottom: 8, overflow: 'hidden',
  },
  faqQ: {
    width: '100%', background: 'none', border: 'none',
    textAlign: 'left', padding: '16px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontFamily: 'var(--font-d)', fontSize: 14, fontWeight: 700,
    color: 'var(--txt1)', cursor: 'pointer', gap: 12,
  },
  faqA: {
    padding: '0 20px 16px',
    color: 'var(--txt2)', fontSize: 13, lineHeight: 1.65,
    borderTop: '1px solid var(--border)',
    paddingTop: 12,
  },

  /* Keyboard shortcut pill */
  kbd: {
    display: 'inline-block', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)', borderRadius: 5,
    padding: '2px 7px', fontSize: 11, fontFamily: 'monospace',
    color: 'var(--txt2)',
  },

  /* CTA */
  cta: {
    background: 'linear-gradient(135deg, var(--accent-dim), var(--bg-card))',
    border: '1px solid var(--accent)',
    borderRadius: 'var(--radius)', padding: 'clamp(24px,4vw,40px)',
    textAlign: 'center', marginTop: 40,
  },
  ctaTitle: {
    fontFamily: 'var(--font-d)', fontSize: 'clamp(18px,3vw,26px)',
    fontWeight: 800, marginBottom: 10,
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'var(--accent)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '11px 22px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    textDecoration: 'none',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'var(--bg-card)', color: 'var(--txt1)',
    border: '1px solid var(--border)', borderRadius: 8, padding: '11px 22px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    textDecoration: 'none',
  },

  /* Sidebar TOC */
  toc: {
    position: 'sticky', top: 80,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '18px 16px',
    width: 210, flexShrink: 0,
  },
  tocTitle: { fontFamily: 'var(--font-d)', fontSize: 12, fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 12 },
  tocLink: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 8px', borderRadius: 6,
    fontSize: 13, color: 'var(--txt2)', textDecoration: 'none',
    transition: 'background .15s, color .15s',
  },
}

/* ── Feature cards ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <IconFeed size={22} color="var(--accent)" />,
    bg: 'var(--accent-dim)',
    title: 'Global Feed',
    desc: 'Browse announcements and posts from everyone on the platform. Share updates, ask questions, and stay connected.',
    path: '/feed',
  },
  {
    icon: <IconProjects size={22} color="#22c97a" />,
    bg: 'rgba(34,201,122,.12)',
    title: 'Projects',
    desc: 'Create or browse student projects. Filter by skills, methodology, or status. Each project has its own workspace.',
    path: '/dashboard',
  },
  {
    icon: <IconHandshake size={22} color="#38bdf8" />,
    bg: 'rgba(56,189,248,.12)',
    title: 'Collaboration',
    desc: 'Request to join projects. Project owners review and accept/reject requests. Track your membership status.',
    path: '/dashboard',
  },
  {
    icon: <IconTask size={22} color="#f5a623" />,
    bg: 'rgba(245,166,35,.12)',
    title: 'Task Board',
    desc: 'Kanban-style task management inside every project. Create tasks, assign collaborators, set priorities.',
    path: '/dashboard',
  },
  {
    icon: <IconChat size={22} color="#a78bfa" />,
    bg: 'rgba(167,139,250,.12)',
    title: 'Project Chat',
    desc: 'Real-time messaging within your project team. Share files, images, and stay in sync.',
    path: '/dashboard',
  },
  {
    icon: <IconGithub size={22} color="var(--txt1)" />,
    bg: 'var(--bg-elevated)',
    title: 'GitHub Integration',
    desc: 'Link your GitHub repo. Track commits, open issues, and pull requests directly from the project view.',
    path: '/dashboard',
  },
  {
    icon: <IconGallery size={22} color="#f472b6" />,
    bg: 'rgba(244,114,182,.12)',
    title: 'Media Gallery',
    desc: 'Every project has a shared gallery. Upload screenshots, mockups, and design assets.',
    path: '/dashboard',
  },
  {
    icon: <IconPost size={22} color="#34d399" />,
    bg: 'rgba(52,211,153,.12)',
    title: 'Project Feed',
    desc: 'A dedicated post feed per project. Announce milestones, share progress updates with your team.',
    path: '/dashboard',
  },
]

/* ── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  {
    num: <IconNumber1 size={32} color="var(--accent)" />,
    title: 'Create your account',
    desc: 'Sign up using your university email (e.g. you@university.edu). Pick your skill set and experience level. Upload an avatar on your profile to stand out.',
  },
  {
    num: <IconNumber2 size={32} color="var(--accent)" />,
    title: 'Complete your profile',
    desc: 'Go to Profile to add your bio, GitHub username, and skills. The more complete your profile, the easier collaborators can find you.',
  },
  {
    num: <IconNumber3 size={32} color="var(--accent)" />,
    title: 'Browse or create a project',
    desc: 'Head to Projects to explore existing ones. Use the search and filters to find projects that match your skills. Or click "+ New Project" to start one.',
  },
  {
    num: <IconNumber4 size={32} color="var(--accent)" />,
    title: 'Request to join',
    desc: 'Found a project you love? Open it and click "Request to Join". The owner will review your profile and either accept or decline.',
  },
  {
    num: <IconNumber5 size={32} color="var(--accent)" />,
    title: 'Collaborate',
    desc: 'Once accepted, access the full project workspace: task board, team chat, media gallery, project feed, and GitHub stats.',
  },
  {
    num: <IconNumber6 size={32} color="var(--accent)" />,
    title: 'Link GitHub & ship',
    desc: 'Add a GitHub Personal Access Token in your profile settings to unlock real-time repo stats, commit tracking, and contributor insights.',
  },
]

/* ── Tips ───────────────────────────────────────────────────────────────── */
const TIPS = [
  { icon: <IconSkill size={18} color="var(--accent)" />, text: 'List your skills accurately. The system uses them to suggest assignees for tasks and highlights your match with project requirements.' },
  { icon: <IconEmail size={18} color="var(--accent)" />, text: 'Only university email addresses (@university.edu by default) can register. If your email is rejected, ask your admin to update the allowed domain in .env.' },
  { icon: <IconCode size={18} color="var(--accent)" />, text: 'When creating a project, include a valid GitHub repo URL. This unlocks the statistics panel with commits and open issues.' },
  { icon: <IconBolt size={18} color="var(--accent)" />, text: 'The task board uses Kanban: drag tasks across To Do → In Progress → Done. Assign tasks to accepted collaborators for best results.' },
  { icon: <IconLock size={18} color="var(--accent)" />, text: 'Your GitHub Personal Access Token (PAT) is encrypted at rest. We never expose it in any API response — only a boolean "connected" flag is shown.' },
]

/* ── FAQ ────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'My email was rejected during registration. Why?',
    a: 'CollabU restricts signups to a specific university domain (default: @university.edu). Ask your platform administrator to update the ALLOWED_DOMAIN environment variable in the backend .env file to match your institution\'s email domain.',
  },
  {
    q: 'What happens after I request to join a project?',
    a: 'Your request is queued as "Pending". The project owner sees a notification and can accept or reject it. Once accepted you get full access to the project workspace including the task board, chat, gallery, and project feed.',
  },
  {
    q: 'Do I need a GitHub account to use CollabU?',
    a: 'No. GitHub is optional. You still need to provide a valid GitHub repo link when creating a project (it validates the URL format), but the live stats panel only activates when you add a GitHub Personal Access Token to your profile.',
  },
  {
    q: 'How do I enable real-time GitHub repo stats?',
    a: 'Go to Profile → GitHub tab. Enter your GitHub Personal Access Token (PAT) with repo scope. This enables commit history, open issues, and pull request tracking in the GitHub panel of every project you have access to.',
  },
  {
    q: 'Can I be in multiple projects at once?',
    a: 'Yes! You can own multiple projects and be an accepted collaborator in many others simultaneously. Your Dashboard shows all of them with filter tabs: All, Mine (owner), and Joined (collaborator).',
  },
  {
    q: 'How does the task assignment work?',
    a: 'Inside the task board, when you create a task you can specify a required skill. The platform will suggest accepted collaborators whose skill list matches — making it easy to assign the right person. You can also manually assign any accepted collaborator.',
  },
  {
    q: 'Is the chat real-time?',
    a: 'Yes. Project chat uses WebSockets (Socket.IO) for real-time delivery. You can also upload images and files in the chat. Messages persist across sessions and support pagination for older messages.',
  },
  {
    q: 'How do I change the theme?',
    a: 'Click the sun/moon icon in the top navigation bar to toggle between dark and light mode. Your theme preference is also saved in your profile settings under Preferences, so it syncs across devices.',
  },
]

/* ── Keyboard shortcuts ──────────────────────────────────────────────────── */
const SHORTCUTS = [
  { keys: ['F'], label: 'Go to Global Feed' },
  { keys: ['P'], label: 'Go to Projects' },
  { keys: ['N'], label: 'Create new project (from Dashboard)' },
  { keys: ['Esc'], label: 'Close modals and overlays' },
]

/* ── Page component ──────────────────────────────────────────────────────── */
export default function GettingStarted() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = i => setOpenFaq(p => (p === i ? null : i))

  return (
    <div style={S.page}>
      <div style={S.inner} className="fade-up">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div style={S.hero}>
          <div style={S.heroGlow} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <IconHexLogo size={40} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 2 }}>CollabU</div>
              <h1 style={S.heroTitle}>Getting Started Guide</h1>
            </div>
          </div>
          <p style={S.heroSub}>
            Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}! This guide walks you through everything you need to know to find collaborators, build projects, and make the most of the platform.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            <a href="#quickstart" style={S.btnPrimary}>
              <IconRocket size={16} /> Quick Start
            </a>
            <a href="#features" style={S.btnSecondary}>
              <IconGuide size={16} /> Explore Features
            </a>
          </div>
        </div>

        {/* ── Platform at a glance ─────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {[
              { icon: <IconProjects size={20} color="var(--accent)" />, label: 'Projects', sub: 'Create & browse' },
              { icon: <IconUsers size={20} color="#22c97a" />, label: 'Collaborators', sub: 'Find & join teams' },
              { icon: <IconTask size={20} color="#f5a623" />, label: 'Tasks', sub: 'Kanban board' },
              { icon: <IconChat size={20} color="#a78bfa" />, label: 'Real-time Chat', sub: 'WebSocket powered' },
              { icon: <IconGithub size={20} color="var(--txt1)" />, label: 'GitHub', sub: 'Repo integration' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ textAlign: 'center', padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-d)', fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Start Steps ────────────────────────────────────────── */}
        <div id="quickstart">
          <div style={S.sectionLabel}>
            <IconRocket size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Quick Start</h2>
          </div>

          {STEPS.map((s, i) => (
            <div key={i} style={S.stepRow}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>{s.num}</div>
              <div style={S.stepContent}>
                <div style={S.stepTitle}>{s.title}</div>
                <div style={S.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Features ─────────────────────────────────────────────────── */}
        <div id="features">
          <div style={S.sectionLabel}>
            <IconBolt size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Platform Features</h2>
          </div>

          <div style={S.cardGrid}>
            {FEATURES.map(f => (
              <Link key={f.title} to={f.path}
                style={{ textDecoration: 'none' }}
                onMouseEnter={e => {
                  e.currentTarget.querySelector('[data-card]').style.borderColor = 'var(--border-hover)'
                  e.currentTarget.querySelector('[data-card]').style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.querySelector('[data-card]').style.borderColor = 'var(--border)'
                  e.currentTarget.querySelector('[data-card]').style.transform = 'none'
                }}
              >
                <div data-card="" style={S.card}>
                  <div style={{ ...S.cardIcon, background: f.bg }}>
                    {f.icon}
                  </div>
                  <div style={S.cardTitle}>{f.title}</div>
                  <div style={S.cardDesc}>{f.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4,
                    color: 'var(--accent-h)', fontSize: 12, fontWeight: 600, marginTop: 'auto' }}>
                    Open <IconChevronRight size={14} color="var(--accent-h)" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Project Workspace Guide ──────────────────────────────────── */}
        <div id="workspace">
          <div style={S.sectionLabel}>
            <IconProjects size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Inside a Project Workspace</h2>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 16 }}>
            {[
              { icon: <IconEdit size={16} color="var(--txt2)" />, tab: 'Overview', desc: 'Project details, GitHub repo link, methodology, team members, and the live GitHub stats panel (commits, issues, PRs).' },
              { icon: <IconTask size={16} color="var(--txt2)" />, tab: 'Task Board', desc: 'Kanban board with columns: To Do, In Progress, Done. Create tasks with priorities (Low / Medium / High / Critical), assignees, and due dates.' },
              { icon: <IconChat size={16} color="var(--txt2)" />, tab: 'Chat', desc: 'Real-time team messaging. Supports text, image uploads, file attachments, message editing, and deletion.' },
              { icon: <IconPost size={16} color="var(--txt2)" />, tab: 'Project Feed', desc: 'Post updates, milestones, and announcements visible to all project members. Great for async communication.' },
              { icon: <IconGallery size={16} color="var(--txt2)" />, tab: 'Gallery', desc: 'Shared media library for the project. Upload screenshots, designs, diagrams — anything visual.' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 20px',
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>{row.icon}</div>
                <div>
                  <span style={{ fontFamily: 'var(--font-d)', fontSize: 14, fontWeight: 700,
                    color: 'var(--txt1)', marginRight: 8 }}>{row.tab}</span>
                  <span style={{ color: 'var(--txt2)', fontSize: 13, lineHeight: 1.55 }}>{row.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Profile & Settings ────────────────────────────────────────── */}
        <div id="profile">
          <div style={S.sectionLabel}>
            <IconProfile size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Profile & Settings</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 8 }}>
            {[
              { icon: <IconProfile size={18} color="var(--accent)" />, label: 'Profile tab', desc: 'Name, bio, skills, level, GitHub username, avatar upload.' },
              { icon: <IconLock size={18} color="#f5a623" />, label: 'Security tab', desc: 'Change your password (requires current password).' },
              { icon: <IconKey size={18} color="#22c97a" />, label: 'GitHub tab', desc: 'Add/remove your GitHub PAT for live repo integration.' },
              { icon: <IconSettings size={18} color="#38bdf8" />, label: 'Preferences tab', desc: 'Toggle dark/light theme, change display language.' },
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  {icon}
                  <span style={{ fontFamily: 'var(--font-d)', fontSize: 13, fontWeight: 700 }}>{label}</span>
                </div>
                <p style={{ color: 'var(--txt2)', fontSize: 12, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── GitHub Integration ────────────────────────────────────────── */}
        <div id="github">
          <div style={S.sectionLabel}>
            <IconGithub size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>GitHub Integration Setup</h2>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 16 }}>
            {[
              { n: '1', text: 'Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic).' },
              { n: '2', text: 'Click "Generate new token". Give it a name like "CollabU". Check the repo scope.' },
              { n: '3', text: 'Copy the token (you can only see it once). Go to CollabU → Profile → GitHub tab.' },
              { n: '4', text: 'Paste the token and save. A green "Connected" badge will appear. Your projects will now show live commit and issue stats.' },
            ].map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', gap: 14, marginBottom: n === '4' ? 0 : 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>{n}</div>
                <p style={{ color: 'var(--txt2)', fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tips ─────────────────────────────────────────────────────── */}
        <div id="tips">
          <div style={S.sectionLabel}>
            <IconBolt size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Tips & Best Practices</h2>
          </div>

          {TIPS.map((t, i) => (
            <div key={i} style={S.tip}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{t.icon}</div>
              <p style={S.tipText}>{t.text}</p>
            </div>
          ))}
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div id="faq">
          <div style={S.sectionLabel}>
            <IconGuide size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>Frequently Asked Questions</h2>
          </div>

          {FAQS.map((f, i) => (
            <div key={i} style={S.faqItem}>
              <button style={S.faqQ} onClick={() => toggleFaq(i)}>
                <span>{f.q}</span>
                <div style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                  <IconChevronRight size={16} color="var(--txt3)" />
                </div>
              </button>
              {openFaq === i && (
                <div style={S.faqA}>{f.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Collaboration Flow ────────────────────────────────────────── */}
        <div id="flow">
          <div style={S.sectionLabel}>
            <IconHandshake size={20} color="var(--accent)" />
            <h2 style={S.sectionTitle}>How Collaboration Works</h2>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '22px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', position: 'relative' }}>
              {[
                { icon: <IconProjects size={18} color="var(--accent)" />, label: 'Browse Projects', color: 'var(--accent)' },
                { icon: <IconHandshake size={18} color="#38bdf8" />, label: 'Send Join Request', color: '#38bdf8' },
                { icon: <IconCheck size={18} color="#22c97a" />, label: 'Owner Accepts', color: '#22c97a' },
                { icon: <IconTask size={18} color="#f5a623" />, label: 'Get Assigned Tasks', color: '#f5a623' },
                { icon: <IconRocket size={18} color="#a78bfa" />, label: 'Ship Together', color: '#a78bfa' },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <div style={{ textAlign: 'center', padding: '0 12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%',
                      background: `${step.color}20`, border: `2px solid ${step.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      {step.icon}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt2)', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <IconChevronRight size={16} color="var(--txt3)" style={{ flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div style={S.cta}>
          <div style={S.ctaTitle}>
            {user ? `Ready to build, ${user.name.split(' ')[0]}?` : 'Ready to start collaborating?'}
          </div>
          <p style={{ color: 'var(--txt2)', fontSize: 14, marginBottom: 22 }}>
            {user
              ? 'Head to the Projects dashboard and find your next collaboration.'
              : 'Create your account and find your next project partner today.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to="/dashboard" style={S.btnPrimary}>
                  <IconProjects size={16} /> Browse Projects
                </Link>
                <Link to="/projects/new" style={S.btnSecondary}>
                  <IconRocket size={16} /> Create a Project
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" style={S.btnPrimary}>
                  <IconRocket size={16} /> Create Account
                </Link>
                <Link to="/login" style={S.btnSecondary}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
