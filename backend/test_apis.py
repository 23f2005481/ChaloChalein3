#!/usr/bin/env python3
"""
Test script to verify all APIs are working correctly.
Run this script to check if your API keys and implementations work.
"""
import json
from api_helpers import (
    get_weather_forecast,
    get_location_search,
    get_route,
    get_groq_response
)

def print_json(data):
    """Pretty print JSON data"""
    print(json.dumps(data, indent=2))

def test_weather_api():
    """Test the Weather API"""
    print("\n=== Testing Weather API ===")
    result = get_weather_forecast("London")
    print_json(result)
    
    if "error" in result:
        print("❌ Weather API test FAILED")
        return False
    else:
        print("✅ Weather API test PASSED")
        return True

def test_location_search():
    """Test the HERE Maps Location Search API"""
    print("\n=== Testing HERE Maps Location Search API ===")
    result = get_location_search("Eiffel Tower")
    print_json(result)
    
    if not result.get("success", False):
        print("❌ Location Search API test FAILED")
        return False
    else:
        print("✅ Location Search API test PASSED")
        return True

def test_routing():
    """Test the HERE Maps Routing API"""
    print("\n=== Testing HERE Maps Routing API ===")
    # Use coordinates instead of place names (lat,lng format)
    # Berlin coordinates: 52.52001,13.40495
    # Munich coordinates: 48.13743,11.57549
    result = get_route("52.52001,13.40495", "48.13743,11.57549")
    print_json(result)
    
    if not result.get("success", False):
        print("❌ Routing API test FAILED")
        return False
    else:
        print("✅ Routing API test PASSED")
        return True

def test_groq():
    """Test the GROQ API"""
    print("\n=== Testing GROQ API ===")
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello in one sentence."}
    ]
    result = get_groq_response(messages)
    print_json(result)
    
    if not result.get("success", False):
        print("❌ GROQ API test FAILED")
        return False
    else:
        print("✅ GROQ API test PASSED")
        return True

def run_all_tests():
    """Run all API tests"""
    print("Running API tests...")
    
    weather = test_weather_api()
    location = test_location_search()
    routing = test_routing()
    groq = test_groq()
    
    print("\n=== Test Summary ===")
    print(f"Weather API: {'✅ PASSED' if weather else '❌ FAILED'}")
    print(f"Location Search API: {'✅ PASSED' if location else '❌ FAILED'}")
    print(f"Routing API: {'✅ PASSED' if routing else '❌ FAILED'}")
    print(f"GROQ API: {'✅ PASSED' if groq else '❌ FAILED'}")
    
    overall = all([weather, location, routing, groq])
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if overall else '❌ SOME TESTS FAILED'}")
    
    return overall

if __name__ == "__main__":
    run_all_tests() 