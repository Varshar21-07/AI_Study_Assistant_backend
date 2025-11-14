const { fetchWikipediaData } = require('../services/wikipediaService');
const { generateAIResponse } = require('../services/aiService');
const { validateInput } = require('../utils/validation');

const getStudyData = async (req, res) => {
  try {
    const { topic, mode } = req.query;

    // Validate input
    const validation = validateInput(topic, mode);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid input',
        message: validation.message
      });
    }

    // Check if the topic is a question or math problem (contains ?, =, or common question words)
    const isQuestion = /[?=]|^(what|how|why|when|where|who|solve|calculate|find)/i.test(topic);
    
    let wikipediaData = null;
    let useDirectAI = false;

    if (isQuestion || mode === 'math') {
      // For questions and math problems, try Wikipedia first but fall back to direct AI
      try {
        wikipediaData = await fetchWikipediaData(topic);
        console.log(`Fetched Wikipedia data for "${topic}": ${wikipediaData.content.length} characters`);
      } catch (error) {
        console.log(`Wikipedia lookup failed for "${topic}", using direct AI processing: ${error.message}`);
        useDirectAI = true;
      }
    } else {
      // For regular topics, require Wikipedia data
      wikipediaData = await fetchWikipediaData(topic);
      
      if (!wikipediaData || !wikipediaData.content) {
        return res.status(404).json({
          error: 'Topic not found',
          message: `Could not find information about "${topic}"`
        });
      }
      console.log(`Fetched Wikipedia data for "${topic}": ${wikipediaData.content.length} characters`);
    }

    // Generate AI response
    let aiResponse;
    if (useDirectAI) {
      // Use the topic/question directly as content for AI processing
      aiResponse = await generateAIResponse(topic, mode, true);
    } else {
      aiResponse = await generateAIResponse(wikipediaData.content, mode, false);
    }

    // Return response
    res.status(200).json({
      topic: topic,
      mode: mode || 'normal',
      summary: aiResponse.summary,
      quiz: aiResponse.quiz,
      studyTip: aiResponse.studyTip,
      solution: aiResponse.solution || null,
      source: wikipediaData?.source || 'AI-generated response'
    });

  } catch (error) {
    console.error('Error in getStudyData:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process study request'
    });
  }
};

module.exports = {
  getStudyData
};

