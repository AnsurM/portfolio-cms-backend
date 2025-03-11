import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async find(ctx: Context) {
    try {
      const { query } = ctx;

      // Extract pagination parameters
      const { page = 1, pageSize = 10 } = query;

      // Use strapi's entity service to fetch blog posts with pagination
      const entries = await strapi.entityService.findMany('api::blog-post.blog-post', {
        ...query,
        populate: '*',
        page,
        pageSize,
        sort: { publishedAt: 'desc' }
      });

      // Get total count for pagination
      const count = await strapi.entityService.count('api::blog-post.blog-post', {
        ...query
      });

      const sanitizedEntries = await this.sanitizeOutput(entries, ctx);

      return {
        data: sanitizedEntries,
        meta: {
          pagination: {
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            pageCount: Math.ceil(count / parseInt(pageSize as string)),
            total: count
          }
        }
      };
    } catch (error) {
      ctx.throw(500, `Error fetching blog posts: ${error.message}`);
    }
  },

  async findOne(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { query } = ctx;

      const entry = await strapi.entityService.findOne('api::blog-post.blog-post', id, {
        ...query,
        populate: '*'
      });

      if (!entry) {
        return ctx.notFound('Blog post not found');
      }

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error fetching blog post: ${error.message}`);
    }
  },

  async create(ctx: Context) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      const { title, content, author } = data;
      if (!title || !content || !author) {
        return ctx.badRequest('Missing required fields: title, content, and author are required');
      }

      // Set publishedAt if not provided
      if (!data.publishedAt) {
        data.publishedAt = new Date().toISOString();
      }

      // Create the entry
      const entry = await strapi.entityService.create('api::blog-post.blog-post', {
        data
      });

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error creating blog post: ${error.message}`);
    }
  },

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Check if blog post exists
      const exists = await strapi.entityService.findOne('api::blog-post.blog-post', id);
      if (!exists) {
        return ctx.notFound('Blog post not found');
      }

      const entry = await strapi.entityService.update('api::blog-post.blog-post', id, {
        data
      });

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error updating blog post: ${error.message}`);
    }
  },

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // Check if entity exists
      const exists = await strapi.entityService.findOne('api::blog-post.blog-post', id);
      if (!exists) {
        return ctx.notFound('Blog post not found');
      }

      // Delete the entry
      const entry = await strapi.entityService.delete('api::blog-post.blog-post', id);

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error deleting blog post: ${error.message}`);
    }
  },
})); 