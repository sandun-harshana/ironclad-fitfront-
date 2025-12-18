const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAOm-n2ak-Mu3YXtvdkPVTumIDOGu15yR0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export const generateGeminiResponse = async (message: string, context: 'fitness' | 'gym' | 'general' = 'fitness'): Promise<string> => {
  try {
    const systemPrompt = getSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error('No valid response from Gemini API:', data);
      throw new Error('No response generated');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getFallbackResponse(message);
  }
};

const getSystemPrompt = (context: string): string => {
  const basePrompt = `You are a helpful fitness assistant for Ironclad Fitness Gym Management System. You provide helpful, accurate, and encouraging responses about fitness, workouts, nutrition, and gym-related topics.

Key guidelines:
- Be encouraging and motivational
- Provide practical, actionable advice
- Focus on safety and proper form
- Suggest consulting professionals for medical concerns
- Keep responses concise but informative (max 200 words)
- Use a friendly, professional tone
- Include emojis sparingly for engagement

You can help with:
- Workout routines and exercises
- Nutrition and diet advice
- Gym equipment usage
- Fitness goals and planning
- General health and wellness
- Gym policies and procedures`;

  switch (context) {
    case 'gym':
      return `${basePrompt}\n\nYou specifically help with gym operations, class schedules, membership information, and facility-related questions.`;
    case 'fitness':
      return `${basePrompt}\n\nYou specialize in fitness advice, workout plans, exercise techniques, and health guidance.`;
    default:
      return basePrompt;
  }
};

const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return "I'd be happy to help with your workout! 💪 For personalized exercise recommendations, I suggest consulting with one of our certified trainers. They can create a program tailored to your fitness level and goals. In the meantime, remember to always warm up before exercising and focus on proper form to prevent injuries.";
  }
  
  if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
    return "Nutrition is a key part of your fitness journey! 🥗 While I can provide general guidance, I recommend speaking with a nutritionist for personalized meal plans. Generally, focus on whole foods, adequate protein (0.8-1g per lb body weight), and staying hydrated. Remember, sustainable changes work best!";
  }
  
  if (lowerMessage.includes('membership') || lowerMessage.includes('class')) {
    return "For specific questions about membership details or class schedules, please check with our front desk staff or visit the member portal. 📅 They'll have the most up-to-date information about our offerings and can help you find the perfect fit for your fitness goals!";
  }
  
  if (lowerMessage.includes('equipment')) {
    return "Our gym has a wide range of equipment! 🏋️‍♂️ If you're unsure how to use any machine, don't hesitate to ask our trainers for a demonstration. They can show you proper form and help you get the most out of your workout safely.";
  }
  
  return "I'm here to help with your fitness journey! 🌟 Feel free to ask me about workouts, nutrition, gym equipment, or any other fitness-related questions. If you need specific assistance with membership or technical issues, our staff is always ready to help!";
};

export const generateWorkoutPlan = async (
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced',
  goals: string[],
  availableDays: number,
  equipment: string[]
): Promise<string> => {
  const prompt = `Create a ${availableDays}-day workout plan for a ${fitnessLevel} level person with goals: ${goals.join(', ')}. Available equipment: ${equipment.join(', ')}. Include exercises, sets, reps, and rest periods. Keep it concise and practical.`;
  
  return await generateGeminiResponse(prompt, 'fitness');
};

export const generateNutritionAdvice = async (
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance',
  dietaryRestrictions: string[],
  activityLevel: 'low' | 'moderate' | 'high'
): Promise<string> => {
  const prompt = `Provide nutrition advice for ${goal} with ${activityLevel} activity level. Dietary restrictions: ${dietaryRestrictions.join(', ')}. Include general guidelines, meal timing, and food suggestions. Keep it practical and concise.`;
  
  return await generateGeminiResponse(prompt, 'fitness');
};