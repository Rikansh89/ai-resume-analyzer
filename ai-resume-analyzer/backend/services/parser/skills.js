const SOFTWARE_KEYWORDS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'Golang', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust', 'Scala', 'Dart', 'Perl', 'C#', 'C++', 'SQL', 'HTML', 'CSS', 'Bash', 'PowerShell',
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'NextJS', 'Redux', 'Zustand', 'jQuery', 'Bootstrap', 'Tailwind', 'Sass', 'Webpack', 'Vite', 'ESLint', 'Storybook',
  'Node', 'NodeJS', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Rails', 'Laravel', 'ASP.NET', '.NET', 'Fastify', 'GraphQL', 'REST', 'RESTful', 'gRPC', 'WebSocket', 'Socket.io',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'MariaDB', 'Oracle', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Firebase', 'Neo4j', 'Snowflake', 'BigQuery', 'Prisma', 'Sequelize', 'Mongoose', 'TypeORM', 'Supabase',
  'AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'Netlify', 'Vercel', 'Cloudflare', 'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Jenkins', 'GitHub', 'GitLab', 'CircleCI', 'CI/CD', 'Nginx', 'Serverless', 'Lambda', 'S3', 'EC2', 'CloudFormation', 'Kafka', 'RabbitMQ',
  'Jest', 'Vitest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium', 'Pytest', 'JUnit', 'TDD', 'Unit Testing', 'Integration Testing', 'E2E',
  'Git', 'Linux', 'Unix', 'Microservices', 'Monorepo', 'System Design', 'SOLID', 'Design Patterns', 'OAuth', 'OAuth2', 'JWT', 'Auth0', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Observability', 'Prometheus', 'Grafana', 'Datadog'
];

const DATA_KEYWORDS = [
  'Python', 'R', 'SQL', 'Pandas', 'NumPy', 'SciPy', 'scikit-learn', 'sklearn', 'TensorFlow', 'PyTorch', 'Keras', 'Machine Learning', 'Deep Learning', 'NLP', 'Natural Language Processing', 'Computer Vision',
  'Statistics', 'Statistical Analysis', 'A/B Testing', 'Data Visualization', 'Tableau', 'Power BI', 'Matplotlib', 'Seaborn', 'Excel', 'Jupyter', 'Spark', 'Apache Spark', 'Hadoop', 'BigQuery', 'Snowflake',
  'Airflow', 'dbt', 'ETL', 'Data Pipelines', 'Data Warehousing', 'Feature Engineering', 'Regression', 'Classification', 'Clustering', 'Forecasting', 'Recommendation System'
];

const DESIGN_KEYWORDS = [
  'Figma', 'Sketch', 'Adobe XD', 'Adobe Photoshop', 'Illustrator', 'InVision', 'Prototyping', 'Wireframing', 'User Research', 'Usability Testing',
  'UI Design', 'UX Design', 'Product Design', 'Design Systems', 'Interaction Design', 'Accessibility', 'WCAG', 'Information Architecture', 'User Journey', 'Journey Mapping', 'Personas', 'Style Guide', 'Design Tokens', 'Motion Design'
];

const MARKETING_KEYWORDS = [
  'SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Email Marketing', 'CRM', 'HubSpot', 'Salesforce',
  'Conversion Rate Optimization', 'CRO', 'A/B Testing', 'PPC', 'Facebook Ads', 'Google Ads', 'Copywriting', 'Brand Strategy', 'Lead Generation',
  'Marketing Automation', 'Funnel Optimization', 'KPI', 'Growth Marketing', 'Affiliate Marketing', 'Inbound Marketing'
];

const DEVOPS_KEYWORDS = [
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Google Cloud', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD', 'Linux', 'Nginx', 'Kafka', 'RabbitMQ',
  'Prometheus', 'Grafana', 'Serverless', 'Lambda', 'CloudFormation', 'Helm', 'ArgoCD', 'GitOps', 'Infrastructure as Code', 'IaC', 'Vault', 'Consul', 'Elasticsearch', 'Datadog', 'New Relic', 'OpenTelemetry'
];

const PRODUCT_KEYWORDS = [
  'Product Management', 'Product Roadmap', 'Agile', 'Scrum', 'Kanban', 'Jira', 'User Stories', 'A/B Testing', 'Market Research', 'Competitive Analysis',
  'Stakeholder Management', 'PRD', 'Backlog', 'OKR', 'GTM', 'Go-to-Market', 'Analytics', 'Funnel', 'Prioritization', 'MVP', 'Discovery'
];

const QA_KEYWORDS = [
  'Selenium', 'Cypress', 'Playwright', 'Jest', 'Pytest', 'JUnit', 'TestNG', 'TDD', 'BDD', 'Unit Testing', 'Integration Testing', 'E2E',
  'Regression Testing', 'Manual Testing', 'Automation Testing', 'API Testing', 'Postman', 'SoapUI', 'Load Testing', 'Performance Testing'
];

const AIML_KEYWORDS = [
  'Python', 'R', 'Machine Learning', 'Deep Learning', 'NLP', 'Natural Language Processing', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'sklearn',
  'LLM', 'LLMs', 'Large Language Models', 'GenAI', 'Generative AI', 'Generative Models', 'Transformers', 'Hugging Face', 'LangChain', 'RAG', 'Retrieval Augmented Generation',
  'Vector Databases', 'Pinecone', 'Weaviate', 'FAISS', 'ChromaDB', 'OpenAI API', 'Fine-tuning', 'Fine Tuning', 'Prompt Engineering', 'MLOps', 'Kubeflow',
  'Model Deployment', 'Model Serving', 'Feature Engineering', 'Pandas', 'NumPy', 'Statistics', 'A/B Testing', 'Recommender Systems', 'Recommendation System',
  'Model Evaluation', 'Evaluation Metrics', 'MLflow', 'ONNX', 'LoRA', 'Agents', 'Multi-Agent', 'RAG Pipeline', 'Tokenization', 'Embeddings', 'LLMOps'
];

const FRONTEND_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'NextJS', 'Remix', 'Redux', 'Zustand', 'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
  'Webpack', 'Vite', 'ESLint', 'Storybook', 'Jest', 'Cypress', 'Playwright', 'REST', 'GraphQL', 'Accessibility', 'Responsive Design', 'PWA', 'Web Performance', 'Design Systems'
];

const BACKEND_KEYWORDS = [
  'Node', 'NodeJS', 'Python', 'Java', 'Golang', 'Go', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Rails', 'Laravel', 'ASP.NET', 'REST', 'RESTful', 'GraphQL', 'gRPC',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'Prisma', 'Sequelize', 'Mongoose', 'Kafka', 'RabbitMQ',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Microservices', 'API Design', 'CI/CD', 'Serverless', 'Lambda', 'OAuth', 'OAuth2', 'JWT', 'System Design'
];

const FULLSTACK_KEYWORDS = [...new Set([...SOFTWARE_KEYWORDS, ...FRONTEND_KEYWORDS, ...BACKEND_KEYWORDS])];

const ROLES = [
  {
    key: 'software',
    label: 'Software Engineer',
    keywords: SOFTWARE_KEYWORDS,
    core: ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node', 'Express', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'REST', 'GraphQL', 'CI/CD']
  },
  {
    key: 'data',
    label: 'Data Scientist / Analyst',
    keywords: DATA_KEYWORDS,
    core: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Statistics', 'Data Visualization', 'Spark', 'Tableau', 'A/B Testing', 'TensorFlow']
  },
  {
    key: 'design',
    label: 'Product / UX Designer',
    keywords: DESIGN_KEYWORDS,
    core: ['Figma', 'Prototyping', 'User Research', 'Usability Testing', 'UI Design', 'UX Design', 'Design Systems', 'Accessibility', 'Wireframing']
  },
  {
    key: 'marketing',
    label: 'Marketing',
    keywords: MARKETING_KEYWORDS,
    core: ['SEO', 'Google Analytics', 'Content Marketing', 'Email Marketing', 'CRM', 'Conversion Rate Optimization', 'A/B Testing', 'Social Media Marketing', 'Copywriting', 'Lead Generation']
  },
  {
    key: 'devops',
    label: 'DevOps / Cloud',
    keywords: DEVOPS_KEYWORDS,
    core: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Prometheus', 'Grafana', 'Serverless', 'Helm']
  },
  {
    key: 'product',
    label: 'Product Manager',
    keywords: PRODUCT_KEYWORDS,
    core: ['Product Management', 'Product Roadmap', 'User Stories', 'Agile', 'Scrum', 'Jira', 'Market Research', 'Stakeholder Management', 'A/B Testing', 'MVP']
  },
  {
    key: 'qa',
    label: 'QA / Testing Engineer',
    keywords: QA_KEYWORDS,
    core: ['Selenium', 'Cypress', 'Playwright', 'Jest', 'Pytest', 'TestNG', 'TDD', 'BDD', 'API Testing', 'Postman']
  },
  {
    key: 'aiml',
    label: 'AI / ML Engineer',
    keywords: AIML_KEYWORDS,
    core: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Large Language Models', 'LangChain', 'RAG', 'MLOps', 'Pandas', 'NumPy', 'Statistics', 'Computer Vision', 'GenAI', 'Fine-tuning']
  },
  {
    key: 'fullstack',
    label: 'Full-Stack Engineer',
    keywords: FULLSTACK_KEYWORDS,
    core: ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node', 'Express', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'REST', 'GraphQL', 'CI/CD']
  },
  {
    key: 'frontend',
    label: 'Frontend Engineer',
    keywords: FRONTEND_KEYWORDS,
    core: ['JavaScript', 'TypeScript', 'React', 'Vue', 'HTML', 'CSS', 'Redux', 'Next.js', 'Tailwind', 'Jest', 'REST', 'GraphQL', 'Accessibility', 'Responsive Design', 'Design Systems']
  },
  {
    key: 'backend',
    label: 'Backend Engineer',
    keywords: BACKEND_KEYWORDS,
    core: ['Node', 'Python', 'Java', 'Express', 'REST', 'GraphQL', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Microservices', 'API Design', 'CI/CD']
  }
];

const ALL_KEYWORDS = [...new Set(ROLES.flatMap((r) => r.keywords))].sort((a, b) => b.length - a.length);

const FALLBACK_CORE_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node', 'Express', 'GraphQL', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Jest', 'Git', 'Microservices'
];

module.exports = { ROLES, ALL_KEYWORDS, FALLBACK_CORE_SKILLS };
