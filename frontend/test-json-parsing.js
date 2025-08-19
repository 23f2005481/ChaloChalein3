// Test script for JSON parsing functions
// Run this in the browser console to test the parsing logic

// Test the JSON parsing function
function testJSONParsing() {
    console.log("Testing JSON parsing functions...");
    
    // Test case 1: Valid JSON
    const validJSON = `{
        "destination": "Paris",
        "totalBudgetINR": "50000",
        "days": [
            {
                "day": 1,
                "activities": [
                    {
                        "time": "09:00",
                        "title": "Eiffel Tower",
                        "description": "Visit the iconic landmark"
                    }
                ]
            }
        ]
    }`;
    
    console.log("Test 1 - Valid JSON:");
    const result1 = parseItineraryJSON(validJSON);
    console.log("Result:", result1);
    console.log("Valid:", result1 !== null);
    
    // Test case 2: JSON with markdown
    const jsonWithMarkdown = "```json\n" + validJSON + "\n```";
    console.log("\nTest 2 - JSON with markdown:");
    const result2 = parseItineraryJSON(jsonWithMarkdown);
    console.log("Result:", result2);
    console.log("Valid:", result2 !== null);
    
    // Test case 3: JSON with extra text
    const jsonWithText = "Here's your itinerary:\n" + validJSON + "\nEnjoy your trip!";
    console.log("\nTest 3 - JSON with extra text:");
    const result3 = parseItineraryJSON(jsonWithText);
    console.log("Result:", result3);
    console.log("Valid:", result3 !== null);
    
    // Test case 4: Invalid JSON
    const invalidJSON = `{
        "destination": "Paris"
        "totalBudgetINR": "50000"
    }`;
    console.log("\nTest 4 - Invalid JSON (missing commas):");
    const result4 = parseItineraryJSON(invalidJSON);
    console.log("Result:", result4);
    console.log("Valid:", result4 !== null);
}

// Copy the parsing functions from TravelPlanner.jsx
function parseItineraryJSON(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return null;
    }

    let cleanedText = rawText.trim();
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/```$/gm, '').trim();
    
    // Try direct parsing first
    try {
        const parsed = JSON.parse(cleanedText);
        if (isValidItinerary(parsed)) {
            return parsed;
        }
    } catch (error) {
        console.log("Direct JSON parsing failed:", error.message);
    }
    
    // Try to extract JSON object from text
    try {
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            const extractedJson = cleanedText.slice(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(extractedJson);
            if (isValidItinerary(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.log("Extracted JSON parsing failed:", error.message);
    }
    
    // Try to fix common JSON issues
    try {
        const fixedJson = fixCommonJSONIssues(cleanedText);
        const parsed = JSON.parse(fixedJson);
        if (isValidItinerary(parsed)) {
            return parsed;
        }
    } catch (error) {
        console.log("Fixed JSON parsing failed:", error.message);
    }
    
    return null;
}

function isValidItinerary(data) {
    return data && 
           typeof data === 'object' && 
           data.destination && 
           Array.isArray(data.days) && 
           data.days.length > 0;
}

function fixCommonJSONIssues(text) {
    let fixed = text;
    
    // Fix missing commas between object properties
    fixed = fixed.replace(/}(\s*){/g, '},{');
    fixed = fixed.replace(/](\s*)\[/g, '],[');
    
    // Fix missing commas between array elements
    fixed = fixed.replace(/"(\s*)"/g, '","');
    
    // Fix trailing commas
    fixed = fixed.replace(/,(\s*)(}|\])/g, '$1$2');
    
    // Fix missing commas between string array elements
    fixed = fixed.replace(/}(\s*)\{/g, '},{');
    fixed = fixed.replace(/](\s*)\[/g, '],[');
    
    // Handle missing commas between string array elements
    fixed = fixed.replace(/"(\s+)"/g, '","');
    
    return fixed;
}

// Run the test
testJSONParsing();



