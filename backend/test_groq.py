#!/usr/bin/env python3
"""
Simple test script to verify GROQ API and mock response functionality
"""

import requests
import json

def test_groq_api():
    """Test the GROQ API directly"""
    
    # GROQ API key
    groq_api_key = "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"
    
    # Test messages
    messages = [
        {
            "role": "system",
            "content": "You are a test assistant. Return ONLY a simple JSON response: {\"test\": \"success\", \"message\": \"API is working\"}"
        },
        {
            "role": "user",
            "content": "Generate a simple test response"
        }
    ]
    
    try:
        # Make API call to GROQ
        url = "https://api.groq.com/openai/v1/chat/completions"
        json_data = {
            "model": "meta-llama/llama-4-scout-17b-16e-instruct",
            "messages": messages,
            "max_tokens": 100,
            "temperature": 0.1
        }
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        
        print(f"Making request to {url}")
        print(f"Request payload: {json.dumps(json_data, indent=2)}")
        
        response = requests.post(url, json=json_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code != 200:
            print(f"Error response: {response.text}")
            print("This is expected with the test API key. The mock response system will handle this.")
            return False
            
        data = response.json()
        print(f"Response data: {json.dumps(data, indent=2)}")
        
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]
            print(f"Content: {content}")
            
            # Try to parse as JSON
            try:
                parsed = json.loads(content)
                print(f"Successfully parsed JSON: {parsed}")
                return True
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {e}")
                return False
        else:
            print("No choices in response")
            return False
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        return False

def test_mock_response():
    """Test the mock response functionality"""
    print("\n" + "="*50)
    print("Testing Mock Response Functionality")
    print("="*50)
    
    try:
        # Import the mock function
        import sys
        import os
        sys.path.append(os.path.dirname(__file__))
        
        from api_helpers import get_mock_itinerary_response
        
        # Test messages
        test_messages = [
            {
                "role": "user",
                "content": "Create a travel itinerary for a trip to Paris"
            }
        ]
        
        print("Testing mock itinerary generation...")
        result = get_mock_itinerary_response(test_messages)
        
        print(f"Mock response: {json.dumps(result, indent=2)}")
        
        if result.get("success") and result.get("content"):
            # Try to parse the content as JSON
            try:
                itinerary = json.loads(result["content"])
                print(f"Successfully parsed mock itinerary JSON!")
                print(f"Destination: {itinerary.get('destination')}")
                print(f"Days: {len(itinerary.get('days', []))}")
                return True
            except json.JSONDecodeError as e:
                print(f"Failed to parse mock itinerary JSON: {e}")
                return False
        else:
            print("Mock response missing content")
            return False
            
    except Exception as e:
        print(f"Exception in mock test: {e}")
        return False

if __name__ == "__main__":
    print("Testing GROQ API and Mock Response...")
    
    # Test GROQ API (will likely fail with test key)
    print("\n1. Testing GROQ API...")
    groq_success = test_groq_api()
    
    # Test mock response (should always work)
    print("\n2. Testing Mock Response...")
    mock_success = test_mock_response()
    
    if groq_success:
        print("\n✅ GROQ API test passed!")
    else:
        print("\n❌ GROQ API test failed (expected with test key)")
    
    if mock_success:
        print("✅ Mock response test passed!")
    else:
        print("❌ Mock response test failed!")
    
    print("\n" + "="*50)
    if mock_success:
        print("🎉 Your application will work with mock responses!")
        print("To use real AI responses, replace the API key with a valid GROQ key.")
    else:
        print("⚠️  There are issues with the mock response system.")
    print("="*50)
