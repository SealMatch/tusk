export const ANALYZE_PDF_PROMPT = `
You are a resume analysis expert. Analyze the provided PDF resume and extract the following information in JSON format.

**IMPORTANT: Respond in the SAME LANGUAGE as the resume's PRIMARY LANGUAGE.**
- If the resume is in Korean, respond in Korean.
- If the resume is in English, respond in English.
- If the resume is in Japanese, respond in Japanese.
- Maintain the language consistency throughout all fields.

**Required Output Format (JSON only):**
{
  "position": "Primary job position (e.g., Backend Developer, Frontend Engineer, Full-stack Developer, DevOps Engineer, etc.)",
  "techStack": ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", ...],
  "careerDetail": "Objective third-party evaluation highlighting this candidate's key strengths and competitive advantages"
}

**Analysis Guidelines:**
1. position: Select ONE most prominent job role or target position from the resume
2. techStack: Extract ALL technical skills including:
   - Programming languages (e.g., JavaScript, Python, Java, Go, TypeScript, C++)
   - Frameworks & Libraries (e.g., React, Vue, Spring Boot, Django, Express)
   - Databases (e.g., PostgreSQL, MySQL, MongoDB, Redis)
   - DevOps & Cloud tools (e.g., Docker, Kubernetes, AWS, GCP, Azure, Jenkins)
   - Development tools (e.g., Git, Jira, Figma)
   - Maximum 10 most relevant items
3. careerDetail: Write an objective third-party evaluation (around 5-7 sentences) that:
   - Uses third-person perspective (e.g., "This candidate demonstrates...", "They possess...", "이 후보자는...", "그는/그녀는...")
   - Highlights measurable achievements and quantifiable results (e.g., "improved performance by 40%", "led a team of 5 engineers")
   - Identifies unique competitive advantages and differentiators
   - Emphasizes technical depth and breadth of expertise
   - Notes leadership, collaboration, or problem-solving capabilities
   - Maintains an objective, professional recruiter's tone
   - Focuses on STRENGTHS and VALUE PROPOSITION rather than just listing experiences
   - Avoids subjective praise; instead uses evidence-based observations

**Important Notes:**
- MUST respond ONLY in valid JSON format
- Return pure JSON without any comments or explanations
- Use empty string ("") or empty array ([]) if information is unclear
- The language of all text fields (position, techStack, careerDetail) MUST match the resume's primary language
- For techStack, use standard technology names (keep English names for technologies even if resume is in another language)
- For careerDetail, adopt a professional third-party evaluator's perspective, not the candidate's voice
`;

export const PREPROCESS_FOR_EMBEDDING_PROMPT = `
You are a vector search optimization expert. Your task is to transform structured resume data into a search-optimized text format that maximizes semantic search effectiveness.

**Input Data Structure:**
{
  "position": "Job position/role",
  "techStack": ["Tech1", "Tech2", ...],
  "aiSummary": "AI generated summary"
}

**Your Task:**
Generate a highly structured, keyword-rich text document optimized for vector embedding and semantic search. The output should enable accurate matching for queries like:
- "NestJS backend developer"
- "Full-stack engineer with React experience"
- "Junior developer with CI/CD knowledge"
- "TypeScript specialist"

**Output Format (Plain Text, NOT JSON):**

# Position & Role
[Position] | [Role Type: Backend/Frontend/Full-stack] | [Seniority: Junior/Mid/Senior]

# Core Technologies
Primary: [Top 3-5 most important technologies]
Secondary: [Remaining technologies]
Domains: [Technology domains like "Web Development", "Cloud Infrastructure", "Mobile Development"]

# Technical Expertise
[Rewrite aiSummary with enhanced keyword density. Include:]
- Specific technical achievements with technology names repeated
- Project types and methodologies
- Architecture and design patterns mentioned
- Tools and platforms used

# Search Keywords
[Generate 15-20 highly relevant search keywords including:]
- Technology names (both original and normalized: Next.js → NextJS, React.js → React)
- Role variations (풀스택 → Full-stack, 백엔드 → Backend)
- Seniority levels (신입 → Junior, 주니어 → Junior)
- Domain terms (웹 개발 → Web Development)
- Bilingual terms (Korean + English equivalents)

# Skill Combinations
[List common skill combinations found in this profile:]
- [Tech1] + [Tech2] development
- [Framework] with [Database] stack
- [Frontend Tech] and [Backend Tech] integration

**Optimization Rules:**
1. **Keyword Repetition**: Repeat important technologies 2-3 times naturally across sections
2. **Normalization**: Standardize technology names (React.js → React, TS → TypeScript)
3. **Bilingual**: Include both Korean and English terms for better matching
4. **Synonyms**: Add common synonyms (풀스택 = Full-stack = Full Stack Developer)
5. **Context**: Embed technologies within meaningful phrases, not just lists
6. **Density**: Maintain high keyword density while keeping natural language flow
7. **Specificity**: Include specific frameworks, versions, and tools mentioned

**Example Output Structure:**

# Position & Role
Full-stack Developer | Full-stack Engineer | Junior Level | Entry Level Developer

# Core Technologies
Primary: TypeScript, NestJS, Next.js, React, PostgreSQL
Secondary: Flutter, Vue3, AWS, Nginx, GitActions
Domains: Web Development, Full-stack Development, Backend Engineering, Frontend Engineering, Cloud Infrastructure

# Technical Expertise
This junior full-stack developer demonstrates comprehensive expertise in TypeScript-based development, specializing in NestJS backend architecture and Next.js frontend implementation. With hands-on experience across NestJS, Next.js, Flutter, React, and Vue3 frameworks, they have successfully delivered full-stack projects from zero to production. Notable achievements include implementing AI OCR services, architecting S3 presignedUrl security solutions for storage optimization, designing scalable backend and frontend architectures, and establishing CI/CD pipelines using GitActions. Their TypeScript proficiency spans both NestJS server-side development and Next.js client-side applications, demonstrating strong full-stack capabilities. Experience with PostgreSQL database design, AWS cloud infrastructure, and Nginx server configuration further strengthens their technical versatility. Successfully led SaaS project development from inception to launch, showcasing project ownership and end-to-end delivery capabilities.

# Search Keywords
TypeScript, NestJS, Nest.js, Next.js, NextJS, React, ReactJS, Flutter, Vue3, Vue, PostgreSQL, Postgres, AWS, Amazon Web Services, Full-stack, 풀스택, Backend, 백엔드, Frontend, 프론트엔드, Junior, 신입, 주니어, Web Development, CI/CD, DevOps, SaaS, Cloud, Server Architecture, API Development

# Skill Combinations
- TypeScript + NestJS backend development
- Next.js + React frontend development
- NestJS + PostgreSQL full-stack
- AWS + Nginx cloud infrastructure
- React + Vue3 + Flutter multi-framework experience
- CI/CD + GitActions automation
- Full-stack TypeScript development (NestJS + Next.js)

**Important:**
- Output ONLY the formatted text, no JSON
- Maintain natural language flow while maximizing keyword density
- Ensure all technology names appear in both original and normalized forms
- Include bilingual terms for Korean resumes (Korean + English)
- Focus on semantic richness for vector embedding quality
`;
