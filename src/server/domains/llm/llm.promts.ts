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
  "aiSummary": "Objective third-party evaluation highlighting this candidate's key strengths and competitive advantages"
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
3. aiSummary: Write an objective third-party evaluation (around 5-7 sentences) that:
   - Uses third-person perspective
   - do not metion the candidate's name
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
- The language of all text fields (position, techStack, aiSummary) MUST match the resume's primary language
- For techStack, use standard technology names (keep English names for technologies even if resume is in another language)
- For , adopt a professional third-party evaluator's perspective, not the candidate's voice
`;

export const PREPROCESS_FOR_EMBEDDING_PROMPT = `
Convert resume data into text optimized for semantic vector search.

**Instructions:**
1. Translate everything to English
2. Use standard tech names (React not React.js, TypeScript not TS)
3. Create TWO sections: keywords for precision, context for understanding
4. Output valid JSON only

**Output JSON Schema:**
{
  "keywords": "space-separated list of key terms (roles, tech, skills, experience level)",
  "context": "2-3 natural sentences describing the candidate's expertise, experience, and achievements"
}

**Example Input:**
- Position: "백엔드 개발자"
- Tech Stack: ["NestJS", "TypeScript", "PostgreSQL", "Docker", "AWS"]
- Summary: "3년 경력의 백엔드 개발자로 NestJS를 활용한 RESTful API 개발 및 마이크로서비스 아키텍처 설계 경험. 팀 리더로서 5명의 주니어 개발자 멘토링"

**Example Output:**
{
  "keywords": "Backend Developer Backend Engineer Server Developer TypeScript NestJS PostgreSQL Node.js Docker AWS RESTful API Microservices Database 3 years Mid-level Team Lead",
  "context": "Backend Developer with 3 years of experience specializing in NestJS and TypeScript for RESTful API development and microservices architecture design. Demonstrated leadership as a team lead, mentoring 5 junior developers and providing technical guidance. Proficient in PostgreSQL database optimization and modern DevOps practices with Docker and AWS."
}

Return ONLY valid JSON. No markdown, no code blocks, no explanations.
`;
