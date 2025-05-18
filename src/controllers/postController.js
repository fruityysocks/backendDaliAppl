import Post from '../models/postModel';

export async function createPost(userId, postFields) {
  const post = new Post();
  post.content = postFields.content;
  post.authorRef = userId;
  // post.tags = postFields.tags;

  try {
    const savedPost = await post.save();
    console.log('post created successfully');
    return savedPost;
  } catch (error) {
    throw new Error(`create post error: ${error}`);
  }
}

export async function getPost(postId) {
  try {
    const post = await Post.findById(postId);
    console.log('post found successfully');
    return post;
  } catch (error) {
    throw new Error(`get post error: ${error}`);
  }
}

export async function deletePost(PostId) {
  try {
    await Post.findByIdAndDelete(PostId);
    console.log('post deleted successfully');
  } catch (error) {
    throw new Error(`delete post error: ${error}`);
  }
}

export async function updatePost(PostId, postFields) {
  try {
    const updatedPost = await Post.findByIdAndUpdate(PostId, postFields, { new: true });
    console.log('post updated successfully');
    return updatedPost;
  } catch (error) {
    throw new Error(`update post error: ${error}`);
  }
}

export async function getPosts() {
  try {
    const posts = await Post.find();
    console.log('posts found successfully');
    return posts;
  } catch (error) {
    throw new Error(`get posts error: ${error}`);
  }
}

// export async function getPost(PostId) {
//   try {
//     const post = await Post.findById(PostId);
//     console.log('post found successfully');
//     return post;
//   } catch (error) {
//     throw new Error(`get post error: ${error}`);
//   }
// }
