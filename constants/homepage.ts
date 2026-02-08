import { Mail, MessageSquare, Github, Twitter, Linkedin, X, Focus, Zap, Users, CheckCircle2, Kanban, Calendar, BarChart3, Bell, Lock, Layers, Users2, Rocket, Code2, Briefcase, GraduationCap, Building2, BookOpen, FileText, Video, Lightbulb, HelpCircle } from "lucide-react";
import { SiStripe, SiNotion, SiSlack, SiZoom, SiFigma } from "react-icons/si";
import type { LucideIcon } from "lucide-react";

// Social Proof Stats
export const socialProofStats = [
  {
    icon: Users,
    value: "50K+",
    label: "Active Users",
  },
  {
    icon: CheckCircle2,
    value: "2M+",
    label: "Tasks Completed",
  },
  {
    icon: Zap,
    value: "100K+",
    label: "Boards Created",
  },
];

// Social Proof Testimonials (shorter quotes for the social proof section)
export const socialProofTestimonials = [
  {
    quote: "Finally, a productivity tool that doesn't get in the way.",
    author: "Sarah Chen",
    role: "Product Manager",
  },
  {
    quote: "Our team's efficiency increased by 40% in the first month.",
    author: "Marcus Rivera",
    role: "Engineering Lead",
  },
];

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

// Help Page Data
export const keyboardShortcuts = [
  { keys: ["Cmd/Ctrl", "K"], description: "Open global search" },
  { keys: ["Cmd/Ctrl", "N"], description: "Create new card" },
  { keys: ["Escape"], description: "Close modal" },
  { keys: ["Arrow Up", "Arrow Down"], description: "Navigate search results" },
  { keys: ["Enter"], description: "Select item" },
];

export const faqItems = [
  {
    question: "How do I create a new board?",
    answer: "Navigate to a workspace and click the 'New Board' button, or use the Create menu in the navigation bar.",
  },
  {
    question: "How do I invite team members?",
    answer: "Go to Workspace Settings and use the Members tab to search and add users to your workspace.",
  },
  {
    question: "Can I move cards between lists?",
    answer: "Yes! Simply drag and drop cards between lists to move them. You can also drag to reorder within the same list.",
  },
  {
    question: "How do I set a due date?",
    answer: "Click on a card to open the card modal, then use the Due Date section to set or change the due date.",
  },
];

export const appVersion = "1.0.0";

// =====================================================
// Features Page Constants
// =====================================================

export interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    highlights: string[];
}

export const featuresPageData = {
    features: [
        {
            icon: Kanban,
            title: "Intuitive Kanban Boards",
            description:
                "Drag-and-drop cards across customizable lists. Visualize your workflow and move tasks through stages effortlessly.",
            highlights: ["Unlimited lists", "Card templates", "Custom backgrounds"],
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description:
                "Invite team members, assign tasks, and work together in real-time. Everyone stays in sync automatically.",
            highlights: ["Real-time updates", "Member roles", "@mentions"],
        },
        {
            icon: Calendar,
            title: "Due Dates & Calendar",
            description:
                "Never miss a deadline. Set due dates, get reminders, and view all tasks in a beautiful calendar view.",
            highlights: ["Calendar view", "Due date reminders", "Overdue tracking"],
        },
        {
            icon: BarChart3,
            title: "Analytics Dashboard",
            description:
                "Get insights into your productivity. Track completed tasks, team performance, and project progress.",
            highlights: ["Task metrics", "Team stats", "Progress tracking"],
        },
        {
            icon: Bell,
            title: "Smart Notifications",
            description:
                "Stay informed with intelligent notifications. Get updates on assignments, comments, and approaching deadlines.",
            highlights: ["In-app alerts", "Email digests", "Custom preferences"],
        },
        {
            icon: Lock,
            title: "Secure & Private",
            description:
                "Your data is encrypted and secure. Control who can access your workspaces with granular permissions.",
            highlights: ["End-to-end encryption", "Role-based access", "SSO support"],
        },
    ] as Feature[],
    additionalFeatures: [
        { title: "Labels & Tags", description: "Categorize cards with color-coded labels" },
        { title: "Checklists", description: "Break tasks into actionable subtasks" },
        { title: "File Attachments", description: "Attach documents, images, and files" },
        { title: "Comments & Activity", description: "Discuss tasks and track all changes" },
        { title: "Search & Filter", description: "Find any card instantly across boards" },
        { title: "Mobile Friendly", description: "Access your boards from any device" },
    ],
};

// =====================================================
// Solutions Page Constants
// =====================================================

export interface Solution {
    id: string;
    icon: LucideIcon;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    benefits: string[];
    cta: string;
}

export const solutionsPageData = {
    solutions: [
        {
            id: "teams",
            icon: Users2,
            title: "For Teams",
            subtitle: "Collaborate seamlessly",
            description:
                "Keep your entire team aligned with shared boards, real-time updates, and clear task ownership. No more lost emails or missed updates.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
            benefits: [
                "Shared workspaces for all team members",
                "Real-time collaboration and updates",
                "Clear task assignments and ownership",
                "Activity feeds and notifications",
                "Comments and @mentions",
            ],
            cta: "Perfect for teams of any size",
        },
        {
            id: "startups",
            icon: Rocket,
            title: "For Startups",
            subtitle: "Move fast, stay organized",
            description:
                "Ship faster without sacrificing organization. Axon scales with you from MVP to enterprise, keeping your team focused on what matters.",
            image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=500&fit=crop",
            benefits: [
                "Quick setup, zero learning curve",
                "Flexible workflows that adapt to your process",
                "Track sprints and product roadmaps",
                "Free tier perfect for early-stage",
                "Scales as you grow",
            ],
            cta: "Built for speed and agility",
        },
        {
            id: "developers",
            icon: Code2,
            title: "For Developers",
            subtitle: "Ship better software",
            description:
                "Track bugs, manage sprints, and coordinate releases. Axon integrates with your development workflow to keep code and tasks in sync.",
            image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop",
            benefits: [
                "Bug and issue tracking",
                "Sprint planning boards",
                "Release management",
                "Code-friendly markdown support",
                "API access for integrations",
            ],
            cta: "From backlog to deployment",
        },
        {
            id: "agencies",
            icon: Briefcase,
            title: "For Agencies",
            subtitle: "Manage multiple clients",
            description:
                "Juggle multiple projects and clients without breaking a sweat. Separate workspaces keep everything organized and confidential.",
            image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop",
            benefits: [
                "Separate workspaces per client",
                "Client-safe sharing options",
                "Track billable tasks and time",
                "Template boards for quick setup",
                "White-label options available",
            ],
            cta: "Scale your client work",
        },
        {
            id: "education",
            icon: GraduationCap,
            title: "For Education",
            subtitle: "Organize learning",
            description:
                "Whether you're a student managing coursework or a teacher organizing curriculum, Axon helps keep educational goals on track.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop",
            benefits: [
                "Track assignments and deadlines",
                "Group project collaboration",
                "Course material organization",
                "Progress tracking for students",
                "Free for educational use",
            ],
            cta: "Learn and teach better",
        },
        {
            id: "enterprise",
            icon: Building2,
            title: "For Enterprise",
            subtitle: "Scale with confidence",
            description:
                "Enterprise-grade security, compliance, and control. Manage thousands of users across departments with centralized administration.",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
            benefits: [
                "SSO and advanced security",
                "Compliance and audit logs",
                "Centralized user management",
                "Custom integrations",
                "Dedicated support",
            ],
            cta: "Enterprise-ready from day one",
        },
    ] as Solution[],
};

// =====================================================
// Resources Page Constants
// =====================================================

export interface ResourceCategory {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    articles: { title: string; time: string }[];
}

export interface ResourceFAQ {
    question: string;
    answer: string;
}

export interface QuickLink {
    title: string;
    description: string;
    href: string;
    external: boolean;
}

export const resourcesPageData = {
    categories: [
        {
            id: "getting-started",
            icon: Lightbulb,
            title: "Getting Started",
            description: "New to Axon? Start here.",
            articles: [
                { title: "Creating your first workspace", time: "3 min read" },
                { title: "Understanding boards and lists", time: "4 min read" },
                { title: "Adding and organizing cards", time: "3 min read" },
                { title: "Inviting team members", time: "2 min read" },
                { title: "Setting up your profile", time: "2 min read" },
            ],
        },
        {
            id: "guides",
            icon: BookOpen,
            title: "User Guides",
            description: "Deep dives into features.",
            articles: [
                { title: "Mastering labels and filters", time: "5 min read" },
                { title: "Using checklists effectively", time: "4 min read" },
                { title: "Due dates and calendar view", time: "4 min read" },
                { title: "File attachments and storage", time: "3 min read" },
                { title: "Keyboard shortcuts", time: "3 min read" },
            ],
        },
        {
            id: "tutorials",
            icon: Video,
            title: "Video Tutorials",
            description: "Learn by watching.",
            articles: [
                { title: "Axon in 5 minutes", time: "5 min video" },
                { title: "Advanced board customization", time: "8 min video" },
                { title: "Team collaboration workflows", time: "10 min video" },
                { title: "Productivity tips and tricks", time: "7 min video" },
                { title: "Mobile app walkthrough", time: "6 min video" },
            ],
        },
        {
            id: "api",
            icon: FileText,
            title: "API Documentation",
            description: "Build integrations.",
            articles: [
                { title: "API overview and authentication", time: "5 min read" },
                { title: "Working with boards endpoint", time: "6 min read" },
                { title: "Cards and lists API", time: "7 min read" },
                { title: "Webhooks and events", time: "5 min read" },
                { title: "Rate limits and best practices", time: "4 min read" },
            ],
        },
    ] as ResourceCategory[],
    faqs: [
        {
            question: "How do I reset my password?",
            answer: "Click on 'Forgot password' on the login page, enter your email, and follow the instructions sent to your inbox.",
        },
        {
            question: "Can I use Axon offline?",
            answer: "Axon requires an internet connection to sync your data. However, you can view cached boards while offline and changes will sync when you're back online.",
        },
        {
            question: "How do I export my data?",
            answer: "Go to Settings > Data > Export. You can download all your boards, cards, and attachments in JSON or CSV format.",
        },
        {
            question: "Is there a limit on team members?",
            answer: "Free plans allow up to 5 team members per workspace. Pro and Enterprise plans have unlimited team members.",
        },
        {
            question: "How do I delete my account?",
            answer: "Go to Settings > Account > Delete Account. Note that this action is irreversible and will delete all your data.",
        },
    ] as ResourceFAQ[],
    quickLinks: [
        {
            title: "System Status",
            description: "Check if Axon services are running normally",
            href: "#",
            external: true,
        },
        {
            title: "Release Notes",
            description: "See what's new in the latest updates",
            href: "#",
            external: false,
        },
        {
            title: "Community Forum",
            description: "Connect with other Axon users",
            href: "#",
            external: true,
        },
        {
            title: "Contact Support",
            description: "Get help from our support team",
            href: "#",
            external: false,
        },
    ] as QuickLink[],
};
