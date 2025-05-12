import Post from '../models/post_model';

export async function createPost(postFields) {
  const post = new Post();
  post.title = postFields.title;
  post.content = postFields.content;
  post.tags = postFields.tags;
  post.coverUrl = postFields.coverUrl;

  try {
    const savedpost = await post.save();
    console.log('post created successfully');
    return savedpost;
  } catch (error) {
    throw new Error(`create post error: ${error}`);
  }
}
export async function getPosts() {
  try {
    const posts = await Post.find();
    console.log('posts found successfully');
    return posts;
  } catch (error) {
    throw new Error(`create post error: ${error}`);
  }
}
export async function getPost(id) {
  try {
    const post = await Post.findById(id);
    console.log('post found successfully');
    return post;
  } catch (error) {
    throw new Error(`get post error: ${error}`);
  }
}
export async function deletePost(id) {
  try {
    await Post.findByIdAndDelete(id);
    console.log('post deleted successfully');
  } catch (error) {
    throw new Error(`delete post error: ${error}`);
  }
}
export async function updatePost(id, postFields) {
  try {
    const updatedPost = await Post.findByIdAndUpdate(id, postFields);
    console.log('post updated successfully');
    return updatedPost;
  } catch (error) {
    throw new Error(`update post error: ${error}`);
  }
}
