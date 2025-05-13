import { Router } from 'express';
import * as Posts from './controllers/post_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

router.route('/posts')
  .get(async (req, res) => {
    try {
      const posts = await Posts.getPosts();
      res.json(posts);
    } catch (error) {
      console.error('error getting posts:', error);
      res.status(500).json({ error: `get posts error: ${error}` });
    }
  });

router.route('/posts/new')
  .post(async (req, res) => {
    const post = await Posts.createPost(req.body);
    res.status(201).json(post);
  });

router.route('/posts/:id')
  .get(async (req, res) => {
    try {
      const post = await Posts.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'post not found' });
      }
      return res.json(post);
    } catch (error) {
      console.error('error getting post:', error);
      return res.status(500).json({ error: `get post error: ${error}` });
    }
  })

  .delete(async (req, res) => {
    try {
      await Posts.deletePost(req.params.id);
      return res.json({ message: 'post deleted successfully' });
    } catch (error) {
      console.error('error deleting post:', error);
      return res.status(500).json({ error: `delete post error: ${error}` });
    }
  })

  .put(async (req, res) => {
    try {
      const post = await Posts.updatePost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: 'post not found' });
      }
      return res.json(post);
    } catch (error) {
      console.error('error getting post:', error);
      return res.status(500).json({ error: `get post error: ${error}` });
    }
  });

export default router;
