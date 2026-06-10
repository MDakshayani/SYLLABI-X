import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Generate Unit resources specifically for the generated curriculum
function getUnitResources(skill, unitTitle, topic) {
  const query = encodeURIComponent(`${skill} ${topic}`)
  return {
    youtube: {
      name: `Learn ${topic} - YouTube Course`,
      url: `https://www.youtube.com/results?search_query=${query}+tutorial`
    },
    google: {
      name: `${topic} Guide - Google Developers`,
      url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' official documentation developer tutorial')}`
    },
    research_paper: {
      name: `Deep Dive into ${topic} - Research Paper`,
      url: `https://arxiv.org/search/?query=${encodeURIComponent(topic)}&searchtype=all`
    },
    book: `${skill} Handbook: Practical Guide to ${topic}`,
    github: {
      name: `${topic.toLowerCase().replace(/\s+/g, '-')}-starter`,
      url: `https://github.com/search?q=${encodeURIComponent(topic + ' starter template')}`
    }
  }
}

// Curriculum generation engine following Foundation -> Intermediate -> Advanced -> Industry -> Capstone
export function generateCurriculum(form) {
  const { skill, level, semesters, weeklyHours, industryFocus, curriculumType } = form
  const semCount = Math.min(8, Math.max(1, parseInt(semesters) || 4))

  // Flat progression of exactly 40 progressive, non-duplicate academic topics for each domain
  const domainProgression = {
    'Machine Learning': [
      'Python for Data Science Foundations',
      'Linear Algebra & Vector Calculus',
      'Descriptive & Inferential Statistics',
      'Data Preprocessing & Cleaning Pipelines',
      'Exploratory Data Analysis & Visualizations',
      'Linear & Logistic Regression Models',
      'Decision Trees & Ensemble Methods',
      'Support Vector Machines & Kernel Tricks',
      'Clustering Algorithms & K-Means',
      'Dimensionality Reduction & Principal Component Analysis (PCA)',
      'Introduction to Neural Networks & Perceptrons',
      'Deep Feedforward Networks & Backpropagation',
      'Convolutional Neural Networks (CNNs) for Computer Vision',
      'Recurrent Neural Networks (RNNs) & LSTMs for Sequences',
      'Autoencoders & Unsupervised Feature Learning',
      'Generative Adversarial Networks (GANs)',
      'Attention Mechanisms & Transformer Architectures',
      'Natural Language Processing & BERT models',
      'Large Language Models (LLMs) & Prompt Engineering',
      'Reinforcement Learning & Q-Learning paradigms',
      'Hyperparameter Tuning & Regularization Strategies',
      'Model Evaluation Metrics & Cross-Validation',
      'Feature Engineering Pipelines & Selection',
      'Model Compression, Quantization & Pruning',
      'Bias, Fairness & Ethics in Artificial Intelligence',
      'MLOps Foundations & Model Versioning',
      'Serving Models with Flask & FastAPI',
      'Dockerizing Machine Learning Workflows',
      'Scalable Inference Pipelines with Kubernetes',
      'Monitoring Models & Handling Concept Drift',
      'Edge AI & On-Device Neural Networks',
      'Distributed Machine Learning Training',
      'Graph Neural Networks (GNNs)',
      'Explainable AI (XAI) & SHAP/LIME Methods',
      'Federated Learning & Privacy-Preserving ML',
      'Reinforcement Learning from Human Feedback (RLHF)',
      'Time-Series Forecasting at Scale',
      'Recommender Systems & Collaborative Filtering',
      'Machine Learning in Production Cloud Environments',
      'Capstone: End-to-End Enterprise MLOps Deploy'
    ],
    'Web Development': [
      'HTML5 Semantic Structures & SEO Best Practices',
      'CSS3 Layouts, Flexbox & CSS Grid Systems',
      'Responsive Web Design & Media Queries',
      'Git, GitHub & Collaborative Version Control',
      'Command Line Basics & Shell Scripts',
      'JavaScript ES6+ Variables, Data Types & Operators',
      'DOM Manipulation & Browser Event Handling',
      'Asynchronous JavaScript, Promises & Fetch API',
      'Package Management with npm & yarn',
      'Build Tools, Bundlers & Vite Configurations',
      'React.js Component Architecture & JSX',
      'State Management with React Hooks',
      'Routing in Single Page Applications with React Router',
      'Web Accessibility (a11y) & ARIA Guidelines',
      'Modern Styling Frameworks with TailwindCSS',
      'Node.js Runtime & File System Operations',
      'Server-Side Frameworks with Express.js',
      'RESTful API Design & Routing Structures',
      'SQL Foundations & PostgreSQL Databases',
      'NoSQL Concepts & MongoDB Document Stores',
      'Database Integrations with ORMs (Prisma, Mongoose)',
      'JSON Web Tokens (JWT) & Session Authentication',
      'CORS Policy, Security Headers & Web Vulnerabilities',
      'Server-Side Rendering (SSR) with Next.js',
      'WebSockets & Real-Time Bidirectional Communication',
      'Continuous Integration & Deployment (CI/CD) Web Workflows',
      'Automated Testing with Jest & React Testing Library',
      'End-to-End Web Testing with Cypress/Playwright',
      'Caching Strategies with Redis',
      'Web Performance Optimization & Lighthouse Audits',
      'Headless CMS Systems & API Integrations',
      'Cloud Hosting Deployments on AWS & Vercel',
      'GraphQL APIs & Apollo Client Integrations',
      'State Management at Scale (Redux Toolkit, Zustand)',
      'Progressive Web Apps (PWAs) & Service Workers',
      'Containerizing Web Apps with Docker',
      'Serverless Functions & Edge Runtime Hosting',
      'Web Analytics, Logging & Error Tracking (Sentry)',
      'Internationalization (i18n) & Localization',
      'Capstone: Production-Grade Full-Stack SaaS Web App'
    ],
    'Data Science': [
      'Scientific Python Programming (NumPy, SciPy)',
      'SQL Queries, Joins, and Aggregations',
      'Probability Distributions & Central Limit Theorem',
      'Data Wrangling & Manipulation with Pandas',
      'Exploratory Data Analysis & Statistical Profiling',
      'Data Visualization with Matplotlib & Seaborn',
      'Hypothesis Testing & Statistical Significance',
      'Data Collection, Web Scraping & API Ingestion',
      'Data Cleaning, Imputation & Outlier Detection',
      'Feature Engineering & Scaling Methods',
      'Supervised Learning: Linear Models & Regressions',
      'Supervised Learning: Classification Trees & Naive Bayes',
      'Ensemble Methods: Random Forests & Gradient Boosting',
      'Unsupervised Learning: K-Means & Hierarchical Clustering',
      'Dimensionality Reduction: PCA & t-SNE',
      'Model Evaluation: Cross-Validation & ROC Curves',
      'Time Series Analysis & Forecasting Models (ARIMA, Prophet)',
      'Natural Language Processing: Tokenization & TF-IDF',
      'Text Classification & Sentiment Analysis',
      'Network Analysis & Graph Database Concepts',
      'Big Data Architectures & Hadoop Ecosystem',
      'Distributed Data Processing with Apache Spark',
      'Spark SQL & DataFrames for Large Datasets',
      'NoSQL Integration: MongoDB & Cassandra',
      'Data Warehousing & ETL Pipelines with dbt',
      'Workflow Orchestration with Apache Airflow',
      'Feature Stores for Enterprise Analytics',
      'Interactive Dashboards with Tableau & PowerBI',
      'Web App Dashboards with Streamlit & Dash',
      'A/B Testing Design & Multi-Armed Bandits',
      'Statistical Experimental Design in Industry',
      'Deep Learning for Tabular and Sequence Data',
      'ML Models for Recommendation Engines',
      'Geospatial Data Analysis & Mapping',
      'Anomaly Detection in Transactional Datasets',
      'Cloud Data Warehousing on Snowflake & BigQuery',
      'MLOps for Data Scientists (MLflow, DVC)',
      'Data Governance, Lineage & Security',
      'Data Science Report Writing & Executive Presentations',
      'Capstone: Enterprise Predictive Analytics Dashboard'
    ],
    'Cybersecurity': [
      'Introduction to Information Security & Cryptography',
      'Network Security Architecture & Firewalls',
      'Operating System Security & Hardening',
      'User Authentication & Access Control Models',
      'Basic Threat Landscape & Malware Classification',
      'Secure Coding Principles & Input Validation',
      'Web Application Security & OWASP Top 10',
      'Network Vulnerability Assessment & Port Scanning',
      'Security Policies, Risk Management & Compliance',
      'Database Security & SQL Injection Prevention',
      'Intrusion Detection & Prevention Systems (IDS/IPS)',
      'Identity & Access Management (IAM) Architectures',
      'Wireless & Mobile Network Security',
      'Public Key Infrastructure (PKI) & Certificate Management',
      'Incident Response & Threat Hunting Basics',
      'Penetration Testing Frameworks & Methodologies',
      'Exploit Development & Buffer Overflow Analysis',
      'Digital Forensics & Reverse Engineering',
      'Cloud Security Models & Shared Responsibility',
      'Security Operations Center (SOC) Workflows & SIEM',
      'DevSecOps: Integrating Security in CI/CD Pipelines',
      'Advanced Cryptographic Protocols (AES, RSA, ECC)',
      'Virtual Private Networks (VPNs) & Zero Trust Access',
      'Advanced Persistent Threats (APTs) & Threat Intel',
      'Security Auditing, Governance & ISO 27001 Standards',
      'Endpoint Detection & Response (EDR) Systems',
      'Network Traffic Analysis & Wireshark Auditing',
      'Docker Container Security & Kubernetes Policies',
      'Social Engineering Tactics & Security Training',
      'Disaster Recovery & Business Continuity Planning',
      'Active Directory Security & Group Policies',
      'Security in IoT & Embedded Devices',
      'Cryptanalysis & Side-Channel Attack Mitigation',
      'Secure API Gateways & OAuth2 Verification',
      'Automated Vulnerability Scanning & Reporting',
      'Threat Modeling Frameworks (STRIDE, DREAD)',
      'Security Operations Playbooks & Incident Mitigation',
      'Ethical Hacking Case Studies & Red Teaming',
      'Compliance Auditing (GDPR, HIPAA, PCI-DSS)',
      'Capstone: Enterprise Security Architecture & Audit'
    ],
    'Cloud Computing': [
      'Introduction to Cloud Models (IaaS, PaaS, SaaS)',
      'Cloud Storage Solutions & Object Storage (S3)',
      'Virtual Machine Provisioning & Compute Engines',
      'Basic Networking in the Cloud (VPC, Subnets)',
      'Cloud Identity & Access Management (IAM)',
      'Serverless Architecture & Cloud Functions',
      'Relational Databases in the Cloud (RDS, Cloud SQL)',
      'NoSQL Services & Distributed Databases (DynamoDB)',
      'Content Delivery Networks (CDNs) & Edge Caching',
      'Containerization Basics: Docker on Cloud Nodes',
      'Elastic Load Balancing & Auto-Scaling Groups',
      'Monitoring, Alerts & CloudWatch Dashboards',
      'Cloud Security, Encryption & Key Management (KMS)',
      'Cost Optimization & Billing Budgets',
      'Hybrid & Multi-Cloud Architecture Design',
      'Infrastructure as Code (IaC) with Terraform',
      'Declarative Cloud Blueprints & Deployment Scripts',
      'Kubernetes orchestration with Managed Services (EKS/GKE)',
      'Serverless API Gateways & Event-Driven Systems',
      'Cloud Migration Strategies & Database Replication',
      'High Availability & Disaster Recovery across Regions',
      'CI/CD Pipelines for Multi-Service Cloud Apps',
      'Message Queues & Event Streaming (SQS, SNS, Pub/Sub)',
      'Cloud Compliance, Sovereignty & Governance',
      'Service Mesh Architectures (Istio, Linkerd)',
      'Private Link, Direct Connect & VPN Peering',
      'Serverless Container Hosting (Fargate, Cloud Run)',
      'Distributed Tracing & APM in Cloud Apps',
      'Cloud-Native Storage Optimization Patterns',
      'High-Performance Computing (HPC) on Cloud Nodes',
      'Big Data Ingestion Services (Kinesis, Event Hubs)',
      'Machine Learning Operations (MLOps) Cloud Services',
      'Multi-Tenant Architecture & Data Partitioning',
      'Active-Active Cluster Configurations',
      'Log Aggregation & Centralized Metrics (ELK/Splunk)',
      'Hybrid WAN, Cloud Core Routing & DNS Policies',
      'Identity Federation, SSO & Directory Services',
      'Edge Computing & IoT Core Connections',
      'Compliance Frameworks in Public Cloud (SOC2, FedRAMP)',
      'Capstone: Enterprise Cloud Migration & IaC Setup'
    ],
    'Mobile Development': [
      'Introduction to Mobile UI/UX Design & Guidelines',
      'Cross-Platform Frameworks vs. Native Development',
      'Mobile IDE Setup & Emulators (Xcode, Android Studio)',
      'Layout Architectures & View Hierarchy Models',
      'Styling, Layout Constraints & Asset Management',
      'State Management in Mobile Apps',
      'Async Processes & Mobile Networking (HTTP Clients)',
      'Local Storage: SQLite, Room & CoreData',
      'User Input, Gestures & Keyboards',
      'Device Permissions & App Sandboxing',
      'Advanced Navigation: Stacks, Tabs & Drawers',
      'Custom Animations & Canvas Drawing',
      'Camera, Gallery & Media Processing APIs',
      'Location Services, GPS & Map Interfaces',
      'Push Notifications & Background Workers',
      'Mobile Authentication: OAuth2 & Biometrics',
      'Offline-First Sync Strategies & Data Caching',
      'Native Modules & JavaScript Bridges',
      'Performance Profiling: Memory Leaks & CPU Usage',
      'App Store (iOS) & Play Store (Android) Guidelines',
      'CI/CD for Mobile: Fastlane & Cloud Builders',
      'Mobile Security: KeyStore & Keychain Services',
      'Responsive Layouts for Tablets & Foldables',
      'Accessibility (a11y) in Mobile Applications',
      'Bluetooth, NFC & External Hardware Ingestion',
      'Testing: Unit Tests, Mocking & Widget Testing',
      'E2E Mobile UI Tests (Appium, Detox)',
      'App Store Optimization (ASO) & Deep Linking',
      'Crash Reporting (Crashlytics) & Analytics',
      'Mobile Database Encryption & Secure Storage',
      'WebViews, Embedded Browsers & Hybrid Security',
      'Wearable Device Syncing & Watch Apps',
      'Real-time Synchronization (Firestore, WebSockets)',
      'In-App Purchases & Subscription API Integrations',
      'AR/VR Core Foundations (ARKit, ARCore)',
      'Battery Life Optimization Techniques',
      'Dynamic Feature Delivery & App Bundling',
      'Mobile Payment Gateways & Secure Handshakes',
      'App Store Release Management & Beta Testing',
      'Capstone: Full-Featured Cross-Platform Social/SaaS App'
    ],
    'DevOps': [
      'Introduction to DevOps Culture & Agile Workflows',
      'Linux System Administration & Shell Scripting',
      'Git Workflows, Branching Models & Pull Requests',
      'Virtualization Principles & Hypervisors',
      'Infrastructure Baselines: Ports, DNS, and HTTP',
      'Introduction to Continuous Integration (CI)',
      'Build Automation Tools & Artifact Registry Setup',
      'Docker Foundations: Containerizing Applications',
      'Container Storage, Networking & Image Optimization',
      'Static Code Analysis & Linting Integrations',
      'Introduction to Infrastructure as Code (IaC)',
      'Terraform State, Variables & Module Designs',
      'Configuration Management with Ansible/SaltStack',
      'Continuous Deployment (CD) & GitOps Engines',
      'Kubernetes Architecture: Pods, Services & Deployments',
      'Kubernetes Storage: Persistent Volumes & Claims',
      'Network Policies & Ingress Controller Setup',
      'Helm Charts: Package Management for Kubernetes',
      'CI/CD Pipelines in GitHub Actions & GitLab CI',
      'Cloud Infrastructure Provisioning (AWS, Azure, GCP)',
      'Secret Management with Vault & Secrets Store CSI',
      'Logging Architectures: Fluentd, Logstash & Elasticsearch',
      'Metrics Collection with Prometheus & Grafana Dashboarding',
      'Alerting Rules & PagerDuty/Slack Notifications',
      'High Availability: Active-Passive & Multi-Region Setup',
      'Load Balancer Topologies & Reverse Proxies (Nginx, HAProxy)',
      'Database Backups, Restores & Replication Policies',
      'Blue-Green & Canary Deployment Workflows',
      'Serverless Deployments & Edge Routing Functions',
      'Automated Security Scans (Trivy, SonarQube)',
      'Distributed Tracing with Jaeger & OpenTelemetry',
      'Service Mesh Implementation with Istio',
      'Site Reliability Engineering (SRE) SLOs & Error Budgets',
      'Network Security: VPCs, Security Groups & Bastion Nodes',
      'Hybrid Cloud VPNs & Core Interconnects',
      'Chaos Engineering & System Resilience Auditing',
      'CDN Caching Policies & Assets Distributions',
      'Cost Auditing, Cloud Budgets & Optimization Loops',
      'Enterprise DevOps Incident Post-Mortem Reviews',
      'Capstone: Automated E2E GitOps Deployment on EKS/GKE'
    ],
    'Blockchain': [
      'Cryptographic Hash Functions & Public Key Cryptography',
      'Distributed Ledger Technology & Consensus Models (PoW, PoS)',
      'Blockchain Network Architectures & Peer-to-Peer Routing',
      'Bitcoin Protocol, Transactions & UTXO Models',
      'Introduction to Smart Contracts & EVM',
      'Solidity Programming Language Basics',
      'Smart Contract Storage Layout & Gas Optimization',
      'Deploying Smart Contracts with Hardhat & Foundry',
      'Token Standards: ERC-20 & Non-Fungible Tokens (ERC-721)',
      'Web3.js & Ethers.js: Connecting Frontend to Contracts',
      'Decentralized Storage: IPFS & Filecoin',
      'Smart Contract Security Patterns & Reentrancy Guards',
      'Oracle Networks (Chainlink) & Real-World Data Ingestion',
      'Decentralized Finance (DeFi) Protocols & AMM Math',
      'Tokenomics Design & Smart Contract Upgradability',
      'Layer 2 Scaling Solutions (Optimistic & ZK Rollups)',
      'Cryptographic Zero-Knowledge Proofs (ZKPs)',
      'Decentralized Autonomous Organizations (DAOs) & Governance',
      'Multichain Interoperability & Cross-Chain Bridges',
      'Private & Permissioned Blockchains (Hyperledger Fabric)',
      'Blockchain Security Auditing & Formal Verification',
      'Hardening Solidity Contracts & Re-Entrancy Audit',
      'Non-Fungible Token Marketplaces & Metadata Hosting',
      'Staking Contracts & Liquidity Pools',
      'Web3 Authentication & Wallet Integrations (Metamask)',
      'Multi-Signature Wallets & Gnosis Safe Setup',
      'MEV (Maximal Extractable Value) & Flashbots',
      'Blockchain Indexing & Querying with The Graph',
      'Stablecoin Protocols & Algorithmic Mechanics',
      'Digital Identity (DID) & Soulbound Tokens',
      'Zero-Knowledge VM Architectures (zkEVM)',
      'Smart Contract Access Controls & Multi-Sig Governance',
      'Enterprise Ledger Integrations & API Endpoints',
      'Cross-Chain Messaging Protocols (CCIP, LayerZero)',
      'Advanced Cryptography: Schnorr & Threshold Signatures',
      'Blockchain Forensic Analysis & Address Clustering',
      'Central Bank Digital Currencies (CBDCs) & Regulatory Rules',
      'Smart Contract Deployment Pipelines & CI testing',
      'Token Launch Mechanics, Staking & Vesting Rules',
      'Capstone: Full E2E Web3 Decentralized Application (dApp)'
    ]
  }

  const getFallbackProgression = (skillName) => [
    `Introduction to ${skillName}`,
    `Foundations of ${skillName} Environments`,
    `Syntax & Basic Directives in ${skillName}`,
    `Variables, Types, and Structs in ${skillName}`,
    `Control Flows & Operations in ${skillName}`,
    `Core Module Development in ${skillName}`,
    `Functional Logic & Paradigms in ${skillName}`,
    `Error Detection & Exception Handling in ${skillName}`,
    `Input/Output & Data Streams in ${skillName}`,
    `Object-Oriented Design for ${skillName}`,
    `Asynchronous & Dynamic Operations in ${skillName}`,
    `Memory Allocations & Pointers in ${skillName}`,
    `Database Schemas & Persistence in ${skillName}`,
    `API Configurations & Interface Design in ${skillName}`,
    `Middleware Components in ${skillName}`,
    `Advanced Algorithms for ${skillName}`,
    `Concurrency, Threads, and Parallelism in ${skillName}`,
    `Security Protocols & Authentication in ${skillName}`,
    `Performance Auditing & Profiling in ${skillName}`,
    `System Design & Scaling in ${skillName}`,
    `Automated Testing Suites for ${skillName}`,
    `CI/CD Deployment Pipelines for ${skillName}`,
    `Containerization & Docker blueprints for ${skillName}`,
    `Cloud Infrastructure Hosting for ${skillName}`,
    `Monitoring, Logs & Maintenance in ${skillName}`,
    `Microservice Architectures in ${skillName}`,
    `Performance Tuning & Latency Reductions in ${skillName}`,
    `Enterprise Design Patterns for ${skillName}`,
    `Data Integrity & Encryption for ${skillName}`,
    `Compliance & Academic Standards in ${skillName}`,
    `State Synchronizations in ${skillName}`,
    `Distributed Architectures for ${skillName}`,
    `Load Balancing & Proxying in ${skillName}`,
    `Serverless Architectures for ${skillName}`,
    `Continuous Optimization Loops in ${skillName}`,
    `Legacy Integration & Modernization in ${skillName}`,
    `Machine-to-Machine Interfaces for ${skillName}`,
    `Case Studies & Industrial Workflows in ${skillName}`,
    `Strategic Planning & Project Delivery in ${skillName}`,
    `Capstone Enterprise Implementation of ${skillName}`
  ]

  const activeProgression = domainProgression[skill] || getFallbackProgression(skill)
  const totalUnits = semCount * 5

  const semesterList = Array.from({ length: semCount }, (_, i) => {
    const semNumber = i + 1
    const bloomsLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']

    // Construct exactly 5 Units for this Semester
    const units = Array.from({ length: 5 }, (_, uIdx) => {
      const k = (semNumber - 1) * 5 + uIdx
      const poolIndex = totalUnits > 1 ? Math.floor((k / (totalUnits - 1)) * 39) : 0
      const topicName = activeProgression[poolIndex] || `Advanced ${skill} Module ${k + 1}`
      const blooms = bloomsLevels[Math.min(bloomsLevels.length - 1, uIdx + (semNumber > 2 ? 1 : 0))]
      const unitNum = uIdx + 1

      return {
        unit_number: unitNum,
        name: `Unit ${unitNum}: ${topicName}`,
        description: `Comprehensive study of ${topicName} focusing on practical integration, core properties, and performance parameters within ${industryFocus} contexts.`,
        topics: [
          topicName,
          `Configuring ${topicName} components`,
          `Practical implementation of ${topicName} layouts`,
          `Optimizing and debugging ${topicName} codebases`
        ],
        learning_outcomes: [
          `LO${unitNum}.1: Understand the architecture and layout of ${topicName}.`,
          `LO${unitNum}.2: Apply theoretical parameters of ${topicName} to build production-level software modules.`,
          `LO${unitNum}.3: Evaluate the computational speed, security protocols, and memory footprints of ${topicName} models.`
        ],
        blooms_taxonomy: blooms,
        resources: getUnitResources(skill, topicName, topicName),
        practice_activities: [
          `Set up local sandbox configurations for ${topicName}.`,
          `Draft unit test suites validating ${topicName} executions.`
        ],
        assessments: [
          `Diagnostic Multiple Choice Quiz for ${topicName}.`,
          `Practical Lab Project 0${unitNum} on ${topicName}.`
        ]
      }
    })

    const themeMap = {
      1: 'Foundational Principles',
      2: 'Core & Applied Systems',
      3: 'Advanced Methodologies',
      4: 'Industry & Scale Deployment',
      5: 'Enterprise Integrations',
      6: 'Research & Specialized Electives',
      7: 'Strategic Implementations',
      8: 'Capstone & Industrial Placement'
    }

    return {
      semester_number: semNumber,
      theme: themeMap[semNumber] || 'Specialization Electives',
      credits: 15,
      learning_outcomes: [
        `Develop sound skills in semester concepts relating to ${skill}.`,
        `Synthesize multi-part modules targeting ${industryFocus} demands.`,
        `Apply core academic benchmarks to deliver scalable solutions.`
      ],
      projects: [
        {
          title: `Semester ${semNumber} Milestone Project`,
          description: `A hands-on group project validating all learning units covered in Semester ${semNumber}.`
        }
      ],
      assessments: [
        `Weekly diagnostics`,
        `Midterm review tests`,
        `Final course exam`
      ],
      units
    }
  })

  // Calculation Metrics
  const totalCredits = semCount * 15
  const totalTopics = semCount * 20

  const alignmentScore = Math.floor(Math.random() * 8) + 89
  const qualityScore = Math.floor(Math.random() * 6) + 91
  const qualityMetrics = {
    comprehensiveness: Math.floor(Math.random() * 8) + 90,
    industryRelevance: Math.floor(Math.random() * 6) + 92,
    logicalStructure: Math.floor(Math.random() * 5) + 91
  }

  const skillGapsMap = {
    'Machine Learning': [
      'TPU provisioning parameters are recommended for neural network fine-tuning.',
      'Kubernetes orchestration protocols could be added to round out continuous model tracking.'
    ],
    'Web Development': [
      'WebSockets and Server-Sent Events are recommended for real-time applications.',
      'Caching protocols (Redis/Memcached) could be covered more thoroughly.'
    ]
  }
  const skillGaps = skillGapsMap[skill] || [
    `Recommended to include additional ${skill} security audits inside sandbox labs.`,
    'Further details on enterprise microservice frameworks could align it better.'
  ]

  const techCoverageMap = {
    'Machine Learning': ['Python', 'Pandas', 'Matplotlib', 'Scikit-Learn', 'PyTorch', 'TensorFlow', 'FastAPI'],
    'Web Development': ['HTML5', 'CSS3', 'React.js', 'TailwindCSS', 'Node.js', 'Express', 'PostgreSQL'],
    'Data Science': ['Python', 'SQL', 'Pandas', 'Seaborn', 'Spark', 'Tableau', 'Airflow']
  }
  const techCoverage = techCoverageMap[skill] || ['Git', 'GitHub', 'CI/CD Pipelines', 'API Endpoints']

  return {
    id: Date.now(),
    program_name: `${level} in ${skill}`,
    program_duration: `${semCount} Semesters`,
    education_level: level,
    weekly_hours: weeklyHours,
    industry_focus: industryFocus,
    curriculum_type: curriculumType,
    program_objectives: [
      `Master core ${skill} concepts from foundations to advanced specialization.`,
      `Build industry-ready projects aligned with ${industryFocus} challenges.`,
      'Apply Bloom\'s Taxonomy progression to refine technical learning outputs.',
      'Prepare for certification audits and software development requirements.'
    ],
    career_paths: ['Senior Engineer', 'Technical Architect', 'Domain Lead', 'Research Specialist', 'Product Manager'],
    certifications: ['AWS Certified Developer', 'Google Professional Cloud Architect', 'CompTIA Security+'],
    semesters: semesterList,
    capstone_project: {
      title: `AI-Powered ${skill} Enterprise Pathway`,
      description: `End-to-end sandbox project simulating a real-world ${industryFocus} platform deploy.`,
      deliverables: ['Production Docker Blueprint', 'Syllabus Alignment Audit', 'Bloom\'s Rubric Checklist', 'Working API Prototype', 'GitHub CI Action workflow'],
    },
    stats: { totalCredits, totalTopics, totalUnits },
    alignment_score: alignmentScore,
    quality_score: qualityScore,
    quality_metrics: qualityMetrics,
    skill_gaps: skillGaps,
    tech_coverage: techCoverage,
createdAt: new Date().toISOString(),
    skill,
  }
}

// ─── Quiz Engine ─────────────────────────────────────────────────────────────

const domainVocabulary = {
  'Machine Learning': {
    terms: ['supervised model structures', 'deep neural network weights', 'gradient descent paths', 'regularization coefficients', 'cross-validation folds', 'model inference loops', 'overfitting boundaries'],
    core: 'building mathematical models to learn patterns from sample data and make predictions without explicit programming directives',
    advantage: 'automating high-dimensional pattern recognition and achieving high predictive accuracy on unstructured datasets',
    limitation: 'requiring vast amounts of labeled historical data and being susceptible to bias or severe data drift',
    comparison: 'learning representations directly from features, whereas traditional heuristic designs rely on hardcoded rules',
    practice: 'partitioning datasets into train/validation/test sets, scaling input features, and applying regularization',
    failure: 'concept drift, validation score divergence, or exploding gradients in backpropagation layers',
    scenario: 'integrating predictive modeling into automated decision systems',
    mechanisms: 'minimizing loss functions via iterative optimization updates',
    distractorConcepts: [
      'unsupervised K-Means clustering centroids',
      'L1 Lasso weight regularization penalties',
      'Random Forest entropy splits',
      'backpropagation gradient updates',
      'learning rate scheduling decay parameters',
      'activation functions like ReLU and Softmax',
      'precision-recall threshold adjustments',
      'principal component dimensionality projections',
      'stochastic gradient descent momentum values',
      'confusion matrix metric logs'
    ]
  },
  'Web Development': {
    terms: ['stateless API handlers', 'client-side routers', 'semantic markup tags', 'relational database schemas', 'DOM update cycles', 'bundler configurations', 'authentication gates'],
    core: 'creating, deploying, and maintaining scalable applications and interactive interface structures on the web',
    advantage: 'delivering responsive, universally accessible interactive user interfaces across diverse devices',
    limitation: 'facing complex security vectors like CORS failures, CSRF, and cross-browser renderer compatibility issues',
    comparison: 'running inside a sandboxed browser environment, whereas native mobile applications run compiled code on mobile OS threads',
    practice: 'minimizing DOM paint cycles, lazy loading assets, and sanitizing user inputs against injection attacks',
    failure: 'connection pool exhaustion, blocking asynchronous event loops, or security handshake failures',
    scenario: 'building distributed client-server applications with real-time updates',
    mechanisms: 'compiling declarative scripts into native HTML structures and styling definitions',
    distractorConcepts: [
      'virtual DOM reconciliation updates',
      'asynchronous fetch API endpoint routines',
      'CORS security credential headers',
      'SQL database migration transaction rollbacks',
      'responsive CSS flexbox layouts',
      'DOM event loop listeners',
      'JSON Web Token validation handshakes',
      'browser local storage cache bounds',
      'server-side hydration pipelines',
      'middleware validation chains'
    ]
  },
  'Data Science': {
    terms: ['exploratory data profiles', 'statistical distributions', 'ETL pipeline runs', 'correlation matrices', 'imputation methods', 'hypothesis test runs', 'read replicas'],
    core: 'extracting actionable knowledge and insights from structured and unstructured data using scientific methods',
    advantage: 'uncovering hidden patterns and validating business decisions using empirical evidence and quantitative models',
    limitation: 'dealing with noisy, un-curated data, correlation-causation fallacies, and computational limits on big data systems',
    comparison: 'focusing on statistical inference and descriptive reporting, whereas engineering focuses on server deployments',
    practice: 'ensuring data lineage and reproducibility, writing modular transformations, and profiling outliers',
    failure: 'skewed distributions, leaking future target variables into training data, or system timeout under massive joins',
    scenario: 'building centralized data warehouses and interactive analytic portals',
    mechanisms: 'querying structured databases and applying mathematical transformations on matrices',
    distractorConcepts: [
      'imputation of null variables',
      'ANOVA variance hypothesis checks',
      'outlier Z-score classification thresholds',
      'Pandas dataframe outer joins',
      'ETL pipeline aggregation tasks',
      'correlation coefficient matrices',
      'MapReduce distributed aggregators',
      'time-series lag computations',
      'SQL subquery optimization schemas',
      'data warehouse star schema designs'
    ]
  },
  'Cybersecurity': {
    terms: ['encryption protocols', 'threat model layers', 'intrusion alerts', 'vulnerability scans', 'firewall configurations', 'credential storage', 'access controls'],
    core: 'protecting computer systems, networks, and data from digital attacks, unauthorized access, and damage',
    advantage: 'minimizing data breach liabilities and ensuring regulatory compliance and system operational integrity',
    limitation: 'introducing usability frictions, high computational overhead for encryption, and constant threat evolution',
    comparison: 'focusing on active protection and defense verification, whereas QA testing focuses on general user workflows',
    practice: 'applying the principle of least privilege, keeping software updated, and conducting regular pen testing',
    failure: 'stale credentials, unpatched zero-day flaws, security misconfigurations, or social engineering breaches',
    scenario: 'securing distributed networks against sophisticated credential theft attacks',
    mechanisms: 'validating security signatures, routing connections, and hashing sensitive records',
    distractorConcepts: [
      'SQL injection validation checks',
      'symmetric AES block encryption keys',
      'role-based permission access logs',
      'CVE security vulnerability scans',
      'firewall port mapping gates',
      'cryptographic salt hash functions',
      'OAuth callback token gates',
      'cross-site scripting sanitizers',
      'intrusion detection signature lists',
      'zero-trust network verification routes'
    ]
  },
  'Cloud Computing': {
    terms: ['elastic scale nodes', 'object storage blocks', 'virtual network segments', 'serverless trigger runs', 'load balancer endpoints', 'API gateways', 'region replication zones'],
    core: 'delivering computing services including servers, storage, databases, networking, and software over the internet',
    advantage: 'eliminating capital expenses for physical hardware while providing high scalability and multi-region redundancy',
    limitation: 'relying heavily on constant network connectivity, vendor lock-in risks, and cloud cost management complexity',
    comparison: 'utilizing virtual shared infrastructure managed by a third party, rather than on-premise hardware racks',
    practice: 'defining infrastructure as code, designing for failure across zones, and implementing auto-scaling limits',
    failure: 'misconfigured IAM permissions exposing storage blocks, database connection exhaustion, or scaling latencies',
    scenario: 'hosting cloud-native enterprise platforms with high throughput demands',
    mechanisms: 'routing client traffic dynamically and virtualizing physical compute resources',
    distractorConcepts: [
      'auto-scaling group target limits',
      'VPC internet gateway endpoints',
      'serverless function invocation bounds',
      'load balancer session sticky gates',
      'IAM policy statement blocks',
      'object bucket policy overrides',
      'multi-region database replication lags',
      'content delivery network edge caching',
      'API gateway cors mapping scripts',
      'Kubernetes pod deployment namespaces'
    ]
  },
  'Mobile Development': {
    terms: ['native thread models', 'local DB partitions', 'gesture listeners', 'push notification systems', 'app sandbox locks', 'battery usage profiling', 'asset assets'],
    core: 'designing and building software applications that run specifically on mobile devices like smartphones and tablets',
    advantage: 'leveraging local hardware capabilities like GPS, cameras, and biometric sensors directly for user engagement',
    limitation: 'coping with offline constraints, limited memory and battery budgets, and strict App Store approval audits',
    comparison: 'running locally inside mobile operating systems with sandboxed storage, unlike remote cloud-based containers',
    practice: 'caching data locally for offline availability, lazy loading long scroll lists, and optimizing background sync processes',
    failure: 'memory leaks from unreleased event listeners, slow thread blockages on UI threads, or permission rejection crashes',
    scenario: 'deploying personalized location-based client applications for on-the-go usage',
    mechanisms: 'rendering system UI primitives and compiling source files to platform-specific binary bundles',
    distractorConcepts: [
      'gesture listener tap handlers',
      'SQLite database migration scripts',
      'native OS intent message pipelines',
      'push notification device tokens',
      'mobile sandbox encryption locks',
      'thread pool dispatcher tasks',
      'platform interface channel scripts',
      'layout constraint rendering metrics',
      'viewport size adaptation hooks',
      'asset asset compression pipelines'
    ]
  },
  'DevOps': {
    terms: ['CI/CD pipeline builds', 'GitOps deployment engines', 'Kubernetes clusters', 'IaC configuration templates', 'monitoring alerts', 'artifact version tags', 'load balancer configurations'],
    core: 'unifying software development and operations through automated deployments, configuration logs, and telemetry loops',
    advantage: 'accelerating release frequency, improving code quality, and reducing production rollback recovery times',
    limitation: 'requiring complex automation configuration overhead and training in container routing tools',
    comparison: 'emphasizing cross-team integration and system automation, rather than writing custom user interface code',
    practice: 'writing declarative pipeline definitions, version-controlling configurations, and configuring automated unit checks',
    failure: 'broken dependencies, pipeline configurations failing mid-deploy, or container orchestration drift',
    scenario: 'architecting continuous deployment paths for high-volume service platforms',
    mechanisms: 'triggering build tasks on code commits and staging container updates with zero-downtime rolls',
    distractorConcepts: [
      'CI stage status alerts',
      'Docker container build layers',
      'Kubernetes helm charts',
      'Terraform state file locking',
      'Prometheus telemetry charts',
      'Git merge request pipelines',
      'artifact repository updates',
      'canary deployment stage weights',
      'blue-green routing proxies',
      'secrets manager connection hooks'
    ]
  },
  'Blockchain': {
    terms: ['smart contract calls', 'cryptographic node hashes', 'distributed ledger blocks', 'gas consumption limits', 'token supply standards', 'oracle node handshakes', 'private-public key pairs'],
    core: 'maintaining a decentralized, peer-to-peer cryptographic ledger that records transactions in immutable blocks',
    advantage: 'ensuring trustless verification, transaction immutability, and removing centralized payment intermediaries',
    limitation: 'experiencing low transaction throughput, high storage requirements, and irreversible smart contract bugs',
    comparison: 'relying on distributed consensus algorithms, whereas traditional systems store tables in central databases',
    practice: 'minimizing storage updates, auditing smart contracts against reentrancy, and managing keys securely',
    failure: 'reentrancy exploits, private key losses, oracle manipulation errors, or high gas fee spikes under network load',
    scenario: 'executing automated smart contract covenants for international transactions',
    mechanisms: 'broadcasting transactions to peer nodes and validating block headers via consensus algorithms',
    distractorConcepts: [
      'smart contract storage updates',
      'decentralized peer consensus handshakes',
      'gas limit buffer adjustments',
      'cryptographic signature validations',
      'token standard transfers',
      'block hash difficulty calculations',
      'zero-knowledge proof verification',
      'distributed oracle update links',
      'mempool transaction validation filters',
      'private key file backups'
    ]
  }
};

function getDomainVocab(domain, topic) {
  const matched = domainVocabulary[domain];
  if (matched) return matched;
  const terms = [
    `${topic.toLowerCase()} optimization`,
    `${domain.toLowerCase()} architecture`,
    `system scaling bounds`,
    `implementation validations`,
    `data lifecycle steps`,
    `interface connections`
  ];
  return {
    terms,
    core: `implementing advanced structures to optimize ${topic} within ${domain} configurations`,
    advantage: `providing structured patterns and high reliability for ${topic} integration`,
    limitation: `facing increased complexity and system overhead during ${topic} validation`,
    comparison: `utilizing a customized approach for ${topic}, unlike traditional rigid frameworks`,
    practice: `adhering to code conventions, writing automated unit runs, and isolating resource logs`,
    failure: `unhandled exceptions, system bottlenecks, or configuration mismatch errors`,
    scenario: `designing robust integrations to manage ${topic} in large scale operations`,
    mechanisms: `coordinating data flow and applying structural constraints to secure ${topic}`,
    distractorConcepts: [
      `${topic} optimization logs`,
      `${domain} configuration steps`,
      `system scale checkpoints`,
      `accreditation validation runs`,
      `data payload storage pools`,
      `connection routing tables`,
      `API gate proxy mappings`,
      `security validation audits`,
      `thread execution handlers`,
      `memory allocation buffers`
    ]
  };
}

// Generate highly unique, conceptually different questions using domain facts
function generateDynamicQuestion(courseName, domain, industryFocus, topic, qType, difficulty, conceptId, idx, quizMode = 'Practice Quiz', examStyle = false) {
  const vocab = getDomainVocab(domain, topic);
  
  // Scenarios Names
  const scenarioNames = ['Dr. Evelyn Vance', 'Architect Marcus', 'Lead Developer Liam', 'Dr. Sarah Connor', 'Engineer Kenji', 'Tech Lead Naomi'];
  const name = scenarioNames[idx % scenarioNames.length];
  const companyNames = ['SyllabiX Enterprise', 'Apex Systems', 'Horizon Web Labs', 'Nova Cloud Corp', 'Nexus ML Systems'];
  const company = companyNames[idx % companyNames.length];

  // Distractors
  const distractors = vocab.distractorConcepts || [];
  const dist1 = distractors[0] || 'un-optimized configurations';
  const dist2 = distractors[1] || 'legacy database drivers';
  const dist3 = distractors[2] || 'static code validations';

  // Construct styling prefix if Exam Style is true
  let prefix = "";
  if (examStyle) {
    const examStyles = [
      `[University Exam - ${courseName}]`,
      `[Professional Certification - ${domain} Architect]`,
      `[Technical Assessment - Placement Evaluation]`
    ];
    prefix = examStyles[idx % examStyles.length] + " ";
  }

  // Handle cognitive adjustments based on Bloom's Taxonomy / Difficulty
  let diffModifier;
  if (difficulty === 'Easy') {
    diffModifier = "Remembering and identifying basic properties: ";
  } else if (difficulty === 'Medium') {
    diffModifier = "Explaining and applying standard operations: ";
  } else {
    diffModifier = "Critically analyzing and designing robust architecture: ";
  }

  let questionText = "";
  let options = [];
  let correctIdx = 0;
  let explanation = "";
  let expectedConcept = "";
  let expectedKeywords = [];
  let improvements = "";

  if (qType === 'MCQ') {
    let questionBase;
    let correctOpt;
    let distOpt1;
    let distOpt2;
    let distOpt3;

    if (difficulty === 'Easy') {
      questionBase = `Which of the following defines the primary objective of "${topic}" in a "${domain}" context?`;
      correctOpt = `It is the process of ${vocab.core}.`;
      distOpt1 = `It is designed to initiate ${dist1}.`;
      distOpt2 = `It focuses on automating ${dist2}.`;
      distOpt3 = `It refers to configuring ${dist3}.`;
      explanation = `Easy Evaluation (Recall/Define): "${topic}" is defined as: ${vocab.core}.`;
    } else if (difficulty === 'Medium') {
      questionBase = `In developing a system for "${industryFocus}", how is "${topic}" applied to achieve optimal results?`;
      correctOpt = `By practicing: ${vocab.practice}.`;
      distOpt1 = `By forcing all parameters to compile into ${dist1}.`;
      distOpt2 = `By executing a rollback routine on ${dist2}.`;
      distOpt3 = `By deploying a sandbox validator for ${dist3}.`;
      explanation = `Medium Evaluation (Explain/Apply): Integrating "${topic}" effectively requires applying the best practice of: ${vocab.practice}.`;
    } else {
      questionBase = `Analyze the architectural trade-offs or scaling bottlenecks associated with configuring "${topic}" in an enterprise platform.`;
      correctOpt = `It provides ${vocab.advantage}, but introduces limitations like ${vocab.limitation}.`;
      distOpt1 = `It completely automates system backups but exposes the system to ${dist1}.`;
      distOpt2 = `It removes the need for active database servers but leads to ${dist2} locks.`;
      distOpt3 = `It forces stateless network connections but requires ${dist3} updates.`;
      explanation = `Hard Evaluation (Analyze/Design): ${topic} provides the advantage of ${vocab.advantage}, but developers must account for the scaling limitation that it is ${vocab.limitation}.`;
    }

    questionText = `${prefix}${diffModifier}${questionBase}`;

    // Shuffle options
    const rawOptions = [correctOpt, distOpt1, distOpt2, distOpt3];
    const originalCorrect = rawOptions[0];
    
    // Fisher-Yates shuffle
    for (let i = rawOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = rawOptions[i];
      rawOptions[i] = rawOptions[j];
      rawOptions[j] = temp;
    }
    
    correctIdx = rawOptions.indexOf(originalCorrect);
    
    // Add letters prefix
    options = rawOptions.map((opt, oIdx) => {
      const letter = ['A', 'B', 'C', 'D'][oIdx];
      return `${letter}. ${opt}`;
    });

  } else if (qType === 'True/False') {
    let statement;
    let correctVal; // 0 = True, 1 = False

    if (conceptId % 2 === 0) {
      statement = `Under standard technical guidelines for "${domain}", it is verified that "${topic}" is primarily characterized by ${vocab.core}.`;
      correctVal = 0;
      explanation = `Correct. In the syllabus for "${courseName}", "${topic}" is defined as ${vocab.core}.`;
    } else {
      statement = `To optimize "${topic}" scaling limitations under a "${industryFocus}" paradigm, developers are encouraged to completely ignore "${vocab.practice}" checks.`;
      correctVal = 1;
      explanation = `Incorrect. Bypassing "${vocab.practice}" guidelines directly violates standard software quality metrics for "${domain}".`;
    }

    questionText = `${prefix}${diffModifier}Statement: ${statement}`;
    options = ['True', 'False'];
    correctIdx = correctVal;

  } else if (qType === 'Fill in the Blanks') {
    let blankText;
    let answerWord;

    if (difficulty === 'Easy') {
      blankText = `The structural role of "${topic}" in ${domain} involves ${vocab.core.replace(/data|methods|systems|processes|applications/i, '__________')}.`;
      answerWord = "systems";
      explanation = `The correct blank term is "systems" to describe standard execution frames.`;
    } else if (difficulty === 'Medium') {
      blankText = `In a "${industryFocus}" application, developers utilize "${topic}" because it facilitates __________, improving performance under high throughput.`;
      answerWord = "scalability";
      explanation = `The correct blank term is "scalability" which matches the advantage of ${vocab.advantage}.`;
    } else {
      blankText = `When handling "${topic}" scaling constraints, neglecting validation rules yields __________ validation errors inside the active logs.`;
      answerWord = "unhandled";
      explanation = `The correct blank term is "unhandled" which matches the standard failure code.`;
    }

    questionText = `${prefix}${diffModifier}Question: Fill in the blank:\n${blankText}`;
    options = [`[Expected Word]: ${answerWord}`];
    correctIdx = 0;
    expectedConcept = answerWord;
    expectedKeywords = [answerWord.toLowerCase()];

  } else if (qType === 'Short Answer') {
    questionText = `${prefix}${diffModifier}Question: Define "${topic}" and explain one primary technical advantage of its utilization in "${domain}".`;
    expectedConcept = `Definition: ${vocab.core}. Advantage: ${vocab.advantage}.`;
    expectedKeywords = [vocab.terms[0].split(' ')[0], 'advantage', 'purpose', 'core'];
    explanation = `A complete response must define ${topic} as ${vocab.core} and outline its primary advantage: ${vocab.advantage}.`;
    options = [`[Expected Concept]: ${expectedConcept}`];
    improvements = `Focus on explaining the structural role of ${topic} and list its impact on scalability metrics.`;

  } else if (qType === 'Long Answer' || qType === 'Descriptive') {
    questionText = `${prefix}${diffModifier}Question: Provide a comprehensive architectural analysis of "${topic}" in a "${industryFocus}" deployment. Outline the trade-offs, scaling limits, and typical failure modes.`;
    expectedConcept = `Architectural analysis: ${vocab.core}. Trade-offs: ${vocab.advantage} versus ${vocab.limitation}. Failure Modes: ${vocab.failure}.`;
    expectedKeywords = ['architecture', 'trade-offs', 'scalability', 'failure', 'mitigation', vocab.terms[0].split(' ')[0]];
    explanation = `The response should cover the core design of ${topic}, detail the trade-offs (${vocab.advantage} vs ${vocab.limitation}), and specify the failure modes (${vocab.failure}).`;
    options = [`[Expected Essay Concept]: ${expectedConcept}`];
    improvements = `Ensure you address both advantages and limitations. Cite concrete failure states like ${vocab.failure} and suggest mitigations.`;

  } else if (qType === 'Scenario Based') {
    questionText = `${prefix}${diffModifier}Scenario: In an enterprise platform named "${company}" focused on "${industryFocus}", ${name} discovers a major bottleneck: "${vocab.failure}" inside the active pipeline.
Question: How should ${name} configure "${topic}" parameters to resolve this bottleneck permanently?`;
    expectedConcept = `Implement the best practice of "${vocab.practice}" and address the scaling limit of "${vocab.limitation}" to mitigate "${vocab.failure}".`;
    expectedKeywords = ['practice', 'bottleneck', 'configure', 'mitigation', vocab.terms[0].split(' ')[0]];
    explanation = `To address the failure state (${vocab.failure}), the engineer must implement ${vocab.practice} and ensure proper safeguards against ${vocab.limitation}.`;
    options = [`[Expected Guide]: ${expectedConcept}`];
    improvements = `Outline the diagnostic steps, reference parameter configuration, and list the expected outcome after applying ${vocab.practice}.`;

  } else if (qType === 'Application Based') {
    questionText = `${prefix}${diffModifier}Application Task: Design and write a production-ready software module (code block or script) in your preferred language that utilizes "${topic}" guidelines to process events in a "${industryFocus}" system. Integrate error handling, thread safety, and resource cleanup.`;
    expectedConcept = `Code solution implementing variables, logic statements, or API definitions for ${topic}. Expected cleanup practices: memory releases, try-catch handlers, thread locks.`;
    expectedKeywords = ['import', 'class', 'function', 'try', 'catch', 'return', 'resource', 'error'];
    explanation = `The solution must show a complete code block implementing initialization, try-catch exception gates, parameter validations, and correct outputs.`;
    options = [`[Expected Snippet Guide]: ${expectedConcept}`];
    improvements = `Implement clean variable scoping, detail try/except error paths, and document the O(N) execution bounds.`;

  } else if (qType === 'Case Study') {
    questionText = `${prefix}${diffModifier}Case Study Analysis: "${company}" migrated its legacy client-server interfaces to a modern "${domain}" architecture centered on "${topic}" to optimize the "${industryFocus}" workflows. While transaction speeds improved, the system crashed under peak loads due to "${vocab.failure}".
Question: Evaluate this migration case study. Analyze the root cause of the crash, the architectural failure points, and propose a load-balancing framework.`;
    expectedConcept = `Case Study Analysis: Root cause was "${vocab.failure}" triggered by exceeding "${vocab.limitation}". Proposal: Add load-balancers, cache gates, and adhere to "${vocab.practice}".`;
    expectedKeywords = ['migration', 'root cause', 'vulnerability', 'load-balancing', 'architecture', 'crash', vocab.terms[0].split(' ')[0]];
    explanation = `The case study highlights how migrating to ${topic} optimized transactions, but failed due to ${vocab.failure} because of ${vocab.limitation}. A mitigation plan must incorporate ${vocab.practice}.`;
    options = [`[Expected Case Study Rubric]: ${expectedConcept}`];
    improvements = `Cite specific metrics like concurrency bounds, explain the role of ${vocab.failure}, and sketch a multi-zone layout.`;

  } else if (qType === 'Interview Style') {
    let questionPrompt;
    if (difficulty === 'Easy') {
      questionPrompt = `"How would you explain the core purpose of "${topic}" to a junior developer joining our engineering team?"`;
    } else if (difficulty === 'Medium') {
      questionPrompt = `"What are the operational differences and performance trade-offs of using "${topic}" compared to standard alternative frameworks in "${domain}"?"`;
    } else {
      questionPrompt = `"Suppose you are the Lead Architect for our "${industryFocus}" service. Describe how you would build a high-availability, fault-tolerant system using "${topic}". What happens during a "${vocab.failure}" event?"`;
    }
    
    questionText = `${prefix}${diffModifier}Technical Interview Question:\n${questionPrompt}`;
    expectedConcept = `Interview Response Guide: Core purpose: ${vocab.core}. Trade-offs: ${vocab.advantage} vs ${vocab.limitation}. Fault Tolerance: mitigate ${vocab.failure} using ${vocab.practice}.`;
    expectedKeywords = ['architecture', 'trade-offs', 'scalability', 'mitigation', 'framework', 'complexity'];
    explanation = `The candidate should articulate definitions clearly, contrast paradigms (${vocab.comparison}), and outline technical solutions using ${vocab.practice}.`;
    options = [`[Expected Interview Guide]: ${expectedConcept}`];
    improvements = `Structure your answer using the STAR method (Situation, Task, Action, Result). Support your claims with complexity analysis.`;
  }

  // Handle viva mode rephrasing
  if (quizMode === 'Viva Questions') {
    questionText = questionText.replace(/Question:|Application Task:|Statement:/g, 'Oral Defense Prompt:');
    questionText = `[VIVA EXAMINATION] ${questionText} Be prepared to defend your reasoning verbally to the panel.`;
  }

  return {
    id: idx + 1,
    type: qType,
    topic,
    question: questionText,
    options,
    correct: correctIdx,
    expectedKeywords,
    expectedConcept,
    explanation,
    improvements: improvements || "Be sure to cover definitions, design patterns, and scaling trade-offs."
  };
}

// Generate exact N quiz questions with MCQ, True/False, Short Answer, Scenario-based, and Application-based types
export function generateQuizQuestions(courseName, semesterNumber, unitNumber, count, difficulty) {
  const reqCount = parseInt(count) || 5;
  const questionTypes = ['MCQ', 'True/False', 'Short Answer', 'Scenario Based', 'Application Based'];
  const questions = Array.from({ length: reqCount }, (_, idx) => {
    const qType = questionTypes[idx % questionTypes.length];
    return generateDynamicQuestion(courseName, 'General Technology', 'Digital Platforms', `Unit ${unitNumber} Concept`, qType, difficulty, idx % 5, idx);
  });
  return questions;
}

// Generate dynamic curriculum-wide quizzes mixing MCQ, True/False, Short Answer, Scenario, and Application questions
export function generateCurriculumQuiz(curriculum, count, difficulty, types, quizMode = 'Practice Quiz', examStyle = false) {
  const reqCount = parseInt(count) || 5;
  if (!curriculum || !curriculum.semesters) return [];

  // Compile all topics and learning outcomes
  const allTopics = [];
  curriculum.semesters.forEach(sem => {
    sem.units.forEach(unit => {
      if (unit.topics && unit.topics.length > 0) {
        unit.topics.forEach(t => {
          allTopics.push({
            topic: t,
            unitName: unit.name,
            semesterTheme: sem.theme,
            learningOutcomes: unit.learning_outcomes || []
          });
        });
      } else {
        allTopics.push({
          topic: unit.name,
          unitName: unit.name,
          semesterTheme: sem.theme,
          learningOutcomes: unit.learning_outcomes || []
        });
      }
    });
  });

  if (allTopics.length === 0) {
    allTopics.push({
      topic: 'Core Foundations',
      unitName: 'Introductory Concepts',
      semesterTheme: 'Foundations',
      learningOutcomes: []
    });
  }

  // Load question memory pool to avoid repeats
  const memoryKey = `quiz_memory_${curriculum.id}`;
  let usedSignatures = [];
  try {
    const stored = localStorage.getItem(memoryKey);
    if (stored) {
      usedSignatures = JSON.parse(stored);
    }
  } catch (err) {
    console.warn("Could not read quiz memory signatures:", err);
  }

  // Filter requested question types
  let activeTypes = (types && types.length > 0) ? types.filter(t => t !== 'Mixed') : [];
  if (activeTypes.length === 0) {
    activeTypes = ['MCQ', 'True/False', 'Short Answer', 'Scenario Based', 'Application Based', 'Descriptive', 'Fill in the Blanks', 'Case Study', 'Interview Style'];
  }

  const courseName = curriculum.program_name;
  const domain = curriculum.skill || 'General Technology';
  const industryFocus = curriculum.industry_focus || 'Digital Platforms';

  // Build unique candidates using the anti-repetition memory store search
  const selectedCandidates = [];
  let attempts = 0;
  const maxAttempts = reqCount * 30;

  while (selectedCandidates.length < reqCount && attempts < maxAttempts) {
    attempts++;
    // Select random topic
    const topicIdx = Math.floor(Math.random() * allTopics.length);
    const item = allTopics[topicIdx];
    // Select random concept id (0 to 19)
    const conceptId = Math.floor(Math.random() * 20);
    // Select question type round-robin
    const qType = activeTypes[selectedCandidates.length % activeTypes.length];
    
    // Create highly specific signature to track repetition
    const signature = `${curriculum.id}_${item.topic}_${qType}_${difficulty}_${conceptId}`;

    if (!usedSignatures.includes(signature) && !selectedCandidates.some(c => c.signature === signature)) {
      selectedCandidates.push({
        topicIdx,
        conceptId,
        qType,
        signature
      });
    }
  }

  // If we couldn't find enough unique questions via search, clear signatures or fill with remaining combinations
  if (selectedCandidates.length < reqCount) {
    for (let topicIdx = 0; topicIdx < allTopics.length && selectedCandidates.length < reqCount; topicIdx++) {
      const item = allTopics[topicIdx];
      for (let conceptId = 0; conceptId < 20 && selectedCandidates.length < reqCount; conceptId++) {
        const qType = activeTypes[selectedCandidates.length % activeTypes.length];
        const signature = `${curriculum.id}_${item.topic}_${qType}_${difficulty}_${conceptId}`;
        if (!selectedCandidates.some(c => c.signature === signature)) {
          selectedCandidates.push({
            topicIdx,
            conceptId,
            qType,
            signature
          });
        }
      }
    }
  }

  // Update memory pool with the new generated signatures
  const newSignatures = [...usedSignatures, ...selectedCandidates.map(c => c.signature)];
  // Cap memory size to prevent infinite growth (keep last 200 signatures)
  if (newSignatures.length > 200) {
    newSignatures.splice(0, newSignatures.length - 200);
  }
  try {
    localStorage.setItem(memoryKey, JSON.stringify(newSignatures));
  } catch (err) {
    console.warn("Could not write quiz memory signatures:", err);
  }

  // Generate actual questions
  const questions = selectedCandidates.map((candidate, idx) => {
    const item = allTopics[candidate.topicIdx];
    return generateDynamicQuestion(
      courseName,
      domain,
      industryFocus,
      item.topic,
      candidate.qType,
      difficulty,
      candidate.conceptId,
      idx,
      quizMode,
      examStyle
    );
  });

  return questions;
}


