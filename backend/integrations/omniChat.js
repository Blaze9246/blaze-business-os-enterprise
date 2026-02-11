// Omni-Chat Service - Syncs app chat with WhatsApp
const { Pool } = require('pg');
const axios = require('axios');

class OmniChatService {
  constructor(pool) {
    this.pool = pool;
    this.userPhone = '+27615215148'; // Zain's WhatsApp
  }

  // Save message to database
  async saveMessage(data) {
    const {
      userId,
      role, // 'user' or 'assistant'
      content,
      source, // 'app' or 'whatsapp'
      platform, // 'web', 'whatsapp', 'telegram'
      messageId,
      timestamp = new Date()
    } = data;

    const result = await this.pool.query(
      `INSERT INTO chat_messages 
       (user_id, role, content, source, platform, message_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, role, content, source, platform, messageId, timestamp]
    );

    return result.rows[0];
  }

  // Get conversation history
  async getConversation(userId, limit = 50) {
    const result = await this.pool.query(
      `SELECT * FROM chat_messages 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows.reverse(); // Oldest first
  }

  // Sync app message to WhatsApp
  async syncToWhatsApp(userId, message) {
    try {
      // Send via WhatsApp API (using your Baileys instance)
      await this.sendWhatsAppMessage(this.userPhone, message);
      
      // Mark as synced
      await this.pool.query(
        `UPDATE chat_messages 
         SET synced = true, synced_at = NOW()
         WHERE user_id = $1 AND content = $2 AND source = 'app'
         ORDER BY created_at DESC LIMIT 1`,
        [userId, message]
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to sync to WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle incoming WhatsApp message
  async handleWhatsAppMessage(phone, message, messageId) {
    // Get user by phone
    const userResult = await this.pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      console.log('User not found for phone:', phone);
      return;
    }

    const userId = userResult.rows[0].id;

    // Save message
    const savedMessage = await this.saveMessage({
      userId,
      role: 'user',
      content: message,
      source: 'whatsapp',
      platform: 'whatsapp',
      messageId
    });

    // Broadcast to all connected clients via WebSocket
    this.broadcastToClients(userId, {
      type: 'new_message',
      message: savedMessage
    });

    return savedMessage;
  }

  // Send AI response to both app and WhatsApp
  async sendResponse(userId, content) {
    // Save to database
    const savedMessage = await this.saveMessage({
      userId,
      role: 'assistant',
      content,
      source: 'system',
      platform: 'web',
      timestamp: new Date()
    });

    // Broadcast to web clients
    this.broadcastToClients(userId, {
      type: 'new_message',
      message: savedMessage
    });

    // Send to WhatsApp
    await this.syncToWhatsApp(userId, content);

    return savedMessage;
  }

  // Send WhatsApp message (via Baileys)
  async sendWhatsAppMessage(phone, message) {
    // This would call your WhatsApp gateway
    // For now, placeholder - you'll connect to your Baileys instance
    try {
      // Option 1: Call your OpenClaw gateway
      await axios.post('http://localhost:3000/api/send-whatsapp', {
        to: phone,
        message
      });
    } catch (error) {
      console.log('WhatsApp send (mock):', { to: phone, message });
    }
  }

  // WebSocket broadcast helper
  broadcastToClients(userId, data) {
    // This will be set by the WebSocket handler
    if (global.webSocketClients) {
      const clients = global.webSocketClients.get(userId);
      if (clients) {
        clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      }
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    const result = await this.pool.query(
      `SELECT COUNT(*) FROM chat_messages 
       WHERE user_id = $1 AND role = 'assistant' AND read = false`,
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  // Mark messages as read
  async markAsRead(userId) {
    await this.pool.query(
      `UPDATE chat_messages 
       SET read = true 
       WHERE user_id = $1 AND role = 'assistant'`,
      [userId]
    );
  }
}

module.exports = OmniChatService;
