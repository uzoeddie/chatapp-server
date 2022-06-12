import { PostModel } from '@post/models/post.schema';
import { IGetPosts, IPostDocument, IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { UserModel } from '@user/models/user.schema';
import { Aggregate, Query, UpdateQuery } from 'mongoose';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IQuerySort } from '@comment/interfaces/comment.interface';
import { ReactionModel } from '@reaction/models/reaction.schema';
import { IReactionDocument } from '@reaction/interfaces/reaction.interface';

class Post {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }

  public async getPosts(query: IGetPosts | any, skip = 0, limit = 0, sort?: IQuerySort): Promise<IPostDocument[]> {
    return new Promise((resolve) => {
      const posts: Aggregate<IPostDocument[]> = PostModel.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ]);
      resolve(posts);
    });
  }

  public async postCount(): Promise<number> {
    const count = await PostModel.find({}).countDocuments();
    return count;
  }

  public async postWithImagesCount(query: any): Promise<number> {
    const count = await PostModel.find(query).countDocuments();
    return count;
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost: Query<IQueryComplete & IQueryDeleted, IPostDocument> = PostModel.deleteOne({ _id: postId });
    const deleteReaction: Query<IQueryComplete & IQueryDeleted, IReactionDocument> = ReactionModel.deleteOne({ postId });
    const decrementPostNumber: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });
    await Promise.all([deletePost, decrementPostNumber, deleteReaction]);
  }

  public async editPost(postId: string, updatedPost: IPostDocument): Promise<void> {
    const updatePost: UpdateQuery<IPostDocument> = PostModel.updateOne({ _id: postId }, { $set: updatedPost });
    await Promise.all([updatePost]);
  }
}

export const postService: Post = new Post();
