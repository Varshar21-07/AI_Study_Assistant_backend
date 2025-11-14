const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI clients
let openaiClient = null;
let geminiClient = null;

if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Mock AI response for testing (when no API keys are available)
// This uses simple text extraction from Wikipedia content to create meaningful summaries
const generateMockResponse = (content, mode, isDirectQuestion = false) => {
  const isMathMode = mode === 'math';
  
  // Handle direct questions/problems
  if (isDirectQuestion) {
    const questionText = content;
    
    // Try to solve simple math equations
    let solution = null;
    const mathMatch = questionText.match(/(\d+)\s*x\s*\+\s*(\d+)\s*=\s*(\d+)/i);
    if (mathMatch) {
      const coefficient = parseInt(mathMatch[1]);
      const constant = parseInt(mathMatch[2]);
      const result = parseInt(mathMatch[3]);
      const x = (result - constant) / coefficient;
      solution = `x = ${x}`;
    }
    
    return {
      summary: [
        `Question: ${questionText}`,
        solution ? `Solution: ${solution}` : "This appears to be a question or problem that requires analysis.",
        solution ? `Verification: Substitute x = ${parseFloat(solution.split('=')[1])} back into the equation to confirm` : "Please provide more context or rephrase the question for better assistance."
      ],
      quiz: [
        {
          question: solution ? `What is the value of x in the equation ${questionText}?` : "What type of problem is this?",
          options: solution ? [solution, `x = ${parseFloat(solution.split('=')[1]) + 1}`, `x = ${parseFloat(solution.split('=')[1]) - 1}`, `x = ${parseFloat(solution.split('=')[1]) * 2}`] : ["Mathematical", "Logical", "Analytical", "Conceptual"],
          correctAnswer: 0
        },
        {
          question: solution ? "What is the first step to solve this equation?" : "How should you approach this problem?",
          options: solution ? ["Isolate the variable term", "Multiply both sides", "Add to both sides", "Square both sides"] : ["Break it down", "Guess randomly", "Skip it", "Give up"],
          correctAnswer: 0
        },
        {
          question: "What mathematical principle is being applied?",
          options: ["Algebraic manipulation", "Geometric reasoning", "Statistical analysis", "Calculus"],
          correctAnswer: 0
        }
      ],
      studyTip: solution 
        ? "For linear equations, always isolate the variable by performing inverse operations on both sides. Work step-by-step and check your answer by substituting back into the original equation."
        : "Break down complex problems into smaller steps. Identify what you know and what you need to find. Look for patterns and apply relevant formulas or concepts.",
      solution: solution ? {
        steps: [
          `Given equation: ${mathMatch[1]}x + ${mathMatch[2]} = ${mathMatch[3]}`,
          `Step 1: Subtract ${mathMatch[2]} from both sides`,
          `${mathMatch[1]}x = ${mathMatch[3]} - ${mathMatch[2]}`,
          `${mathMatch[1]}x = ${parseInt(mathMatch[3]) - parseInt(mathMatch[2])}`,
          `Step 2: Divide both sides by ${mathMatch[1]}`,
          `x = ${parseInt(mathMatch[3]) - parseInt(mathMatch[2])} ÷ ${mathMatch[1]}`,
          `x = ${(parseInt(mathMatch[3]) - parseInt(mathMatch[2])) / parseInt(mathMatch[1])}`,
          `\nVerification: ${mathMatch[1]}(${(parseInt(mathMatch[3]) - parseInt(mathMatch[2])) / parseInt(mathMatch[1])}) + ${mathMatch[2]} = ${parseInt(mathMatch[1]) * ((parseInt(mathMatch[3]) - parseInt(mathMatch[2])) / parseInt(mathMatch[1]))} + ${mathMatch[2]} = ${mathMatch[3]} ✓`
        ]
      } : null
    };
  }
  
  // Extract key sentences from Wikipedia content
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const firstSentence = sentences[0]?.trim() || content.substring(0, 100);
  const secondSentence = sentences[1]?.trim() || sentences[0]?.substring(100, 200) || content.substring(100, 200);
  const thirdSentence = sentences[2]?.trim() || sentences[1]?.substring(200, 300) || content.substring(200, 300);
  
  // Create summary from actual content
  const summary = [
    firstSentence.length > 150 ? firstSentence.substring(0, 150) + '...' : firstSentence,
    secondSentence.length > 150 ? secondSentence.substring(0, 150) + '...' : secondSentence,
    thirdSentence.length > 150 ? thirdSentence.substring(0, 150) + '...' : thirdSentence
  ].filter(s => s && s.length > 10);
  
  // If we don't have enough sentences, create generic ones based on content
  while (summary.length < 3) {
    if (summary.length === 0) {
      summary.push(content.substring(0, Math.min(150, content.length)));
    } else if (summary.length === 1) {
      summary.push(content.substring(150, Math.min(300, content.length)));
    } else {
      summary.push("This topic contains important information that requires careful study and understanding.");
    }
  }
  
  if (isMathMode) {
    // Create quiz questions based on content
    const importantTerms = content.split(/\s+/).filter(word => 
      word.length > 4 && /^[A-Z]/.test(word)
    ).slice(0, 15);
    
    // Create 3 quiz questions from content
    const quiz = [
      {
        question: firstSentence.length > 100
          ? `According to the content, ${firstSentence.substring(0, 100)}...?`
          : `What is a fundamental mathematical concept mentioned in this topic?`,
        options: [
          importantTerms[0] || "Core mathematical principle",
          importantTerms[1] || "Key calculation method",
          importantTerms[2] || "Important mathematical formula",
          importantTerms[3] || "Mathematical application"
        ],
        correctAnswer: 0
      },
      {
        question: secondSentence.length > 100
          ? `Based on the information, ${secondSentence.substring(0, 100)}...?`
          : `Which mathematical operation is most relevant to this topic?`,
        options: [
          "Basic arithmetic",
          "Algebraic manipulation",
          "Calculus operations",
          "Statistical analysis"
        ],
        correctAnswer: 1
      },
      {
        question: thirdSentence.length > 100
          ? `The content suggests that ${thirdSentence.substring(0, 100)}...?`
          : `What is an important application of the mathematical concepts in this topic?`,
        options: [
          importantTerms[4] || "Problem-solving",
          importantTerms[5] || "Data analysis",
          importantTerms[6] || "Modeling",
          importantTerms[7] || "Optimization"
        ],
        correctAnswer: 2
      }
    ];
    
    return {
      summary: summary.slice(0, 3),
      quiz: quiz,
      studyTip: "For math topics, focus on understanding the step-by-step process rather than memorizing formulas. Practice solving similar problems to build confidence. Work through examples methodically and understand why each step is necessary.",
      solution: {
        steps: [
          "Key Concept: " + (summary[0] || "Understanding the fundamentals is essential"),
          "Application: " + (summary[1] || "Apply the concepts to solve problems"),
          "Practice: Work through multiple examples to build proficiency",
          "Verification: Always check your work and understand each step"
        ]
      }
    };
  }

  // Extract potential quiz questions from content
  const importantTerms = content.split(/\s+/).filter(word => 
    word.length > 6 && /^[A-Z]/.test(word)
  ).slice(0, 10);
  
  return {
    summary: summary.slice(0, 3),
    quiz: [
      {
        question: firstSentence.length > 80 
          ? `According to the content, ${firstSentence.substring(0, 80)}...?`
          : `What is a key concept mentioned in this topic?`,
        options: [
          importantTerms[0] || "The primary concept",
          importantTerms[1] || "The secondary concept",
          importantTerms[2] || "An important detail",
          importantTerms[3] || "A related topic"
        ],
        correctAnswer: 0
      },
      {
        question: secondSentence.length > 80
          ? `Based on the information, ${secondSentence.substring(0, 80)}...?`
          : `Which statement best describes this topic?`,
        options: [
          "It is a fundamental concept",
          "It has practical applications",
          "It requires careful study",
          "It involves multiple aspects"
        ],
        correctAnswer: 1
      },
      {
        question: thirdSentence.length > 80
          ? `The content suggests that ${thirdSentence.substring(0, 80)}...?`
          : `What is an important aspect of this topic?`,
        options: [
          importantTerms[4] || "Historical context",
          importantTerms[5] || "Modern applications",
          importantTerms[6] || "Theoretical foundation",
          importantTerms[7] || "Practical examples"
        ],
        correctAnswer: 2
      }
    ],
    studyTip: "Break down complex topics into smaller chunks. Use the Feynman technique: explain the concept in simple terms as if teaching someone else. Review the key points regularly.",
    mathQuestion: null
  };
};

// Generate AI response using OpenAI
const generateOpenAIResponse = async (content, mode, isDirectQuestion = false) => {
  try {
    const isMathMode = mode === 'math';
    
    let prompt = '';
    if (isDirectQuestion) {
      // Handle direct questions/problems
      prompt = `You are a helpful study assistant. The user has asked: "${content}"

Please solve this problem or answer this question, then generate educational content:
1. A brief explanation/solution in exactly 3 bullet points
2. Three multiple-choice quiz questions related to this problem with 4 options each and the correct answer index (0-3)
3. ${isMathMode ? 'A detailed step-by-step solution showing how to solve the problem (as an array of strings)' : ''}
4. A study tip for mastering this type of problem

Format the response as JSON with this structure:
{
  "summary": ["point1 with solution", "point2", "point3"],
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
  ${isMathMode ? '"solution": { "steps": ["Given: equation", "Step 1: operation", "Step 2: operation", "Final answer", "Verification: check"] },' : ''}
  "studyTip": "tip text"
}`;
    } else if (isMathMode) {
      prompt = `Based on the following content about "${content.substring(0, 1000)}", generate:
1. A brief summary in exactly 3 bullet points (make them specific to the content)
2. Three multiple-choice quiz questions with 4 options each and the correct answer index (0-3)
3. A detailed step-by-step solution or explanation (as an array of strings)
4. A study tip for mastering this topic

Format the response as JSON with this structure:
{
  "summary": ["point1", "point2", "point3"],
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
  "solution": {
    "steps": ["Key concept 1", "Key concept 2", "Application example", "Important note"]
  },
  "studyTip": "tip text"
}`;
    } else {
      prompt = `Based on the following content: "${content.substring(0, 1000)}", generate:
1. A brief summary in exactly 3 bullet points
2. Three multiple-choice quiz questions with 4 options each and the correct answer index (0-3)
3. A helpful study tip

Format the response as JSON with this structure:
{
  "summary": ["point1", "point2", "point3"],
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
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant. Always respond with valid JSON only, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.startsWith('```json')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```\n?/g, '').trim();
    }

    const aiResponse = JSON.parse(jsonText);

    // Ensure proper structure
    if (isMathMode) {
      return {
        summary: aiResponse.summary || [],
        quiz: aiResponse.quiz || [],
        studyTip: aiResponse.studyTip || '',
        solution: aiResponse.solution || null
      };
    } else {
      return {
        summary: aiResponse.summary || [],
        quiz: aiResponse.quiz || [],
        studyTip: aiResponse.studyTip || '',
        solution: null
      };
    }

  } catch (error) {
    console.error('OpenAI error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

// Generate AI response using Gemini
const generateGeminiResponse = async (content, mode, isDirectQuestion = false) => {
  try {
    const isMathMode = mode === 'math';
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    
    let prompt = '';
    if (isDirectQuestion) {
      // Handle direct questions/problems
      prompt = `You are a helpful study assistant. The user has asked: "${content}"

Please solve this problem or answer this question, then generate educational content:
1. A brief explanation/solution in exactly 3 bullet points
2. Three multiple-choice quiz questions related to this problem with 4 options each and the correct answer index (0-3)
3. ${isMathMode ? 'A detailed step-by-step solution showing how to solve the problem (as an array of strings)' : ''}
4. A study tip for mastering this type of problem

Format the response as JSON with this structure:
{
  "summary": ["point1 with solution", "point2", "point3"],
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
  ${isMathMode ? '"solution": { "steps": ["Given: equation", "Step 1: operation", "Step 2: operation", "Final answer", "Verification: check"] },' : ''}
  "studyTip": "tip text"
}`;
    } else if (isMathMode) {
      prompt = `Based on the following content about "${content.substring(0, 1000)}", generate:
1. A brief summary in exactly 3 bullet points (make them specific to the content)
2. Three multiple-choice quiz questions with 4 options each and the correct answer index (0-3)
3. A detailed step-by-step solution or explanation (as an array of strings)
4. A study tip for mastering this topic

Format the response as JSON with this structure:
{
  "summary": ["point1", "point2", "point3"],
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
  "solution": {
    "steps": ["Key concept 1", "Key concept 2", "Application example", "Important note"]
  },
  "studyTip": "tip text"
}`;
    } else {
      prompt = `Based on the following content: "${content.substring(0, 1000)}", generate:
1. A brief summary in exactly 3 bullet points
2. Three multiple-choice quiz questions with 4 options each and the correct answer index (0-3)
3. A helpful study tip

Format the response as JSON with this structure:
{
  "summary": ["point1", "point2", "point3"],
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
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Extract JSON from response
    let jsonText = responseText;
    if (responseText.startsWith('```json')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```\n?/g, '').trim();
    }

    // Find JSON object in response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const aiResponse = JSON.parse(jsonText);

    // Ensure proper structure
    if (isMathMode) {
      return {
        summary: aiResponse.summary || [],
        quiz: aiResponse.quiz || [],
        studyTip: aiResponse.studyTip || '',
        solution: aiResponse.solution || null
      };
    } else {
      return {
        summary: aiResponse.summary || [],
        quiz: aiResponse.quiz || [],
        studyTip: aiResponse.studyTip || '',
        solution: null
      };
    }

  } catch (error) {
    console.error('Gemini error:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

// Main function to generate AI response
const generateAIResponse = async (content, mode, isDirectQuestion = false) => {
  // Try OpenAI first, then Gemini, then mock
  if (openaiClient) {
    try {
      return await generateOpenAIResponse(content, mode, isDirectQuestion);
    } catch (error) {
      console.error('OpenAI failed, trying Gemini...', error);
    }
  }

  if (geminiClient) {
    try {
      return await generateGeminiResponse(content, mode, isDirectQuestion);
    } catch (error) {
      console.error('Gemini failed, using mock...', error);
    }
  }

  // Fallback to mock response
  console.log('Using mock AI response (no API keys configured) - Content length:', content.length);
  console.log('Content preview:', content.substring(0, 200));
  return generateMockResponse(content, mode, isDirectQuestion);
};

module.exports = {
  generateAIResponse
};

