export type SkillList = (string | string[])[];

export type CategorySkills = Record<string, SkillList>;

export interface MeasurableResultPattern {
  label: string;
  pattern: string;
}

/**
 * Patterns used to detect quantified / measurable impact inside work
 * experience highlights (e.g. "reduced load time by 40%", "saved 10
 * hours/week", "increased sales by $50k"). Matching is regex-based.
 */
export const MEASURABLE_RESULTS: MeasurableResultPattern[] = [
  {
    label: "performance boost",
    // উদাহরণ: "improved application load time by 40%", "boosted api response speed by 2x", "reduced page render time from 3.2s to 800ms"
    pattern: String.raw`\b(?:improved|grew|boosted|optimized|optimizing|speeded up|accelerated|increased|increasing|enhanced|enhancing|upgraded|reduced|reducing)\s+[\w\s-]{0,40}?\s*(?:performance|speed|load time|response time|throughput|latency|rendering|efficiency|query time|build time)\s+(?:by|to|of|from)?\s*(?:\d+(?:\.\d+)?\s?%|\d+(?:\.\d+)?\s?x|\d+(?:\.\d+)?\s?(?:ms|s|sec|seconds))(?!\w)`,
  },
  {
    label: "cost reduction",
    // উদাহরণ: "reduced cloud infrastructure cost by 30%", "cut aws billing by $5k", "saved $12k/year by migrating to serverless"
    pattern: String.raw`\b(?:reduced|reducing|cut|cutting|saved|saving|lowered|lowering|decreased|decreasing|minimized|slashed)\s+[\w\s-]{0,40}?\s*(?:cost|costs|expense|expenses|billing|spend|budget|infrastructure cost|cloud spend|aws|server cost)\s+(?:by|to|of)?\s*(?:\d+(?:\.\d+)?\s?%|(?:\$|usd)\s?\d[\d,]*(?:\.\d+)?(?:[kmbt])?)(?!\w)`,
  },
  {
    label: "time saved development",
    // উদাহরণ: "saved 15 hours per week by automating deployments", "reduced build time by 50%", "cut release cycle from 2 weeks to 3 days"
    pattern: String.raw`\b(?:saved|saving|reduced|reducing|cut|cutting)\s+(?:about|around|up to\s+)?\d+(?:\.\d+)?\s*(?:hr|hrs|hour|hours|day|days|wk|wks|week|weeks|%)\s+[\w\s-]{0,30}?\s*(?:by|per|in)?\s*(?:automating|automation|ci/cd|pipeline|development|build time|testing|deployment|release cycle|onboarding)(?!\w)`,
  },
  {
    label: "scale and traffic handle",
    // উদাহরণ: "scaled system to handle 10m daily active users", "managed architecture supporting 50k requests per second", "processed 1B+ transactions per month"
    pattern: String.raw`\b(?:scaled|scaling|handled|handling|supported|supporting|managed|managing|processed|processing)\s+[\w\s-]{0,20}?\s*(?:to|up to)?\s*\d[\d,]*(?:\.\d+)?\s*(?:k|m|b|k/s|m/s)?\s*(?:users|dau|mau|requests|req/sec|rps|queries|qps|transactions|api calls|concurrent users|visitors|traffic|data)(?!\w)`,
  },
  {
    label: "code quality and bugs",
    // উদাহরণ: "reduced production bugs by 45%", "decreased critical incidents by 70%", "cut average bug resolution time from 4 days to 8 hours"
    pattern: String.raw`\b(?:reduced|reducing|decreased|dropped|cut|cutting|lowered)\s+[\w\s-]{0,30}?\s*(?:bugs|errors|crashes|incidents|tickets|downtime|issues|crash rate|resolution time)\s+(?:by|to|of|from)?\s*\d+(?:\.\d+)?\s?%(?!\w)`,
  },
  {
    label: "test coverage increase",
    // উদাহরণ: "increased unit test coverage from 60% to 85%", "raised integration test coverage to 90%"
    pattern: String.raw`\b(?:increased|increasing|raised|raising|improved|improving)\s+[\w\s-]{0,30}?\s*(?:test coverage|code coverage|unit test coverage|integration test coverage|e2e coverage)\s+(?:by|to|from|of)?\s*\d+(?:\.\d+)?\s?%(?!\w)`,
  },
  {
    label: "system uptime availability",
    // উদাহরণ: "maintained 99.99% system uptime", "ensured 99.9% api availability", "achieved zero downtime deployments for 12 months"
    pattern: String.raw`\b(?:maintained|maintaining|ensured|ensuring|achieved|achieving|guaranteed)\s+\d+(?:\.\d+)?\s?%\s+[\w\s-]{0,20}?\s*(?:uptime|availability|sla)(?!\w)`,
  },
  {
    label: "team productivity",
    // উদাহরণ: "boosted team delivery speed by 25%", "increased sprint completion rate from 70% to 95%", "onboarded 5 new engineers"
    pattern: String.raw`\b(?:boosted|increased|improved|accelerated)\s+[\w\s-]{0,30}?\s*(?:delivery|productivity|velocity|output|efficiency|sprint completion)\s+(?:by|to|of|from)?\s*\d+(?:\.\d+)?\s?%(?!\w)`,
  },
  {
    label: "reliability and mttr",
    // উদাহরণ: "reduced mean time to recovery from 45 min to 8 min", "improved mttr by 80%"
    pattern: String.raw`\b(?:reduced|reducing|improved|improving|decreased|cut)\s+[\w\s-]{0,30}?\s*(?:mttr|mean time to recovery|mean time to resolve|incident recovery time)\s+(?:by|to|of|from)?\s*(?:\d+(?:\.\d+)?\s?%|\d+(?:\.\d+)?\s*(?:min|mins|minutes|hr|hrs|hours))(?!\w)`,
  },
  {
    label: "migration modernization",
    // উদাহরণ: "migrated legacy monolith to microservices resulting in 40% faster feature delivery", "refactored codebase reducing technical debt by 30%"
    pattern: String.raw`\b(?:migrated|migrating|refactored|refactoring|modernized|modernizing)\s+[\w\s-]{0,40}?\s*(?:to|into)?\s*[\w\s-]{0,30}?\s*(?:resulting in|leading to|achieving)?\s*(?:\d+(?:\.\d+)?\s?%|\d+(?:\.\d+)?\s?x)\s*(?:faster|improvement|reduction)?(?!\w)`,
  },
  {
    label: "security improvement",
    // উদাহরণ: "reduced critical security vulnerabilities by 100%", "implemented scanning that caught 15+ high-severity issues"
    pattern: String.raw`\b(?:reduced|reducing|eliminated|fixed|resolved)\s+[\w\s-]{0,30}?\s*(?:security vulnerabilities|critical vulnerabilities|high-severity issues|security issues)\s+(?:by|to|of)?\s*\d+(?:\.\d+)?\s?%(?!\w)`,
  },
  {
    label: "business user impact",
    // উদাহরণ: "improved conversion rate by 18%", "increased user retention by 12%", "enabled new revenue stream generating $25k/month"
    pattern: String.raw`\b(?:improved|increased|boosted|grew|enhanced)\s+[\w\s-]{0,30}?\s*(?:conversion rate|sales|user retention|revenue|signups|engagement)\s+(?:by|to|of)?\s*(?:\d+(?:\.\d+)?\s?%|(?:\$|usd)\s?\d[\d,]*(?:\.\d+)?(?:[kmbt])?)(?!\w)`,
  },
];

export const extractMeasurableResults = (text: string): string[] => {
  if (!text || !text.trim()) return [];

  const matches: string[] = [];
  MEASURABLE_RESULTS.forEach(({ pattern }) => {
    const regex = new RegExp(pattern, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[0].trim());
    }
  });

  return [...new Set(matches)];
};

/**
 * Technical / hard skills, grouped by category.
 */
export const SKILLS: CategorySkills = {
  programmingLanguages: [
    ["javascript"],
    ["typescript"],
    ["python"],
    ["java"],
    ["c++", "cpp"],
    ["c#", "csharp"],
    ["go", "golang"],
    ["rust"],
    ["ruby"],
    ["php"],
    ["swift"],
    ["kotlin"],
    ["scala"],
    ["r"],
    ["sql"],
    ["dart"],
    ["shell", "sh"],
    ["bash"],
    ["html5", "html"],
    ["css3", "css"],
  ],

  frontendFrameworks: [
    ["react.js", "react", "reactjs", "react js"],
    ["angular", "angularjs", "angular.js", "angular js"],
    ["vue.js", "vue", "vuejs", "vue js"],
    ["next.js", "nextjs", "next", "next js"],
    ["nuxt.js", "nuxt", "nuxtjs", "nuxt js"],
    ["svelte"],
    ["gatsby"],
    ["remix"],
    ["solid.js", "solid", "solidjs", "solid js"],
    ["tailwind css", "tailwind", "tailwindcss"],
    ["bootstrap"],
    ["redux", "redux-toolkit"],
    ["graphql client", "apollo", "apollo client", "relay"],
  ],

  backendFrameworks: [
    ["node.js", "node", "nodejs", "node js"],
    ["express.js", "express", "expressjs", "express js"],
    ["nestjs", "nest.js", "nest"],
    ["django"],
    ["flask"],
    ["fastapi"],
    ["spring boot", "spring", "springboot"],
    ["ruby on rails", "rails", "ror"],
    ["laravel"],
    ["asp.net core", "asp.net", "dotnet", ".net"],
    ["fastify"],
    ["gin"],
    ["fiber"],
  ],

  databases: [
    ["postgresql", "postgres"],
    ["mongodb", "mongo"],
    ["mysql"],
    ["redis"],
    ["sqlite"],
    ["elasticsearch", "elastic"],
    ["dynamodb"],
    ["cassandra"],
    ["mariadb"],
    ["oracle"],
    ["ms sql server", "mssql", "sql server", "microsoft sql server"],
    ["nosql"],
    ["firebase", "firestore"],
    ["supabase"],
  ],

  orms: [
    ["prisma"],
    ["mongoose"],
    ["sequelize"],
    ["typeorm"],
    ["drizzle orm", "drizzle"],
    ["hibernate"],
    ["entity framework", "ef core"],
  ],

  cloudPlatforms: [
    ["aws", "amazon web services"],
    ["google cloud platform", "gcp", "google cloud"],
    ["microsoft azure", "azure"],
    ["digitalocean", "digital ocean"],
    ["heroku"],
    ["vercel"],
    ["netlify"],
    ["cloudflare"],
  ],

  devopsTools: [
    ["docker"],
    ["kubernetes", "k8s"],
    ["jenkins"],
    ["github actions", "gh actions"],
    ["gitlab ci/cd", "gitlab ci"],
    ["circleci"],
    ["ansible"],
    ["terraform", "tf"],
    ["prometheus"],
    ["grafana"],
    ["datadog"],
    ["new relic"],
    ["argocd", "argo cd"],
  ],

  testingTools: [
    ["jest"],
    ["cypress"],
    ["playwright"],
    ["selenium"],
    ["mocha"],
    ["vitest"],
    ["react testing library", "testing library"],
    ["jasmine"],
    ["pytest"],
    ["junit"],
    ["postman"],
  ],

  versionControl: [["git"], ["github"], ["gitlab"], ["bitbucket"]],

  methodologies: [
    ["agile"],
    ["scrum"],
    ["kanban"],
    ["devops"],
    ["ci/cd", "ci-cd"],
    ["tdd", "test-driven development"],
    ["bdd", "behavior-driven development"],
    ["microservices", "microservice"],
    ["serverless"],
    ["event-driven architecture", "event-driven", "eda"],
    ["rest api", "rest", "restful"],
    ["graphql"],
  ],

  messageBrokers: [
    ["apache kafka", "kafka"],
    ["rabbitmq"],
    ["amazon sqs", "sqs"],
    ["nats"],
  ],

  aiAndData: [
    ["openai api", "openai"],
    ["langchain"],
    ["vector databases", "vector database", "pinecone", "chromadb", "weaviate"],
    ["llm", "large language models"],
  ],
};

/**
 * Soft skills. Includes the extra soft skills previously defined only in jdParser.
 */
export const SOFT_SKILLS: SkillList = [
  [
    "leadership",
    "leader",
    "team lead",
    "team leadership",
    "leading",
    "management",
  ],
  [
    "communication",
    "communications",
    "interpersonal",
    "verbal communication",
    "written communication",
  ],
  ["teamwork", "team player", "team-work"],
  [
    "problem solving",
    "problem-solving",
    "analytical thinking",
    "troubleshooting",
  ],
  ["critical thinking", "critical-thinking"],
  ["time management", "time-management", "prioritization", "deadline-driven"],
  ["adaptability", "adaptable", "flexibility", "flexible"],
  [
    "collaboration",
    "collaborative",
    "cross-functional collaboration",
    "cross-functional",
  ],
  ["mentoring", "mentor", "coaching", "mentorship", "guidance"],
  ["presentation", "presentations", "public speaking"],
  ["negotiation", "negotiating"],
  ["conflict resolution", "conflict-resolution", "resolving conflicts"],
  ["creativity", "creative", "innovation", "innovative"],
  ["initiative", "proactive", "proactiveness", "self-starter"],
  ["self-motivated", "self motivated", "self-motivation", "driven"],
  ["detail-oriented", "detail oriented", "attention to detail", "meticulous"],
  ["organization", "organizational skills", "planning"],
  ["ownership", "accountability", "responsibility"],
  ["analytical", "analytical skills", "data-driven"],
];

/**
 * Action verbs in base form. Matching also catches inflected forms
 * (e.g. "develop" matches "developed", "developing"). Aliases carry
 * irregular / spelling-change forms (e.g. "build" -> "built", "plan" ->
 * "planned"). Canonical name is the base form; scoring surfaces the
 * canonical name.
 */
export const ACTION_VERBS: CategorySkills = {
  coreDevelopment: [
    ["develop", "developed", "developing"],
    ["design", "designed", "designing"],
    ["implement", "implemented", "implementing"],
    ["build", "built", "building"],
    ["create", "created", "creating"],
    ["architect", "architected"],
    ["engineer", "engineered"],
    ["write", "wrote", "written"],
  ],

  optimizationAndImpact: [
    ["optimize", "optimized", "optimizing"],
    ["improve", "improved", "improving"],
    ["enhance", "enhanced", "enhancing"],
    ["boost", "boosted", "boosting"],
    ["accelerate", "accelerated", "accelerating"],
    ["scale", "scaled", "scaling"],
    ["refactor", "refactored", "refactoring"],
    ["streamline", "streamlined", "streamlining"],
    ["modernize", "modernized", "modernizing"],
  ],

  automationAndDelivery: [
    ["automate", "automated", "automating"],
    ["deploy", "deployed", "deploying"],
    ["launch", "launched", "launching"],
    ["migrate", "migrated", "migrating"],
    ["integrate", "integrated", "integrating"],
    ["deliver", "delivered", "delivering"],
    ["execute", "executed", "executing"],
  ],

  qualityAndTesting: [
    ["test", "tested", "testing"],
    ["debug", "debugged", "debugging"],
    ["troubleshoot", "troubleshot", "troubleshooting"],
    ["validate", "validated", "validating"],
    ["review", "reviewed", "reviewing"],
    ["analyze", "analyzed", "analyzing", "analyse", "analysed"],
  ],

  leadershipAndValue: [
    ["lead", "led", "leading"],
    ["manage", "managed", "managing"],
    ["spearhead", "spearheaded", "spearheading"],
    ["drive", "drove", "driven", "driving"],
    ["save", "saved", "saving"],
    ["reduce", "reduced", "reducing"],
    ["cut", "cutting"],
  ],
};

/**
 * Industry-specific keywords grouped by domain. Used for keyword matching
 * in both JD parsing and resume parsing.
 */
export const KEYWORDS: CategorySkills = {
  softwareDevelopment: [
    ["sdlc", "software development life cycle"],
    ["code review", "code reviews"],
    ["version control", "vcs"],
    ["branching", "git branching"],
    ["merging"],
    ["pull request", "pr", "pull requests", "prs"],
    ["continuous integration", "ci"],
    ["continuous deployment", "cd", "continuous delivery"],
    ["api", "apis", "api design"],
    ["microservice", "microservices"],
    ["monolith", "monolithic"],
    ["serverless", "serverless architecture"],
    ["cloud-native", "cloud native"],
    ["system design"],
    ["software architecture"],
    ["scalability", "scalable", "scaling"],
    ["oop", "object-oriented programming", "object oriented programming"],
    ["design patterns", "design pattern"],
    ["clean code"],
    ["solid principles", "solid principle", "solid"],
    ["dry principle", "dry"],
    ["refactoring", "refactored"],
    ["debugging", "debug"],
    ["concurrency", "concurrent"],
    ["multithreading", "multi-threading"],
    ["caching", "cache"],
    ["load balancing", "load balancer"],
    ["data structures", "data structure", "dsa"],
    ["algorithms", "algorithm"],
    ["observability"],
    ["monitoring", "monitor"],
    ["logging", "log", "logs"],
  ],

  webDevelopment: [
    ["responsive", "responsive design"],
    ["spa", "single page application", "single page applications"],
    ["ssr", "server-side rendering", "server side rendering"],
    ["ssg", "static site generation", "static site generator"],
    ["pwa", "progressive web app", "progressive web apps"],
    ["seo", "search engine optimization", "search engine optimisation"],
    ["accessibility", "a11y", "web accessibility"],
    ["wcag"],
    ["cross-browser", "cross-browser compatibility", "cross browser"],
    ["mobile-first", "mobile first"],
    ["performance optimization", "performance tuning", "web performance"],
    ["state management"],
    ["dom", "dom manipulation"],
    ["websocket", "websockets", "web socket"],
    ["ui/ux", "ui-ux", "user interface", "user experience"],
    ["restful api", "rest api", "rest apis", "restful apis"],
    ["graphql"],
    ["bundle optimization", "bundle size"],
    ["lazy loading", "lazy-loading"],
    ["code splitting", "code-splitting"],
    ["semantic html"],
    ["css grid", "grid"],
    ["flexbox", "flex-box"],
    ["cors", "cross-origin resource sharing"],
    ["session management", "session handling"],
    ["web performance", "page speed"],
    ["middleware", "middlewares"],
    ["routing", "router"],
    ["hydration"],
  ],

  dataEngineering: [
    ["etl", "extract transform load"],
    ["data pipeline", "data pipelines"],
    ["data warehouse", "dwh", "data warehousing"],
    ["data lake", "data lakes"],
    ["big data"],
    ["streaming", "data streaming", "event streaming"],
    ["batch processing", "batch jobs"],
    ["data modeling", "data modelling"],
    ["data governance"],
    ["query optimization", "sql optimization", "performance tuning"],
    ["olap"],
    ["data replication"],
  ],

  machineLearning: [
    ["machine learning", "ml"],
    ["deep learning", "dl"],
    ["neural network", "neural networks", "ann", "cnn", "rnn"],
    ["nlp", "natural language processing"],
    ["cv", "computer vision"],
    ["model training", "training models"],
    ["feature engineering"],
    ["hyperparameter tuning"],
    ["llm", "large language models", "large language model", "llms"],
    ["prompt engineering"],
    ["mlops"],
    ["vector database", "vector databases", "vector search"],
    ["fine-tuning", "finetuning", "fine tuning"],
  ],

  cybersecurity: [
    ["security", "cybersecurity", "application security", "appsec"],
    ["encryption", "cryptography"],
    ["authentication", "authn"],
    ["authorization", "authz"],
    ["oauth", "oauth2", "oauth 2.0"],
    ["jwt", "json web token", "jwts"],
    ["ssl", "secure sockets layer"],
    ["tls", "transport layer security"],
    ["penetration testing", "pen testing", "pentest"],
    ["vulnerability assessment", "vulnerability scanning"],
    ["owasp", "owasp top 10"],
    ["cors", "cross-origin resource sharing"],
    ["iam", "identity and access management"],
    ["rbac", "role-based access control"],
    ["csrf", "xsrf"],
  ],

  projectManagement: [
    ["stakeholder", "stakeholders", "stakeholder management"],
    ["roadmap", "product roadmap"],
    ["milestone", "milestones"],
    ["deliverable", "deliverables"],
    ["sprint", "sprints", "sprint planning"],
    ["backlog", "product backlog", "backlog grooming"],
    ["retrospective", "sprint retrospective", "retro"],
    ["standup", "daily standup", "scrum meeting"],
    ["planning", "project planning"],
    ["estimation", "story pointing", "estimates"],
    ["agile", "agile methodology"],
    ["scrum", "scrum master"],
    ["cross-functional", "cross-functional collaboration"],
    ["ci/cd", "cicd", "ci-cd"],
  ],
};
