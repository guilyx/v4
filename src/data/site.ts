/**
 * Single source of truth for everything rendered on the site.
 * Edit this file to update content — no component changes needed.
 */

export const site = {
  name: "Erwin Lejeune",
  handle: "guilyx",
  role: "Team Lead — Robotics Software",
  tagline: "Building the layer that decides what happens next.",
  description:
    "Erwin Lejeune — Team Lead, Robotics Software, in Abu Dhabi. Hands-on ROS 2 developer: behavior, task and path planning, sensor fusion, multi-agent planning and agentic AI orchestration. C++, Python, Go.",
  url: "https://v4.elejeune.me",
  email: "erwin.lejeune15@gmail.com",
  location: "Abu Dhabi, UAE",
  resume: "https://resume.elejeune.me",
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
  { label: "experiences", href: "/#experience" },
  { label: "systems", href: "/#systems" },
  { label: "projects", href: "/#projects" },
  { label: "open source", href: "/#open-source" },
  { label: "contact", href: "/#contact" },
  { label: "blog", href: "/blog" },
  { label: "photos", href: "/photos" },
] as const;

export const about = {
  paragraphs: [
    `Hello! I'm Erwin — a robotics software team lead who still writes the
     code. I've spent 8+ years taking autonomy from research to real-world
     deployment: behavior, task and path planning, sensor fusion, motion
     control, and the system design that keeps robots reliable outside the
     lab. ROS 2 is home.`,
    `Today I'm Head of Robotics at [SIRB.AI](https://sirb.ai/), on the founding
     team that took its swarm autonomy stack from prototype to public launch
     at UMEX 2026. Until then I led a team of 9 robotics engineers at the
     [Technology Innovation Institute](https://www.tii.ae/) — autonomy,
     infrastructure and platform integration for drone fleets. I've been
     leading teams for 2+ years, from product roadmaps through PI planning to
     sprints, while staying hands-on in the stack. Before drones, I built the
     navigation stack of a robot working the aisles of a supermarket in
     Odense, Denmark, at [Coalescent Mobile Robotics](https://cm-robotics.com/).`,
    `On the side I run [Unchained Labs](https://unchainedlabs.dev/), building
     local-first agentic systems for companies, and
     [Clanker Labs](https://clanker-labs.github.io/clanker-labs-public/), the
     same idea pointed at my own home: one self-hosted stack, with an agent
     running it. I bring both back to robotics: agentic tooling that turns
     robot data into diagnostics, and self-healing autonomy that detects and
     recovers from failures in the field. When I'm not shipping autonomy
     stacks I'm playing basketball, watching films, or chasing ranked
     ladders.`,
  ],
  technologies: [
    "ROS 2",
    "C++ / Python / Go / Rust",
    "Behavior Trees",
    "Task & Path Planning",
    "Multi-Agent Planning",
    "PDDL",
    "Sensor Fusion",
    "Motion Control",
    "Agent Orchestration",
    "MCP / RAG",
    "Docker / CI",
    "Scrum / PI Planning",
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
    role: "Head of Robotics",
    period: "Feb 2026 — Present",
    location: "Abu Dhabi, UAE",
    start: 2026.1,
    end: null,
    bullets: [
      "Joined as founding team: designed the robotics software architecture and set the autonomy roadmap.",
      "Built a self-healing autonomy layer: swarm-wide fault and state recording, agents that detect and recover from failures, and ML-based mission scoring before launch.",
      "Took the autonomy stack from prototype to public launch at UMEX 2026, unveiled as the Middle East's first AI-powered swarm platform.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Team Lead — Robotics Software",
    period: "2024 — 2026",
    location: "Abu Dhabi, UAE",
    start: 2024,
    end: 2026.1,
    bullets: [
      "Grew and led a Robotics Software team of 9 engineers across autonomy (navigation, perception, orchestration), infrastructure (DevOps, RobotOps) and platform integration.",
      "Overhauled the swarm autonomy architecture, cutting onboard CPU usage by 74% and network bandwidth by 52%.",
      "Scaled the framework with tooling for reliable, repeatable missions, and expanded the team's scope to path planning and path tracking.",
      "Joint program with Caltech on their multi-modal robot M4 and their humanoid: worked on outdoor planning and tracking for M4's flying and rolling modalities.",
      "Led autonomy demos to companies in Europe and the UAE, resulting in USD 10M+ in contracts.",
      "Started building AI tooling for the team to raise engineering efficiency and productivity.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Senior Engineer — Robotics Software",
    period: "2022 — 2024",
    location: "Abu Dhabi, UAE",
    start: 2022,
    end: 2024,
    bullets: [
      "Led the research & development of components for multi-robot behavior orchestration, collaboration and control.",
      "Designed new swarm behaviors, including decentralized bird-inspired flocking published at IEEE/RSJ IROS 2024.",
      "Ran the live demos to partners; the project led to USD 3M in contracts with other companies in the UAE ecosystem.",
    ],
  },
  {
    company: "Unchained Labs",
    shortName: "Unchained",
    url: "https://unchainedlabs.dev/",
    role: "Founder",
    period: "2024 — Present",
    location: "Remote",
    start: 2024,
    end: null,
    bullets: [
      "Build AI brains for companies: local-first agentic systems that run on their own models, data and infrastructure.",
      "Design graph-based agent orchestration (Kymatics) and open-source the tooling to run it reliably.",
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
      "Led development of the navigation stack — path planning, motion control and localization — and contributed to perception: detection, filtering, tracking.",
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
    period: "2020 — 2021",
    location: "Remote",
    start: 2020.5,
    end: 2021.1,
    bullets: [
      "Built core backend services in Go with PostgreSQL and Docker for a computer-aided production engineering platform.",
      "Developed an automated programming test manager for candidate evaluation.",
    ],
  },
  {
    company: "Hiventive",
    shortName: "Hiventive",
    url: "https://www.hiventive.com/en/",
    role: "Embedded Software Engineer",
    period: "2018 — 2019",
    location: "Bordeaux, France",
    start: 2018.7,
    end: 2019.5,
    bullets: [
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

/**
 * "Built for Companies" — systems from the day job, shown as conceptual
 * animations rather than code. Each `scene` names a canvas scene in
 * src/scripts/systems/. `**bold**` in points renders as <b>.
 */
export interface System {
  id: "bt" | "fmr" | "swarm";
  tab: string;
  headline: string;
  points: string[];
  note: string;
  caption: string;
}

export const systemsIntro = `Solutions I've engineered for companies, sketched
  conceptually: how each one works, not the code or the client behind it.`;

export const systems: System[] = [
  {
    id: "swarm",
    tab: "Swarm navigation & coverage",
    headline: "Plan, fly in formation, cover the zone, find the target.",
    points: [
      "**Plan around what the fleet must not touch.** Zones and every other source of the world are costmap layers; a global plan is routed through them before anything moves.",
      "**Fly in formation, links in view.** The flock holds its slots behind a virtual leader, a safety barrier underneath keeps every vehicle clear of the boundary, and link strength across the mesh is part of the picture.",
      "**Cover, then localize.** In the task zone the formation breaks into a Voronoi partition and each vehicle sweeps its own cell. When one gets a contact, the others take bearings and triangulate it.",
    ],
    note: "Change the vehicle, change a plugin: every motion algorithm became a tracker behind the same contract.",
    caption: "plan → formation transit → Voronoi coverage → triangulation",
  },
  {
    id: "bt",
    tab: "Behavior tree densification & scoring",
    headline: "Mission trees anyone can read, scored before they fly.",
    points: [
      "**Densify.** Control nodes become arrows, conditions become guards on those arrows, subtrees inline. A 16-node tree reads as six actions, and \"what happens if GoToZone fails?\" takes one arrow to answer.",
      "**Find the gaps.** Actions with no failure path, branches that can never run, loops with no exit — flagged before anyone flies the tree.",
      "**Score.** Every node logs every run. Point that history at a tree being authored and you get the weakest branch and a concrete fix, not one percentage for the whole flight.",
    ],
    note: "Operators get a plain-language view of the mission: what the robot is doing now, and what comes next. Engineers get the guards, the gap report and a graph diff on every change.",
    caption: "behavior tree → action graph → risk per branch",
  },
  {
    id: "fmr",
    tab: "Agentic fault management & recovery",
    headline: "One timeline for every fault, and an agent that proposes the repair.",
    points: [
      "**Components report; they don't recover themselves.** Lifecycle errors, failed transitions, tree outcomes and silent process deaths all land in one ordered event table.",
      "**One place decides.** Policies match patterns and actuate. Restarts go through the dependency graph, so dependents come back in the right order.",
      "**The agent reads windows, not events.** It tells a link flap from a dying node, suppresses the noise and proposes the repair. It never owns the actuator: the deterministic rules stay underneath.",
    ],
    note: "This is most of the distance between a demo and a product: autonomy that doesn't need a person on the link.",
    caption: "report → one timeline → read the window → repair",
  },
];

/**
 * Every project sits at one of three altitudes. The layer is real information —
 * it says how far from the metal the thing runs — so it's rendered, not just
 * used for sorting.
 */
export type Layer = "field" | "agent" | "machine";

export const layers: Record<Layer, string> = {
  field: "in the field",
  agent: "in the loop",
  machine: "on the metal",
};

export interface Project {
  title: string;
  blurb: string;
  tech: string[];
  /** Omitted for things that don't run anywhere, like a curated list. */
  layer?: Layer;
  github?: string;
  external?: string;
  externalLabel?: string;
  glyph?: string;
  /** The org it lives under (Clanker Labs, Unchained Labs…); omitted means personal. */
  org?: string;
  /** The card is the org itself, not one repo in it. */
  isOrg?: boolean;
  /** Local promo clip under public/media/, with a poster frame shown before playback. */
  video?: string;
  videoPoster?: string;
  /** Defaults to video/mp4. */
  videoType?: string;
  /** Set when there's no public link — closed source or internal. */
  closed?: boolean;
}

/** A row in the /archive table — everything, not just the highlights. */
export interface ArchiveEntry {
  year: number;
  title: string;
  /** Company or org it was built under; omitted means personal. */
  madeAt?: string;
  tech: string[];
  github?: string;
  external?: string;
}

/** The framing for the Featured Projects section: side projects only. */
export const projectsIntro = `Side projects, built on my own time and in the
  open: planning toolboxes, robotics tooling, and the two orgs where most of it
  lives now, Clanker Labs and Unchained Labs.`;

/**
 * Featured projects — the carousel. Every slide has a real demo clip recorded
 * from the thing actually running. Work done for an employer belongs in Built
 * for Companies, not here.
 */
export const featured: Project[] = [
  {
    title: "grip",
    blurb:
      "Pass the whiteboard defense before you ship. A git hook that quizzes you on your own diff before you commit or push, grades the answers against a hidden rubric, and blocks anything below your team's pass mark.",
    tech: ["Python", "Git Hooks", "LLM Grading"],
    layer: "agent",
    github: "https://github.com/guilyx/grip",
    external: "https://guilyx.github.io/grip/",
    externalLabel: "Read the docs",
    video: "/media/grip-promo.mp4",
    videoPoster: "/media/grip-poster.jpg",
  },
  {
    title: "PyMAPF",
    blurb:
      "Multi-agent planning on arbitrary graphs, not just grids: CBS, PIBT, LaCAM and MAPF-LNS, plus multi-agent RL. The solvers stream their search live, so you can watch conflicts get found and resolved.",
    tech: ["Python", "Multi-Agent Planning", "Graph Search"],
    layer: "field",
    org: "APLA-Toolbox",
    github: "https://github.com/APLA-Toolbox/pymapf",
    external: "https://apla-toolbox.github.io/pymapf/",
    externalLabel: "Open the playground",
    video: "/media/pymapf-promo.mp4",
    videoPoster: "/media/pymapf-poster.png",
  },
  {
    title: "PythonPDDL",
    blurb:
      "A dependency-free Python PDDL framework: a hand-written parser and grounder from STRIPS to durative actions, 14 planners, LM-cut and FF heuristics, and heuristics you can train on your own plans.",
    tech: ["Python", "PDDL", "Heuristic Search"],
    layer: "field",
    org: "APLA-Toolbox",
    github: "https://github.com/APLA-Toolbox/pythonpddl",
    external: "https://apla-toolbox.github.io/PythonPDDL/",
    externalLabel: "Open the workbench",
    video: "/media/jupyddl-promo.mp4",
    videoPoster: "/media/jupyddl-poster.png",
  },
  {
    title: "roue",
    blurb:
      "Drop a file, get the file you wanted. An offline file converter for the Linux desktop: Ctrl+Shift+right-click a file, pick a format on the wheel, and the result lands next to the original.",
    tech: ["Python", "GTK 4", "FFmpeg", "libvips"],
    layer: "machine",
    github: "https://github.com/guilyx/roue",
    external: "https://guilyx.github.io/roue/",
    externalLabel: "Visit the site",
    video: "/media/roue-promo.mp4",
    videoPoster: "/media/roue-poster.jpg",
  },
  {
    title: "rostree",
    blurb:
      "A ROS 2 dependency graph is a DAG, not a tree. rostree explores it from the command line, a TUI, or a self-contained HTML file that still opens on a robot with no route out.",
    tech: ["Python", "Graph Theory", "ROS 2", "TUI"],
    layer: "machine",
    github: "https://github.com/guilyx/rostree",
    external: "https://guilyx.github.io/rostree",
    video: "/media/rostree-promo.mp4",
    videoPoster: "/media/rostree-poster.png",
  },
  {
    title: "flybots",
    blurb:
      "Flight algorithms from scratch: multirotor, fixed-wing and VTOL physics written out in full, 40+ runnable simulations, and a gym for teaching a drone to fly itself.",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    layer: "field",
    github: "https://github.com/guilyx/flybots",
    external: "https://guilyx.github.io/flybots/",
    video: "/media/flybots-promo.mp4",
    videoPoster: "/media/flybots-poster.jpg",
  },
  {
    title: "Clanker Labs",
    blurb:
      "Self-host your home, let the agent run it. Notes, mail, media, passwords and money back on hardware you own, with an agent in front so keeping it running doesn't take a sysadmin.",
    tech: ["Ansible", "Docker", "LangGraph", "MCP"],
    layer: "machine",
    org: "Clanker Labs",
    isOrg: true,
    github: "https://github.com/Clanker-Labs",
    external: "https://clanker-labs.github.io/clanker-labs-public/",
    externalLabel: "Visit the site",
    video: "/media/clanker-labs-promo.mp4",
    videoPoster: "/media/clanker-labs-poster.png",
  },
  {
    title: "Unchained Labs",
    blurb:
      "AI brains for companies: local-first agentic systems that run on their own models, data and infrastructure. Shown here, Kymatics turns a spoken intent into a queue of build jobs.",
    tech: ["Rust", "Python", "Agentic AI", "Voice / STT"],
    layer: "agent",
    org: "Unchained Labs",
    isOrg: true,
    github: "https://github.com/Unchained-Labs",
    external: "https://unchainedlabs.dev/",
    externalLabel: "Visit the site",
    video: "/media/kymatics-promo.mp4",
    videoPoster: "/media/kymatics-poster.png",
  },
];

/**
 * Open Source — its own section: why it matters, where it went upstream,
 * and the repos of my own. `prs` links are GitHub searches for my pull
 * requests in that repo, so they stay current without a list to maintain.
 */
export const openSource = {
  since: 2018,
  paragraphs: [
    `I made my first open-source contribution in 2018 and haven't stopped
     since. Robotics runs on shared code: ROS and the thousands of packages
     around it exist because people chose to publish their work. Contributing
     back is how I pay that forward, and nothing has taught me more about
     writing code that strangers can read, review and build on.`,
    `Upstream, that's meant projects like navigation2, the ROS 2 navigation
     stack, and tf2, the transform library nearly every ROS robot leans on.
     The rest is my own: tools for problems I kept running into, published so
     the next person doesn't have to start from zero.`,
  ],
  upstream: [
    {
      name: "navigation2",
      what: "the ROS 2 navigation stack",
      repo: "https://github.com/ros-navigation/navigation2",
      prs: "https://github.com/ros-navigation/navigation2/pulls?q=is%3Apr+author%3Aguilyx",
    },
    {
      name: "tf2",
      what: "ROS 2 coordinate transforms",
      repo: "https://github.com/ros2/geometry2",
      prs: "https://github.com/ros2/geometry2/pulls?q=is%3Apr+author%3Aguilyx",
    },
  ],
} as const;

/**
 * My own open source — the grid in the Open Source section. The archive has
 * everything else.
 */
export const projects: Project[] = [
  {
    title: "awesome-daily-minigames",
    blurb:
      "281 games that give you one puzzle a day, Wordle and everything since, across 18 categories, with a searchable site generated from one YAML file.",
    tech: ["Awesome List", "YAML", "Node.js"],
    github: "https://github.com/guilyx/awesome-daily-minigames",
    external: "https://guilyx.github.io/awesome-daily-minigames/",
  },
  {
    title: "awesome-github-pages-portfolios",
    blurb: "A curated list of portfolio templates and personal sites hosted on GitHub Pages, each with its repo and live demo.",
    tech: ["Awesome List", "GitHub Pages"],
    github: "https://github.com/guilyx/awesome-github-pages-portfolios",
  },
  {
    title: "jarvis_ros2",
    blurb:
      "Event, fault and recovery management for ROS 2 robots: a real fault lifecycle, rule-based recovery behind safety gates, an agent that explains incidents with evidence, and a live dashboard.",
    tech: ["ROS 2", "Python", "React", "LiteLLM"],
    layer: "field",
    github: "https://github.com/guilyx/jarvis_ros2",
  },
  {
    title: "BTView",
    blurb:
      "A visual graph editor for BehaviorTree.CPP trees inside VS Code and Cursor: bidirectional XML sync, tidy layout, and a validation panel that jumps to the offending node.",
    tech: ["TypeScript", "Behavior Trees", "VS Code"],
    layer: "agent",
    github: "https://github.com/guilyx/btview-vscode-plugin",
    external: "https://marketplace.visualstudio.com/items?itemName=rangonomics.btview",
  },
];

/**
 * The full record, newest first. Years are repo creation dates (or publication
 * year for the papers), not the last time something was touched.
 */
export const archive: ArchiveEntry[] = [
  {
    year: 2026,
    title: "roue",
    tech: ["Python", "GTK 4", "FFmpeg", "libvips"],
    github: "https://github.com/guilyx/roue",
    external: "https://guilyx.github.io/roue/",
  },
  {
    year: 2026,
    title: "jarvis_ros2",
    tech: ["ROS 2", "Python", "React", "LiteLLM"],
    github: "https://github.com/guilyx/jarvis_ros2",
  },
  {
    year: 2026,
    title: "awesome-daily-minigames",
    tech: ["Awesome List", "YAML", "Node.js"],
    github: "https://github.com/guilyx/awesome-daily-minigames",
    external: "https://guilyx.github.io/awesome-daily-minigames/",
  },
  {
    year: 2026,
    title: "grip",
    tech: ["Python", "Git Hooks", "LLM Grading"],
    github: "https://github.com/guilyx/grip",
    external: "https://guilyx.github.io/grip/",
  },
  {
    year: 2026,
    title: "Clanker Labs",
    madeAt: "Clanker Labs",
    tech: ["Ansible", "Docker", "LangGraph", "MCP"],
    github: "https://github.com/Clanker-Labs",
    external: "https://clanker-labs.github.io/clanker-labs-public/",
  },
  {
    year: 2026,
    title: "wallet",
    madeAt: "Clanker Labs",
    tech: ["Next.js", "SQLite", "MCP", "Passkeys"],
    github: "https://github.com/Clanker-Labs/wallet",
    external: "https://clanker-labs.github.io/wallet/",
  },
  {
    year: 2026,
    title: "tradesights",
    madeAt: "Clanker Labs",
    tech: ["Python", "Options Data", "Data Viz"],
    github: "https://github.com/Clanker-Labs/tradesights",
  },
  {
    year: 2026,
    title: "selfmail",
    madeAt: "Clanker Labs",
    tech: ["Rust", "axum", "SQLite"],
    github: "https://github.com/Clanker-Labs/selfmail",
  },
  {
    year: 2026,
    title: "lebenchmark",
    madeAt: "Clanker Labs",
    tech: ["Python", "LLM Evaluation", "Statistics"],
    github: "https://github.com/Clanker-Labs/lebenchmark",
    external: "https://clanker-labs.github.io/lebenchmark/",
  },
  {
    year: 2026,
    title: "Kymatics",
    madeAt: "Unchained Labs",
    tech: ["Rust", "Python", "React", "Voice"],
    github: "https://github.com/Unchained-Labs/kymatics",
    external: "https://kymatics.vercel.app/",
  },
  {
    year: 2026,
    title: "t212-mcp",
    tech: ["TypeScript", "Node.js", "MCP"],
    github: "https://github.com/guilyx/t212-mcp",
  },
  {
    year: 2026,
    title: "BTView",
    tech: ["TypeScript", "Behavior Trees", "VS Code"],
    github: "https://github.com/guilyx/btview-vscode-plugin",
    external: "https://marketplace.visualstudio.com/items?itemName=rangonomics.btview",
  },
  {
    year: 2026,
    title: "zucman",
    tech: ["Python", "Matplotlib", "Data Viz"],
    github: "https://github.com/guilyx/zucman",
    external: "https://guilyx.github.io/zucman/",
  },
  {
    year: 2026,
    title: "flybots",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    github: "https://github.com/guilyx/flybots",
    external: "https://guilyx.github.io/flybots/",
  },
  {
    year: 2026,
    title: "Doxmosis",
    madeAt: "Unchained Labs",
    tech: ["Go", "Agentic AI", "GitHub Apps"],
    external: "https://doxmosis.vercel.app/",
  },
  {
    year: 2026,
    title: "rostree",
    tech: ["Python", "Graph Theory", "ROS 2", "TUI"],
    github: "https://github.com/guilyx/rostree",
    external: "https://guilyx.github.io/rostree",
  },
  {
    year: 2026,
    title: "epsteinexposed-mcp",
    tech: ["Python", "MCP"],
    github: "https://github.com/guilyx/epsteinexposed-mcp",
  },
  {
    year: 2026,
    title: "setup",
    madeAt: "Clanker Labs",
    tech: ["Ansible", "Python", "chezmoi", "Flask"],
    github: "https://github.com/Clanker-Labs/setup",
  },
  {
    year: 2026,
    title: "LeHarness",
    madeAt: "Clanker Labs",
    tech: ["vLLM", "Ollama", "Docker", "CUDA"],
  },
  {
    year: 2025,
    title: "v3 — portfolio",
    tech: ["React", "Vite", "Tailwind", "d3"],
    github: "https://github.com/guilyx/v3",
  },
  {
    year: 2024,
    title: "Unchained Labs",
    madeAt: "Unchained Labs",
    tech: ["Rust", "Python", "Agentic AI"],
    github: "https://github.com/Unchained-Labs",
    external: "https://unchainedlabs.dev/",
  },
  {
    year: 2024,
    title: "Decentralized Acceleration-Based Bird-Inspired Flocking",
    madeAt: "Technology Innovation Institute",
    tech: ["C++", "ROS 2", "Control Theory", "IROS 2024"],
    external:
      "https://www.researchgate.net/publication/387418977_Decentralized_Acceleration-Based_Bird-Inspired_Flocking",
  },
  {
    year: 2022,
    title: "v2 — portfolio",
    tech: ["HTML", "CSS", "Vanilla JS"],
    github: "https://github.com/guilyx/v2",
  },
  {
    year: 2021,
    title: "PyMAPF",
    madeAt: "APLA-Toolbox",
    tech: ["Python", "Multi-Agent Planning", "Graph Search"],
    github: "https://github.com/APLA-Toolbox/pymapf",
    external: "https://apla-toolbox.github.io/pymapf/",
  },
  {
    year: 2021,
    title: "Real-time Jitter Measurements under ROS 2",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["ROS 2", "Xenomai", "C++"],
    github: "https://github.com/mastererts/ros2_realtime_statistics",
    external:
      "https://www.researchgate.net/publication/350353690_Real-time_Jitter_Measurements_under_ROS2_the_Inverted_Pendulum_case",
  },
  {
    year: 2021,
    title: "Survey of the Multi-Agent Pathfinding Solutions",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["Research", "Path Planning"],
    external:
      "https://www.researchgate.net/publication/348716625_Survey_of_the_Multi-Agent_Pathfinding_Solutions",
  },
  {
    year: 2020,
    title: "PythonPDDL",
    madeAt: "APLA-Toolbox",
    tech: ["Python", "PDDL", "A* / Search", "Heuristics"],
    github: "https://github.com/APLA-Toolbox/pythonpddl",
    external: "https://apla-toolbox.github.io/PythonPDDL/",
  },
  {
    year: 2020,
    title: "artin-pathfinding",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["C++17", "Algorithms"],
    github: "https://github.com/master-coro/artin-pathfinding",
  },
  {
    year: 2020,
    title: "awesome-github-pages-portfolios",
    tech: ["Awesome List", "GitHub Pages"],
    github: "https://github.com/guilyx/awesome-github-pages-portfolios",
  },
  {
    year: 2020,
    title: "v1 — portfolio",
    tech: ["Bootstrap", "jQuery"],
    github: "https://github.com/guilyx/v1",
  },
];

/**
 * Hero spec block — the key/value register comes from Erwin's own GitHub
 * profile README, which introduces him as a YAML document.
 */
/**
 * The hero's one-paragraph answer to "who is this and what do they do."
 * Deliberately does not restate the tagline above it or the spec block
 * beside it — this is the part that carries the story.
 */
export const heroSummary = `Head of Robotics at SIRB.AI, after leading a robotics
  software team at the Technology Innovation Institute, and still hands-on in
  the code. Two-plus years running teams from product roadmaps through PI
  planning to sprints; eight years taking autonomy from research to real-world
  deployment — from a supermarket robot in Denmark to drone fleets in the UAE.`;

export const spec = [
  { key: "role", value: "team lead · robotics software" },
  { key: "based", value: "abu dhabi, uae" },
  { key: "domain", value: "behavior, task & path planning, sensor fusion" },
  { key: "hands-on", value: "ros 2 · c++ · python" },
] as const;

export const contact = {
  title: "Open Channel",
  body: `I'm not actively looking, but the inbox stays open — a question
   about multi-agent planning, an open-source idea, or just to say hi. I'll
   get back to you.`,
} as const;
