import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async find(ctx: Context) {
    try {
      const { query } = ctx;

      // Extract pagination parameters
      const { page = 1, pageSize = 10 } = query;

      // Use strapi's entity service to fetch projects with pagination
      const entries = await strapi.entityService.findMany('api::project.project', {
        ...query,
        populate: '*',
        page,
        pageSize,
        sort: { createdAt: 'desc' }
      });

      // Get total count for pagination
      const count = await strapi.entityService.count('api::project.project', {
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
      ctx.throw(500, `Error fetching projects: ${error.message}`);
    }
  },

  async findFeatured(ctx: Context) {
    try {
      const { query } = ctx;

      // Use strapi's entity service to fetch featured projects
      const entries = await strapi.entityService.findMany('api::project.project', {
        ...query,
        filters: { featured: true },
        populate: '*',
        sort: { createdAt: 'desc' }
      });

      const sanitizedEntries = await this.sanitizeOutput(entries, ctx);

      return {
        data: sanitizedEntries
      };
    } catch (error) {
      ctx.throw(500, `Error fetching featured projects: ${error.message}`);
    }
  },

  async findOne(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { query } = ctx;

      const entry = await strapi.entityService.findOne('api::project.project', id, {
        ...query,
        populate: '*'
      });

      if (!entry) {
        return ctx.notFound('Project not found');
      }

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error fetching project: ${error.message}`);
    }
  },

  async create(ctx: Context) {
    try {
      const { data } = ctx.request.body;

      // Validate required fields
      const { title, description, category, liveUrl } = data;
      if (!title || !description || !category || !liveUrl) {
        return ctx.badRequest('Missing required fields');
      }

      // Validate URL format
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(liveUrl)) {
        return ctx.badRequest('Invalid URL format');
      }

      // Create the entry
      const entry = await strapi.entityService.create('api::project.project', {
        data
      });

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error creating project: ${error.message}`);
    }
  },

  async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Validate URL format if provided
      if (data.liveUrl) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(data.liveUrl)) {
          return ctx.badRequest('Invalid URL format');
        }
      }

      const entry = await strapi.entityService.update('api::project.project', id, {
        data
      });

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error updating project: ${error.message}`);
    }
  },

  async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      
      // Check if entity exists
      const exists = await strapi.entityService.findOne('api::project.project', id);
      if (!exists) {
        return ctx.notFound('Project not found');
      }

      // Delete the entry
      const entry = await strapi.entityService.delete('api::project.project', id);

      const sanitizedEntry = await this.sanitizeOutput(entry, ctx);
      return {
        data: sanitizedEntry
      };
    } catch (error) {
      ctx.throw(500, `Error deleting project: ${error.message}`);
    }
  },
})); 