// NOTE: this file is not used anymore
const SKILL_GROUPS = [
    // Frontend frameworks & libraries
    { display: "React", aliases: ["react", "react.js", "reactjs", "react js"] },
    { display: "React Native", aliases: ["react native", "reactnative"] },
    { display: "Next.js", aliases: ["nextjs", "next js", "next", "next.js"] },
    { display: "Vue.js", aliases: ["vuejs", "vue js", "vue", "vue.js"] },
    { display: "Nuxt", aliases: ["nuxtjs", "nuxt js", "nuxt", "nuxt.js"] },
    {
        display: "Svelte",
        aliases: ["sveltejs", "svelte js", "svelte", "svelte.js"],
    },
    { display: "jQuery", aliases: ["jquery", "jquery.js"] },
    {
        display: "Tailwind CSS",
        aliases: ["tailwindcss", "tailwind css", "tailwind"],
    },
    { display: "Material UI", aliases: ["material-ui", "mui"] },
    { display: "Ant Design", aliases: ["antd", "ant design"] },
    { display: "Ember.js", aliases: ["emberjs", "ember js", "ember"] },
    {
        display: "Backbone.js",
        aliases: ["backbonejs", "backbone js", "backbone"],
    },
    { display: "Three.js", aliases: ["threejs", "three js"] },
    { display: "D3.js", aliases: ["d3js", "d3 js", "d3"] },
    { display: "Chart.js", aliases: ["chartjs", "chart js"] },
    { display: "Framer Motion", aliases: ["framer-motion", "framer motion"] },
    { display: "Alpine.js", aliases: ["alpinejs", "alpine js"] },
    { display: "Inertia.js", aliases: ["inertiajs", "inertia js"] },
    {
        display: "PWA",
        aliases: ["progressive web app", "progressive web application"],
    },
    // Backend frameworks & runtimes
    { display: "Node.js", aliases: ["nodejs", "node js", "node", "node.js"] },
    {
        display: "Express",
        aliases: ["express.js", "expressjs", "express js", "express"],
    },
    { display: "NestJS", aliases: ["nest.js", "nest js", "nest"] },
    { display: "Koa", aliases: ["koa.js", "koajs"] },
    { display: "Hapi", aliases: ["hapi.js", "hapijs"] },
    { display: "Fastify", aliases: ["fastifyjs"] },
    { display: "AdonisJS", aliases: ["adonis.js", "adonis js", "adonis"] },
    { display: "Sails.js", aliases: ["sailsjs", "sails js", "sails"] },
    { display: "Ruby on Rails", aliases: ["rails"] },
    { display: "Spring Boot", aliases: ["springboot", "spring-boot"] },
    { display: "ASP.NET", aliases: ["aspnet", "asp net"] },
    { display: ".NET", aliases: ["dotnet", ".net core", "dot net"] },
    {
        display: "Socket.io",
        aliases: ["socketio", "socket io", "socket", "socket.io"],
    },
    { display: "tRPC", aliases: ["trpc"] },
    { display: "gRPC", aliases: ["grpc"] },
    { display: "GraphQL", aliases: ["graphql"] },
    { display: "Microservices", aliases: ["micro-service", "microservice"] },
    { display: "Serverless", aliases: ["serverless"] },
    { display: "AWS Lambda", aliases: ["lambda"] },
    { display: "Azure Functions", aliases: ["azure function"] },
    { display: "Cloud Functions", aliases: ["google cloud functions"] },
    // Databases
    { display: "MySQL", aliases: ["mysql"] },
    { display: "PostgreSQL", aliases: ["postgres", "postgresql"] },
    { display: "MongoDB", aliases: ["mongo", "mongodb"] },
    { display: "SQLite", aliases: ["sqlite"] },
    {
        display: "Microsoft SQL Server",
        aliases: ["SQL Server", "MSSQL", "ms sql server"],
    },
    { display: "Redis", aliases: ["redis"] },
    { display: "Firebase", aliases: ["firebase"] },
    { display: "Firestore", aliases: ["firebase firestore"] },
    { display: "Supabase", aliases: ["supabase"] },
    { display: "Elasticsearch", aliases: ["elastic search", "elastic"] },
    { display: "DynamoDB", aliases: ["dynamodb"] },
    { display: "BigQuery", aliases: ["bigquery"] },
    { display: "Drizzle", aliases: ["drizzle"] },
    { display: "Prisma", aliases: ["prisma"] },
    { display: "TypeORM", aliases: ["typeorm"] },
    { display: "Sequelize", aliases: ["sequelize"] },
    { display: "Mongoose", aliases: ["mongoose"] },
    { display: "SQLAlchemy", aliases: ["sqlalchemy"] },
    { display: "Knex", aliases: ["knex"] },
    {
        display: "Entity Framework",
        aliases: ["entity framework core", "ef core"],
    },
    // Cloud & DevOps
    { display: "AWS", aliases: ["Amazon Web Services", "amazon aws"] },
    { display: "Azure", aliases: ["Microsoft Azure", "microsoft azure"] },
    { display: "Google Cloud", aliases: ["Google Cloud Platform", "GCP", "gcp"] },
    { display: "Kubernetes", aliases: ["K8s", "k8s"] },
    { display: "Terraform", aliases: ["terraform"] },
    { display: "Docker", aliases: ["docker"] },
    { display: "CI/CD", aliases: ["cicd", "ci cd"] },
    { display: "Jenkins", aliases: ["jenkins"] },
    { display: "GitHub Actions", aliases: ["Github Actions", "github action"] },
    { display: "GitLab CI", aliases: ["Gitlab CI"] },
    { display: "Grafana", aliases: ["grafana"] },
    { display: "Prometheus", aliases: ["prometheus"] },
    { display: "ELK Stack", aliases: ["ELK"] },
    { display: "CloudFormation", aliases: ["AWS CloudFormation"] },
    { display: "NGINX", aliases: ["Nginx"] },
    { display: "Ansible", aliases: ["ansible"] },
    // Languages
    { display: "JavaScript", aliases: ["javascript"] },
    { display: "TypeScript", aliases: ["typescript"] },
    { display: "Python", aliases: ["python"] },
    { display: "Java", aliases: ["java"] },
    { display: "SQL", aliases: ["sql"] },
    { display: "HTML", aliases: ["html"] },
    { display: "CSS", aliases: ["css"] },
    { display: "C", aliases: ["c"] },
    { display: "C#", aliases: ["CSharp", "c sharp"] },
    { display: "C++", aliases: ["Cpp", "c plus plus"] },
    { display: "Objective-C", aliases: ["Objective C", "obj-c"] },
    { display: "Go", aliases: ["Golang", "golang"] },
    { display: "Shell Scripting", aliases: ["Shell", "shell script", "bash"] },
    { display: "PowerShell", aliases: ["powershell"] },
    { display: "Visual Basic", aliases: ["VB", "VB.NET", "vb net"] },
    { display: "Kotlin", aliases: ["kotlin"] },
    { display: "Swift", aliases: ["swift"] },
    { display: "Dart", aliases: ["dart"] },
    { display: "Ruby", aliases: ["ruby"] },
    { display: "PHP", aliases: ["php"] },
    { display: "Scala", aliases: ["scala"] },
    { display: "Rust", aliases: ["rust"] },
    // Testing
    { display: "Jest", aliases: ["jest"] },
    { display: "Vitest", aliases: ["vitest"] },
    { display: "Mocha", aliases: ["mocha"] },
    { display: "Chai", aliases: ["chai"] },
    { display: "Cypress", aliases: ["cypress"] },
    { display: "Playwright", aliases: ["playwright"] },
    { display: "Puppeteer", aliases: ["puppeteer"] },
    { display: "Selenium", aliases: ["selenium"] },
    { display: "Postman", aliases: ["postman"] },
    { display: "Swagger", aliases: ["swagger"] },
    { display: "OpenAPI", aliases: ["open api"] },
    { display: "pytest", aliases: ["PyTest"] },
    // Data science, ML & AI
    { display: "Machine Learning", aliases: ["ML", "ml"] },
    { display: "Deep Learning", aliases: ["DL", "dl"] },
    { display: "Artificial Intelligence", aliases: ["AI", "ai"] },
    { display: "Natural Language Processing", aliases: ["NLP", "nlp"] },
    { display: "scikit-learn", aliases: ["scikit learn", "sklearn"] },
    { display: "TensorFlow", aliases: ["tensorflow"] },
    { display: "PyTorch", aliases: ["pytorch"] },
    { display: "Keras", aliases: ["keras"] },
    { display: "Pandas", aliases: ["pandas"] },
    { display: "NumPy", aliases: ["numpy"] },
    { display: "OpenCV", aliases: ["opencv"] },
    { display: "Hugging Face", aliases: ["huggingface"] },
    { display: "LangChain", aliases: ["langchain"] },
    { display: "LangGraph", aliases: ["langgraph"] },
    {
        display: "LLM",
        aliases: ["Large Language Model", "large language models"],
    },
    {
        display: "RAG",
        aliases: [
            "Retrieval Augmented Generation",
            "retrieval-augmented generation",
        ],
    },
    { display: "Apache Spark", aliases: ["Spark"] },
    { display: "Airflow", aliases: ["apache airflow"] },
    { display: "Databricks", aliases: ["databricks"] },
    { display: "Tableau", aliases: ["tableau"] },
    { display: "Power BI", aliases: ["PowerBI", "power bi"] },
    { display: "Looker", aliases: ["looker"] },
    { display: "Fine-tuning", aliases: ["fine tuning"] },
    // Security
    { display: "Cybersecurity", aliases: ["Cyber Security", "cyber security"] },
    {
        display: "Penetration Testing",
        aliases: ["PenTesting", "pentesting", "pen testing"],
    },
    { display: "OAuth", aliases: ["OAuth 2.0", "oauth2"] },
    { display: "JWT", aliases: ["JSON Web Token", "jwt"] },
    { display: "SAML", aliases: ["saml"] },
    { display: "SSO", aliases: ["Single Sign-On", "single sign on"] },
    {
        display: "2FA",
        aliases: ["Two-Factor Authentication", "two factor authentication"],
    },
    // Version control & collaboration
    { display: "Git", aliases: ["git"] },
    { display: "GitHub", aliases: ["Github"] },
    { display: "GitLab", aliases: ["Gitlab"] },
    { display: "SVN", aliases: ["Subversion", "subversion"] },
    { display: "Mercurial", aliases: ["hg"] },
    { display: "Jira", aliases: ["jira"] },
    { display: "Confluence", aliases: ["confluence"] },
    { display: "Notion", aliases: ["notion"] },
    { display: "Trello", aliases: ["trello"] },
    { display: "Slack", aliases: ["slack"] },
    { display: "Asana", aliases: ["asana"] },
    // Mobile
    { display: "Flutter", aliases: ["flutter"] },
    { display: "SwiftUI", aliases: ["swift ui"] },
    { display: "Jetpack Compose", aliases: ["compose"] },
    { display: "Xamarin", aliases: ["xamarin"] },
    { display: "Ionic", aliases: ["ionic"] },
    { display: "Capacitor", aliases: ["capacitor"] },
    { display: "Expo", aliases: ["expo"] },
    // Design
    { display: "Figma", aliases: ["figma"] },
    { display: "Adobe XD", aliases: ["adobe xd"] },
    { display: "Photoshop", aliases: ["adobe photoshop"] },
    { display: "Illustrator", aliases: ["adobe illustrator"] },
    // Miscellaneous / enterprise
    { display: "Agile", aliases: ["agile"] },
    { display: "Scrum", aliases: ["scrum"] },
    { display: "Kanban", aliases: ["kanban"] },
    { display: "WordPress", aliases: ["wordpress"] },
    { display: "Shopify", aliases: ["shopify"] },
    { display: "Salesforce", aliases: ["salesforce"] },
    { display: "SAP", aliases: ["sap"] },
    { display: "CRM", aliases: ["crm"] },
    { display: "ERP", aliases: ["erp"] },
    { display: "TDD", aliases: ["Test Driven Development"] },
    { display: "BDD", aliases: ["bdd"] },
];
/** Words that carry no skill meaning and should be dropped. */
const SKILL_STOPWORDS = new Set([
    "and",
    "etc",
    "etc.",
    "including",
    "such",
    "as",
    "with",
    "using",
    "skills",
]);
/**
 * Normalizes a skill spelling to a canonical lookup key.
 * Lowercases and removes separators (spaces, dots, dashes, underscores,
 * slashes) but keeps "#" and "+" so C# / C++ / C stay distinct.
 */
function normalizeKey(value) {
    return value.toLowerCase().replace(/[\s.\-_/]+/g, "");
}
const LOOKUP = {};
for (const group of SKILL_GROUPS) {
    for (const alias of [group.display, ...group.aliases]) {
        LOOKUP[normalizeKey(alias)] = group;
    }
}
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Word-boundary-aware matcher for every alias of a group. */
const GROUP_PATTERNS = SKILL_GROUPS.map((group) => {
    const alternatives = [group.display, ...group.aliases]
        .map((alias) => escapeRegex(alias))
        .join("|");
    return {
        display: group.display,
        re: new RegExp(`(?<![\\w.-])(?:${alternatives})(?![\\w-])`, "i"),
    };
});
/**
 * Finds a known skill embedded inside a longer phrase (e.g. "pure react app").
 * Returns the canonical name only when EXACTLY ONE known skill matches, so
 * ambiguous phrases are left untouched.
 */
function extractEmbeddedSkill(token) {
    let match = null;
    for (const { display, re } of GROUP_PATTERNS) {
        if (re.test(token)) {
            if (match && match !== display)
                return null;
            match = display;
        }
    }
    return match;
}
/** Splits a raw AI entry into individual skill tokens when possible. */
function splitEntry(raw) {
    return raw
        .split(/\s*(?:,|;|\band\b|\betc\.?\b|\bsuch as\b)\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
}
/**
 * Collapses one skill spelling to its canonical display name.
 * Unknown skills are returned cleaned but unchanged.
 */
export const canonicalizeSkill = (raw) => {
    const cleaned = raw.trim();
    if (!cleaned)
        return "";
    const group = LOOKUP[normalizeKey(cleaned)];
    if (group)
        return group.display;
    const embedded = extractEmbeddedSkill(cleaned);
    if (embedded)
        return embedded;
    return cleaned.replace(/^[\s,.;:]+/, "");
};
/**
 * Normalizes an array of hard skills: collapses variant spellings to a
 * single canonical name, splits comma/"and"/"etc" lists and removes
 * duplicates (case-insensitive) while preserving first-seen order.
 */
export const normalizeHardSkills = (skills) => {
    if (!Array.isArray(skills))
        return [];
    const out = [];
    const seen = new Set();
    const add = (skill) => {
        const canonical = canonicalizeSkill(skill);
        if (!canonical)
            return;
        if (SKILL_STOPWORDS.has(canonical.toLowerCase()))
            return;
        const key = canonical.toLowerCase();
        if (seen.has(key))
            return;
        seen.add(key);
        out.push(canonical);
    };
    for (const raw of skills) {
        if (typeof raw !== "string")
            continue;
        // Prefer treating the whole entry as one skill when it matches a known
        // canonical form (e.g. "CI/CD"), otherwise split list-like entries.
        if (LOOKUP[normalizeKey(raw)]) {
            add(raw);
        }
        else {
            for (const part of splitEntry(raw))
                add(part);
        }
    }
    return out;
};
/**
 * Returns every known spelling variant (including the canonical form) for a
 * skill, so matching can detect a skill no matter how it is written.
 */
export const getSkillAliases = (skill) => {
    const group = LOOKUP[normalizeKey(skill)];
    if (!group)
        return [skill];
    return [group.display, ...group.aliases];
};
