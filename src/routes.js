import { Router } from 'express';
import * as Posts from './controllers/postController';
import * as Users from './controllers/userController';
import * as Slacks from './controllers/slackEventsController';
import User from './models/userModel';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our blog api!' });
});

// user routes

router.route('/users').get(async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      const user = await User.findOne({ name });
      return res.status(200).json({ user: user || null });
    } else {
      const users = await Users.getUsers(req.body);
      return res.status(200).json(users);
    }
  } catch (error) {
    console.error('error getting users:', error);
    return res.status(500).json({ error: `get users error: ${error.message}` });
  }
});

router.route('/users/newUser').post(async (req, res) => {
  try {
    const user = await Users.createUser(req.body);
    return res.status(200).json(user);
  } catch (error) {
    console.error('error creating user:', error);
    return res.status(404).json({ error: `create user error: ${error}` });
  }
});

router.route('/users/:userId')
  .get(async (req, res) => {
    try {
      const user = await Users.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: 'user not found' });
      }
      return res.json(user);
    } catch (error) {
      console.error('error getting user:', error);
      return res.status(404).json({ error: `get user error: ${error}` });
    }
  })

  .put(async (req, res) => {
    try {
      const user = await Users.updateUser(req.params.userId, req.body);
      if (!user) {
        return res.status(404).json({ error: 'user not found' });
      }
      return res.json(user);
    } catch (error) {
      console.error('error getting user:', error);
      return res.status(500).json({ error: `get user error: ${error}` });
    }
  })

  .delete(async (req, res) => {
    try {
      await Users.deleteUser(req.params.userId);
      return res.json({ message: 'user deleted successfully' });
    } catch (error) {
      console.error('error deleting user:', error);
      return res.status(500).json({ error: `delete user error: ${error}` });
    }
  });

router.route('/users/:userId/allPosts')
  .get(async (req, res) => {
    try {
      const posts = await Users.getPostsByUser(req.params.userId);
      if (posts.length === 0) {
        return res.status(404).json({ error: 'no posts found for this user' });
      }
      return res.json(posts);
    } catch (error) {
      console.error('error finding posts for user:', error);
      return res.status(404).json({ error: `get posts for user error: ${error}` });
    }
  });

// post routes

router.route('/users/:userId/:postId')
  .get(async (req, res) => {
    try {
      const post = await Posts.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ error: 'post not found' });
      }
      return res.json(post);
    } catch (error) {
      console.error('error getting post:', error);
      return res.status(404).json({ error: `get post error: ${error}` });
    }
  })

  .put(async (req, res) => {
    try {
      const post = await Posts.updatePost(req.params.postId, req.body);
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
      await Posts.deletePost(req.params.postId);
      return res.json({ message: 'post deleted successfully' });
    } catch (error) {
      console.error('error deleting post:', error);
      return res.status(500).json({ error: `delete post error: ${error}` });
    }
  });

router.route('/posts')
  .get(async (req, res) => {
    try {
      const posts = await Posts.getPosts();
      res.json(posts);
    } catch (error) {
      console.error('error getting posts:', error);
      res.status(404).json({ error: `get posts error: ${error}` });
    }
  });

router.route('/users/:userId/newPost')
  .post(async (req, res) => {
    const post = await Posts.createPost(req.body);
    res.status(200).json(post);
  });

router.route('/naps')
  .get(async (req, res) => {
    try {
      const naps = await Slacks.getNaps();
      res.json(naps);
    } catch (error) {
      console.error('error getting naps:', error);
      res.status(404).json({ error: `get naps error: ${error}` });
    }
  });

router.route('/naps/:napId')
  .get(async (req, res) => {
    try {
      const nap = await Slacks.getNap(req.params.napId);
      if (!nap) {
        return res.status(404).json({ error: 'nap not found' });
      }
      return res.json(nap);
    } catch (error) {
      console.error('error getting nap:', error);
      return res.status(404).json({ error: `get nap error: ${error}` });
    }
  });

router.route('/naps/:napId/addReply')
  .put(async (req, res) => {
    const { napId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Reply message is required.' });
    }

    try {
      const nap = await Slacks.getNap(napId);
      if (!nap) {
        return res.status(404).json({ error: 'Nap not found.' });
      }

      nap.replies.push({ message, timestamp: new Date() });
      await nap.save();

      return res.status(200).json({ message: 'Reply added successfully.', nap });
    } catch (err) {
      console.error('Error adding reply:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  });
export default router;
