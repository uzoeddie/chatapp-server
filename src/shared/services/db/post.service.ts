import { PostModel } from '@post/models/post.schema';
import { IGetPosts, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { UserModel } from '@user/models/user.schema';
import { Aggregate, Query, UpdateQuery } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IQuerySort } from '@comment/interfaces/comment.interface';

class Post {
    public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
        const post: Promise<IPostDocument> = PostModel.create(createdPost);
        const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
        await Promise.all([post, user]);
    }

    public async getPosts(query: IGetPosts, skip = 0, limit = 0, sort?: IQuerySort): Promise<IPostDocument[]> {
        return new Promise((resolve) => {
            const posts: Aggregate<IPostDocument[]> = PostModel.aggregate([
                { $match: query },
                { $sort: sort },
                { $skip: skip },
                { $limit: limit },
                { $addFields: { objectReactions: { $objectToArray: '$reactions' } } },
                {
                    $addFields: {
                        reactions: {
                            $map: {
                                input: '$objectReactions',
                                as: 'reaction',
                                in: { type: '$$reaction.k', value: '$$reaction.v' }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        reactions: {
                            $filter: {
                                input: '$reactions',
                                as: 'item',
                                cond: { $ne: ['$$item.value', 0] }
                            }
                        }
                    }
                },
                { $project: { objectReactions: 0 } }
            ]);
            resolve(posts);
        });
    }

    public async deletePost(postId: string, userId: string): Promise<void> {
        const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
        const decrementPostNumber: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
        await Promise.all([deletePost, decrementPostNumber]);
    }

    public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
        const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
        await Promise.all([updatePost]);
    }
}

export const postService: Post = new Post();
