import io
import json

import anthropic
import PyPDF2

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are an expert resume analyst and career coach with deep knowledge of hiring practices across all industries. Your task is to analyze resumes against job requirements and provide comprehensive, actionable feedback.

## Analysis Process

### 1. Skill Extraction
Carefully read the entire resume and extract ALL skills mentioned or implied:
- Technical skills: programming languages, frameworks, tools, platforms, databases
- Soft skills: communication, leadership, teamwork, problem-solving, time management
- Domain knowledge: industry-specific expertise, methodologies (Agile, Scrum, DevOps, etc.)
- Certifications and qualifications
- Tools and software proficiency

### 2. Job Requirements Analysis
Based on the target job title, identify typical requirements for that role:
- Core technical skills that are essential
- Soft skills that employers prioritize
- Industry-standard tools and technologies
- Experience level indicators
- Common certifications or qualifications valued for this role

### 3. Match Analysis
Compare the resume skills against job requirements:
- matched_skills: skills from the resume that are directly relevant to the target job
- missing_skills: important skills for the target job that are absent from the resume
- extracted_skills: all skills found anywhere in the resume (comprehensive list)

### 4. Scoring
Calculate a match_score from 0 to 100:
- 90-100: Excellent match, very strong candidate
- 70-89: Good match, most key requirements met
- 50-69: Moderate match, some notable gaps
- 30-49: Partial match, significant gaps exist
- 0-29: Poor match, major required skills are missing

### 5. Actionable Suggestions
Provide 4-6 specific, actionable suggestions such as:
- Which specific skills or certifications to acquire
- How to better highlight existing experience for this role
- What projects or experience to build to fill skill gaps
- How to reframe existing experience to better match the target role
- Important keywords to add for ATS optimization
- Specific ways to quantify achievements relevant to this job

## Output Format
Return ONLY a JSON object with exactly these fields:
- match_score: integer 0-100
- matched_skills: array of skill strings found in resume that match the job
- missing_skills: array of important job skills not found in the resume
- extracted_skills: array of all skills found anywhere in the resume
- suggestions: array of actionable improvement tip strings

Be thorough, specific, and constructive. Base missing_skills on real industry expectations for the target role."""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return " ".join(page.extract_text() or "" for page in reader.pages)


def analyze_resume(file_bytes: bytes, target_job: str, job_description: str = "") -> dict:
    resume_text = extract_text_from_pdf(file_bytes)

    if job_description:
        user_content = f"Target Job: {target_job}\n\nJob Description:\n{job_description}\n\nResume Text:\n{resume_text}"
    else:
        user_content = f"Target Job: {target_job}\n\nResume Text:\n{resume_text}"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=[{
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        }],
        output_config={
            "format": {
                "type": "json_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "match_score": {"type": "integer"},
                        "matched_skills": {"type": "array", "items": {"type": "string"}},
                        "missing_skills": {"type": "array", "items": {"type": "string"}},
                        "extracted_skills": {"type": "array", "items": {"type": "string"}},
                        "suggestions": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["match_score", "matched_skills", "missing_skills", "extracted_skills", "suggestions"],
                    "additionalProperties": False,
                },
            }
        },
        messages=[{
            "role": "user",
            "content": user_content,
        }],
    )

    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)
