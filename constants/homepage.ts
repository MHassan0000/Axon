import { Mail, MessageSquare, Github, Twitter, Linkedin, X, Focus, Zap } from "lucide-react";
import { SiStripe, SiNotion, SiSlack, SiZoom, SiFigma } from "react-icons/si";

// App Workflow Section
export const workflows = [
  {
    icon: Mail,
    title: "From message to action",
    description: "Quickly turn communication from your favorite apps into to-dos, keeping all your discussions and tasks organized in one place.",
    image: "/images/email-todos.webp",
    imageAlt: "Email to tasks workflow demonstration",
    reverse: false,
  },
  {
    icon: MessageSquare,
    title: "Message App Sorcery",
    description: "Need to follow up on a message from Slack or Microsoft Teams? Send it directly to your board! Your favorite app interface lets you save messages that appear in your Inbox with AI-generated summaries and links.",
    image: "/images/slackteams-to-inbox.webp",
    imageAlt: "Slack and Teams to inbox workflow",
    reverse: true,
  },
];

// How It Works Section
export const howItWorksSteps = [
  {
    iconPath: "/icons/kanban-svgrepo-com.svg",
    title: "Create Your Board",
    description: "Start with a blank canvas or choose from templates",
  },
  {
    iconPath: "/icons/task-collection-svgrepo-com.svg",
    title: "Add Tasks",
    description: "Drag, drop, and organize your workflow visually",
  },
  {
    iconPath: "/icons/in-progress-svgrepo-com.svg",
    title: "Track Progress",
    description: "Watch your tasks move from idea to completion",
  },
  {
    iconPath: "/icons/collaboration-team-svgrepo-com.svg",
    title: "Collaborate",
    description: "Share boards and work together in real-time",
  },
];

// Core Features Section
export const coreFeatures = [
  {
    title: "Drag & Drop Boards",
    description: "Organize tasks visually with intuitive drag and drop. No friction, just flow.",
    image: "/icons/Project_management.png",
  },
  {
    title: "Real-Time Updates",
    description: "See changes instantly. No refresh needed. Everyone stays in sync automatically.",
    image: "/icons/lightning-svgrepo-com.svg",
  },
  {
    title: "Keyboard Shortcuts",
    description: "Power users move fast. Every action is accessible without touching the mouse.",
    image: "/icons/keyboard-svgrepo-com.svg",
  },
  {
    title: "Clean Dark Mode",
    description: "Designed dark-first. Easy on the eyes during long work sessions.",
    image: "/icons/kanban-svgrepo-com.svg",
  },
  {
    title: "Seamless Collaboration",
    description: "Work together without friction. Real-time presence and instant updates.",
    image: "/icons/Integration.png",
  },
  {
    title: "Performance & Speed",
    description: "Built for speed. Optimized to handle thousands of tasks without lag.",
    image: "/icons/settings.png",
  },
];

// Why Different Section
export const whyDifferentValues = [
  {
    icon: Zap,
    title: "Speed First",
    description: "Every interaction is instant. No loading spinners, no delays.",
  },
  {
    icon: Focus,
    title: "Clarity Over Clutter",
    description: "Only what matters. We removed everything that gets in your way.",
  },
  {
    icon: X,
    title: "No Feature Bloat",
    description: "Built to solve one problem exceptionally well, not everything poorly.",
  },
];

// Testimonials Section
export const testimonials = [
  {
    quote: "Axon is great for simplifying complex processes. As a manager, I can chunk processes down into bite-sized pieces for my team and then delegate that out, but still keep a bird's-eye view.",
    author: "Sarah Mitchell",
    role: "Product Manager",
    company: "TechFlow",
    stat: "75% of organizations report that Axon delivers value to their business within 30 days.",
  },
  {
    quote: "Whether someone is in the office, working from home, or working on-site with a client, everyone can share context and information through Axon.",
    author: "Marcus Chen",
    role: "Engineering Lead",
    company: "DataWorks",
    stat: "81% of customers chose Axon for its ease of use.",
  },
  {
    quote: "We used Axon to provide clarity on steps, requirements, and procedures. This was exceptional when communicating with teams that had deep cultural and language differences.",
    author: "Jennifer Kowalski",
    role: "Operations Director",
    company: "GlobalTech",
    stat: "74% of customers say Axon has improved communication with their co-workers and teams.",
  },
];

// Company Logos
export const companyLogos = [
  { name: "Stripe", icon: SiStripe },
  { name: "Notion", icon: SiNotion },
  { name: "Slack", icon: SiSlack },
  { name: "Zoom", icon: SiZoom },
  { name: "Figma", icon: SiFigma },
];
export const footerLinks = {
  product: {
    title: "Product",
    links: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Updates", href: "/updates" },
      { name: "Beta", href: "/beta" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Contact", href: "/contact" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
  },
};

// Social Media Links
export const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Github", icon: Github, href: "https://github.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Email", icon: Mail, href: "mailto:hello@axon.com" },
];
