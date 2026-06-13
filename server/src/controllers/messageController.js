const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const { getIO } = require('../socket');

const prisma = new PrismaClient();

async function getOrCreateConversation(req, res, next) {
  try {
    const { providerId, bookingId } = req.body;

    if (!providerId) {
      throw new BadRequestError('providerId is required');
    }

    if (providerId === req.user.id) {
      throw new BadRequestError('Cannot start a conversation with yourself');
    }

    // Try to find if a conversation already exists between these two users
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { seekerId: req.user.id, providerId: providerId },
          { seekerId: providerId, providerId: req.user.id }
        ]
      },
      include: {
        seeker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        provider: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } }
      }
    });

    if (!conversation) {
      // If it doesn't exist, create it. Since seeker/provider roles are flexible,
      // we'll assign the initiator as seeker and the target as provider.
      conversation = await prisma.conversation.create({
        data: {
          seekerId: req.user.id,
          providerId: providerId,
          bookingId: bookingId || null
        },
        include: {
          seeker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
          provider: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } }
        }
      });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
}

async function getConversations(req, res, next) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { seekerId: req.user.id },
          { providerId: req.user.id }
        ]
      },
      include: {
        seeker: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true }
        },
        provider: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Populate the otherUser object, lastMessage and unread count for each conversation
    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: req.user.id },
            isRead: false
          }
        });

        const otherUser = conv.seekerId === req.user.id ? conv.provider : conv.seeker;

        return {
          id: conv.id,
          bookingId: conv.bookingId,
          seekerId: conv.seekerId,
          providerId: conv.providerId,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherUser,
          lastMessage: conv.messages[0] || null,
          unreadCount
        };
      })
    );

    res.json({ success: true, data: processedConversations });
  } catch (error) {
    next(error);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        seeker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        provider: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (conversation.seekerId !== req.user.id && conversation.providerId !== req.user.id) {
      throw new ForbiddenError('Not authorized to view these messages');
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: req.user.id },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Emit event to update sender's read UI and recipient unread count
    const io = getIO();
    if (io) {
      const otherUserId = conversation.seekerId === req.user.id ? conversation.providerId : conversation.seekerId;
      io.to(otherUserId).emit('messagesRead', { conversationId: id });
      
      // Update unread count for current user
      const unreadCount = await prisma.message.count({
        where: {
          conversation: {
            OR: [
              { seekerId: req.user.id },
              { providerId: req.user.id }
            ]
          },
          senderId: { not: req.user.id },
          isRead: false
        }
      });
      io.to(req.user.id).emit('unreadCountUpdate', { count: unreadCount });
    }

    res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new BadRequestError('Message content cannot be empty');
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    if (conversation.seekerId !== req.user.id && conversation.providerId !== req.user.id) {
      throw new ForbiddenError('Not authorized to send messages in this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: req.user.id,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        }
      }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Real-time dispatch via Socket.io
    const recipientId = conversation.seekerId === req.user.id ? conversation.providerId : conversation.seekerId;
    const io = getIO();
    if (io) {
      io.to(recipientId).emit('message', message);
      io.to(req.user.id).emit('message', message);

      // Send updated unread count to recipient
      const recipientUnreadCount = await prisma.message.count({
        where: {
          conversation: {
            OR: [
              { seekerId: recipientId },
              { providerId: recipientId }
            ]
          },
          senderId: { not: recipientId },
          isRead: false
        }
      });
      io.to(recipientId).emit('unreadCountUpdate', { count: recipientUnreadCount });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { seekerId: req.user.id },
            { providerId: req.user.id }
          ]
        },
        senderId: { not: req.user.id },
        isRead: false
      }
    });

    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrCreateConversation,
  getConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount
};
