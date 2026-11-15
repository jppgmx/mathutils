from fastapi.testclient import TestClient

from app.main import app

def test_health_returns_expected_contract():
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/json")
    assert response.json() == {"status": "ok"}
