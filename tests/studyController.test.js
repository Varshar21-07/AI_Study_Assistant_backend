const request = require('supertest');
const app = require('../server');

describe('Study Controller Tests', () => {
  describe('GET /api/study', () => {
    test('should return 400 if topic is missing', async () => {
      const response = await request(app)
        .get('/api/study')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid input');
    });

    test('should return 400 if topic is empty', async () => {
      const response = await request(app)
        .get('/api/study?topic=')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid input');
    });

    test('should return study data for a valid topic', async () => {
      const response = await request(app)
        .get('/api/study?topic=JavaScript')
        .expect(200);

      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('quiz');
      expect(response.body).toHaveProperty('studyTip');
      expect(response.body.summary).toBeInstanceOf(Array);
      expect(response.body.summary.length).toBe(3);
      expect(response.body.quiz).toBeInstanceOf(Array);
      expect(response.body.quiz.length).toBe(3);
    }, 15000); // Increase timeout for API calls

    test('should return math question when mode=math', async () => {
      const response = await request(app)
        .get('/api/study?topic=Mathematics&mode=math')
        .expect(200);

      expect(response.body).toHaveProperty('mode');
      expect(response.body.mode).toBe('math');
      expect(response.body).toHaveProperty('mathQuestion');
      expect(response.body.mathQuestion).toHaveProperty('question');
      expect(response.body.mathQuestion).toHaveProperty('options');
      expect(response.body.mathQuestion).toHaveProperty('correctAnswer');
      expect(response.body.mathQuestion).toHaveProperty('explanation');
      expect(response.body.quiz).toHaveLength(0);
    }, 15000);

    test('should return 404 for non-existent topic', async () => {
      const response = await request(app)
        .get('/api/study?topic=NonExistentTopic12345XYZ')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Topic not found');
    }, 15000);
  });

  describe('GET /health', () => {
    test('should return 200 and status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });
});

