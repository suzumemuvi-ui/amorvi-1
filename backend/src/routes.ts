import { Router, Request, Response, NextFunction } from 'express';
import {
  createId,
  publicUser,
  readDatabase,
  writeDatabase,
} from './store.js';

const router = Router();

// =====================================================
// AUTH
// =====================================================

const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    return res.status(401).json({
      error: 'Not authenticated',
    });
  }

  next();
};

// =====================================================
// HOME / POSTS
// =====================================================

router.get(
  '/posts/nearby',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const latitude = Number(req.query.latitude);
      const longitude = Number(req.query.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({
          error: 'Valid latitude and longitude are required',
        });
      }

      const radiusKm = 50;

      const user = db.users.find((u) => u.id === userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const nearbyPosts = db.posts
        .filter((post) => {
          const postUser = db.users.find(
            (u) => u.id === post.userId
          );

          if (!postUser) return false;
          if (postUser.id === userId) return false;

          if (
            postUser.latitude === null ||
            postUser.longitude === null
          ) {
            return false;
          }

          const distance = getDistance(
            latitude,
            longitude,
            postUser.latitude,
            postUser.longitude
          );

          return distance <= radiusKm;
        })
        .map((post) => {
          const postUser = db.users.find(
            (u) => u.id === post.userId
          );

          if (!postUser) return null;

          const likeCount = db.postLikes.filter(
            (like) => like.postId === post.id
          ).length;

          const commentCount = db.postComments.filter(
            (comment) => comment.postId === post.id
          ).length;

          const userLiked = db.postLikes.some(
            (like) =>
              like.userId === userId &&
              like.postId === post.id
          );

          const userInterested = db.interested.some(
            (interest) =>
              interest.userId === userId &&
              interest.targetUserId === post.userId
          );

          return {
            id: post.id,
            user: publicUser(postUser),
            images: post.images ?? [],
            caption: post.caption ?? '',
            likes: likeCount,
            comments: commentCount,
            userLiked,
            userInterested,
            createdAt: post.createdAt,
          };
        })
        .filter(
          (post): post is NonNullable<typeof post> =>
            post !== null
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      return res.json(nearbyPosts);
    } catch (error) {
      console.error('GET /posts/nearby:', error);

      return res.status(500).json({
        error: 'Failed to load nearby posts',
      });
    }
  }
);

// Create post
router.post(
  '/posts',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const { images, caption } = req.body;

      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          error: 'At least one image is required',
        });
      }

      const user = db.users.find((u) => u.id === userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const post = {
        id: createId(),
        userId,
        images,
        caption: typeof caption === 'string' ? caption : '',
        createdAt: new Date().toISOString(),
      };

      db.posts.push(post);

      await writeDatabase(db);

      return res.status(201).json(post);
    } catch (error) {
      console.error('POST /posts:', error);

      return res.status(500).json({
        error: 'Failed to create post',
      });
    }
  }
);

router.post(
  '/posts/:postId/like',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const postIdParam = req.params.postId;

      if (typeof postIdParam !== 'string') {
        return res.status(400).json({
          error: 'Invalid post ID',
        });
      }

      const postId = postIdParam;

      const post = db.posts.find(
        (p) => p.id === postId
      );

      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
        });
      }

      const existing = db.postLikes.find(
        (like) =>
          like.userId === userId &&
          like.postId === postId
      );

      if (existing) {
        return res.status(409).json({
          error: 'Already liked',
        });
      }

      const like = {
        id: createId(),
        userId,
        postId,
        createdAt: new Date().toISOString(),
      };

      db.postLikes.push(like);

      await writeDatabase(db);

      return res.status(201).json(like);
    } catch (error) {
      console.error('POST /posts/:postId/like:', error);

      return res.status(500).json({
        error: 'Failed to like post',
      });
    }
  }
);

// =====================================================
// COMMENTS
// =====================================================

router.get(
  '/posts/:postId/comments',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const { postId } = req.params;

      const post = db.posts.find(
        (p) => p.id === postId
      );

      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
        });
      }

      const comments = db.postComments
        .filter((comment) => comment.postId === postId)
        .map((comment) => {
          const user = db.users.find(
            (u) => u.id === comment.userId
          );

          if (!user) return null;

          return {
            id: comment.id,
            user: publicUser(user),
            content: comment.content,
            createdAt: comment.createdAt,
          };
        })
        .filter(
          (comment): comment is NonNullable<typeof comment> =>
            comment !== null
        );

      return res.json(comments);
    } catch (error) {
      console.error('GET comments:', error);

      return res.status(500).json({
        error: 'Failed to load comments',
      });
    }
  }
);

// Comment
router.post(
  '/posts/:postId/comment',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const postIdParam = req.params.postId;

      if (typeof postIdParam !== 'string') {
        return res.status(400).json({
          error: 'Invalid post ID',
        });
      }

      const postId = postIdParam;
      const { content } = req.body;

      const post = db.posts.find(
        (p) => p.id === postId
      );

      if (!post) {
        return res.status(404).json({
          error: 'Post not found',
        });
      }

      if (
        typeof content !== 'string' ||
        content.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Comment cannot be empty',
        });
      }

      const comment = {
        id: createId(),
        userId,
        postId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };

      db.postComments.push(comment);

      await writeDatabase(db);

      return res.status(201).json(comment);
    } catch (error) {
      console.error('POST comment:', error);

      return res.status(500).json({
        error: 'Failed to create comment',
      });
    }
  }
);


// =====================================================
// INTERESTED
// =====================================================

// Add Interested
router.post(
  '/interested',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;
      const { targetUserId } = req.body;

      if (
        typeof targetUserId !== 'string' ||
        !targetUserId
      ) {
        return res.status(400).json({
          error: 'targetUserId is required',
        });
      }

      if (targetUserId === userId) {
        return res.status(400).json({
          error: 'You cannot be interested in yourself',
        });
      }

      const targetUser = db.users.find(
        (u) => u.id === targetUserId
      );

      if (!targetUser) {
        return res.status(404).json({
          error: 'Target user not found',
        });
      }

      const existing = db.interested.find(
        (interest) =>
          interest.userId === userId &&
          interest.targetUserId === targetUserId
      );

      if (existing) {
        return res.status(409).json({
          error: 'Already interested',
        });
      }

      const interested = {
        id: createId(),
        userId,
        targetUserId,
        createdAt: new Date().toISOString(),
      };

      db.interested.push(interested);

      await writeDatabase(db);

      return res.status(201).json(interested);
    } catch (error) {
      console.error('POST /interested:', error);

      return res.status(500).json({
        error: 'Failed to add interest',
      });
    }
  }
);

// Get Interested
router.get(
  '/interested',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const interestedProfiles = db.interested
        .filter(
          (interest) => interest.userId === userId
        )
        .map((interest) => {
          const targetUser = db.users.find(
            (u) => u.id === interest.targetUserId
          );

          if (!targetUser) return null;

          return {
            id: interest.id,
            user: publicUser(targetUser),
            interestedAt: interest.createdAt,
          };
        })
        .filter(
          (
            profile
          ): profile is NonNullable<typeof profile> =>
            profile !== null
        );

      return res.json(interestedProfiles);
    } catch (error) {
      console.error('GET /interested:', error);

      return res.status(500).json({
        error: 'Failed to load interested profiles',
      });
    }
  }
);

// Remove Interested
router.delete(
  '/interested/:interestedId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;
      const { interestedId } = req.params;

      const interest = db.interested.find(
        (item) =>
          item.id === interestedId &&
          item.userId === userId
      );

      if (!interest) {
        return res.status(404).json({
          error: 'Interested profile not found',
        });
      }

      db.interested = db.interested.filter(
        (item) => item.id !== interestedId
      );

      await writeDatabase(db);

      return res.json({ ok: true });
    } catch (error) {
      console.error('DELETE /interested:', error);

      return res.status(500).json({
        error: 'Failed to remove interest',
      });
    }
  }
);

// =====================================================
// LIKES + MATCHES
// =====================================================

router.post(
  '/likes',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userAId = req.userId!;
      const { userBId } = req.body;

      if (
        typeof userBId !== 'string' ||
        !userBId
      ) {
        return res.status(400).json({
          error: 'userBId is required',
        });
      }

      if (userAId === userBId) {
        return res.status(400).json({
          error: 'You cannot like yourself',
        });
      }

      const targetUser = db.users.find(
        (u) => u.id === userBId
      );

      if (!targetUser) {
        return res.status(404).json({
          error: 'Target user not found',
        });
      }

      // Check exact direction
      const existingLike = db.likes.find(
        (like) =>
          like.userAId === userAId &&
          like.userBId === userBId
      );

      if (existingLike) {
        return res.status(409).json({
          error: 'Already liked this user',
        });
      }

      const like = {
        id: createId(),
        userAId,
        userBId,
        createdAt: new Date().toISOString(),
      };

      db.likes.push(like);

      // Check reverse like
      const mutualLike = db.likes.find(
        (item) =>
          item.userAId === userBId &&
          item.userBId === userAId
      );

      let match = null;

      if (mutualLike) {
        // Prevent duplicate match
        const existingMatch = db.matches.find(
          (item) =>
            (item.userAId === userAId &&
              item.userBId === userBId) ||
            (item.userAId === userBId &&
              item.userBId === userAId)
        );

        if (!existingMatch) {
          match = {
            id: createId(),
            userAId,
            userBId,
            status: 'matched' as const,
            createdAt: new Date().toISOString(),
          };

          db.matches.push(match);
        } else {
          match = existingMatch;
        }
      }

      await writeDatabase(db);

      return res.status(201).json({
        like,
        match: match ? match : null,
      });
    } catch (error) {
      console.error('POST /likes:', error);

      return res.status(500).json({
        error: 'Failed to like user',
      });
    }
  }
);

// Get Matches
router.get(
  '/matches',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const matches = db.matches
        .filter(
          (match) =>
            match.userAId === userId ||
            match.userBId === userId
        )
        .map((match) => {
          const otherUserId =
            match.userAId === userId
              ? match.userBId
              : match.userAId;

          const otherUser = db.users.find(
            (user) => user.id === otherUserId
          );

          if (!otherUser) return null;

          return {
            id: match.id,
            user: publicUser(otherUser),
            matchedAt: match.createdAt,
          };
        })
        .filter(
          (
            match
          ): match is NonNullable<typeof match> =>
            match !== null
        )
        .sort(
          (a, b) =>
            new Date(b.matchedAt).getTime() -
            new Date(a.matchedAt).getTime()
        );

      return res.json(matches);
    } catch (error) {
      console.error('GET /matches:', error);

      return res.status(500).json({
        error: 'Failed to load matches',
      });
    }
  }
);

// =====================================================
// CONNECTIONS
// =====================================================

// Send connection request
router.post(
  '/connections/request',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userAId = req.userId!;
      const { userBId } = req.body;

      if (
        typeof userBId !== 'string' ||
        !userBId
      ) {
        return res.status(400).json({
          error: 'userBId is required',
        });
      }

      if (userAId === userBId) {
        return res.status(400).json({
          error: 'You cannot connect with yourself',
        });
      }

      const targetUser = db.users.find(
        (u) => u.id === userBId
      );

      if (!targetUser) {
        return res.status(404).json({
          error: 'Target user not found',
        });
      }

      const existing = db.connections.find(
        (connection) =>
          (connection.userAId === userAId &&
            connection.userBId === userBId) ||
          (connection.userAId === userBId &&
            connection.userBId === userAId)
      );

      if (existing) {
        return res.status(409).json({
          error: 'Connection already exists',
        });
      }

      const connection = {
        id: createId(),
        userAId,
        userBId,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      db.connections.push(connection);

      await writeDatabase(db);

      return res.status(201).json(connection);
    } catch (error) {
      console.error('POST connection:', error);

      return res.status(500).json({
        error: 'Failed to create connection',
      });
    }
  }
);

// Pending requests
router.get(
  '/connections/pending',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const pending = db.connections
        .filter(
          (connection) =>
            connection.userBId === userId &&
            connection.status === 'pending'
        )
        .map((connection) => {
          const requester = db.users.find(
            (user) => user.id === connection.userAId
          );

          if (!requester) return null;

          return {
            id: connection.id,
            user: publicUser(requester),
            requestedAt: connection.createdAt,
          };
        })
        .filter(
          (
            request
          ): request is NonNullable<typeof request> =>
            request !== null
        );

      return res.json(pending);
    } catch (error) {
      console.error('GET pending connections:', error);

      return res.status(500).json({
        error: 'Failed to load connection requests',
      });
    }
  }
);

// Accept connection
router.patch(
  '/connections/:connectionId/accept',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;
      const { connectionId } = req.params;

      const connection = db.connections.find(
        (item) =>
          item.id === connectionId &&
          item.userBId === userId &&
          item.status === 'pending'
      );

      if (!connection) {
        return res.status(404).json({
          error: 'Connection request not found',
        });
      }

      connection.status = 'accepted';

      await writeDatabase(db);

      return res.json(connection);
    } catch (error) {
      console.error('PATCH connection:', error);

      return res.status(500).json({
        error: 'Failed to accept connection',
      });
    }
  }
);

// Get connections
router.get(
  '/connections',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const connections = db.connections
        .filter(
          (connection) =>
            (
              connection.userAId === userId ||
              connection.userBId === userId
            ) &&
            connection.status === 'accepted'
        )
        .map((connection) => {
          const otherUserId =
            connection.userAId === userId
              ? connection.userBId
              : connection.userAId;

          const otherUser = db.users.find(
            (user) => user.id === otherUserId
          );

          if (!otherUser) return null;

          return {
            id: connection.id,
            user: publicUser(otherUser),
            connectedAt: connection.createdAt,
          };
        })
        .filter(
          (
            connection
          ): connection is NonNullable<typeof connection> =>
            connection !== null
        );

      return res.json(connections);
    } catch (error) {
      console.error('GET connections:', error);

      return res.status(500).json({
        error: 'Failed to load connections',
      });
    }
  }
);

// =====================================================
// MESSAGES
// =====================================================

router.post(
  '/messages',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const senderId = req.userId!;

      const { receiverId, content } = req.body;

      if (
        typeof receiverId !== 'string' ||
        !receiverId
      ) {
        return res.status(400).json({
          error: 'receiverId is required',
        });
      }

      if (
        typeof content !== 'string' ||
        content.trim().length === 0
      ) {
        return res.status(400).json({
          error: 'Message cannot be empty',
        });
      }

      if (senderId === receiverId) {
        return res.status(400).json({
          error: 'You cannot message yourself',
        });
      }

      const receiver = db.users.find(
        (user) => user.id === receiverId
      );

      if (!receiver) {
        return res.status(404).json({
          error: 'Receiver not found',
        });
      }

      const message = {
        id: createId(),
        senderId,
        receiverId,
        content: content.trim(),
        read: false,
        createdAt: new Date().toISOString(),
      };

      db.messages.push(message);

      await writeDatabase(db);

      return res.status(201).json(message);
    } catch (error) {
      console.error('POST /messages:', error);

      return res.status(500).json({
        error: 'Failed to send message',
      });
    }
  }
);

router.get(
  '/messages/:otherUserId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;
      const { otherUserId } = req.params;

      const otherUser = db.users.find(
        (user) => user.id === otherUserId
      );

      if (!otherUser) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      const messages = db.messages
        .filter(
          (message) =>
            (message.senderId === userId &&
              message.receiverId === otherUserId) ||
            (message.senderId === otherUserId &&
              message.receiverId === userId)
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

      return res.json(messages);
    } catch (error) {
      console.error('GET messages:', error);

      return res.status(500).json({
        error: 'Failed to load messages',
      });
    }
  }
);

// =====================================================
// PROFILE
// =====================================================

router.get(
  '/profile/:userId',
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const { userId } = req.params;

      const user = db.users.find(
        (u) => u.id === userId
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      return res.json(publicUser(user));
    } catch (error) {
      console.error('GET profile:', error);

      return res.status(500).json({
        error: 'Failed to load profile',
      });
    }
  }
);

router.patch(
  '/profile',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const db = await readDatabase();
      const userId = req.userId!;

      const {
        name,
        age,
        bio,
        interests,
        images,
        latitude,
        longitude,
      } = req.body;

      const user = db.users.find(
        (u) => u.id === userId
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      if (name !== undefined) {
        if (
          typeof name !== 'string' ||
          name.trim().length === 0
        ) {
          return res.status(400).json({
            error: 'Invalid name',
          });
        }

        user.name = name.trim();
      }

      if (age !== undefined) {
        const numericAge = Number(age);

        if (
          !Number.isInteger(numericAge) ||
          numericAge < 18 ||
          numericAge > 120
        ) {
          return res.status(400).json({
            error: 'Invalid age',
          });
        }

        user.age = numericAge;
      }

      if (bio !== undefined) {
        if (typeof bio !== 'string') {
          return res.status(400).json({
            error: 'Invalid bio',
          });
        }

        user.bio = bio.trim();
      }

      if (interests !== undefined) {
        if (!Array.isArray(interests)) {
          return res.status(400).json({
            error: 'Interests must be an array',
          });
        }

        user.interests = interests;
      }

      if (images !== undefined) {
        if (!Array.isArray(images)) {
          return res.status(400).json({
            error: 'Images must be an array',
          });
        }

        user.images = images;
      }

      if (latitude !== undefined) {
        const lat = Number(latitude);

        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
          return res.status(400).json({
            error: 'Invalid latitude',
          });
        }

        user.latitude = lat;
      }

      if (longitude !== undefined) {
        const lon = Number(longitude);

        if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
          return res.status(400).json({
            error: 'Invalid longitude',
          });
        }

        user.longitude = lon;
      }

      user.updatedAt = new Date().toISOString();

      await writeDatabase(db);

      return res.json(publicUser(user));
    } catch (error) {
      console.error('PATCH /profile:', error);

      return res.status(500).json({
        error: 'Failed to update profile',
      });
    }
  }
);

// =====================================================
// DISTANCE
// =====================================================

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const lat1Rad =
    (lat1 * Math.PI) / 180;

  const lat2Rad =
    (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

export default router;
