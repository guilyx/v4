/**
 * Single source of truth for everything rendered on the site.
 * Edit this file to update content — no component changes needed.
 */

export const site = {
  name: "Erwin Lejeune",
  handle: "guilyx",
  role: "Lead Robotics Software Engineer",
  tagline: "I make robot swarms think for themselves.",
  description:
    "Erwin Lejeune — Lead Robotics Software Engineer in Abu Dhabi. Robotics autonomy, agentic AI, and blockchain platforms. C++, Python, Go.",
  url: "https://v4.elejeune.me",
  email: "erwin.lejeune15@gmail.com",
  location: "Abu Dhabi, UAE",
  resume: "https://github.com/guilyx/resume",
  socials: [
    { label: "GitHub", url: "https://github.com/guilyx", icon: "github" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/erwinlejeune-lkn",
      icon: "linkedin",
    },
    {
      label: "ResearchGate",
      url: "https://www.researchgate.net/profile/Erwin-Lejeune",
      icon: "researchgate",
    },
    {
      label: "Spotify",
      url: "https://open.spotify.com/user/11147618695",
      icon: "spotify",
    },
  ],
} as const;

export const nav = [
  { label: "background", href: "/#about" },
  { label: "trajectory", href: "/#experience" },
  { label: "builds", href: "/#projects" },
  { label: "contact", href: "/#contact" },
  { label: "blog", href: "/blog" },
  { label: "photos", href: "/photos" },
] as const;

export const about = {
  paragraphs: [
    `Hello! I'm Erwin, a robotics software engineer based in Abu Dhabi with a
     soft spot for systems that move — and think — on their own. My path started
     in Nantes, France with electronics and embedded systems, detoured through
     backend engineering, and landed where I always wanted to be: teaching
     fleets of robots to make decisions together.`,
    `Today I lead autonomy teams at [SIRB.AI](https://sirb.ai/) and the
     [Technology Innovation Institute](https://www.tii.ae/), where nine
     engineers and I build decentralized autonomy frameworks for heterogeneous
     drone swarms — navigation, perception, orchestration, and the
     infrastructure that keeps it all flying. On the side, I build agentic AI
     and blockchain tooling at [Unchained Labs](https://unchainlabs.xyz/).`,
    `I care about software that survives contact with the real world:
     real-time constraints, modular architectures, and behavior that stays
     predictable when the environment isn't. When I'm not shipping autonomy
     stacks I'm playing basketball, watching films, or chasing ranked ladders.`,
  ],
  technologies: [
    "C++ / C",
    "Python",
    "Go",
    "Rust",
    "ROS 2",
    "PX4 / MAVLink",
    "Motion Planning",
    "Sensor Fusion",
    "Agentic AI / MCP",
    "TypeScript / React",
    "Solidity / EVM",
    "Docker / CI",
  ],
} as const;

export interface Job {
  company: string;
  shortName: string;
  url: string;
  role: string;
  period: string;
  location?: string;
  /** Decimal years, used to place the bar on the trajectory timeline. */
  start: number;
  /** `null` means still running — the bar extends to the present marker. */
  end: number | null;
  bullets: string[];
}

/** Left edge of the trajectory axis. */
export const TIMELINE_START = 2018;

export const experience: Job[] = [
  {
    company: "SIRB.AI",
    shortName: "SIRB.AI",
    url: "https://sirb.ai/",
    role: "Lead Robotics Engineer",
    period: "2026 — Present",
    location: "Abu Dhabi, UAE",
    start: 2026,
    end: null,
    bullets: [
      "Lead the autonomy team at a defense-technology startup spun off from the Technology Innovation Institute.",
      "Agentic generation of missions for surveillance, monitoring, and tail chasing.",
      "Architecture and algorithm development for decentralized swarm control and multi-agent planning.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Lead Robotics Engineer",
    period: "2022 — Present",
    location: "Abu Dhabi, UAE",
    start: 2022,
    end: null,
    bullets: [
      "Lead a robotics software team of 9 engineers developing decentralized autonomy frameworks for heterogeneous drone swarms — spanning navigation, perception, orchestration, DevOps/RobotOps, and integration onto real-world platforms.",
      "Drove initiatives on modular software architecture, lifecycle management, and behavior orchestration for swarm autonomy.",
      "Promoted twice: Engineer → Senior Engineer (2023) → Lead Engineer (2026).",
    ],
  },
  {
    company: "Unchained Labs",
    shortName: "Unchained",
    url: "https://unchainlabs.xyz/",
    role: "Principal Solutions Engineer",
    period: "2024 — Present",
    location: "Remote",
    start: 2024,
    end: null,
    bullets: [
      "Built agentic AI tools for automated documentation PRs (Doxmosis), agentic orchestration (Kymatics), contribution analysis, real-estate analysis, and UAE defense data analysis.",
      "Developed production backend services for LoopFi's blockchain data analysis on EVM chains.",
    ],
  },
  {
    company: "Coalescent Mobile Robotics",
    shortName: "Coalescent",
    url: "https://cm-robotics.com/",
    role: "Founding Robotics Engineer",
    period: "2021 — 2022",
    location: "Odense, Denmark",
    start: 2021,
    end: 2022.9,
    bullets: [
      "Founding core technical team that delivered the first working in-store robot system, supporting company milestones across pre-seed and seed rounds.",
      "Led development of the navigation stack — path planning, motion control, localization — and contributed to perception (detection, filtering, tracking).",
    ],
  },
  {
    company: "Ecole Centrale de Nantes",
    shortName: "ECN",
    url: "https://www.ec-nantes.fr/",
    role: "Robotics Researcher",
    period: "2020 — 2021",
    location: "Nantes, France",
    start: 2020.2,
    end: 2021.2,
    bullets: [
      "Led 4 research projects: multi-agent pathfinding, AI planning (PDDL), real-time ROS control on Xenomai/XDDP, and ROS 2 latency benchmarking.",
      "Published research on real-time jitter measurements under ROS 2 and a survey of multi-agent pathfinding solutions.",
    ],
  },
  {
    company: "Hiventive",
    shortName: "Hiventive",
    url: "https://www.hiventive.com/en/",
    role: "Software Engineer",
    period: "2018 — 2021",
    location: "Bordeaux, France & Remote",
    start: 2018.7,
    end: 2021.2,
    bullets: [
      "Built core backend services in Go with PostgreSQL and Docker for a computer-aided production engineering platform.",
      "Developed a SystemC/TLM virtual prototype of an STM32 microcontroller for SoC emulation — TIM, I2C, CAN, GPIO, USART peripherals with QEMU integration.",
    ],
  },
  {
    company: "Ingeniarius",
    shortName: "Ingeniarius",
    url: "https://ingeniarius.pt/",
    role: "Robotics Assistant",
    period: "2019",
    location: "Coimbra, Portugal",
    start: 2019.5,
    end: 2019.75,
    bullets: [
      "Built full autonomy stacks from scratch with ROS and embedded systems.",
      "Won both the mapped and unmapped maze-solving competitions.",
    ],
  },
];

export interface Project {
  title: string;
  blurb: string;
  tech: string[];
  github?: string;
  external?: string;
  externalLabel?: string;
  glyph?: string;
}

/** Big spotlight cards. */
export const featured: Project[] = [
  {
    title: "Bird-Inspired Flocking",
    blurb:
      "Decentralized, acceleration-based flocking for drone swarms, inspired by how starlings murmurate. Each agent decides from local observations only — no leader, no central brain — yet the flock moves as one. Published at IEEE/RSJ IROS 2024, and the reason the hero of this site is a boids simulation.",
    tech: ["C++", "ROS 2", "Swarm Autonomy", "IROS 2024"],
    external:
      "https://www.researchgate.net/publication/387418977_Decentralized_Acceleration-Based_Bird-Inspired_Flocking",
    externalLabel: "Read the paper",
    glyph: "flock",
  },
  {
    title: "t212-mcp",
    blurb:
      "A Model Context Protocol server that gives AI assistants read-only access to a Trading 212 investing account — balances, positions, dividends, pies, and the instrument catalogue. Strictly no trading: the HTTP client has no code path that issues anything but a GET.",
    tech: ["TypeScript", "Node.js", "MCP", "Finance"],
    github: "https://github.com/guilyx/t212-mcp",
    glyph: "chart",
  },
  {
    title: "Doxmosis",
    blurb:
      "An agentic AI tool that keeps documentation alive: it watches your codebase, detects drift, and opens documentation pull requests on its own. Built at Unchained Labs alongside Kymatics, an agentic orchestration platform.",
    tech: ["Agentic AI", "LLMs", "GitHub Apps", "TypeScript"],
    external: "https://doxmosis.vercel.app/",
    externalLabel: "Visit doxmosis.vercel.app",
    glyph: "docs",
  },
];

/** Smaller grid cards. */
export const projects: Project[] = [
  {
    title: "Kymatics",
    blurb:
      "Agentic orchestration platform — coordinate fleets of AI agents the way you'd orchestrate services.",
    tech: ["Agentic AI", "TypeScript"],
    external: "https://kymatics.vercel.app/",
  },
  {
    title: "ROS 2 Real-Time Benchmarks",
    blurb:
      "Real-time jitter measurements under ROS 2 on the inverted pendulum case — tooling and a published preprint.",
    tech: ["ROS 2", "Xenomai", "C++"],
    github: "https://github.com/mastererts/ros2_realtime_statistics",
    external:
      "https://www.researchgate.net/publication/350353690_Real-time_Jitter_Measurements_under_ROS2_the_Inverted_Pendulum_case",
  },
  {
    title: "Multi-Agent Pathfinding Survey",
    blurb:
      "A survey of the multi-agent pathfinding landscape: taxonomy, solvers, and open problems.",
    tech: ["Research", "Path Planning"],
    external:
      "https://www.researchgate.net/publication/348716625_Survey_of_the_Multi-Agent_Pathfinding_Solutions",
  },
  {
    title: "artin-pathfinding",
    blurb:
      "A C++17 pathfinding library — A*, Dijkstra, DFS/BFS and friends — with a clean interface for grid worlds.",
    tech: ["C++17", "Algorithms"],
    github: "https://github.com/master-coro/artin-pathfinding",
  },
  {
    title: "autonomous-uav",
    blurb:
      "2D/3D pathfinding, a cascaded controller, and an extended Kalman filter for autonomous flying vehicles.",
    tech: ["Python", "Control", "Estimation"],
    github: "https://github.com/guilyx/autonomous-uav",
  },
  {
    title: "awesome-github-pages-portfolios",
    blurb:
      "A curated list of awesome GitHub Pages portfolio templates — where the first version of this site began.",
    tech: ["Curated List", "Community"],
    github: "https://github.com/guilyx/awesome-github-pages-portfolios",
  },
];

/**
 * Hero spec block — the key/value register comes from Erwin's own GitHub
 * profile README, which introduces him as a YAML document.
 */
export const spec = [
  { key: "role", value: "lead robotics engineer" },
  { key: "based", value: "abu dhabi, uae" },
  { key: "building", value: "decentralized swarm autonomy" },
  { key: "also", value: "agentic ai, blockchain backends" },
] as const;

export const contact = {
  title: "Open Channel",
  body: `I'm not actively looking, but the inbox stays open — a question about
   swarm autonomy, an open-source idea, or just to say hi. I'll get back to you.`,
} as const;
