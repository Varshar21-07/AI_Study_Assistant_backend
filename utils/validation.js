const validateInput = (topic, mode) => {
  // Check if topic is provided
  if (!topic || typeof topic !== 'string') {
    return {
      valid: false,
      message: 'Topic parameter is required'
    };
  }

  // Trim and check if topic is not empty
  const trimmedTopic = topic.trim();
  if (trimmedTopic.length === 0) {
    return {
      valid: false,
      message: 'Topic cannot be empty'
    };
  }

  // Check topic length
  if (trimmedTopic.length > 200) {
    return {
      valid: false,
      message: 'Topic must be 200 characters or less'
    };
  }

  // Validate mode if provided
  if (mode && mode !== 'math' && mode !== 'normal') {
    return {
      valid: false,
      message: 'Mode must be either "math" or "normal" (or omitted)'
    };
  }

  return {
    valid: true,
    message: 'Input is valid'
  };
};

module.exports = {
  validateInput
};

