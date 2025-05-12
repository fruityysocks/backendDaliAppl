import { Router } from 'express';
import * as Posts from './controllers/post_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

router.route('/posts')
  .post(async (req, res) => {
    res.json({ message: 'create post' });
  })
  .get(Posts.getPosts);

router.route('/posts/:id')
  .get(Posts.getPost)
  .delete(Posts.deletePost)
  .put(Posts.updatePost);

export default router;
