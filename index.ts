import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'image' | 'button';
  image?: string;
  buttons?: Array<{
    id: string;
    text: string;
  }>;
}

async function sendWhatsAppMessage(message: WhatsAppMessage) {
  const instanceId = Deno.env.get('ULTRAMSG_INSTANCE_ID');
  const token = Deno.env.get('ULTRAMSG_TOKEN');
  
  if (!instanceId || !token) {
    throw new Error('Ultramsg credentials not configured');
  }

  const endpoint = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  
  const payload = {
    token,
    to: message.to,
    body: message.message,
    priority: 1,
    ...message.type === 'image' && { image: message.image },
    ...message.buttons && { buttons: JSON.stringify(message.buttons) },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.statusText}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();

    switch (type) {
      case 'onboarding': {
        const { phone } = await req.json();
        await sendWhatsAppMessage({
          to: phone,
          message: "Welcome to Auto-Dukaan! 🎉\n\n" +
            "Let's get your online store set up. Please select your preferred language:",
          type: 'button',
          buttons: [
            { id: 'lang_en', text: 'English' },
            { id: 'lang_hi', text: 'हिंदी' },
            { id: 'lang_ta', text: 'தமிழ்' }
          ]
        });
        break;
      }

      case 'order_confirmation': {
        const { phone, orderDetails } = await req.json();
        await sendWhatsAppMessage({
          to: phone,
          message: `Order Confirmed! 🎉\n\n` +
            `Order #${orderDetails.id}\n` +
            `Amount: ₹${orderDetails.amount}\n` +
            `Status: ${orderDetails.status}\n\n` +
            `Thank you for shopping with us! 🙏`,
        });
        break;
      }

      case 'payment_verification': {
        const { phone, amount, transactionId } = await req.json();
        await sendWhatsAppMessage({
          to: phone,
          message: `Payment Verification\n\n` +
            `Amount: ₹${amount}\n` +
            `Transaction ID: ${transactionId}\n\n` +
            `Please reply with "Paid ${transactionId}" to confirm your payment.`,
        });
        break;
      }

      default:
        throw new Error('Invalid message type');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});