// AI Service with 7 W's and How Framework

const get7WsPrompt = (question) => {
  return `You are a helpful study assistant. The user has asked: "${question}"

Please answer this question comprehensively using the 7 W's and How framework:

- WHAT: What is it? (Definition and core concept)
- WHY: Why is it important? (Significance and relevance)  
- WHEN: When is it used/relevant? (Time context and applications)
- WHERE: Where is it applied? (Contexts and domains)
- WHO: Who uses/benefits from it? (Target audience and stakeholders)
- WHICH: Which types/categories exist? (Classifications and variations)
- WHOM: Whom does it affect? (Impact and beneficiaries)
- HOW: How does it work? (Process and mechanism)

Then generate:
1. A comprehensive summary covering the 7 W's and How (as an array of 8 points, one for each W/How)
2. Three multiple-choice quiz questions with 4 options each and the correct answer index (0-3)
3. A study tip

Format the response as JSON with this structure:
{
  "summary": [
    "WHAT: [definition and core concept]",
    "WHY: [importance and significance]",
    "WHEN: [timing, context, and when it's used]",
    "WHERE: [location, domain, and where it's applied]",
    "WHO: [users, stakeholders, and who benefits]",
    "WHICH: [types, categories, and variations]",
    "WHOM: [affected parties and beneficiaries]",
    "HOW: [process, mechanism, and how it works]"
  ],
  "quiz": [
    {
      "question": "question1",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0
    },
    {
      "question": "question2",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 1
    },
    {
      "question": "question3",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 2
    }
  ],
  "studyTip": "tip text"
}`;
};

module.exports = { get7WsPrompt };
