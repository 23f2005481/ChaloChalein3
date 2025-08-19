import requests

BASE_URL = "http://localhost:5000"

def test_health():
    url = f"{BASE_URL}/api/health"
    response = requests.get(url)
    print(f"Health check ({url}): {response.status_code} - {response.text}")

def test_weather():
    url = f"{BASE_URL}/api/weather"
    params = {"city": "New York"}
    response = requests.get(url, params=params)
    print(f"Weather API ({url}): {response.status_code} - {response.text}")

def test_locations_search():
    url = f"{BASE_URL}/api/locations/search"
    params = {"query": "Paris"}
    response = requests.get(url, params=params)
    print(f"Locations Search API ({url}): {response.status_code} - {response.text}")

def test_chatbot_help():
    url = f"{BASE_URL}/api/chatbot/help"
    json_data = {
        "message": "Hello",
        "conversation_history": []
    }
    response = requests.post(url, json=json_data)
    print(f"Chatbot Help API ({url}): {response.status_code} - {response.text}")

def test_chat_completions():
    url = f"{BASE_URL}/api/chat/completions"
    json_data = {
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    }
    response = requests.post(url, json=json_data)
    print(f"Chat Completions API ({url}): {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_health()
    test_weather()
    test_locations_search()
    test_chatbot_help()
    test_chat_completions()
