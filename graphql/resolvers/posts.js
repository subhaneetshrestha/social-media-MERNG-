const Post = require('../../models/Post');
const checkAuth = require('../../utils/checkAuth');
const {
    AuthenticationError,
    UserInputError
} = require('apollo-server');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({
                    createdAt: -1
                });
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },

        async getPost(_, {
            postId
        }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch (err) {
                throw new Error(err);
            }
        },
    },

    Mutation: {
        async createPost(_, {
            body
        }, context) {
            const user = checkAuth(context);

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save();

            return post;
        },

        async deletePost(_, {
            postId
        }, context) {
            const user = checkAuth(context);

            try {
                const post = await Post.findById(postId);

                if (!post) {
                    return new UserInputError(`Post with id ${postId} not found.`)
                }

                if (user.username === post.username) {
                    await post.delete();

                    return "Post deleted successfully!"
                } else {
                    throw new AuthenticationError('Action not allowed!')
                }
            } catch (err) {
                throw new Error(err);
            }
        },

        async createComment(_, {
            postId,
            body
        }, context) {
            const {
                username
            } = checkAuth(context);

            if (body.trim() === "") {
                throw new UserInputError('Empty Comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId);

            if (post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })

                await post.save();

                return post;
            } else {
                throw new UserInputError('Post not found');
            }
        },

        async deleteComment(_, {
            postId,
            commentId
        }, context) {
            const {
                username
            } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                if (post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);

                    await post.save();
                    return post;
                } else {
                    throw new AuthenticationError('Action not allowed!');
                }
            } else {
                throw new UserInputError(`Post with id ${postId} not found`);
            }
        }
    }
}