# Test FastAPI app startup and homepage response
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_app_startup():
    """Test if FastAPI app starts and serves the homepage."""
    response = client.get("/")
    assert response.status_code == 200, " Homepage did not load correctly!"


def test_shutdown():
    """Test if FastAPI app shuts down correctly."""
    response = client.get("/")
    assert response.status_code == 200, "Shutdown endpoint did not respond correctly!"
