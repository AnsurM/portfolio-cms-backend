export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-posts',
      handler: 'blog-post.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/blog-posts/:id',
      handler: 'blog-post.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/blog-posts',
      handler: 'blog-post.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/blog-posts/:id',
      handler: 'blog-post.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/blog-posts/:id',
      handler: 'blog-post.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 