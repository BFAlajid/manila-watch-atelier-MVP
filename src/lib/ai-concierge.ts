// AI Concierge System for Manila Watch Atelier
// Uses OpenAI GPT-4 for intelligent watch recommendations and inquiries

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ConversationContext {
  messages: Message[];
  userPreferences?: {
    budget?: number;
    brand?: string;
    category?: string;
    currency?: string;
  };
  watchesViewed: string[];
  leadQuality: 'cold' | 'warm' | 'hot';
}

// System prompt for the AI concierge
const SYSTEM_PROMPT = `You are the AI concierge for Manila Watch Atelier, a prestigious grey-market luxury watch dealer in the Philippines managed by Sherard W. Ng.

PERSONALITY & TONE:
- Sophisticated yet approachable
- Knowledgeable watch enthusiast
- Patient and consultative (not pushy)
- Use subtle luxury language
- Build trust through expertise

YOUR CAPABILITIES:
1. Product Recommendations - Suggest watches based on budget, style, occasion
2. Watch Education - Explain complications, movements, brand heritage
3. Market Insights - Discuss investment potential, value retention
4. Lead Qualification - Understand customer needs and route to WhatsApp/Telegram

INVENTORY TIERS (Always explain):
- Tier A: In Hand - Ready to ship in 1-3 days
- Tier B: Incoming - Secured from supplier, arriving soon
- Tier C: Sourcing - Can source on request within 2-4 weeks

CRITICAL RULES:
❌ NEVER quote exact prices (they change) - say "approximately" or "starting from"
❌ NEVER guarantee availability - always say "let me check with Sherard"
❌ NEVER make binding commitments on shipping or customs
❌ NEVER discuss grey market risks directly - focus on authenticity guarantee

✅ ALWAYS mention authenticity guarantee and buy-back option
✅ ALWAYS collect name, email, WhatsApp for serious inquiries
✅ ALWAYS route high-intent buyers to WhatsApp for final negotiation
✅ ALWAYS be honest about grey market nature ("direct sourcing for better value")

ESCALATION TRIGGERS (Route to WhatsApp):
- Customer asks about specific watch availability
- Mentions budget over ₱500k
- Wants to make purchase
- Asks about sell/trade/consign
- Technical questions beyond your knowledge

CONVERSATION STYLE:
- Short responses (2-3 sentences max initially)
- Ask qualifying questions naturally
- Use watch collector terminology when appropriate
- Build rapport before pitching
- Mirror customer's formality level

Remember: You're here to assist, educate, and qualify - not to hard sell. Let the watches sell themselves.`;

// Mock AI response (replace with actual OpenAI API call in production)
export async function getConciergeResponse(
  context: ConversationContext,
  newMessage: string
): Promise<{ response: string; shouldEscalate: boolean; leadScore: number }> {

  // In production, this would call OpenAI API
  // For demo, we'll use intelligent keyword matching

  const lowerMessage = newMessage.toLowerCase();

  // Detect intent
  const isBuyIntent = /buy|purchase|order|get|want|interested in/i.test(lowerMessage);
  const isPriceQuestion = /price|cost|how much/i.test(lowerMessage);
  const isBrandQuestion = /rolex|patek|omega|audemars/i.test(lowerMessage);
  const isBudgetMention = /budget|₱|php|peso|\$/i.test(lowerMessage);
  const isAvailabilityQuestion = /available|stock|have|in hand/i.test(lowerMessage);

  // Extract budget if mentioned
  const budgetMatch = lowerMessage.match(/₱?([\d,]+)k?/);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : null;

  // Calculate lead score
  let leadScore = context.leadQuality === 'hot' ? 80 : context.leadQuality === 'warm' ? 50 : 20;
  if (isBuyIntent) leadScore += 20;
  if (budget && budget > 500000) leadScore += 15;
  if (isAvailabilityQuestion) leadScore += 10;
  if (context.watchesViewed.length > 2) leadScore += 10;

  // Decide if should escalate to human
  const shouldEscalate = leadScore > 70 || isBuyIntent;

  // Generate contextual response
  let response = '';

  // Greeting
  if (/hello|hi|hey|good morning|good afternoon/.test(lowerMessage)) {
    response = "Hello! Welcome to Manila Watch Atelier. I'm here to help you find the perfect timepiece. Are you looking for something specific, or would you like some recommendations?";
  }
  // Buy intent
  else if (isBuyIntent && shouldEscalate) {
    response = "Excellent choice! I'd love to connect you with Sherard directly to discuss availability and finalize the details. May I have your name and WhatsApp number? He typically responds within an hour during business hours.";
  }
  // Price question
  else if (isPriceQuestion) {
    response = "Our pricing is competitive in the grey market. Most pieces range from ₱500k to ₱5M depending on the model and condition. Which watch caught your eye? I can give you an approximate range and connect you with Sherard for the current quote.";
  }
  // Brand preference
  else if (isBrandQuestion) {
    const brand = lowerMessage.match(/(rolex|patek|omega|audemars piguet|ap)/i)?.[1];
    response = `Excellent taste! ${brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'That brand'} is a fantastic choice. We carry both Tier A (in hand) and Tier B (incoming) pieces. What style are you drawn to - sports, dress, or complications?`;
  }
  // Availability
  else if (isAvailabilityQuestion) {
    response = "Availability varies by piece. Tier A watches (green badge) ship in 1-3 days. Tier B (blue badge) are incoming and arrive within 2-3 weeks. For specific pieces, I recommend browsing our inventory or I can connect you with Sherard for real-time availability.";
  }
  // Budget
  else if (isBudgetMention && budget) {
    if (budget < 500000) {
      response = `At around ₱${(budget / 1000).toFixed(0)}k, you have great options! Consider Rolex Oyster Perpetual, Omega Seamaster, or entry-level Cartier. Would you like to see our available pieces in that range?`;
    } else if (budget < 2000000) {
      response = `Wonderful budget! At ₱${(budget / 1000000).toFixed(1)}M, you can explore Rolex Submariner, GMT-Master II, or Omega Speedmaster. Are you looking for sports watches or something dressier?`;
    } else {
      response = `Exceptional! At ₱${(budget / 1000000).toFixed(1)}M+, you're in Rolex Daytona, Patek Philippe, and Audemars Piguet territory. These are investment-grade pieces. I'd love to connect you with Sherard to discuss our current exclusive pieces. May I have your contact details?`;
      // High budget = escalate
      return { response, shouldEscalate: true, leadScore: 90 };
    }
  }
  // Generic help
  else {
    response = "I'm here to help! I can assist with: \n• Recommending watches based on your style & budget\n• Explaining our inventory tiers & availability\n• Answering questions about specific brands or models\n• Connecting you with Sherard for purchases\n\nWhat interests you most?";
  }

  return { response, shouldEscalate, leadScore };
}

// Production implementation with OpenAI
export async function getConciergeResponseProd(
  context: ConversationContext,
  newMessage: string,
  apiKey: string
): Promise<{ response: string; shouldEscalate: boolean; leadScore: number }> {

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...context.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content: newMessage }
        ],
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Analyze response for escalation triggers
    const shouldEscalate = /whatsapp|contact sherard|connect you|serious buyer/i.test(aiResponse);

    // Calculate lead score based on conversation
    const leadScore = calculateLeadScore(context, newMessage, aiResponse);

    return { response: aiResponse, shouldEscalate, leadScore };

  } catch (error) {
    console.error('AI Concierge error:', error);
    // Fallback to mock response
    return getConciergeResponse(context, newMessage);
  }
}

function calculateLeadScore(
  context: ConversationContext,
  userMessage: string,
  aiResponse: string
): number {
  let score = 20; // Base score

  // Conversation depth
  score += Math.min(context.messages.length * 5, 30);

  // Watches viewed
  score += Math.min(context.watchesViewed.length * 10, 30);

  // Budget mentioned
  if (context.userPreferences?.budget) {
    if (context.userPreferences.budget > 2000000) score += 20;
    else if (context.userPreferences.budget > 1000000) score += 15;
    else if (context.userPreferences.budget > 500000) score += 10;
  }

  // High-intent keywords
  const highIntent = /buy|purchase|order|available|serious|invest/i;
  if (highIntent.test(userMessage)) score += 15;

  // Response from AI suggests escalation
  if (/connect|whatsapp|sherard/i.test(aiResponse)) score += 15;

  return Math.min(score, 100);
}

// Create or load conversation context
export function initConversation(userId?: string): ConversationContext {
  const stored = userId ? localStorage.getItem(`chat-${userId}`) : null;

  if (stored) {
    return JSON.parse(stored);
  }

  return {
    messages: [],
    watchesViewed: [],
    leadQuality: 'cold',
    userPreferences: {}
  };
}

// Save conversation
export function saveConversation(context: ConversationContext, userId?: string) {
  if (userId) {
    localStorage.setItem(`chat-${userId}`, JSON.stringify(context));
  }
}

// Generate lead for routing to WhatsApp/Telegram
export interface Lead {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  leadScore: number;
  watchesInterested: string[];
  budget?: number;
  conversationHistory: Message[];
  createdAt: Date;
}

export function generateLead(context: ConversationContext, contactInfo: {
  name?: string;
  email?: string;
  phone?: string;
}): Lead {
  return {
    ...contactInfo,
    message: context.messages[context.messages.length - 1]?.content || '',
    leadScore: calculateLeadScore(context, '', ''),
    watchesInterested: context.watchesViewed,
    budget: context.userPreferences?.budget,
    conversationHistory: context.messages,
    createdAt: new Date()
  };
}
