const db = require('../config/db');

// 1. GET /api/chat/users - Get available users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, created_at FROM users ORDER BY name ASC');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

// 2. GET /api/chat/conversations/:userId - Get conversations belonging to user
exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  if (!userId || isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Valid user ID is required.' });
  }

  try {
    const query = `
      SELECT 
        c.id AS conversation_id,
        c.created_at,
        c.updated_at,
        CASE 
          WHEN c.user_one_id = ? THEN u2.id
          ELSE u1.id
        END AS other_user_id,
        CASE 
          WHEN c.user_one_id = ? THEN u2.name
          ELSE u1.name
        END AS other_user_name,
        CASE 
          WHEN c.user_one_id = ? THEN u2.email
          ELSE u1.email
        END AS other_user_email,
        m.message AS last_message,
        m.created_at AS last_message_time,
        m.sender_id AS last_message_sender_id,
        (
          SELECT COUNT(*) 
          FROM messages unread_m 
          WHERE unread_m.conversation_id = c.id 
            AND unread_m.receiver_id = ? 
            AND unread_m.is_read = FALSE
        ) AS unread_count
      FROM conversations c
      JOIN users u1 ON c.user_one_id = u1.id
      JOIN users u2 ON c.user_two_id = u2.id
      LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC, id DESC 
        LIMIT 1
      )
      WHERE c.user_one_id = ? OR c.user_two_id = ?
      ORDER BY COALESCE(m.created_at, c.updated_at) DESC;
    `;

    const [conversations] = await db.query(query, [userId, userId, userId, userId, userId, userId]);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
};

// 3. POST /api/chat/conversations - Create or return existing conversation
exports.createConversation = async (req, res) => {
  const { user_one_id, user_two_id } = req.body;

  if (!user_one_id || !user_two_id) {
    return res.status(400).json({ success: false, message: 'Both user_one_id and user_two_id are required.' });
  }

  const u1 = parseInt(user_one_id);
  const u2 = parseInt(user_two_id);

  if (u1 === u2) {
    return res.status(400).json({ success: false, message: 'Cannot create a conversation with yourself.' });
  }

  try {
    // Check if users exist
    const [users] = await db.query('SELECT id FROM users WHERE id IN (?, ?)', [u1, u2]);
    if (users.length < 2) {
      return res.status(404).json({ success: false, message: 'One or both users do not exist.' });
    }

    // Check if conversation already exists
    const [existing] = await db.query(
      `SELECT id FROM conversations 
       WHERE (user_one_id = ? AND user_two_id = ?) 
          OR (user_one_id = ? AND user_two_id = ?)`,
      [u1, u2, u2, u1]
    );

    if (existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Conversation already exists.',
        data: { id: existing[0].id }
      });
    }

    // Insert new conversation
    const [result] = await db.query(
      'INSERT INTO conversations (user_one_id, user_two_id) VALUES (?, ?)',
      [u1, u2]
    );

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to create conversation.' });
  }
};

// 4. GET /api/chat/messages/:conversationId - Get messages with authorization check
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId query parameter is required.' });
  }

  try {
    // Authorization check: Verify requesting user belongs to conversation
    const [conv] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
      [conversationId, userId, userId]
    );

    if (conv.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not belong to this conversation.'
      });
    }

    // Fetch messages
    const [messages] = await db.query(
      `SELECT id, conversation_id, sender_id, receiver_id, message, is_read, created_at 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

// 5. POST /api/chat/messages - Send message with safety validation
exports.sendMessage = async (req, res) => {
  const { conversation_id, sender_id, receiver_id, message } = req.body;

  if (!conversation_id || !sender_id || !receiver_id || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  }

  try {
    // Authorization check: Verify sender belongs to conversation
    const [conv] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)',
      [conversation_id, sender_id, sender_id]
    );

    if (conv.length === 0) {
      return res.status(403).json({ success: false, message: 'Sender is not part of this conversation.' });
    }

    // Insert message
    const [result] = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message) 
       VALUES (?, ?, ?, ?)`,
      [conversation_id, sender_id, receiver_id, trimmedMessage]
    );

    // Update conversation timestamp
    await db.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation_id]);

    const [newMessage] = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: newMessage[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

// 6. PATCH /api/chat/messages/read - Mark received messages as read
exports.markMessagesRead = async (req, res) => {
  const { conversation_id, user_id } = req.body;

  if (!conversation_id || !user_id) {
    return res.status(400).json({ success: false, message: 'conversation_id and user_id are required.' });
  }

  try {
    await db.query(
      `UPDATE messages 
       SET is_read = TRUE 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [conversation_id, user_id]
    );

    res.status(200).json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update read status.' });
  }
};