/// <reference types="jest" />
import request from 'supertest';

interface StrapiInstance {
  server: any;
}

describe('Project API', () => {
  let app: StrapiInstance;
  let projectId: string;
  const testProject = {
    data: {
      title: 'Test Project',
      description: 'A test project description',
      category: 'web',
      liveUrl: 'https://test-project.com'
    }
  };

  beforeAll(async () => {
    app = global.strapi;
  });

  describe('POST /api/projects', () => {
    it('should create a project successfully', async () => {
      const response = await request(app.server)
        .post('/api/projects')
        .send(testProject)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.attributes.title).toBe(testProject.data.title);
      projectId = response.body.data.id;
    });

    it('should fail when required fields are missing', async () => {
      const invalidProject = {
        data: {
          title: 'Invalid Project'
        }
      };

      await request(app.server)
        .post('/api/projects')
        .send(invalidProject)
        .expect(400);
    });
  });

  describe('GET /api/projects', () => {
    it('should return list of projects', async () => {
      const response = await request(app.server)
        .get('/api/projects')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a specific project', async () => {
      const response = await request(app.server)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body.data.id).toBe(projectId);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.server)
        .get('/api/projects/999999')
        .expect(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project successfully', async () => {
      const updatedData = {
        data: {
          title: 'Updated Test Project'
        }
      };

      const response = await request(app.server)
        .put(`/api/projects/${projectId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.data.attributes.title).toBe(updatedData.data.title);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project successfully', async () => {
      await request(app.server)
        .delete(`/api/projects/${projectId}`)
        .expect(200);

      // Verify project is deleted
      await request(app.server)
        .get(`/api/projects/${projectId}`)
        .expect(404);
    });
  });
}); 