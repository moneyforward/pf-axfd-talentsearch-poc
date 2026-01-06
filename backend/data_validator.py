"""
Data validation for employee data conforming to BigQuery schema
"""
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class DataValidationError(Exception):
    """Raised when data validation fails"""
    pass


def validate_employee_data(employees: List[Dict[str, Any]]) -> tuple[bool, List[str]]:
    """
    Validate employee data against BigQuery schema.
    
    Returns:
        (is_valid, list_of_errors)
    """
    errors = []
    
    if not isinstance(employees, list):
        errors.append("Employee data must be a JSON array")
        return False, errors
    
    if len(employees) == 0:
        logger.warning("Employee data is empty")
        return True, []  # Empty is valid, just a warning
    
    # Required fields according to BigQuery schema
    required_fields = ["employee_id", "employee_name"]
    
    # Expected scalar fields (may be null)
    expected_scalar_fields = [
        "employee_id", "employee_name", "employee_name_kana", "nickname", "mail",
        "current_employee_flag", "employment_type", "entered_at", "last_day_at",
        "retired_at", "years_of_service", "employment_category",
        "recruitment_category_new_graduate", "gender", "birthday", "age",
        "nationality", "dept_name", "location", "job_title", "job_family",
        "job_family_detail", "salary_table", "latest_job_grade", "latest_org_grade",
        "annual_salary", "ffs_a_factor", "ffs_b_factor", "ffs_c_factor",
        "ffs_d_factor", "ffs_e_factor", "ffs_type", "ffs_concat_text",
        "jp_non_jp_classification", "self_introduction", "kaonavi_url"
    ]
    
    # Expected array fields (should be arrays or null)
    expected_array_fields = [
        "pulse_survey_history", "ggi_history", "ggi_monthly_history",
        "evaluation_history", "activity_history", "transfer_history",
        "grade_retention_history"
    ]
    
    for idx, emp in enumerate(employees):
        emp_id = emp.get("employee_id", f"<unknown at index {idx}>")
        
        # Check required fields
        for field in required_fields:
            if field not in emp or not emp[field]:
                errors.append(f"Employee {emp_id}: Missing required field '{field}'")
        
        # Check for unexpected fields (warn only)
        for field in emp.keys():
            if field not in expected_scalar_fields + expected_array_fields:
                logger.warning(f"Employee {emp_id}: Unexpected field '{field}' (will be ignored)")
        
        # Validate dept_name format (should be hierarchical with ">")
        if "dept_name" in emp and emp["dept_name"]:
            dept_name = emp["dept_name"]
            if not isinstance(dept_name, str):
                errors.append(f"Employee {emp_id}: dept_name must be a string")
            elif ">" in dept_name and dept_name.count(">") > 5:
                logger.warning(f"Employee {emp_id}: dept_name has more than 6 levels (max recommended)")
        
        # Validate array fields
        for field in expected_array_fields:
            if field in emp:
                value = emp[field]
                if value is not None and not isinstance(value, list):
                    errors.append(f"Employee {emp_id}: '{field}' must be an array or null, got {type(value).__name__}")
        
        # Validate date formats (YYYY-MM-DD)
        date_fields = ["entered_at", "last_day_at", "retired_at", "birthday"]
        for field in date_fields:
            if field in emp and emp[field]:
                date_value = emp[field]
                if not isinstance(date_value, str):
                    errors.append(f"Employee {emp_id}: '{field}' must be a string (YYYY-MM-DD format)")
                elif len(date_value) != 10 or date_value.count("-") != 2:
                    logger.warning(f"Employee {emp_id}: '{field}' may not be in YYYY-MM-DD format: {date_value}")
        
        # Validate age is integer if present
        if "age" in emp and emp["age"] is not None:
            if not isinstance(emp["age"], int):
                errors.append(f"Employee {emp_id}: 'age' must be an integer or null")
        
        # Validate current_employee_flag
        if "current_employee_flag" in emp:
            flag = emp["current_employee_flag"]
            if flag not in ["●", "", None]:
                logger.warning(f"Employee {emp_id}: current_employee_flag should be '●' or empty string, got '{flag}'")
    
    is_valid = len(errors) == 0
    return is_valid, errors


def validate_and_log(employees: List[Dict[str, Any]], raise_on_error: bool = False) -> bool:
    """
    Validate employee data and log results.
    
    Args:
        employees: List of employee dictionaries
        raise_on_error: If True, raise DataValidationError on validation failure
    
    Returns:
        True if valid, False otherwise
    """
    is_valid, errors = validate_employee_data(employees)
    
    if is_valid:
        logger.info(f"✓ Employee data validation passed ({len(employees)} employees)")
    else:
        logger.error(f"✗ Employee data validation failed ({len(errors)} errors)")
        for error in errors:
            logger.error(f"  - {error}")
        
        if raise_on_error:
            raise DataValidationError(f"Data validation failed: {', '.join(errors[:5])}")
    
    return is_valid

