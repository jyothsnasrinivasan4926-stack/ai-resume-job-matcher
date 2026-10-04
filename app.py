import re
import streamlit as st
import pdfplumber
import docx
from sentence_transformers import SentenceTransformer, util

# ---------- Sample data (so the demo never fails) ----------
SAMPLE_RESUME = """Rahul Sharma
Data Analyst with 2 years of experience. Built dashboards in Tableau and Power BI,
wrote SQL queries on PostgreSQL, and automated reports with Python and pandas.
Completed a machine learning project using scikit-learn for churn prediction.
B.Tech in Computer Science."""

SAMPLE_JD = """We are hiring a Machine Learning Engineer with 2+ years of experience.
Required: Python, SQL, scikit-learn, TensorFlow, Docker, AWS, REST APIs.
Nice to have: NLP, Git. Bachelor's degree in Computer Science or related field."""

# ---------- Skill vocabulary (extend this list) ----------
SKILLS = [
    "python", "sql", "java", "javascript", "react", "pandas", "numpy",
    "scikit-learn", "tensorflow", "pytorch", "nlp", "machine learning",
    "deep learning", "docker", "kubernetes", "aws", "azure", "gcp", "git",
    "rest apis", "fastapi", "flask", "tableau", "power bi", "postgresql",
    "mongodb", "spark", "excel", "linux", "ci/cd",
]

@st.cache_resource
def load_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

# ---------- Parsing ----------
def read_file(f):
    if f.name.endswith(".pdf"):
        with pdfplumber.open(f) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages)
    if f.name.endswith(".docx"):
        return "\n".join(p.text for p in docx.Document(f).paragraphs)
    return f.read().decode("utf-8", errors="ignore")

def anonymize(text):
    text = re.sub(r"\S+@\S+", "[email]", text)
    text = re.sub(r"\+?\d[\d\s-]{8,}\d", "[phone]", text)
    return text

def extract_skills(text):
    t = text.lower()
    return {s for s in SKILLS if re.search(rf"(?<![a-z]){re.escape(s)}(?![a-z])", t)}

def years_required(jd):
    m = re.search(r"(\d+)\+?\s*years", jd.lower())
    return int(m.group(1)) if m else 0

def years_have(resume):
    m = re.search(r"(\d+)\+?\s*years", resume.lower())
    return int(m.group(1)) if m else 0

# ---------- Scoring ----------
def score(resume, jd):
    model = load_model()
    sim = util.cos_sim(model.encode(resume), model.encode(jd)).item()
    sim = max(0.0, min(sim, 1.0))

    r_sk, j_sk = extract_skills(resume), extract_skills(jd)
    overlap = len(r_sk & j_sk) / max(len(j_sk), 1)

    need, have = years_required(jd), years_have(resume)
    exp = 1.0 if need == 0 else min(have / need, 1.0)

    total = 100 * (0.5 * sim + 0.35 * overlap + 0.15 * exp)
    return {
        "total": round(total, 1),
        "semantic": round(sim * 100, 1),
        "skills": round(overlap * 100, 1),
        "experience": round(exp * 100, 1),
        "matched": sorted(r_sk & j_sk),
        "missing": sorted(j_sk - r_sk),
    }

# ---------- UI ----------
st.set_page_config(page_title="AI Resume & Job Matcher", layout="wide")
st.title("AI Resume & Job Matching System")

col1, col2 = st.columns(2)
with col1:
    up = st.file_uploader("Upload resume (PDF/DOCX/TXT)", type=["pdf", "docx", "txt"])
    resume = read_file(up) if up else st.text_area("...or paste resume", SAMPLE_RESUME, height=250)
with col2:
    jd = st.text_area("Job description", SAMPLE_JD, height=310)

blind = st.checkbox("Bias reduction: hide email/phone before scoring", value=True)

if st.button("Analyze match", type="primary"):
    if blind:
        resume = anonymize(resume)
    res = score(resume, jd)

    st.metric("Overall match", f"{res['total']}%")
    c1, c2, c3 = st.columns(3)
    c1.metric("Semantic similarity", f"{res['semantic']}%")
    c2.metric("Skill overlap", f"{res['skills']}%")
    c3.metric("Experience fit", f"{res['experience']}%")
    st.bar_chart({"Score": {"Semantic": res["semantic"], "Skills": res["skills"],
                            "Experience": res["experience"]}})

    st.success("Matched skills: " + (", ".join(res["matched"]) or "none"))
    st.error("Missing skills: " + (", ".join(res["missing"]) or "none"))
    if res["missing"]:
        st.info("Suggestion: add projects or certifications covering "
                + ", ".join(res["missing"][:3]) + ", and mirror the job's wording in your resume.")
