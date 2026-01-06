#!/usr/bin/env python3
"""
Script to convert legacy employee data to BigQuery schema format
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

BASE_DIR = Path(__file__).parent.parent
INPUT_FILE = BASE_DIR / "mock-data" / "employees" / "employees.json"
OUTPUT_FILE = BASE_DIR / "mock-data" / "employees" / "employees.json"


def calculate_age(birthday: str) -> int:
    """Calculate age from birthday (YYYY-MM-DD format)"""
    if not birthday:
        return None
    try:
        birth_date = datetime.strptime(birthday, "%Y-%m-%d")
        today = datetime.now()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    except:
        return None


def build_dept_name(emp: Dict[str, Any]) -> Optional[str]:
    """Build hierarchical dept_name from dept_1, dept_2, etc."""
    # If dept_name already exists, use it
    if "dept_name" in emp and emp["dept_name"]:
        return emp["dept_name"]
    
    # Otherwise, build from dept_1, dept_2, etc.
    dept_parts = []
    for i in range(1, 7):
        dept_key = f"dept_{i}"
        dept_value = emp.get(dept_key)
        if dept_value and dept_value != "-" and str(dept_value).strip():
            dept_parts.append(str(dept_value).strip())
        elif dept_parts:  # If we have some parts already, add "-" as placeholder
            dept_parts.append("-")
    
    # Remove trailing "-" parts
    while dept_parts and dept_parts[-1] == "-":
        dept_parts.pop()
    
    return " > ".join(dept_parts) if dept_parts else None


def convert_to_bigquery_schema(emp: Dict[str, Any]) -> Dict[str, Any]:
    """Convert legacy employee record to BigQuery schema"""
    # Start with base fields
    converted = {
        "employee_id": emp.get("employee_id", ""),
        "employee_name": emp.get("employee_name", ""),
        "employee_name_kana": emp.get("employee_name_kana"),  # Will be None if not present
        "nickname": emp.get("nickname"),
        "mail": emp.get("mail"),
        "current_employee_flag": emp.get("current_employee_flag", ""),
        "employment_type": emp.get("employment_type"),
        "entered_at": emp.get("entered_at"),
        "last_day_at": emp.get("last_day_at"),
        "retired_at": emp.get("retired_at"),
        "years_of_service": emp.get("years_of_service"),
        "employment_category": emp.get("employment_category"),
        "recruitment_category_new_graduate": emp.get("recruitment_category_new_graduate"),
        "gender": emp.get("gender"),
        "birthday": emp.get("birthday"),
        "age": emp.get("age") or calculate_age(emp.get("birthday")),
        "nationality": emp.get("nationality"),
        "dept_name": build_dept_name(emp),
        "location": emp.get("location"),
        "job_title": emp.get("job_title"),
        "job_family": emp.get("job_family"),
        "job_family_detail": emp.get("job_family_detail"),
        "salary_table": emp.get("salary_table"),
        "latest_job_grade": emp.get("latest_job_grade"),
        "latest_org_grade": emp.get("latest_org_grade"),
        "annual_salary": emp.get("annual_salary"),
        "ffs_a_factor": emp.get("ffs_a_factor"),
        "ffs_b_factor": emp.get("ffs_b_factor"),
        "ffs_c_factor": emp.get("ffs_c_factor"),
        "ffs_d_factor": emp.get("ffs_d_factor"),
        "ffs_e_factor": emp.get("ffs_e_factor"),
        "ffs_type": emp.get("ffs_type"),
        "ffs_concat_text": emp.get("ffs_concat_text"),
        "jp_non_jp_classification": emp.get("jp_non_jp_classification"),
        "self_introduction": emp.get("self_introduction"),
        "kaonavi_url": emp.get("kaonavi_url"),
    }
    
    # Add array fields (empty arrays if not present)
    array_fields = [
        "pulse_survey_history",
        "ggi_history",
        "ggi_monthly_history",
        "evaluation_history",
        "activity_history",
        "transfer_history",
        "grade_retention_history"
    ]
    
    for field in array_fields:
        converted[field] = emp.get(field) if emp.get(field) is not None else []
    
    # Remove None values for optional fields (keep empty strings and empty arrays)
    # But preserve dept_name and other important nullable fields
    cleaned = {}
    for key, value in converted.items():
        if value is not None:
            cleaned[key] = value
        else:
            # Keep null for fields that are explicitly nullable in schema
            nullable_fields = [
                "employee_name_kana", "nickname", "last_day_at", "retired_at",
                "nationality", "job_family_detail", "latest_org_grade",
                "annual_salary", "ffs_a_factor", "ffs_b_factor", "ffs_c_factor",
                "ffs_d_factor", "ffs_e_factor", "ffs_type", "ffs_concat_text",
                "self_introduction", "kaonavi_url", "dept_name", "latest_job_grade",
                "salary_table"
            ]
            if key in nullable_fields:
                cleaned[key] = None
    
    return cleaned


def main():
    """Main conversion function"""
    print(f"Reading from: {INPUT_FILE}")
    
    if not INPUT_FILE.exists():
        print(f"Error: Input file not found: {INPUT_FILE}")
        return
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        employees = json.load(f)
    
    print(f"Found {len(employees)} employees")
    print("Converting to BigQuery schema...")
    
    converted_employees = []
    for emp in employees:
        converted = convert_to_bigquery_schema(emp)
        converted_employees.append(converted)
    
    # Write to output file
    print(f"Writing to: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(converted_employees, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Successfully converted {len(converted_employees)} employees")
    print(f"✓ Output written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

