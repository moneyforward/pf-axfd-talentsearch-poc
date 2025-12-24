"""
PF Talent Search API - FastAPI Backend
Minimal prototype for skill-based people search
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, field_validator, ValidationError
from typing import Optional, List
import httpx
import json
import os
from pathlib import Path
import logging
import asyncio
from datetime import datetime
from review_service import ReviewService
from face_image_service import FaceImageService
from fastapi.responses import Response

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PF Talent Search API",
    version="1.0.0",
    description="Minimal prototype for skill-based people search using Azure OpenAI"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pf-talentsearch-frontend.azurewebsites.net",
        "http://localhost:5173",
        "http://localhost:80",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format validation errors for better readability"""
    errors = exc.errors()
    error_messages = []
    for error in errors:
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        message = error.get("msg", "Validation error")
        error_messages.append(f"{field}: {message}")
    
    detail = "; ".join(error_messages) if error_messages else "Validation error"
    logger.error(f"Validation error: {detail}")
    return JSONResponse(
        status_code=400,
        content={"detail": detail}
    )

# Azure OpenAI Configuration - Load from environment variables or .env file
BASE_DIR = Path(__file__).parent
ENV_FILE = BASE_DIR / ".env"

def load_env_file(file_path: Path) -> dict:
    """Load environment variables from a file (simple key=value format)"""
    env_vars = {}
    if file_path.exists():
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments and empty lines
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key, value = line.split('=', 1)
                            env_vars[key.strip()] = value.strip()
        except Exception as e:
            logger.warning(f"Error loading .env file: {e}")
    return env_vars

# Load .env file if it exists
_env_vars = load_env_file(ENV_FILE)

# Get Azure OpenAI configuration from environment variables, fallback to .env
AZURE_OPENAI_ENDPOINT = os.getenv(
    "AZURE_OPENAI_ENDPOINT",
    _env_vars.get("AZURE_OPENAI_ENDPOINT", "")
)
AZURE_OPENAI_API_KEY = os.getenv(
    "AZURE_OPENAI_API_KEY",
    _env_vars.get("AZURE_OPENAI_API_KEY", "")
)
AZURE_OPENAI_API_VERSION = os.getenv(
    "AZURE_OPENAI_API_VERSION",
    _env_vars.get("AZURE_OPENAI_API_VERSION", "2024-10-21")
)
AZURE_OPENAI_DEPLOYMENT = os.getenv(
    "AZURE_OPENAI_DEPLOYMENT",
    _env_vars.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
)

# Validate that required credentials are set
if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
    logger.warning(
        "Azure OpenAI credentials not found in environment variables or .env file. "
        "Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY."
    )

# Data paths (BASE_DIR already defined above)
EMPLOYEES_FILE = BASE_DIR / "mock-data" / "employees" / "employees.json"
PERSONAS_FILE = BASE_DIR / "mock-data" / "personas" / "personas.json"
RESUMES_DIR = BASE_DIR / "mock-data" / "resumes"

# Initialize review service
review_service = ReviewService()

# Initialize face image service (with error handling for optional GCS)
try:
    face_image_service = FaceImageService()
except ImportError as e:
    logger.warning(f"Face image service not available: {e}. Using mock mode only.")
    face_image_service = None
except Exception as e:
    logger.warning(f"Error initializing face image service: {e}. Using mock mode only.")
    # Fallback to mock mode
    os.environ["USE_MOCK_DATA"] = "true"
    face_image_service = FaceImageService()

# Load data on startup
_employees_data = None
_personas_data = None

def load_employees():
    """Load employees data from JSON file"""
    global _employees_data
    if _employees_data is None:
        if EMPLOYEES_FILE.exists():
            with open(EMPLOYEES_FILE, 'r', encoding='utf-8') as f:
                _employees_data = json.load(f)
        else:
            _employees_data = []
    return _employees_data

def load_personas():
    """Load personas data from JSON file"""
    global _personas_data
    if _personas_data is None:
        if PERSONAS_FILE.exists():
            with open(PERSONAS_FILE, 'r', encoding='utf-8') as f:
                _personas_data = json.load(f)
        else:
            _personas_data = {}
    return _personas_data

def load_resume(employee_id: str) -> Optional[str]:
    """Load resume text file for an employee"""
    # Try different filename patterns
    patterns = [
        f"EMP{employee_id}_*.txt",
        f"*{employee_id}*.txt",
        f"EMP*{employee_id}*.txt",
    ]
    
    for pattern in patterns:
        matches = list(RESUMES_DIR.glob(pattern))
        if matches:
            try:
                with open(matches[0], 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception:
                continue
    
    # If no match found, try direct filename
    direct_path = RESUMES_DIR / f"EMP{employee_id}_*.txt"
    matches = list(RESUMES_DIR.glob(f"EMP{employee_id}_*.txt"))
    if matches:
        try:
            with open(matches[0], 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            pass
    
    return None


# Helper function to calculate years of experience from entered_at date
def calculate_years_of_experience(entered_at: str) -> float:
    """Calculate years of experience from entered_at date string"""
    if not entered_at:
        return 0.0
    try:
        from datetime import datetime
        entered_date = datetime.strptime(entered_at, '%Y-%m-%d')
        current_date = datetime.now()
        delta = current_date - entered_date
        years = delta.days / 365.25
        return round(years, 2)
    except (ValueError, TypeError):
        return 0.0


# Pydantic Models
class HealthResponse(BaseModel):
    status: str
    version: str


class Skill(BaseModel):
    name: str
    experience: Optional[int] = None
    description: Optional[str] = None


class Persona(BaseModel):
    skills: List[Skill]
    career: Optional[List[dict]] = None


class PersonaRequest(BaseModel):
    employee_id: str
    employee_name: str


class PersonaResponse(BaseModel):
    skills: List[Skill]
    career: Optional[List[dict]] = None


class Person(BaseModel):
    employee_id: str
    employee_name: str
    mail: Optional[str] = None
    job_title: Optional[str] = None
    dept_1: Optional[str] = None
    dept_2: Optional[str] = None
    location: Optional[str] = None


class SearchPeopleResponse(BaseModel):
    person: Person
    score: float = 1.0


class FindPersonRequest(BaseModel):
    persona: Persona
    person: Optional[dict] = None  # Optional person data from frontend
    instructions: Optional[str] = None  # Optional instructions from frontend


class FindPersonResult(BaseModel):
    person: Person
    score: float = 1.0


class FindPersonResponse(BaseModel):
    result: List[FindPersonResult]
    count: int


# Similar Employee Search Models
class SimilarEmployeeSearchRequest(BaseModel):
    target_employee: dict
    language: Optional[str] = "ja"  # "ja" or "en"
    
    @field_validator('target_employee')
    @classmethod
    def validate_target_employee(cls, v):
        if not v:
            raise ValueError('target_employee is required and cannot be empty')
        if not isinstance(v, dict):
            raise ValueError('target_employee must be an object/dictionary')
        if not v.get('employee_id'):
            raise ValueError('target_employee must contain employee_id')
        return v


class HardFilter(BaseModel):
    job_family: Optional[str] = None
    dept_3: Optional[List[str]] = None
    job_title: Optional[List[str]] = None
    years_of_service_min: Optional[int] = None
    current_employee_flag: str = "●"


class SoftCriteria(BaseModel):
    key_skills: List[str]
    domain_expertise: List[str]
    experience_level: str
    role_alignment: str
    preferred_departments: List[str]


class AnalysisResult(BaseModel):
    hard_filters: HardFilter
    soft_criteria: SoftCriteria
    thinking_text: str


class SimilarEmployeeSearchResponse(BaseModel):
    search_id: str
    stage: str
    thinking_text: str
    analysis_result: Optional[AnalysisResult] = None


class FilterSearchRequest(BaseModel):
    search_id: str
    hard_filters: dict
    target_employee_id: str
    language: Optional[str] = "ja"  # "ja" or "en"
    user_filters: Optional[dict] = None  # User-selected filters from modal


class FilterSearchResponse(BaseModel):
    stage: str
    thinking_text: str
    stats: dict
    candidate_ids: List[str]
    sql_query: Optional[str] = None


class EvaluationScore(BaseModel):
    technical_skills: int
    domain_expertise: int
    experience_level: int
    role_alignment: int
    soft_skills: int
    overall: int


class CandidateEvaluation(BaseModel):
    scores: EvaluationScore
    strengths: List[str]
    gaps: List[str]
    explanation: str


class EvaluateRequest(BaseModel):
    search_id: str
    target_employee: dict
    candidate_ids: List[str]
    soft_criteria: dict
    language: Optional[str] = "ja"  # "ja" or "en"


class CandidateResult(BaseModel):
    rank: int
    candidate: dict
    evaluation: CandidateEvaluation


class EvaluateResponse(BaseModel):
    stage: str
    thinking_text: str
    progress_messages: List[str]
    top_3_candidates: List[CandidateResult]


# Natural Language Search Models
class NaturalLanguageSearchRequest(BaseModel):
    query: str
    language: Optional[str] = "ja"  # "ja" or "en"


class NaturalLanguageSearchResponse(BaseModel):
    stage: str  # "parsing", "filtering", "complete"
    thinking_text: str
    parsed_filters: dict
    results: List[dict]
    stats: dict


# Review Models
class HalfReview(BaseModel):
    fy_cycle: str
    upload_year_month: str
    cycle_start_date: str
    employee_id: str
    org1: str
    org2: str
    job_family: str
    half_year_self_review_achievement_growth: str
    self_assessment_score: str
    short_term_1yr: str
    med_term_2_3yr: str
    row_num: str
    employment_type: str
    # Additional fields that may be in the data
    monthly_interview_owner_name: Optional[str] = None
    first_evaluator_owner_name: Optional[str] = None
    second_evaluator_owner_name: Optional[str] = None
    second_evaluator2_employee_name: Optional[str] = None
    half_year_goal: Optional[str] = None
    half_year_goal_indicator: Optional[str] = None
    action_plan: Optional[str] = None
    values_to_embody: Optional[str] = None
    strengths_and_skills_to_improve: Optional[str] = None
    career_intentions: Optional[str] = None


class MonthlyReview(BaseModel):
    fy_cycle: str
    cycle_start_date: str
    year_month: str
    employee_id: str
    org1: str
    org2: str
    org3: Optional[str] = None
    job_family: str
    employment_type: str
    monthly_goal: str
    monthly_review: str


class EmployeeReviewsResponse(BaseModel):
    monthly: Optional[MonthlyReview] = None
    half_year: Optional[HalfReview] = None


# Azure OpenAI Client
async def call_azure_openai(messages: List[dict], temperature: float = 0.0, use_json_format: bool = False) -> dict:
    """Call Azure OpenAI API"""
    url = f"{AZURE_OPENAI_ENDPOINT}openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions"
    params = {"api-version": AZURE_OPENAI_API_VERSION}
    
    headers = {
        "Content-Type": "application/json",
        "api-key": AZURE_OPENAI_API_KEY
    }
    
    payload = {
        "model": AZURE_OPENAI_DEPLOYMENT,
        "messages": messages,
        "temperature": temperature
    }
    
    if use_json_format:
        payload["response_format"] = {"type": "json_object"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, params=params, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            
            # Log LLM response
            logger.info("=" * 80)
            logger.info("LLM API Response:")
            logger.info(f"Model: {AZURE_OPENAI_DEPLOYMENT}")
            logger.info(f"Temperature: {temperature}")
            if "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]
                logger.info(f"Response Content:\n{content}")
            else:
                logger.warning(f"Unexpected response structure: {result}")
            logger.info("=" * 80)
            
            return result
        except httpx.HTTPStatusError as e:
            error_detail = f"Status: {e.response.status_code}, Response: {e.response.text}"
            logger.error(f"HTTP Error: {error_detail}")
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except Exception as e:
            logger.error(f"Error calling Azure OpenAI: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calling Azure OpenAI: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "PF Talent Search API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return HealthResponse(status="ok", version="1.0.0")


@app.post("/api/persona", response_model=PersonaResponse)
async def generate_persona(request: PersonaRequest):
    """
    Generate persona from employee reviews using Azure OpenAI
    For now, this is a simplified version that will be expanded later
    """
    system_prompt = """あなたは人事評価者です。
過去の評価内容を元に、社員の経歴とスキルを分析し、JSON形式で出力します。
出力はJSONのみを出力し、他の情報は一切出力しないでください。
markdownやHTMLなどのフォーマットは使用しないでください。
出力は日本語でお願いします。

JSON形式:
{
  "skills": [
    {
      "name": "SkillName",
      "experience": 2,
      "description": "説明"
    }
  ],
  "career": [
    {
      "start_month": "2020-01",
      "end_month": "2022-12",
      "company": "会社名",
      "position": "役職",
      "role": "Engineer",
      "description": "説明"
    }
  ]
}"""

    user_prompt = f"""従業員ID {request.employee_id} ({request.employee_name}) の経歴とスキルを分析してください。
現在はサンプルデータを使用していますが、将来的には実際のレビューデータを使用します。"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = await call_azure_openai(messages, temperature=0.0, use_json_format=True)
        
        if "choices" not in response or len(response["choices"]) == 0:
            raise HTTPException(status_code=500, detail="No response from Azure OpenAI")
        
        content = response["choices"][0]["message"]["content"]
        
        # Parse JSON response
        try:
            persona_data = json.loads(content)
            return PersonaResponse(**persona_data)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON response: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating persona: {str(e)}")


@app.get("/api/test-openai")
async def test_openai():
    """Test endpoint to verify Azure OpenAI connection"""
    test_messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say 'Hello, Azure OpenAI is working!' in Japanese."}
    ]
    
    try:
        response = await call_azure_openai(test_messages, temperature=0.0)
        if "choices" in response and len(response["choices"]) > 0:
            return {
                "status": "success",
                "response": response["choices"][0]["message"]["content"]
            }
        else:
            return {
                "status": "error",
                "error": "No choices in response"
            }
    except HTTPException as e:
        return {
            "status": "error",
            "error": e.detail,
            "status_code": e.status_code
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }


@app.get("/api/people/{query}", response_model=List[SearchPeopleResponse])
async def search_people(query: str):
    """
    Search people by query string
    Searches across employee_id, name, email, job_title, and department fields
    """
    employees = load_employees()
    if not employees:
        return []
    
    query_lower = query.lower().strip()
    if not query_lower:
        return []
    
    results = []
    for emp in employees:
        # Search across multiple fields
        matches = False
        score = 0.0
        
        # Exact employee_id match gets highest score
        if query_lower == str(emp.get("employee_id", "")).lower():
            matches = True
            score = 1.0
        # Employee ID contains query
        elif query_lower in str(emp.get("employee_id", "")).lower():
            matches = True
            score = 0.9
        # Name contains query
        elif query_lower in (emp.get("employee_name", "") or "").lower():
            matches = True
            score = 0.8
        # Email contains query
        elif query_lower in (emp.get("mail", "") or "").lower():
            matches = True
            score = 0.7
        # Job title contains query
        elif query_lower in (emp.get("job_title", "") or "").lower():
            matches = True
            score = 0.6
        # Department fields contain query
        elif (query_lower in (emp.get("dept_1", "") or "").lower() or
              query_lower in (emp.get("dept_2", "") or "").lower() or
              query_lower in (emp.get("dept_3", "") or "").lower() or
              query_lower in (emp.get("dept_4", "") or "").lower()):
            matches = True
            score = 0.5
        
        if matches:
            results.append(SearchPeopleResponse(
                person=Person(
                    employee_id=emp.get("employee_id", ""),
                    employee_name=emp.get("employee_name", ""),
                    mail=emp.get("mail"),
                    job_title=emp.get("job_title"),
                    dept_1=emp.get("dept_1"),
                    dept_2=emp.get("dept_2"),
                    location=emp.get("location")
                ),
                score=score
            ))
    
    # Sort by score (highest first)
    results.sort(key=lambda x: x.score, reverse=True)
    return results


@app.post("/api/person/find", response_model=FindPersonResponse)
async def find_person(request: FindPersonRequest):
    """
    Find people matching the provided persona
    Matches based on skills and career information
    """
    employees = load_employees()
    personas = load_personas()
    
    if not employees:
        return FindPersonResponse(result=[], count=0)
    
    # Extract skill names from persona
    skill_names = [skill.name.lower() for skill in request.persona.skills]
    
    results = []
    for emp in employees:
        employee_id = emp.get("employee_id", "")
        persona_data = personas.get(employee_id, {})
        
        # Calculate match score based on skills
        score = 0.0
        matched_skills = 0
        
        if persona_data and "skills" in persona_data:
            persona_skills = [s.get("name", "").lower() for s in persona_data.get("skills", [])]
            for req_skill in skill_names:
                for pers_skill in persona_skills:
                    if req_skill in pers_skill or pers_skill in req_skill:
                        matched_skills += 1
                        break
        
        if matched_skills > 0:
            score = matched_skills / max(len(skill_names), 1)
            results.append(FindPersonResult(
            person=Person(
                    employee_id=emp.get("employee_id", ""),
                    employee_name=emp.get("employee_name", ""),
                    mail=emp.get("mail"),
                    job_title=emp.get("job_title"),
                    dept_1=emp.get("dept_1"),
                    dept_2=emp.get("dept_2"),
                    location=emp.get("location")
                ),
                score=score
            ))
    
    # Sort by score (highest first)
    results.sort(key=lambda x: x.score, reverse=True)
    
    return FindPersonResponse(
        result=results,
        count=len(results)
    )


# Similar Employee Search Endpoints
import uuid
import re

@app.post("/api/search/similar-employees", response_model=SimilarEmployeeSearchResponse)
async def start_similar_search(request: SimilarEmployeeSearchRequest):
    """
    Layer 1: Analysis Agent
    Parse target employee profile and decompose into hard filters and soft criteria
    """
    try:
        logger.info(f"Received similar-employees request. target_employee type: {type(request.target_employee)}, keys: {list(request.target_employee.keys()) if isinstance(request.target_employee, dict) else 'N/A'}")
        
        # Validate target_employee
        if not request.target_employee:
            logger.error("target_employee is missing")
            raise HTTPException(status_code=400, detail="target_employee is required")
        
        if not isinstance(request.target_employee, dict):
            logger.error(f"target_employee is not a dict, type: {type(request.target_employee)}")
            raise HTTPException(status_code=400, detail="target_employee must be an object/dictionary")
        
        if not request.target_employee.get("employee_id"):
            logger.error(f"target_employee missing employee_id. Keys: {list(request.target_employee.keys())}")
            raise HTTPException(status_code=400, detail="target_employee must contain employee_id")
        
        search_id = str(uuid.uuid4())
        target_employee = request.target_employee
        language = request.language or "ja"
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in request validation: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    
    # Build analysis prompt based on language
    if language == "en":
        system_prompt = """You are an excellent HR analyst. Analyze employee profiles and extract search criteria to find similar employees.

Output must be in JSON format following this structure:
{
  "hard_filters": {
    "job_family": "Engineer",
    "dept_3": ["AI Division", "Data Science Department"],
    "job_title": ["Senior Engineer", "ML Engineer"],
    "years_of_service_min": 1,
    "current_employee_flag": "●"
  },
  "soft_criteria": {
    "key_skills": ["Python", "AI/ML", "Azure"],
    "domain_expertise": ["Machine Learning", "Data Analysis"],
    "experience_level": "Senior",
    "role_alignment": "AI project leadership",
    "preferred_departments": ["AI Division", "AI Acceleration Department"]
  },
  "thinking_text": "Explain the analysis in natural English."
}

Important:
- hard_filters are structural attributes that can be filtered with SQL queries
- soft_criteria are skills and experience evaluated through resume analysis
- thinking_text should be conversational, explaining why these criteria were chosen
- Output JSON only, do not use markdown code blocks"""
        
        user_prompt = f"""Analyze the following employee profile and extract search criteria to find similar employees:

{json.dumps(target_employee, ensure_ascii=False, indent=2)}

Available database fields:
- employee_id, employee_name, mail
- job_title, job_family
- dept_1, dept_2, dept_3, dept_4, dept_5, dept_6
- years_of_service (string format, e.g., "1 year 3 months")
- current_employee_flag ("●" for current employees)
- location, employment_type, gender"""
    else:
        system_prompt = """あなたは優秀な人事アナリストです。従業員のプロファイルを分析し、類似した従業員を探すための検索条件を抽出します。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "hard_filters": {
    "job_family": "エンジニア",
    "dept_3": ["AI推進室", "データサイエンス部"],
    "job_title": ["シニアエンジニア", "MLエンジニア"],
    "years_of_service_min": 1,
    "current_employee_flag": "●"
  },
  "soft_criteria": {
    "key_skills": ["Python", "AI/ML", "Azure"],
    "domain_expertise": ["機械学習", "データ分析"],
    "experience_level": "シニア",
    "role_alignment": "AI関連プロジェクトの推進",
    "preferred_departments": ["AI推進室", "AIアクセラレーション部"]
  },
  "thinking_text": "分析した内容を自然な日本語で説明してください。"
}

重要：
- hard_filtersは構造的な属性で、SQLクエリでフィルタリングできるもの
- soft_criteriaはスキルや経験など、レジュメ分析で評価するもの
- thinking_textは会話形式で、なぜこれらの条件を選んだかを説明
- JSONのみを出力し、マークダウンコードブロックは使用しない"""

        user_prompt = f"""以下の従業員プロファイルを分析し、類似した従業員を探すための検索条件を抽出してください：

{json.dumps(target_employee, ensure_ascii=False, indent=2)}

利用可能なデータベースフィールド：
- employee_id, employee_name, mail
- job_title, job_family
- dept_1, dept_2, dept_3, dept_4, dept_5, dept_6
- years_of_service (文字列形式、例: "1年3ヵ月")
- current_employee_flag ("●" が現在の従業員)
- location, employment_type, gender"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    try:
        response = await call_azure_openai(messages, temperature=0.1, use_json_format=True)
        
        if "choices" not in response or len(response["choices"]) == 0:
            raise HTTPException(status_code=500, detail="No response from Azure OpenAI")
        
        content = response["choices"][0]["message"]["content"]
        
        # Clean JSON (remove markdown code fences if present)
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = content.strip()
        
        # Parse JSON
        try:
            analysis_data = json.loads(content)
            
            # Build response
            hard_filters = HardFilter(**analysis_data.get("hard_filters", {}))
            soft_criteria = SoftCriteria(**analysis_data.get("soft_criteria", {}))
            thinking_text = analysis_data.get("thinking_text", "分析が完了しました。")
            
            analysis_result = AnalysisResult(
                hard_filters=hard_filters,
                soft_criteria=soft_criteria,
                thinking_text=thinking_text
            )
            
            return SimilarEmployeeSearchResponse(
                search_id=search_id,
                stage="analysis",
                thinking_text=thinking_text,
                analysis_result=analysis_result
            )
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON response: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing employee profile: {str(e)}")


@app.post("/api/search/filter", response_model=FilterSearchResponse)
async def filter_candidates(request: FilterSearchRequest):
    """
    Layer 2: Filter Search
    Apply hard filters to eliminate 80-90% of candidates
    Also apply user-selected filters from the modal
    """
    employees = load_employees()
    if not employees:
        raise HTTPException(status_code=404, detail="No employee data available")
    
    hard_filters = request.hard_filters
    target_employee_id = request.target_employee_id
    user_filters = request.user_filters or {}
    
    # Apply filters
    filtered = []
    logger.info(f"Filtering employees with hard_filters: {hard_filters}")
    logger.info(f"User filters: {user_filters}")
    logger.info(f"Target employee ID: {target_employee_id}")
    
    for emp in employees:
        # Exclude target employee
        if emp.get("employee_id") == target_employee_id:
            logger.info(f"Skipping target employee: {emp.get('employee_id')}")
            continue
        
        # Check current employee flag
        if hard_filters.get("current_employee_flag") and emp.get("current_employee_flag") != hard_filters.get("current_employee_flag"):
            continue
        
        # Check job_family
        if hard_filters.get("job_family") and emp.get("job_family") != hard_filters.get("job_family"):
            continue
        
        # Check dept_3 - make it more flexible (allow related departments)
        if hard_filters.get("dept_3"):
            dept_3_list = hard_filters.get("dept_3", [])
            emp_dept_3 = emp.get("dept_3", "")
            # Exact match or related department
            if emp_dept_3 not in dept_3_list:
                # Allow if it's a related department (e.g., AI-related, data-related)
                dept_3_lower = emp_dept_3.lower()
                is_related = False
                for filter_dept in dept_3_list:
                    filter_lower = filter_dept.lower()
                    # Check if both contain related keywords
                    ai_keywords = ["ai", "機械学習", "データ", "ml", "データサイエンス", "ai推進", "aiアクセラレーション"]
                    if any(keyword in dept_3_lower or keyword in filter_lower for keyword in ai_keywords):
                        # If either contains AI/data keywords, consider them related
                        is_related = True
                        break
                if not is_related:
                    continue
        
        # Check job_title - make it very flexible (don't filter strictly by job_title)
        # Only use job_title as a soft filter - if job_family matches, allow different titles
        if hard_filters.get("job_title"):
            job_title_list = hard_filters.get("job_title", [])
            emp_job_title = emp.get("job_title", "")
            # If job_title doesn't match exactly, check if it's a similar role type
            if emp_job_title not in job_title_list:
                # Allow similar roles (e.g., all engineers, all data scientists)
                is_similar_role = False
                engineer_keywords = ["エンジニア", "engineer"]
                data_keywords = ["データ", "data", "サイエンティスト", "scientist"]
                ai_keywords = ["ai", "ml", "機械学習", "machine learning", "aiエンジニア", "mlエンジニア"]
                
                emp_title_lower = emp_job_title.lower()
                for filter_title in job_title_list:
                    filter_title_lower = filter_title.lower()
                    # If both contain engineer keywords, allow
                    if any(kw in emp_title_lower and kw in filter_title_lower for kw in engineer_keywords):
                        is_similar_role = True
                        break
                    # If both contain data/AI keywords, allow
                    if any(kw in emp_title_lower and kw in filter_title_lower for kw in data_keywords + ai_keywords):
                        is_similar_role = True
                        break
                
                # If job_family matches, always allow (even if job_title is different)
                # This is the key fix - same job family means similar roles
                if hard_filters.get("job_family") and emp.get("job_family") == hard_filters.get("job_family"):
                    # Same job family - allow it regardless of exact job title
                    is_similar_role = True
                
                if not is_similar_role:
                    continue
        
        # Check years_of_service_min (parse string like "1年3ヵ月")
        if hard_filters.get("years_of_service_min"):
            years_str = emp.get("years_of_service", "")
            # Simple parsing: extract number before "年"
            match = re.search(r'(\d+)年', years_str)
            if match:
                years = int(match.group(1))
                if years < hard_filters.get("years_of_service_min", 0):
                    continue
        
        # Apply user filters from modal
        # Gender filter
        if user_filters.get("gender"):
            gender_filters = user_filters["gender"]
            # Only apply filter if at least one gender is selected
            if gender_filters.get("male", False) or gender_filters.get("female", False):
                emp_gender = emp.get("gender", "")
                # Map Japanese gender to filter keys
                gender_matches = False
                if emp_gender == "男" and gender_filters.get("male", False):
                    gender_matches = True
                if emp_gender == "女" and gender_filters.get("female", False):
                    gender_matches = True
                if not gender_matches:
                    continue
        
        # Experience level filter (based on years of experience in company)
        if user_filters.get("experience"):
            exp_filters = user_filters["experience"]
            entered_at = emp.get("entered_at")
            years_exp = calculate_years_of_experience(entered_at) if entered_at else 0.0
            
            # Check if employee matches any selected experience filter
            matches_exp = False
            if exp_filters.get("lessThan3", False) and years_exp < 3:
                matches_exp = True
            if exp_filters.get("lessThan5", False) and years_exp < 5:
                matches_exp = True
            if exp_filters.get("moreThan5", False) and years_exp >= 5:
                matches_exp = True
            
            # If any experience filter is selected, employee must match at least one
            if any(exp_filters.values()) and not matches_exp:
                continue
        
        # Join date filter
        if user_filters.get("joinDate"):
            join_date_filter = user_filters["joinDate"]
            if not join_date_filter.get("noInput", False):
                entered_at = emp.get("entered_at")
                if entered_at:
                    from datetime import datetime
                    try:
                        emp_date = datetime.strptime(entered_at, '%Y-%m-%d')
                        if join_date_filter.get("from"):
                            from_date = datetime.strptime(join_date_filter["from"], '%Y-%m-%d')
                            if emp_date < from_date:
                                continue
                        if join_date_filter.get("to"):
                            to_date = datetime.strptime(join_date_filter["to"], '%Y-%m-%d')
                            if emp_date > to_date:
                                continue
                    except (ValueError, TypeError):
                        pass
        
        # Birth date filter
        if user_filters.get("birthDate"):
            birth_date_filter = user_filters["birthDate"]
            if not birth_date_filter.get("noInput", False):
                birthday = emp.get("birthday")
                if birthday:
                    from datetime import datetime
                    try:
                        emp_birthday = datetime.strptime(birthday, '%Y-%m-%d')
                        if birth_date_filter.get("from"):
                            from_date = datetime.strptime(birth_date_filter["from"], '%Y-%m-%d')
                            if emp_birthday < from_date:
                                continue
                        if birth_date_filter.get("to"):
                            to_date = datetime.strptime(birth_date_filter["to"], '%Y-%m-%d')
                            if emp_birthday > to_date:
                                continue
                    except (ValueError, TypeError):
                        pass
        
        # Employment period filter (from entered_at to retired_at or current)
        if user_filters.get("employmentPeriod"):
            emp_period_filter = user_filters["employmentPeriod"]
            if not emp_period_filter.get("noInput", False):
                entered_at = emp.get("entered_at")
                retired_at = emp.get("retired_at")
                if entered_at:
                    from datetime import datetime
                    try:
                        emp_entered = datetime.strptime(entered_at, '%Y-%m-%d')
                        emp_retired = datetime.strptime(retired_at, '%Y-%m-%d') if retired_at else datetime.now()
                        
                        if emp_period_filter.get("from"):
                            from_date = datetime.strptime(emp_period_filter["from"], '%Y-%m-%d')
                            if emp_entered < from_date:
                                continue
                        if emp_period_filter.get("to"):
                            to_date = datetime.strptime(emp_period_filter["to"], '%Y-%m-%d')
                            if emp_retired > to_date:
                                continue
                    except (ValueError, TypeError):
                        pass
        
        # Departure date filter
        if user_filters.get("departureDate"):
            departure_filter = user_filters["departureDate"]
            if not departure_filter.get("noInput", False):
                retired_at = emp.get("retired_at")
                if retired_at:
                    from datetime import datetime
                    try:
                        emp_retired = datetime.strptime(retired_at, '%Y-%m-%d')
                        if departure_filter.get("from"):
                            from_date = datetime.strptime(departure_filter["from"], '%Y-%m-%d')
                            if emp_retired < from_date:
                                continue
                        if departure_filter.get("to"):
                            to_date = datetime.strptime(departure_filter["to"], '%Y-%m-%d')
                            if emp_retired > to_date:
                                continue
                    except (ValueError, TypeError):
                        pass
                else:
                    # If employee hasn't retired but filter requires departure date, skip
                    if departure_filter.get("from") or departure_filter.get("to"):
                        continue
        
        filtered.append(emp)
        logger.info(f"Included employee {emp.get('employee_id')} ({emp.get('employee_name')}): dept={emp.get('dept_3')}, title={emp.get('job_title')}, family={emp.get('job_family')}")
    
    # Limit to 50 candidates
    filtered = filtered[:50]
    
    candidate_ids = [emp.get("employee_id") for emp in filtered]
    logger.info(f"Filtered {len(filtered)} candidates: {candidate_ids}")
    
    total_count = len(employees)
    filtered_count = len(filtered)
    elimination_rate = ((total_count - filtered_count) / total_count * 100) if total_count > 0 else 0
    
    # Generate SQL-like query description
    sql_query = f"""SELECT * FROM employees 
WHERE current_employee_flag = '{hard_filters.get("current_employee_flag", "●")}'
  AND employee_id != '{target_employee_id}'
  AND job_family = '{hard_filters.get("job_family", "")}'
  AND dept_3 IN ({', '.join([f"'{d}'" for d in hard_filters.get("dept_3", [])])})
LIMIT 50"""
    
    language = request.language or "ja"
    if language == "en":
        thinking_text = f"Searched the database. Found {filtered_count} candidates from {total_count} employees ({elimination_rate:.1f}% eliminated)."
    else:
        thinking_text = f"データベースを検索しました。{total_count}人の従業員から{filtered_count}人の候補者を見つけました（{elimination_rate:.1f}%を除外）。"
    
    return FilterSearchResponse(
        stage="filtering",
        thinking_text=thinking_text,
        stats={
            "total_employees": total_count,
            "filtered_count": filtered_count,
            "elimination_rate": round(elimination_rate, 1)
        },
        candidate_ids=candidate_ids,
        sql_query=sql_query
    )


async def evaluate_candidates_stream(request: EvaluateRequest):
    """
    Stream evaluation progress as candidates are processed
    """
    employees = load_employees()
    personas = load_personas()
    
    target_employee = request.target_employee
    candidate_ids = request.candidate_ids[:30]  # Limit to 30 for performance
    soft_criteria = request.soft_criteria
    language = request.language or "ja"
    
    # Get target employee's persona and resume
    target_id = target_employee.get("employee_id")
    target_persona = personas.get(target_id, {})
    target_resume = load_resume(target_id) or ""
    
    evaluations = []
    total = len(candidate_ids)
    
    async def generate():
        for idx, candidate_id in enumerate(candidate_ids, 1):
            # Find candidate employee
            candidate_emp = next((e for e in employees if e.get("employee_id") == candidate_id), None)
            if not candidate_emp:
                # Send progress update even if candidate not found
                progress_data = {
                    "type": "progress",
                    "current": idx,
                    "total": total
                }
                yield f"data: {json.dumps(progress_data)}\n\n"
                continue
            
            # Send progress update before processing
            progress_data = {
                "type": "progress",
                "current": idx,
                "total": total
            }
            yield f"data: {json.dumps(progress_data)}\n\n"
            
            candidate_persona = personas.get(candidate_id, {})
            candidate_resume = load_resume(candidate_id) or ""
            
            # Build evaluation prompt based on language
            if language == "en":
                system_prompt = """You are an excellent HR evaluator. Analyze candidate resumes and evaluate similarity to the target employee across 5 dimensions.

Output must be in JSON format following this structure:
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "Expert in Python and TensorFlow",
    "Has practical experience with Azure ML"
  ],
  "gaps": [
    "Lacks NLP experience",
    "Limited leadership experience"
  ],
  "explanation": "This candidate scores highly in technical skills and domain knowledge, but has room for improvement in years of experience and soft skills."
}

Important:
- Each score is an integer from 0-100
- overall is the average of the 5 dimensions (rounded)
- strengths: maximum 3, gaps: maximum 2
- explanation: 1-2 sentences in natural English
- Output JSON only, do not use markdown code blocks"""
            else:
                system_prompt = """あなたは優秀な人事評価者です。候補者のレジュメを分析し、ターゲット従業員との類似度を5つの次元で評価してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "PythonとTensorFlowに精通している",
    "Azure MLの実務経験がある"
  ],
  "gaps": [
    "NLPの経験が不足している",
    "リーダーシップ経験が少ない"
  ],
  "explanation": "この候補者は技術スキルとドメイン知識で高い評価を得ていますが、経験年数とソフトスキルで改善の余地があります。"
}

重要：
- 各スコアは0-100の整数
- overallは5つの次元の平均（四捨五入）
- strengthsは最大3つ、gapsは最大2つ
- explanationは自然な日本語で1-2文
- JSONのみを出力し、マークダウンコードブロックは使用しない"""

            if language == "en":
                target_info = f"""
Target Employee:
- Name: {target_employee.get('employee_name')}
- Position: {target_employee.get('job_title')}
- Department: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- Resume: {target_resume[:500]}...

Search Criteria:
- Key Skills: {', '.join(soft_criteria.get('key_skills', []))}
- Domain Expertise: {', '.join(soft_criteria.get('domain_expertise', []))}
- Experience Level: {soft_criteria.get('experience_level', '')}
"""

                candidate_info = f"""
Candidate:
- Name: {candidate_emp.get('employee_name')}
- Position: {candidate_emp.get('job_title')}
- Department: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- Resume: {candidate_resume[:500]}...
"""

                user_prompt = f"""{target_info}

{candidate_info}

Evaluate how similar this candidate is to the target employee across 5 dimensions."""
            else:
                target_info = f"""
ターゲット従業員:
- 名前: {target_employee.get('employee_name')}
- 役職: {target_employee.get('job_title')}
- 部署: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- レジュメ: {target_resume[:500]}...

検索条件:
- 重要スキル: {', '.join(soft_criteria.get('key_skills', []))}
- ドメイン専門性: {', '.join(soft_criteria.get('domain_expertise', []))}
- 経験レベル: {soft_criteria.get('experience_level', '')}
"""

                candidate_info = f"""
候補者:
- 名前: {candidate_emp.get('employee_name')}
- 役職: {candidate_emp.get('job_title')}
- 部署: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- レジュメ: {candidate_resume[:500]}...
"""

                user_prompt = f"""{target_info}

{candidate_info}

この候補者がターゲット従業員とどの程度類似しているか、5つの次元で評価してください。"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            try:
                response = await call_azure_openai(messages, temperature=0.2, use_json_format=True)
                
                if "choices" in response and len(response["choices"]) > 0:
                    content = response["choices"][0]["message"]["content"]
                    
                    # Clean JSON
                    content = re.sub(r'```json\s*', '', content)
                    content = re.sub(r'```\s*', '', content)
                    content = content.strip()
                    
                    try:
                        eval_data = json.loads(content)
                        
                        scores = EvaluationScore(**eval_data.get("scores", {}))
                        evaluation = CandidateEvaluation(
                            scores=scores,
                            strengths=eval_data.get("strengths", [])[:3],
                            gaps=eval_data.get("gaps", [])[:2],
                            explanation=eval_data.get("explanation", "")
                        )
                        
                        evaluations.append({
                            "candidate": candidate_emp,
                            "evaluation": evaluation
                        })
                    except (json.JSONDecodeError, Exception) as e:
                        logger.error(f"Failed to parse evaluation for {candidate_id}: {e}")
                        continue
            except Exception as e:
                logger.error(f"Failed to evaluate {candidate_id}: {e}")
                continue
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.3)
        
        # Sort by overall score
        evaluations.sort(key=lambda x: x["evaluation"].scores.overall, reverse=True)
        
        # Get top 3
        top_3 = evaluations[:3]
        
        top_3_results = []
        for rank, item in enumerate(top_3, 1):
            top_3_results.append({
                "rank": rank,
                "candidate": item["candidate"],
                "evaluation": {
                    "scores": item["evaluation"].scores.dict(),
                    "strengths": item["evaluation"].strengths,
                    "gaps": item["evaluation"].gaps,
                    "explanation": item["evaluation"].explanation
                }
            })
        
        if language == "en":
            thinking_text = f"Resume and review analysis complete. Evaluated {len(evaluations)} candidates and selected the top 3 most similar employees."
        else:
            thinking_text = f"レジュメとレビュー分析が完了しました。{len(evaluations)}人の候補者を評価し、最も類似した3人を選出しました。"
        
        # Send final results
        final_data = {
            "type": "complete",
            "thinking_text": thinking_text,
            "top_3_candidates": top_3_results
        }
        yield f"data: {json.dumps(final_data)}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/search/evaluate/stream")
async def evaluate_candidates_stream(request: EvaluateRequest):
    """
    Stream evaluation progress as candidates are processed in real-time
    """
    employees = load_employees()
    personas = load_personas()
    
    target_employee = request.target_employee
    candidate_ids = request.candidate_ids[:30]  # Limit to 30 for performance
    soft_criteria = request.soft_criteria
    language = request.language or "ja"
    
    # Get target employee's persona and resume
    target_id = target_employee.get("employee_id")
    target_persona = personas.get(target_id, {})
    target_resume = load_resume(target_id) or ""
    
    evaluations = []
    total = len(candidate_ids)
    
    async def generate():
        for idx, candidate_id in enumerate(candidate_ids, 1):
            # Find candidate employee
            candidate_emp = next((e for e in employees if e.get("employee_id") == candidate_id), None)
            if not candidate_emp:
                continue
            
            candidate_persona = personas.get(candidate_id, {})
            candidate_resume = load_resume(candidate_id) or ""
            
            # Build evaluation prompt (same as before)
            if language == "en":
                system_prompt = """You are an excellent HR evaluator. Analyze candidate resumes and evaluate similarity to the target employee across 5 dimensions.

Output must be in JSON format following this structure:
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "Expert in Python and TensorFlow",
    "Has practical experience with Azure ML"
  ],
  "gaps": [
    "Lacks NLP experience",
    "Limited leadership experience"
  ],
  "explanation": "This candidate scores highly in technical skills and domain knowledge, but has room for improvement in years of experience and soft skills."
}

Important:
- Each score is an integer from 0-100
- overall is the average of the 5 dimensions (rounded)
- strengths: maximum 3, gaps: maximum 2
- explanation: 1-2 sentences in natural English
- Output JSON only, do not use markdown code blocks"""
            else:
                system_prompt = """あなたは優秀な人事評価者です。候補者のレジュメを分析し、ターゲット従業員との類似度を5つの次元で評価してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "PythonとTensorFlowに精通している",
    "Azure MLの実務経験がある"
  ],
  "gaps": [
    "NLPの経験が不足している",
    "リーダーシップ経験が少ない"
  ],
  "explanation": "この候補者は技術スキルとドメイン知識で高い評価を得ていますが、経験年数とソフトスキルで改善の余地があります。"
}

重要：
- 各スコアは0-100の整数
- overallは5つの次元の平均（四捨五入）
- strengthsは最大3つ、gapsは最大2つ
- explanationは自然な日本語で1-2文
- JSONのみを出力し、マークダウンコードブロックは使用しない"""

            if language == "en":
                target_info = f"""
Target Employee:
- Name: {target_employee.get('employee_name')}
- Position: {target_employee.get('job_title')}
- Department: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- Resume: {target_resume[:500]}...

Search Criteria:
- Key Skills: {', '.join(soft_criteria.get('key_skills', []))}
- Domain Expertise: {', '.join(soft_criteria.get('domain_expertise', []))}
- Experience Level: {soft_criteria.get('experience_level', '')}
"""

                candidate_info = f"""
Candidate:
- Name: {candidate_emp.get('employee_name')}
- Position: {candidate_emp.get('job_title')}
- Department: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- Resume: {candidate_resume[:500]}...
"""

                user_prompt = f"""{target_info}

{candidate_info}

Evaluate how similar this candidate is to the target employee across 5 dimensions."""
            else:
                target_info = f"""
ターゲット従業員:
- 名前: {target_employee.get('employee_name')}
- 役職: {target_employee.get('job_title')}
- 部署: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- レジュメ: {target_resume[:500]}...

検索条件:
- 重要スキル: {', '.join(soft_criteria.get('key_skills', []))}
- ドメイン専門性: {', '.join(soft_criteria.get('domain_expertise', []))}
- 経験レベル: {soft_criteria.get('experience_level', '')}
"""

                candidate_info = f"""
候補者:
- 名前: {candidate_emp.get('employee_name')}
- 役職: {candidate_emp.get('job_title')}
- 部署: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- レジュメ: {candidate_resume[:500]}...
"""

                user_prompt = f"""{target_info}

{candidate_info}

この候補者がターゲット従業員とどの程度類似しているか、5つの次元で評価してください。"""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            try:
                response = await call_azure_openai(messages, temperature=0.2, use_json_format=True)
                
                if "choices" in response and len(response["choices"]) > 0:
                    content = response["choices"][0]["message"]["content"]
                    
                    # Clean JSON
                    content = re.sub(r'```json\s*', '', content)
                    content = re.sub(r'```\s*', '', content)
                    content = content.strip()
                    
                    try:
                        eval_data = json.loads(content)
                        resume_scores = EvaluationScore(**eval_data.get("scores", {}))
                        resume_strengths = eval_data.get("strengths", [])[:3]
                        resume_gaps = eval_data.get("gaps", [])[:2]
                        resume_explanation = eval_data.get("explanation", "")
                        
                        # Step 2: Analyze review data
                        target_reviews = review_service.get_all_reviews_for_employee(target_id)
                        candidate_reviews = review_service.get_all_reviews_for_employee(candidate_id)
                        
                        review_scores = None
                        review_strengths = []
                        review_gaps = []
                        review_explanation = ""
                        
                        if target_reviews.get("monthly") or target_reviews.get("half_year") or \
                           candidate_reviews.get("monthly") or candidate_reviews.get("half_year"):
                            
                            # Build review analysis prompt
                            if language == "en":
                                review_system_prompt = """You are an excellent HR evaluator. Analyze employee review data (monthly and half-year reviews) and evaluate similarity to the target employee's performance and growth trajectory.

Output must be in JSON format following this structure:
{
  "scores": {
    "performance_alignment": 85,
    "growth_trajectory": 80,
    "goal_achievement": 75,
    "career_alignment": 90,
    "overall": 82
  },
  "strengths": [
    "Similar performance patterns",
    "Aligned career goals"
  ],
  "gaps": [
    "Different growth trajectory",
    "Different performance focus"
  ],
  "explanation": "This candidate shows similar performance patterns and career alignment, but has a different growth trajectory."
}

Important:
- Each score is an integer from 0-100
- overall is the average of the 4 dimensions (rounded)
- strengths: maximum 2, gaps: maximum 2
- explanation: 1-2 sentences in natural English
- Output JSON only, do not use markdown code blocks"""
                            else:
                                review_system_prompt = """あなたは優秀な人事評価者です。従業員のレビューデータ（月次レビューと半期レビュー）を分析し、ターゲット従業員のパフォーマンスと成長軌道との類似度を評価してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "scores": {
    "performance_alignment": 85,
    "growth_trajectory": 80,
    "goal_achievement": 75,
    "career_alignment": 90,
    "overall": 82
  },
  "strengths": [
    "類似したパフォーマンスパターン",
    "一致したキャリア目標"
  ],
  "gaps": [
    "異なる成長軌道",
    "異なるパフォーマンス焦点"
  ],
  "explanation": "この候補者は類似したパフォーマンスパターンとキャリアの一致を示していますが、成長軌道が異なります。"
}

重要：
- 各スコアは0-100の整数
- overallは4つの次元の平均（四捨五入）
- strengthsは最大2つ、gapsは最大2つ
- explanationは自然な日本語で1-2文
- JSONのみを出力し、マークダウンコードブロックは使用しない"""
                            
                            # Format review data for prompt
                            target_review_text = ""
                            if target_reviews.get("monthly"):
                                m = target_reviews["monthly"]
                                target_review_text += f"Monthly Review: Goal: {m.get('monthly_goal', '')}, Review: {m.get('monthly_review', '')[:200]}\n"
                            if target_reviews.get("half_year"):
                                h = target_reviews["half_year"]
                                target_review_text += f"Half-Year Review: Score: {h.get('self_assessment_score', '')}, Growth: {h.get('half_year_self_review_achievement_growth', '')[:200]}, Career: {h.get('career_intentions', '')}\n"
                            
                            candidate_review_text = ""
                            if candidate_reviews.get("monthly"):
                                m = candidate_reviews["monthly"]
                                candidate_review_text += f"Monthly Review: Goal: {m.get('monthly_goal', '')}, Review: {m.get('monthly_review', '')[:200]}\n"
                            if candidate_reviews.get("half_year"):
                                h = candidate_reviews["half_year"]
                                candidate_review_text += f"Half-Year Review: Score: {h.get('self_assessment_score', '')}, Growth: {h.get('half_year_self_review_achievement_growth', '')[:200]}, Career: {h.get('career_intentions', '')}\n"
                            
                            if language == "en":
                                review_user_prompt = f"""Target Employee Reviews:
{target_review_text if target_review_text else "No review data available"}

Candidate Reviews:
{candidate_review_text if candidate_review_text else "No review data available"}

Evaluate how similar this candidate's performance and growth trajectory is to the target employee."""
                            else:
                                review_user_prompt = f"""ターゲット従業員のレビュー:
{target_review_text if target_review_text else "レビューデータなし"}

候補者のレビュー:
{candidate_review_text if candidate_review_text else "レビューデータなし"}

この候補者のパフォーマンスと成長軌道がターゲット従業員とどの程度類似しているか評価してください。"""
                            
                            try:
                                review_messages = [
                                    {"role": "system", "content": review_system_prompt},
                                    {"role": "user", "content": review_user_prompt}
                                ]
                                
                                review_response = await call_azure_openai(review_messages, temperature=0.2, use_json_format=True)
                                
                                if "choices" in review_response and len(review_response["choices"]) > 0:
                                    review_content = review_response["choices"][0]["message"]["content"]
                                    review_content = re.sub(r'```json\s*', '', review_content)
                                    review_content = re.sub(r'```\s*', '', review_content)
                                    review_content = review_content.strip()
                                    
                                    review_eval_data = json.loads(review_content)
                                    review_scores = review_eval_data.get("scores", {})
                                    review_strengths = review_eval_data.get("strengths", [])[:2]
                                    review_gaps = review_eval_data.get("gaps", [])[:2]
                                    review_explanation = review_eval_data.get("explanation", "")
                            except Exception as e:
                                logger.warning(f"Failed to analyze review data for {candidate_id}: {e}")
                                # Continue without review scores if analysis fails
                        
                        # Combine resume and review scores (70% resume, 30% review)
                        if review_scores and review_scores.get("overall"):
                            resume_overall = resume_scores.overall
                            review_overall = review_scores.get("overall", resume_overall)
                            combined_overall = int((resume_overall * 0.7) + (review_overall * 0.3))
                            
                            # Update overall score
                            resume_scores.overall = combined_overall
                            
                            # Combine explanations
                            if review_explanation:
                                if language == "en":
                                    combined_explanation = f"{resume_explanation} Additionally, review analysis shows: {review_explanation}"
                                else:
                                    combined_explanation = f"{resume_explanation} さらに、レビュー分析では: {review_explanation}"
                            else:
                                combined_explanation = resume_explanation
                            
                            # Combine strengths and gaps
                            all_strengths = resume_strengths + review_strengths
                            all_gaps = resume_gaps + review_gaps
                        else:
                            combined_explanation = resume_explanation
                            all_strengths = resume_strengths
                            all_gaps = resume_gaps
                        
                        evaluation = CandidateEvaluation(
                            scores=resume_scores,
                            strengths=all_strengths[:3],
                            gaps=all_gaps[:2],
                            explanation=combined_explanation
                        )
                        
                        evaluations.append({
                            "candidate": candidate_emp,
                            "evaluation": evaluation
                        })
                        
                        # Send progress update after resume analysis completes
                        resume_progress_data = {
                            "type": "progress",
                            "current": idx,
                            "total": total,
                            "stage": "resume",
                            "message": f"Analyzing resume ({idx}/{total})" if language == "en" else f"レジュメ分析中 ({idx}/{total})"
                        }
                        yield f"data: {json.dumps(resume_progress_data)}\n\n"
                        
                        # Send progress update after review analysis completes (if review data exists)
                        if review_scores and review_scores.get("overall"):
                            review_progress_data = {
                                "type": "progress",
                                "current": idx,
                                "total": total,
                                "stage": "review",
                                "message": f"Analyzing review data ({idx}/{total})" if language == "en" else f"レビューデータ分析中 ({idx}/{total})"
                            }
                            yield f"data: {json.dumps(review_progress_data)}\n\n"
                    except (json.JSONDecodeError, Exception) as e:
                        logger.error(f"Failed to parse evaluation for {candidate_id}: {e}")
                        # Still send progress update even if parsing fails
                        progress_data = {
                            "type": "progress",
                            "current": idx,
                            "total": total
                        }
                        yield f"data: {json.dumps(progress_data)}\n\n"
                        continue
            except Exception as e:
                logger.error(f"Failed to evaluate {candidate_id}: {e}")
                # Still send progress update even if API call fails
                progress_data = {
                    "type": "progress",
                    "current": idx,
                    "total": total
                }
                yield f"data: {json.dumps(progress_data)}\n\n"
                continue
            
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.3)
        
        # Sort by overall score
        evaluations.sort(key=lambda x: x["evaluation"].scores.overall, reverse=True)
        
        # Get top 3
        top_3 = evaluations[:3]
        
        top_3_results = []
        for rank, item in enumerate(top_3, 1):
            top_3_results.append({
                "rank": rank,
                "candidate": item["candidate"],
                "evaluation": {
                    "scores": item["evaluation"].scores.dict(),
                    "strengths": item["evaluation"].strengths,
                    "gaps": item["evaluation"].gaps,
                    "explanation": item["evaluation"].explanation
                }
            })
        
        if language == "en":
            thinking_text = f"Resume and review analysis complete. Evaluated {len(evaluations)} candidates and selected the top 3 most similar employees."
        else:
            thinking_text = f"レジュメとレビュー分析が完了しました。{len(evaluations)}人の候補者を評価し、最も類似した3人を選出しました。"
        
        # Send final results
        final_data = {
            "type": "complete",
            "thinking_text": thinking_text,
            "top_3_candidates": top_3_results
        }
        yield f"data: {json.dumps(final_data)}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/search/evaluate", response_model=EvaluateResponse)
async def evaluate_candidates(request: EvaluateRequest):
    """
    Layer 3: Deep Resume Matching (Legacy endpoint - kept for compatibility)
    Evaluate each candidate's resume against target profile
    """
    employees = load_employees()
    personas = load_personas()
    
    target_employee = request.target_employee
    candidate_ids = request.candidate_ids
    soft_criteria = request.soft_criteria
    language = request.language or "ja"
    
    # Get target employee's persona and resume
    target_id = target_employee.get("employee_id")
    target_persona = personas.get(target_id, {})
    target_resume = load_resume(target_id) or ""
    
    progress_messages = []
    evaluations = []
    
    for idx, candidate_id in enumerate(candidate_ids[:30], 1):  # Limit to 30 for performance
        # Find candidate employee
        candidate_emp = next((e for e in employees if e.get("employee_id") == candidate_id), None)
        if not candidate_emp:
            continue
        
        candidate_persona = personas.get(candidate_id, {})
        candidate_resume = load_resume(candidate_id) or ""
        
        if language == "en":
            progress_messages.append(f"Analyzing resume {idx} of {len(candidate_ids)}: {candidate_emp.get('employee_name', candidate_id)}")
        else:
            progress_messages.append(f"レジュメ {idx}/{len(candidate_ids)} を分析中: {candidate_emp.get('employee_name', candidate_id)}")
        
        # Also analyze review data after resume analysis
        if language == "en":
            progress_messages.append(f"Analyzing review data for {candidate_emp.get('employee_name', candidate_id)}")
        else:
            progress_messages.append(f"レビューデータを分析中: {candidate_emp.get('employee_name', candidate_id)}")
        
        # Build evaluation prompt based on language
        if language == "en":
            system_prompt = """You are an excellent HR evaluator. Analyze candidate resumes and evaluate similarity to the target employee across 5 dimensions.

Output must be in JSON format following this structure:
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "Expert in Python and TensorFlow",
    "Has practical experience with Azure ML"
  ],
  "gaps": [
    "Lacks NLP experience",
    "Limited leadership experience"
  ],
  "explanation": "This candidate scores highly in technical skills and domain knowledge, but has room for improvement in years of experience and soft skills."
}

Important:
- Each score is an integer from 0-100
- overall is the average of the 5 dimensions (rounded)
- strengths: maximum 3, gaps: maximum 2
- explanation: 1-2 sentences in natural English
- Output JSON only, do not use markdown code blocks"""
        else:
            system_prompt = """あなたは優秀な人事評価者です。候補者のレジュメを分析し、ターゲット従業員との類似度を5つの次元で評価してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "scores": {
    "technical_skills": 85,
    "domain_expertise": 90,
    "experience_level": 75,
    "role_alignment": 80,
    "soft_skills": 70,
    "overall": 82
  },
  "strengths": [
    "PythonとTensorFlowに精通している",
    "Azure MLの実務経験がある"
  ],
  "gaps": [
    "NLPの経験が不足している",
    "リーダーシップ経験が少ない"
  ],
  "explanation": "この候補者は技術スキルとドメイン知識で高い評価を得ていますが、経験年数とソフトスキルで改善の余地があります。"
}

重要：
- 各スコアは0-100の整数
- overallは5つの次元の平均（四捨五入）
- strengthsは最大3つ、gapsは最大2つ
- explanationは自然な日本語で1-2文
- JSONのみを出力し、マークダウンコードブロックは使用しない"""

        if language == "en":
            target_info = f"""
Target Employee:
- Name: {target_employee.get('employee_name')}
- Position: {target_employee.get('job_title')}
- Department: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- Resume: {target_resume[:500]}...

Search Criteria:
- Key Skills: {', '.join(soft_criteria.get('key_skills', []))}
- Domain Expertise: {', '.join(soft_criteria.get('domain_expertise', []))}
- Experience Level: {soft_criteria.get('experience_level', '')}
"""

            candidate_info = f"""
Candidate:
- Name: {candidate_emp.get('employee_name')}
- Position: {candidate_emp.get('job_title')}
- Department: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- Skills: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- Resume: {candidate_resume[:500]}...
"""

            user_prompt = f"""{target_info}

{candidate_info}

Evaluate how similar this candidate is to the target employee across 5 dimensions."""
        else:
            target_info = f"""
ターゲット従業員:
- 名前: {target_employee.get('employee_name')}
- 役職: {target_employee.get('job_title')}
- 部署: {target_employee.get('dept_3')} / {target_employee.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in target_persona.get('skills', [])])}
- レジュメ: {target_resume[:500]}...

検索条件:
- 重要スキル: {', '.join(soft_criteria.get('key_skills', []))}
- ドメイン専門性: {', '.join(soft_criteria.get('domain_expertise', []))}
- 経験レベル: {soft_criteria.get('experience_level', '')}
"""

            candidate_info = f"""
候補者:
- 名前: {candidate_emp.get('employee_name')}
- 役職: {candidate_emp.get('job_title')}
- 部署: {candidate_emp.get('dept_3')} / {candidate_emp.get('dept_4')}
- スキル: {', '.join([s.get('name', '') for s in candidate_persona.get('skills', [])])}
- レジュメ: {candidate_resume[:500]}...
"""

            user_prompt = f"""{target_info}

{candidate_info}

この候補者がターゲット従業員とどの程度類似しているか、5つの次元で評価してください。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await call_azure_openai(messages, temperature=0.2, use_json_format=True)
            
            if "choices" in response and len(response["choices"]) > 0:
                content = response["choices"][0]["message"]["content"]
                
                # Clean JSON
                content = re.sub(r'```json\s*', '', content)
                content = re.sub(r'```\s*', '', content)
                content = content.strip()
                
                try:
                    eval_data = json.loads(content)
                    resume_scores = EvaluationScore(**eval_data.get("scores", {}))
                    resume_strengths = eval_data.get("strengths", [])[:3]
                    resume_gaps = eval_data.get("gaps", [])[:2]
                    resume_explanation = eval_data.get("explanation", "")
                    
                    # Step 2: Analyze review data
                    target_reviews = review_service.get_all_reviews_for_employee(target_id)
                    candidate_reviews = review_service.get_all_reviews_for_employee(candidate_id)
                    
                    review_scores = None
                    review_strengths = []
                    review_gaps = []
                    review_explanation = ""
                    
                    if target_reviews.get("monthly") or target_reviews.get("half_year") or \
                       candidate_reviews.get("monthly") or candidate_reviews.get("half_year"):
                        
                        # Build review analysis prompt
                        if language == "en":
                            review_system_prompt = """You are an excellent HR evaluator. Analyze employee review data (monthly and half-year reviews) and evaluate similarity to the target employee's performance and growth trajectory.

Output must be in JSON format following this structure:
{
  "scores": {
    "performance_alignment": 85,
    "growth_trajectory": 80,
    "goal_achievement": 75,
    "career_alignment": 90,
    "overall": 82
  },
  "strengths": [
    "Similar performance patterns",
    "Aligned career goals"
  ],
  "gaps": [
    "Different growth trajectory",
    "Different performance focus"
  ],
  "explanation": "This candidate shows similar performance patterns and career alignment, but has a different growth trajectory."
}

Important:
- Each score is an integer from 0-100
- overall is the average of the 4 dimensions (rounded)
- strengths: maximum 2, gaps: maximum 2
- explanation: 1-2 sentences in natural English
- Output JSON only, do not use markdown code blocks"""
                        else:
                            review_system_prompt = """あなたは優秀な人事評価者です。従業員のレビューデータ（月次レビューと半期レビュー）を分析し、ターゲット従業員のパフォーマンスと成長軌道との類似度を評価してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "scores": {
    "performance_alignment": 85,
    "growth_trajectory": 80,
    "goal_achievement": 75,
    "career_alignment": 90,
    "overall": 82
  },
  "strengths": [
    "類似したパフォーマンスパターン",
    "一致したキャリア目標"
  ],
  "gaps": [
    "異なる成長軌道",
    "異なるパフォーマンス焦点"
  ],
  "explanation": "この候補者は類似したパフォーマンスパターンとキャリアの一致を示していますが、成長軌道が異なります。"
}

重要：
- 各スコアは0-100の整数
- overallは4つの次元の平均（四捨五入）
- strengthsは最大2つ、gapsは最大2つ
- explanationは自然な日本語で1-2文
- JSONのみを出力し、マークダウンコードブロックは使用しない"""
                        
                        # Format review data for prompt
                        target_review_text = ""
                        if target_reviews.get("monthly"):
                            m = target_reviews["monthly"]
                            target_review_text += f"Monthly Review: Goal: {m.get('monthly_goal', '')}, Review: {m.get('monthly_review', '')[:200]}\n"
                        if target_reviews.get("half_year"):
                            h = target_reviews["half_year"]
                            target_review_text += f"Half-Year Review: Score: {h.get('self_assessment_score', '')}, Growth: {h.get('half_year_self_review_achievement_growth', '')[:200]}, Career: {h.get('career_intentions', '')}\n"
                        
                        candidate_review_text = ""
                        if candidate_reviews.get("monthly"):
                            m = candidate_reviews["monthly"]
                            candidate_review_text += f"Monthly Review: Goal: {m.get('monthly_goal', '')}, Review: {m.get('monthly_review', '')[:200]}\n"
                        if candidate_reviews.get("half_year"):
                            h = candidate_reviews["half_year"]
                            candidate_review_text += f"Half-Year Review: Score: {h.get('self_assessment_score', '')}, Growth: {h.get('half_year_self_review_achievement_growth', '')[:200]}, Career: {h.get('career_intentions', '')}\n"
                        
                        if language == "en":
                            review_user_prompt = f"""Target Employee Reviews:
{target_review_text if target_review_text else "No review data available"}

Candidate Reviews:
{candidate_review_text if candidate_review_text else "No review data available"}

Evaluate how similar this candidate's performance and growth trajectory is to the target employee."""
                        else:
                            review_user_prompt = f"""ターゲット従業員のレビュー:
{target_review_text if target_review_text else "レビューデータなし"}

候補者のレビュー:
{candidate_review_text if candidate_review_text else "レビューデータなし"}

この候補者のパフォーマンスと成長軌道がターゲット従業員とどの程度類似しているか評価してください。"""
                        
                        try:
                            review_messages = [
                                {"role": "system", "content": review_system_prompt},
                                {"role": "user", "content": review_user_prompt}
                            ]
                            
                            review_response = await call_azure_openai(review_messages, temperature=0.2, use_json_format=True)
                            
                            if "choices" in review_response and len(review_response["choices"]) > 0:
                                review_content = review_response["choices"][0]["message"]["content"]
                                review_content = re.sub(r'```json\s*', '', review_content)
                                review_content = re.sub(r'```\s*', '', review_content)
                                review_content = review_content.strip()
                                
                                review_eval_data = json.loads(review_content)
                                review_scores = review_eval_data.get("scores", {})
                                review_strengths = review_eval_data.get("strengths", [])[:2]
                                review_gaps = review_eval_data.get("gaps", [])[:2]
                                review_explanation = review_eval_data.get("explanation", "")
                        except Exception as e:
                            logger.warning(f"Failed to analyze review data for {candidate_id}: {e}")
                            # Continue without review scores if analysis fails
                    
                    # Combine resume and review scores (70% resume, 30% review)
                    if review_scores and review_scores.get("overall"):
                        resume_overall = resume_scores.overall
                        review_overall = review_scores.get("overall", resume_overall)
                        combined_overall = int((resume_overall * 0.7) + (review_overall * 0.3))
                        
                        # Update overall score
                        resume_scores.overall = combined_overall
                        
                        # Combine explanations
                        if review_explanation:
                            if language == "en":
                                combined_explanation = f"{resume_explanation} Additionally, review analysis shows: {review_explanation}"
                            else:
                                combined_explanation = f"{resume_explanation} さらに、レビュー分析では: {review_explanation}"
                        else:
                            combined_explanation = resume_explanation
                        
                        # Combine strengths and gaps
                        all_strengths = resume_strengths + review_strengths
                        all_gaps = resume_gaps + review_gaps
                    else:
                        combined_explanation = resume_explanation
                        all_strengths = resume_strengths
                        all_gaps = resume_gaps
                    
                    evaluation = CandidateEvaluation(
                        scores=resume_scores,
                        strengths=all_strengths[:3],
                        gaps=all_gaps[:2],
                        explanation=combined_explanation
                    )
                    
                    evaluations.append({
                        "candidate": candidate_emp,
                        "evaluation": evaluation
                    })
                except (json.JSONDecodeError, Exception) as e:
                    # Skip this candidate if parsing fails
                    continue
        except Exception as e:
            # Skip this candidate if API call fails
            continue
        
        # Small delay to avoid rate limiting
        import asyncio
        await asyncio.sleep(0.3)
    
    # Sort by overall score
    evaluations.sort(key=lambda x: x["evaluation"].scores.overall, reverse=True)
    
    # Get top 3
    top_3 = evaluations[:3]
    
    top_3_results = []
    for rank, item in enumerate(top_3, 1):
        top_3_results.append(CandidateResult(
            rank=rank,
            candidate=item["candidate"],
            evaluation=item["evaluation"]
        ))
    
    if language == "en":
        thinking_text = f"Resume and review analysis complete. Evaluated {len(evaluations)} candidates and selected the top 3 most similar employees."
    else:
        thinking_text = f"レジュメとレビュー分析が完了しました。{len(evaluations)}人の候補者を評価し、最も類似した3人を選出しました。"
    
    return EvaluateResponse(
        stage="evaluation",
        thinking_text=thinking_text,
        progress_messages=progress_messages,
        top_3_candidates=top_3_results
    )


@app.post("/api/search/natural-language", response_model=NaturalLanguageSearchResponse)
async def natural_language_search(request: NaturalLanguageSearchRequest):
    """
    Natural language search for employees
    Layer 1: Parse natural language query into structured filters using LLM
    Layer 2: Apply filters to search employees
    """
    employees = load_employees()
    if not employees:
        raise HTTPException(status_code=404, detail="No employee data available")
    
    query = request.query.strip()
    language = request.language or "ja"
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    # Layer 1: Parse natural language query using LLM
    if language == "en":
        system_prompt = """You are an excellent HR search assistant. Parse natural language queries about employees into structured search filters.

Output must be in JSON format following this structure:
{
  "filters": {
    "employee_id": null,
    "employee_name": null,
    "mail": null,
    "nickname": null,
    "employment_type": null,
    "current_employee_flag": "●",
    "entered_at_min": null,
    "entered_at_max": null,
    "last_day_at": null,
    "retired_at": null,
    "fulltime_employee_hired_at": null,
    "fulltime_employee_retired_at": null,
    "employment_category": null,
    "recruitment_category_new_graduate": null,
    "gender": null,
    "birthday_min": null,
    "birthday_max": null,
    "age_min": null,
    "age_max": null,
    "years_of_service_min": null,
    "years_of_service_max": null,
    "dept_1": null,
    "dept_2": null,
    "dept_3": null,
    "dept_4": null,
    "dept_5": null,
    "dept_6": null,
    "location": null,
    "job_title": null,
    "job_family": null,
    "latest_job_grade": null,
    "latest_org_grade": null,
    "grade_combined": null,
    "salary_table": null,
    "jp_non_jp_classification": null
  },
  "thinking_text": "I understood the query as: finding employees with less than 2 years of experience in the AI department. I'll search for current employees in AI-related departments with less than 2 years of service."
}

Available database fields (use exact field names):
- employee_id (string): Employee ID
- employee_name (string): Full name
- mail (string): Email address
- nickname (string or null): Nickname
- employment_type (string): "正社員" (full-time), "業務委託" (contractor), etc.
- current_employee_flag (string): "●" for current employees, empty/null for former
- entered_at (date, YYYY-MM-DD): Employment start date
- last_day_at (date or null): Last working day
- retired_at (date or null): Retirement date
- fulltime_employee_hired_at (date or null): Full-time hire date
- fulltime_employee_retired_at (date or null): Full-time retirement date
- employment_category (string or null): Employment category
- recruitment_category_new_graduate (string or null): New graduate flag
- gender (string): "男" (male), "女" (female)
- birthday (date, YYYY-MM-DD): Birth date
- age (number or null): Age
- years_of_service (string): Service years, e.g., "1年3ヵ月" or "1 year 3 months"
- dept_1, dept_2, dept_3, dept_4, dept_5, dept_6 (string): Department hierarchy levels
- location (string): Office location, e.g., "本社" (headquarters)
- job_title (string): Job title, e.g., "シニアエンジニア" (Senior Engineer)
- job_family (string): Job family, e.g., "エンジニア" (Engineer)
- latest_job_grade (string or null): Latest job grade
- latest_org_grade (string or null): Latest organizational grade
- grade_combined (string or null): Combined grade
- salary_table (string or null): Salary table reference
- jp_non_jp_classification (string): "JP" or "Non-JP" classification

Filter field types:
- String fields: Use exact string value or array of strings for multiple matches
- Date fields: Use YYYY-MM-DD format, or use _min/_max for ranges (e.g., entered_at_min, entered_at_max)
- Numeric fields: Use number or _min/_max for ranges (e.g., age_min, age_max, years_of_service_min, years_of_service_max)
- Boolean-like: current_employee_flag uses "●" for current employees

Important:
- Parse the query carefully and extract ALL mentioned criteria using the exact field names above
- For date ranges, use _min and _max suffixes (e.g., entered_at_min, birthday_max)
- For numeric ranges, use _min and _max suffixes (e.g., age_min, years_of_service_max)
- For department searches, you can use any dept_1 through dept_6 field
- For list fields (like dept_3), use an array if multiple values should match
- Set unused fields to null
- thinking_text: explain what you understood from the query in natural language
- Output JSON only, do not use markdown code blocks"""
    else:
        system_prompt = """あなたは優秀な人事検索アシスタントです。従業員に関する自然言語クエリを構造化された検索フィルターに変換してください。

出力は必ずJSON形式で、以下の構造に従ってください：
{
  "filters": {
    "employee_id": null,
    "employee_name": null,
    "mail": null,
    "nickname": null,
    "employment_type": null,
    "current_employee_flag": "●",
    "entered_at_min": null,
    "entered_at_max": null,
    "last_day_at": null,
    "retired_at": null,
    "fulltime_employee_hired_at": null,
    "fulltime_employee_retired_at": null,
    "employment_category": null,
    "recruitment_category_new_graduate": null,
    "gender": null,
    "birthday_min": null,
    "birthday_max": null,
    "age_min": null,
    "age_max": null,
    "years_of_service_min": null,
    "years_of_service_max": null,
    "dept_1": null,
    "dept_2": null,
    "dept_3": null,
    "dept_4": null,
    "dept_5": null,
    "dept_6": null,
    "location": null,
    "job_title": null,
    "job_family": null,
    "latest_job_grade": null,
    "latest_org_grade": null,
    "grade_combined": null,
    "salary_table": null,
    "jp_non_jp_classification": null
  },
  "thinking_text": "クエリを理解しました：AI部門で2年未満の経験を持つ従業員を探す。AI関連部署で2年未満の勤続年数の現役従業員を検索します。"
}

利用可能なデータベースフィールド（正確なフィールド名を使用）：
- employee_id (文字列): 従業員ID
- employee_name (文字列): 氏名
- mail (文字列): メールアドレス
- nickname (文字列またはnull): ニックネーム
- employment_type (文字列): "正社員"、"業務委託" など
- current_employee_flag (文字列): "●" が現役従業員、空/null が退職者
- entered_at (日付, YYYY-MM-DD): 入社日
- last_day_at (日付またはnull): 最終出社日
- retired_at (日付またはnull): 退職日
- fulltime_employee_hired_at (日付またはnull): 正社員採用日
- fulltime_employee_retired_at (日付またはnull): 正社員退職日
- employment_category (文字列またはnull): 雇用区分
- recruitment_category_new_graduate (文字列またはnull): 新卒区分
- gender (文字列): "男" (男性)、"女" (女性)
- birthday (日付, YYYY-MM-DD): 生年月日
- age (数値またはnull): 年齢
- years_of_service (文字列): 勤続年数、例: "1年3ヵ月"
- dept_1, dept_2, dept_3, dept_4, dept_5, dept_6 (文字列): 部署階層レベル
- location (文字列): 勤務地、例: "本社"
- job_title (文字列): 職位、例: "シニアエンジニア"
- job_family (文字列): 職種、例: "エンジニア"
- latest_job_grade (文字列またはnull): 最新の職位等級
- latest_org_grade (文字列またはnull): 最新の組織等級
- grade_combined (文字列またはnull): 統合等級
- salary_table (文字列またはnull): 給与テーブル参照
- jp_non_jp_classification (文字列): "JP" または "Non-JP" 区分

フィルターフィールドタイプ：
- 文字列フィールド: 正確な文字列値を使用、または複数一致の場合は文字列配列
- 日付フィールド: YYYY-MM-DD形式、または範囲の場合は_min/_maxを使用（例: entered_at_min, entered_at_max）
- 数値フィールド: 数値、または範囲の場合は_min/_maxを使用（例: age_min, age_max, years_of_service_min, years_of_service_max）
- ブール値風: current_employee_flagは現役従業員に"●"を使用

重要：
- クエリを注意深く解析し、上記の正確なフィールド名を使用して言及されているすべての条件を抽出
- 日付範囲には_minと_maxサフィックスを使用（例: entered_at_min, birthday_max）
- 数値範囲には_minと_maxサフィックスを使用（例: age_min, years_of_service_max）
- 部署検索にはdept_1からdept_6のいずれかのフィールドを使用可能
- リストフィールド（dept_3など）は、複数の値が一致する必要がある場合は配列を使用
- 使用しないフィールドはnullに設定
- thinking_text: クエリから理解した内容を自然な日本語で説明
- JSONのみを出力し、マークダウンコードブロックは使用しない"""
    
    if language == "en":
        user_prompt = f"""Parse the following natural language query and convert it into structured search filters:

"{query}"

You can filter by any field in the employee profile schema. Extract all mentioned criteria and map them to the appropriate filter fields."""
    else:
        user_prompt = f"""以下の自然言語クエリを解析して、構造化された検索フィルターに変換してください：

"{query}"

従業員プロファイルスキーマの任意のフィールドでフィルタリングできます。言及されているすべての条件を抽出し、適切なフィルターフィールドにマッピングしてください。"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        # Parse query
        if language == "en":
            thinking_text_parsing = "🤔 Analyzing your search query..."
        else:
            thinking_text_parsing = "🤔 検索クエリを分析中..."
        
        response = await call_azure_openai(messages, temperature=0.1, use_json_format=True)
        
        if "choices" not in response or len(response["choices"]) == 0:
            raise HTTPException(status_code=500, detail="No response from Azure OpenAI")
        
        content = response["choices"][0]["message"]["content"]
        
        # Clean JSON
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*', '', content)
        content = content.strip()
        
        # Parse JSON
        try:
            parsed_data = json.loads(content)
            filters = parsed_data.get("filters", {})
            thinking_text = parsed_data.get("thinking_text", thinking_text_parsing)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON response: {str(e)}")
        
        # Layer 2: Apply filters to search employees
        if language == "en":
            thinking_text_filtering = f"✅ Query understood: {thinking_text}\n🔍 Searching database..."
        else:
            thinking_text_filtering = f"✅ クエリを理解しました: {thinking_text}\n🔍 データベースを検索中..."
        
        filtered_employees = []
        
        for emp in employees:
            match = True
            
            # Check employee_id
            if filters.get("employee_id"):
                filter_id = filters.get("employee_id")
                if isinstance(filter_id, list):
                    if emp.get("employee_id") not in filter_id:
                        match = False
                else:
                    if emp.get("employee_id") != filter_id:
                        match = False
            
            # Check employee_name (partial match)
            if match and filters.get("employee_name"):
                filter_name = filters.get("employee_name")
                emp_name = emp.get("employee_name", "")
                if isinstance(filter_name, list):
                    if not any(fn.lower() in emp_name.lower() or emp_name.lower() in fn.lower() for fn in filter_name):
                        match = False
                else:
                    if filter_name.lower() not in emp_name.lower() and emp_name.lower() not in filter_name.lower():
                        match = False
            
            # Check mail (partial match)
            if match and filters.get("mail"):
                filter_mail = filters.get("mail")
                emp_mail = emp.get("mail", "")
                if isinstance(filter_mail, list):
                    if not any(fm.lower() in emp_mail.lower() for fm in filter_mail):
                        match = False
                else:
                    if filter_mail.lower() not in emp_mail.lower():
                        match = False
            
            # Check nickname
            if match and filters.get("nickname"):
                filter_nickname = filters.get("nickname")
                emp_nickname = emp.get("nickname", "")
                if isinstance(filter_nickname, list):
                    if emp_nickname not in filter_nickname:
                        match = False
                else:
                    if emp_nickname != filter_nickname:
                        match = False
            
            # Check employment_type
            if match and filters.get("employment_type"):
                filter_emp_type = filters.get("employment_type")
                emp_emp_type = emp.get("employment_type", "")
                if isinstance(filter_emp_type, list):
                    if emp_emp_type not in filter_emp_type:
                        match = False
                else:
                    if emp_emp_type != filter_emp_type:
                        match = False
            
            # Check current_employee_flag
            if match and filters.get("current_employee_flag"):
                if emp.get("current_employee_flag") != filters.get("current_employee_flag"):
                    match = False
            
            # Check entered_at (date range)
            if match and (filters.get("entered_at_min") or filters.get("entered_at_max")):
                entered_at = emp.get("entered_at")
                if entered_at:
                    try:
                        entered_date = datetime.strptime(entered_at, "%Y-%m-%d").date()
                        if filters.get("entered_at_min"):
                            min_date = datetime.strptime(filters.get("entered_at_min"), "%Y-%m-%d").date()
                            if entered_date < min_date:
                                match = False
                        if match and filters.get("entered_at_max"):
                            max_date = datetime.strptime(filters.get("entered_at_max"), "%Y-%m-%d").date()
                            if entered_date > max_date:
                                match = False
                    except (ValueError, TypeError):
                        pass
            
            # Check last_day_at
            if match and filters.get("last_day_at"):
                filter_date = filters.get("last_day_at")
                emp_date = emp.get("last_day_at")
                if emp_date != filter_date:
                    match = False
            
            # Check retired_at
            if match and filters.get("retired_at"):
                filter_date = filters.get("retired_at")
                emp_date = emp.get("retired_at")
                if emp_date != filter_date:
                    match = False
            
            # Check fulltime_employee_hired_at
            if match and filters.get("fulltime_employee_hired_at"):
                filter_date = filters.get("fulltime_employee_hired_at")
                emp_date = emp.get("fulltime_employee_hired_at")
                if emp_date != filter_date:
                    match = False
            
            # Check fulltime_employee_retired_at
            if match and filters.get("fulltime_employee_retired_at"):
                filter_date = filters.get("fulltime_employee_retired_at")
                emp_date = emp.get("fulltime_employee_retired_at")
                if emp_date != filter_date:
                    match = False
            
            # Check employment_category
            if match and filters.get("employment_category"):
                filter_cat = filters.get("employment_category")
                emp_cat = emp.get("employment_category", "")
                if isinstance(filter_cat, list):
                    if emp_cat not in filter_cat:
                        match = False
                else:
                    if emp_cat != filter_cat:
                        match = False
            
            # Check recruitment_category_new_graduate
            if match and filters.get("recruitment_category_new_graduate"):
                filter_cat = filters.get("recruitment_category_new_graduate")
                emp_cat = emp.get("recruitment_category_new_graduate", "")
                if isinstance(filter_cat, list):
                    if emp_cat not in filter_cat:
                        match = False
                else:
                    if emp_cat != filter_cat:
                        match = False
            
            # Check gender
            if match and filters.get("gender"):
                if emp.get("gender", "") != filters.get("gender"):
                    match = False
            
            # Check birthday (date range)
            if match and (filters.get("birthday_min") or filters.get("birthday_max")):
                birthday = emp.get("birthday")
                if birthday:
                    try:
                        birth_date = datetime.strptime(birthday, "%Y-%m-%d").date()
                        if filters.get("birthday_min"):
                            min_date = datetime.strptime(filters.get("birthday_min"), "%Y-%m-%d").date()
                            if birth_date < min_date:
                                match = False
                        if match and filters.get("birthday_max"):
                            max_date = datetime.strptime(filters.get("birthday_max"), "%Y-%m-%d").date()
                            if birth_date > max_date:
                                match = False
                    except (ValueError, TypeError):
                        pass
            
            # Check age (numeric range)
            if match and (filters.get("age_min") is not None or filters.get("age_max") is not None):
                emp_age = emp.get("age")
                if emp_age is not None:
                    if filters.get("age_min") is not None:
                        if emp_age < filters.get("age_min"):
                            match = False
                    if match and filters.get("age_max") is not None:
                        if emp_age > filters.get("age_max"):
                            match = False
                elif filters.get("age_min") is not None or filters.get("age_max") is not None:
                    # If age filter is set but employee age is null, exclude
                    match = False
            
            # Check years_of_service (numeric range)
            if match and (filters.get("years_of_service_min") is not None or filters.get("years_of_service_max") is not None):
                years_str = emp.get("years_of_service", "")
                entered_at = emp.get("entered_at")
                years = 0.0
                
                if entered_at:
                    years = calculate_years_of_experience(entered_at)
                elif years_str:
                    # Parse string like "1年3ヵ月" or "1 year 3 months"
                    match_years = re.search(r'(\d+)年', years_str)
                    if match_years:
                        years = float(match_years.group(1))
                
                if filters.get("years_of_service_min") is not None:
                    if years < filters.get("years_of_service_min"):
                        match = False
                
                if match and filters.get("years_of_service_max") is not None:
                    if years > filters.get("years_of_service_max"):
                        match = False
            
            # Check dept_1
            if match and filters.get("dept_1"):
                filter_dept = filters.get("dept_1")
                emp_dept = emp.get("dept_1", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check dept_2
            if match and filters.get("dept_2"):
                filter_dept = filters.get("dept_2")
                emp_dept = emp.get("dept_2", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check dept_3
            if match and filters.get("dept_3"):
                filter_dept = filters.get("dept_3")
                emp_dept = emp.get("dept_3", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        # Allow flexible matching for AI/data-related departments
                        dept_lower = emp_dept.lower()
                        is_related = False
                        for fd in filter_dept:
                            fd_lower = fd.lower()
                            ai_keywords = ["ai", "機械学習", "データ", "ml", "データサイエンス", "ai推進", "aiアクセラレーション"]
                            if any(keyword in dept_lower or keyword in fd_lower for keyword in ai_keywords):
                                is_related = True
                                break
                        if not is_related:
                            match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check dept_4
            if match and filters.get("dept_4"):
                filter_dept = filters.get("dept_4")
                emp_dept = emp.get("dept_4", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check dept_5
            if match and filters.get("dept_5"):
                filter_dept = filters.get("dept_5")
                emp_dept = emp.get("dept_5", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check dept_6
            if match and filters.get("dept_6"):
                filter_dept = filters.get("dept_6")
                emp_dept = emp.get("dept_6", "")
                if isinstance(filter_dept, list):
                    if emp_dept not in filter_dept:
                        match = False
                else:
                    if filter_dept.lower() not in emp_dept.lower() and emp_dept.lower() not in filter_dept.lower():
                        match = False
            
            # Check location
            if match and filters.get("location"):
                filter_location = filters.get("location")
                emp_location = emp.get("location", "")
                if isinstance(filter_location, list):
                    if not any(fl.lower() in emp_location.lower() or emp_location.lower() in fl.lower() for fl in filter_location):
                        match = False
                else:
                    if filter_location.lower() not in emp_location.lower() and emp_location.lower() not in filter_location.lower():
                        match = False
            
            # Check job_title
            if match and filters.get("job_title"):
                filter_title = filters.get("job_title")
                emp_title = emp.get("job_title", "")
                if isinstance(filter_title, list):
                    if emp_title not in filter_title:
                        # Allow similar roles
                        is_similar = False
                        engineer_keywords = ["エンジニア", "engineer"]
                        emp_title_lower = emp_title.lower()
                        for ft in filter_title:
                            ft_lower = ft.lower()
                            if any(kw in emp_title_lower and kw in ft_lower for kw in engineer_keywords):
                                is_similar = True
                                break
                        if not is_similar:
                            match = False
                else:
                    if filter_title.lower() not in emp_title.lower() and emp_title.lower() not in filter_title.lower():
                        match = False
            
            # Check job_family
            if match and filters.get("job_family"):
                if emp.get("job_family", "") != filters.get("job_family"):
                    match = False
            
            # Check latest_job_grade
            if match and filters.get("latest_job_grade"):
                filter_grade = filters.get("latest_job_grade")
                emp_grade = emp.get("latest_job_grade", "")
                if isinstance(filter_grade, list):
                    if emp_grade not in filter_grade:
                        match = False
                else:
                    if emp_grade != filter_grade:
                        match = False
            
            # Check latest_org_grade
            if match and filters.get("latest_org_grade"):
                filter_grade = filters.get("latest_org_grade")
                emp_grade = emp.get("latest_org_grade", "")
                if isinstance(filter_grade, list):
                    if emp_grade not in filter_grade:
                        match = False
                else:
                    if emp_grade != filter_grade:
                        match = False
            
            # Check grade_combined
            if match and filters.get("grade_combined"):
                filter_grade = filters.get("grade_combined")
                emp_grade = emp.get("grade_combined", "")
                if isinstance(filter_grade, list):
                    if emp_grade not in filter_grade:
                        match = False
                else:
                    if emp_grade != filter_grade:
                        match = False
            
            # Check salary_table
            if match and filters.get("salary_table"):
                filter_table = filters.get("salary_table")
                emp_table = emp.get("salary_table", "")
                if isinstance(filter_table, list):
                    if emp_table not in filter_table:
                        match = False
                else:
                    if emp_table != filter_table:
                        match = False
            
            # Check jp_non_jp_classification
            if match and filters.get("jp_non_jp_classification"):
                filter_class = filters.get("jp_non_jp_classification")
                emp_class = emp.get("jp_non_jp_classification", "")
                if isinstance(filter_class, list):
                    if emp_class not in filter_class:
                        match = False
                else:
                    if filter_class.lower() not in emp_class.lower() and emp_class.lower() not in filter_class.lower():
                        match = False
            
            if match:
                filtered_employees.append(emp)
        
        # Limit results
        filtered_employees = filtered_employees[:100]
        
        total_count = len(employees)
        filtered_count = len(filtered_employees)
        
        if language == "en":
            thinking_text_complete = f"{thinking_text_filtering}\n✅ Found {filtered_count} employees matching your criteria (from {total_count} total employees)."
        else:
            thinking_text_complete = f"{thinking_text_filtering}\n✅ {total_count}人の従業員から{filtered_count}人の結果が見つかりました。"
        
        return NaturalLanguageSearchResponse(
            stage="complete",
            thinking_text=thinking_text_complete,
            parsed_filters=filters,
            results=filtered_employees,
            stats={
                "total_employees": total_count,
                "filtered_count": filtered_count,
                "query": query
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in natural language search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing natural language search: {str(e)}")


# Face Image Endpoints
@app.get("/api/person/{employee_id}/face")
async def get_face_image(employee_id: str):
    """
    Get face image (profile picture) for a specific employee.
    
    - **employee_id**: Employee ID to search for
    - Returns JPEG image or 404 if not found
    - Content-Type: image/jpeg
    - If image not found, returns 404 (frontend will use default placeholder)
    """
    if face_image_service is None:
        raise HTTPException(status_code=503, detail="Face image service not available")
    
    try:
        image_data = face_image_service.get_face_image(employee_id)
        if image_data is None:
            raise HTTPException(
                status_code=404,
                detail=f"Face image for employee {employee_id} not found"
            )
        
        return Response(
            content=image_data,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f'inline; filename="{employee_id}.jpg"',
                "Cache-Control": "public, max-age=3600"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching face image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching face image: {str(e)}")


@app.get("/api/person/{employee_id}/face/exists")
async def check_face_image_exists(employee_id: str):
    """
    Check if face image exists for an employee.
    
    - **employee_id**: Employee ID to check
    - Returns JSON with exists boolean and URL if exists
    """
    if face_image_service is None:
        return {
            "employee_id": employee_id,
            "exists": False,
            "url": None
        }
    
    try:
        exists = face_image_service.face_image_exists(employee_id)
        return {
            "employee_id": employee_id,
            "exists": exists,
            "url": f"/api/person/{employee_id}/face" if exists else None
        }
    except Exception as e:
        logger.error(f"Error checking face image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking face image: {str(e)}")


@app.get("/api/person/face/list")
async def list_available_images():
    """
    List all available employee IDs that have face images.
    
    Returns a list of employee IDs with available images.
    """
    if face_image_service is None:
        return {
            "count": 0,
            "employee_ids": []
        }
    
    try:
        employee_ids = face_image_service.list_available_images()
        return {
            "count": len(employee_ids),
            "employee_ids": employee_ids
        }
    except Exception as e:
        logger.error(f"Error listing images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing images: {str(e)}")


# Review Endpoints
@app.get("/api/reviews/half-year/{employee_id}", response_model=HalfReview)
async def get_half_review(employee_id: str):
    """
    Get half-year review for a specific employee.
    
    - **employee_id**: Employee ID to search for
    """
    try:
        review = review_service.get_half_review(employee_id)
        if review is None:
            raise HTTPException(
                status_code=404,
                detail=f"Half-year review for employee {employee_id} not found"
            )
        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching half-year review: {str(e)}")


@app.get("/api/reviews/half-year", response_model=List[HalfReview])
async def get_all_half_reviews():
    """
    Get all half-year reviews.
    """
    try:
        reviews = review_service.get_all_half_reviews()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching half-year reviews: {str(e)}")


@app.get("/api/reviews/monthly/{employee_id}", response_model=MonthlyReview)
async def get_monthly_review(employee_id: str):
    """
    Get monthly review for a specific employee.
    
    - **employee_id**: Employee ID to search for
    """
    try:
        review = review_service.get_monthly_review(employee_id)
        if review is None:
            raise HTTPException(
                status_code=404,
                detail=f"Monthly review for employee {employee_id} not found"
            )
        return review
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly review: {str(e)}")


@app.get("/api/reviews/monthly", response_model=List[MonthlyReview])
async def get_all_monthly_reviews():
    """
    Get all monthly reviews.
    """
    try:
        reviews = review_service.get_all_monthly_reviews()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly reviews: {str(e)}")


@app.get("/api/reviews/{employee_id}", response_model=EmployeeReviewsResponse)
async def get_all_reviews_for_employee(employee_id: str):
    """
    Get all reviews (both monthly and half-year) for a specific employee.
    
    - **employee_id**: Employee ID to search for
    """
    try:
        reviews = review_service.get_all_reviews_for_employee(employee_id)
        # Convert dict to models
        monthly = None
        half_year = None
        if reviews.get("monthly"):
            monthly = MonthlyReview(**reviews["monthly"])
        if reviews.get("half_year"):
            half_year = HalfReview(**reviews["half_year"])
        return EmployeeReviewsResponse(monthly=monthly, half_year=half_year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reviews: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

