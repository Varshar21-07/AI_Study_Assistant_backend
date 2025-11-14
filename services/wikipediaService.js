const axios = require('axios');

const fetchWikipediaData = async (topic) => {
  try {
    // Wikipedia API endpoint
    const apiUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(topic);
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StudyAssistant/1.0 (https://github.com/yourusername/study-assistant; your-email@example.com)'
      }
    });

    if (response.data && response.data.extract) {
      return {
        content: response.data.extract,
        title: response.data.title,
        source: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`
      };
    }

    // If summary is not available, try to get full page content
    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(topic)}`;
    const pageResponse = await axios.get(pageUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'StudyAssistant/1.0 (https://github.com/yourusername/study-assistant; your-email@example.com)'
      }
    });

    // Extract text from HTML (simple approach)
    if (pageResponse.data) {
      const textContent = pageResponse.data
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 2000); // Limit to 2000 characters

      return {
        content: textContent,
        title: topic,
        source: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`
      };
    }

    throw new Error('No content found');

  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error(`Topic "${topic}" not found on Wikipedia`);
      }
      if (error.response.status === 403) {
        throw new Error('Wikipedia API access denied. Please check your User-Agent configuration.');
      }
      if (error.response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`Wikipedia API error: ${error.response.status} - ${error.response.statusText}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to Wikipedia. Please check your internet connection.');
    }
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

module.exports = {
  fetchWikipediaData
};

