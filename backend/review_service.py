"""
Review Service - Handles reading employee review data from mock files
"""
import json
from typing import List, Optional
from pathlib import Path

BASE_DIR = Path(__file__).parent
MOCK_DATA_DIR = BASE_DIR / "mock-data" / "reviews"


class ReviewService:
    """Service for accessing employee review data from mock files."""
    
    def __init__(self):
        self.mock_data_dir = MOCK_DATA_DIR
        # Ensure directory exists
        self.mock_data_dir.mkdir(parents=True, exist_ok=True)
    
    def _read_jsonl_file(self, file_path: Path) -> List[dict]:
        """Read a JSONL file and return list of JSON objects."""
        data = []
        try:
            if not file_path.exists():
                return []
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        data.append(json.loads(line))
        except FileNotFoundError:
            return []
        except json.JSONDecodeError as e:
            print(f"Error parsing JSONL file {file_path}: {e}")
            return []
        return data
    
    def get_half_review(self, employee_id: str) -> Optional[dict]:
        """
        Get half-year review for a specific employee.
        
        Args:
            employee_id: Employee ID to search for
        
        Returns:
            Half-year review dictionary or None if not found
        """
        file_path = self.mock_data_dir / "half_year_review.jsonl.json"
        reviews = self._read_jsonl_file(file_path)
        
        # Find the review for this employee (get the most recent one if multiple)
        matching_reviews = [r for r in reviews if r.get("employee_id") == employee_id]
        if matching_reviews:
            # Return the most recent one (by cycle_start_date or upload_year_month)
            return max(matching_reviews, key=lambda x: x.get("cycle_start_date", "") or x.get("upload_year_month", ""))
        
        return None
    
    def get_all_half_reviews(self) -> List[dict]:
        """Get all half-year reviews."""
        file_path = self.mock_data_dir / "half_year_review.jsonl.json"
        return self._read_jsonl_file(file_path)
    
    def get_monthly_review(self, employee_id: str) -> Optional[dict]:
        """
        Get monthly review for a specific employee.
        
        Args:
            employee_id: Employee ID to search for
        
        Returns:
            Monthly review dictionary or None if not found
        """
        file_path = self.mock_data_dir / "monthly_review.jsonl.json"
        reviews = self._read_jsonl_file(file_path)
        
        # Find the review for this employee (get the most recent one if multiple)
        matching_reviews = [r for r in reviews if r.get("employee_id") == employee_id]
        if matching_reviews:
            # Return the most recent one (by year_month)
            return max(matching_reviews, key=lambda x: x.get("year_month", ""))
        
        return None
    
    def get_all_monthly_reviews(self) -> List[dict]:
        """Get all monthly reviews."""
        file_path = self.mock_data_dir / "monthly_review.jsonl.json"
        return self._read_jsonl_file(file_path)
    
    def get_all_reviews_for_employee(self, employee_id: str) -> dict:
        """
        Get all reviews (both monthly and half-year) for a specific employee.
        
        Args:
            employee_id: Employee ID to search for
        
        Returns:
            Dictionary with 'monthly' and 'half_year' keys containing review data
        """
        return {
            "monthly": self.get_monthly_review(employee_id),
            "half_year": self.get_half_review(employee_id)
        }

