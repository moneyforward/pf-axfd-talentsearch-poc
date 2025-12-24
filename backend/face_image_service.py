import os
from typing import Optional
from pathlib import Path

# GCS Configuration - Optional, only used if USE_MOCK_DATA is false
try:
    from google.cloud import storage
    from google.cloud.exceptions import NotFound
    GCS_AVAILABLE = True
except ImportError:
    GCS_AVAILABLE = False

# Configuration from environment variables
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "pf_ai_app")
GCS_PHOTOS_PATH = os.getenv("GCS_PHOTOS_PATH", "photos")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Base directory for mock data
BASE_DIR = Path(__file__).parent
MOCK_PHOTOS_DIR = BASE_DIR / "mock-data" / "photos"


class FaceImageService:
    """Service for accessing employee face images from Google Cloud Storage or mock files."""
    
    def __init__(self):
        self.use_mock = USE_MOCK_DATA
        
        if not self.use_mock:
            # Use GCS if available and configured
            if not GCS_AVAILABLE:
                raise ImportError(
                    "google-cloud-storage is not installed. "
                    "Install it with: pip install google-cloud-storage"
                )
            
            # Initialize GCS client
            if GOOGLE_APPLICATION_CREDENTIALS:
                # Use explicit credentials file
                self.client = storage.Client.from_service_account_json(
                    GOOGLE_APPLICATION_CREDENTIALS
                )
            else:
                # Use default credentials (from environment or gcloud auth)
                self.client = storage.Client()
            
            self.bucket = self.client.bucket(GCS_BUCKET_NAME)
        else:
            # Use mock data from local files
            self.mock_photos_dir = MOCK_PHOTOS_DIR
            # Create photos directory if it doesn't exist
            self.mock_photos_dir.mkdir(parents=True, exist_ok=True)
    
    def get_face_image(self, employee_id: str) -> Optional[bytes]:
        """
        Get face image (profile picture) for a specific employee.
        
        Args:
            employee_id: Employee ID to search for
        
        Returns:
            Image bytes (JPEG format) or None if not found
        """
        if self.use_mock:
            # Mock mode: look for image in mock-data/photos/ directory
            image_path = self.mock_photos_dir / f"{employee_id}.jpg"
            
            if image_path.exists():
                try:
                    with open(image_path, 'rb') as f:
                        return f.read()
                except Exception as e:
                    print(f"Error reading mock image {image_path}: {e}")
                    return None
            else:
                # Return None if image doesn't exist (frontend will use default)
                return None
        else:
            # GCS mode
            try:
                blob_name = f"{GCS_PHOTOS_PATH}/{employee_id}.jpg"
                blob = self.bucket.blob(blob_name)
                
                if not blob.exists():
                    return None
                
                image_data = blob.download_as_bytes()
                return image_data
            except NotFound:
                return None
            except Exception as e:
                print(f"Error reading face image from GCS: {e}")
                return None
    
    def face_image_exists(self, employee_id: str) -> bool:
        """
        Check if face image exists for an employee.
        
        Args:
            employee_id: Employee ID to check
        
        Returns:
            True if image exists, False otherwise
        """
        if self.use_mock:
            image_path = self.mock_photos_dir / f"{employee_id}.jpg"
            return image_path.exists()
        else:
            # GCS mode
            try:
                blob_name = f"{GCS_PHOTOS_PATH}/{employee_id}.jpg"
                blob = self.bucket.blob(blob_name)
                return blob.exists()
            except Exception:
                return False
    
    def list_available_images(self) -> list[str]:
        """
        List all available employee IDs that have face images.
        
        Returns:
            List of employee IDs with available images
        """
        if self.use_mock:
            employee_ids = []
            if self.mock_photos_dir.exists():
                for file_path in self.mock_photos_dir.glob("*.jpg"):
                    # Extract employee_id from filename (remove .jpg extension)
                    employee_id = file_path.stem
                    employee_ids.append(employee_id)
            return sorted(employee_ids)
        else:
            # GCS mode
            try:
                blobs = self.bucket.list_blobs(prefix=f"{GCS_PHOTOS_PATH}/")
                employee_ids = []
                for blob in blobs:
                    if blob.name.endswith('.jpg'):
                        # Extract employee_id from blob name
                        # Format: photos/{employee_id}.jpg
                        employee_id = Path(blob.name).stem
                        employee_ids.append(employee_id)
                return sorted(employee_ids)
            except Exception as e:
                print(f"Error listing images from GCS: {e}")
                return []

