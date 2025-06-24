// controllers/chatbot.js
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

// Improved rule-based chatbot responses
const getBotResponse = (message) => {
  const lowerMessage = message.toLowerCase().trim();

  // Greetings
  if (/(hello|hi|hey|greetings|what's up)/.test(lowerMessage)) {
    return "Hey there! 👋 Welcome to GuestGrove. How can I assist you today?";
  }

  // Booking related
  if (/(book|booking|reserve|reservation|stay|room)/.test(lowerMessage)) {
    return "Looking to book a place? 🏡 You can browse listings and make reservations easily. Need help finding one?";
  }

  // Pricing / Cost
  if (/(price|cost|rate|charges|fees|how much)/.test(lowerMessage)) {
    return "Our prices vary by property, date, and location. 📅 You can find detailed pricing on each listing. Want help filtering by budget?";
  }

  // Location queries
  if (/(location|where|area|nearby|place|city|region)/.test(lowerMessage)) {
    return "We’ve got listings in multiple cities and regions! 🌍 Use the search filters to find accommodations near your preferred location.";
  }

  // Help / Support
  if (/(help|support|assist|issue|problem|trouble|question)/.test(lowerMessage)) {
    return "I'm here to help! 🛟 You can ask about bookings, account issues, pricing, or anything else GuestGrove-related.";
  }

  // Cancellations / Refunds
  if (/(cancel|cancellation|refund|money back|change plan|change booking)/.test(lowerMessage)) {
    return "For cancellations or refunds, please review the policy in your booking confirmation. 💸 Need help contacting support?";
  }

  // Account related
  if (/(account|profile|dashboard|login|signup|register|sign in)/.test(lowerMessage)) {
    return "You can manage your profile, view bookings, and update preferences in your account dashboard. 👤 Want me to take you there?";
  }

  // Availability
  if (/(available|availability|open dates|free rooms|slots)/.test(lowerMessage)) {
    return "You can check availability on the listing pages by selecting your preferred dates. 🗓 Need help picking a date?";
  }

  // Thank you / Appreciation
  if (/(thank you|thanks|ty|appreciate)/.test(lowerMessage)) {
    return "You're welcome! 😊 Let me know if there's anything else I can help with.";
  }

  // Default fallback
  return "I'm not sure I got that. 🤔 Could you rephrase your question? I can assist with bookings, pricing, accounts, cancellations, and more!";
};


// API Routes for AJAX calls
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user ? req.user.id : null;

    console.log("Message:", message);
    console.log("Session ID:", sessionId);
    console.log("User ID:", userId);

    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and session ID are required'
      });
    }

    // Save user message
    const userMessage = new ChatMessage({
      user: userId,
      sessionId,
      message,
      isBot: false
    });

    await userMessage.save();

    const botResponseText = getBotResponse(message);

    const botMessage = new ChatMessage({
      user: userId,
      sessionId,
      message: botResponseText,
      response: botResponseText,
      isBot: true
    });

    await botMessage.save();

    res.json({
      success: true,
      response: botResponseText,
      messageId: botMessage._id,
      timestamp: botMessage.timestamp
    });

  } catch (error) {
    console.error('🔥 Chatbot error:', error); // Check this output!
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user ? req.user.id : null;

    const messages = await ChatMessage.find({
      sessionId,
      ...(userId && { user: userId })
    }).sort({ timestamp: 1 });

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

exports.clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user ? req.user.id : null;

    await ChatMessage.deleteMany({
      sessionId,
      ...(userId && { user: userId })
    });

    res.json({
      success: true,
      message: 'Chat history cleared'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};