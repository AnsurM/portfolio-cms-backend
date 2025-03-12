/// <reference types="jest" />
import request from 'supertest';

interface StrapiInstance {
  server: any;
}

describe('Blog API', () => {
  let app: StrapiInstance;
  let blogId: string;
  const testBlog = {
    data: {
      title: 'Test Blog Post',
      content: 'This is a test blog post content',
      tags: ['test', 'development'],
      author: 'Test Author',
      publishedAt: new Date().toISOString()
    }
  };

  beforeAll(async () => {
    app = global.strapi;
  });

  describe('POST /api/blogs', () => {
    it('should create a blog post successfully', async () => {
      const response = await request(app.server)
        .post('/api/blogs')
        .send(testBlog)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.attributes.title).toBe(testBlog.data.title);
      expect(response.body.data.attributes.content).toBe(testBlog.data.content);
      expect(response.body.data.attributes.tags).toEqual(testBlog.data.tags);
      blogId = response.body.data.id;
    });

    it('should fail when required fields are missing', async () => {
      const invalidBlog = {
        data: {
          title: 'Invalid Blog'
          // Missing required fields
        }
      };

      await request(app.server)
        .post('/api/blogs')
        .send(invalidBlog)
        .expect(400);
    });

    it('should validate publishedAt date format', async () => {
      const invalidDateBlog = {
        data: {
          ...testBlog.data,
          publishedAt: 'invalid-date'
        }
      };

      await request(app.server)
        .post('/api/blogs')
        .send(invalidDateBlog)
        .expect(400);
    });
  });

  describe('GET /api/blogs', () => {
    it('should return list of blog posts', async () => {
      const response = await request(app.server)
        .get('/api/blogs')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
    });

    it('should support pagination', async () => {
      const response = await request(app.server)
        .get('/api/blogs?pagination[page]=1&pagination[pageSize]=10')
        .expect(200);

      expect(response.body.meta.pagination).toBeDefined();
      expect(response.body.meta.pagination.page).toBe(1);
    });

    it('should support filtering by tags', async () => {
      const response = await request(app.server)
        .get('/api/blogs?filters[tags][$contains]=test')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBeTruthy();
      response.body.data.forEach((blog: any) => {
        expect(blog.attributes.tags).toContain('test');
      });
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return a specific blog post', async () => {
      const response = await request(app.server)
        .get(`/api/blogs/${blogId}`)
        .expect(200);

      expect(response.body.data.id).toBe(blogId);
      expect(response.body.data.attributes.title).toBe(testBlog.data.title);
    });

    it('should return 404 for non-existent blog post', async () => {
      await request(app.server)
        .get('/api/blogs/999999')
        .expect(404);
    });
  });

  describe('PUT /api/blogs/:id', () => {
    it('should update a blog post successfully', async () => {
      const updatedData = {
        data: {
          title: 'Updated Blog Post',
          content: 'Updated content'
        }
      };

      const response = await request(app.server)
        .put(`/api/blogs/${blogId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.data.attributes.title).toBe(updatedData.data.title);
      expect(response.body.data.attributes.content).toBe(updatedData.data.content);
    });

    it('should maintain unchanged fields during partial updates', async () => {
      const partialUpdate = {
        data: {
          title: 'Partially Updated Blog Post'
        }
      };

      const response = await request(app.server)
        .put(`/api/blogs/${blogId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data.attributes.title).toBe(partialUpdate.data.title);
      expect(response.body.data.attributes.content).toBeDefined();
      expect(response.body.data.attributes.tags).toBeDefined();
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    it('should delete a blog post successfully', async () => {
      await request(app.server)
        .delete(`/api/blogs/${blogId}`)
        .expect(200);

      // Verify blog post is deleted
      await request(app.server)
        .get(`/api/blogs/${blogId}`)
        .expect(404);
    });

    it('should return 404 when trying to delete non-existent blog post', async () => {
      await request(app.server)
        .delete('/api/blogs/999999')
        .expect(404);
    });
  });
}); 