import { sendMetaConversionsApiEvent } from '../../src/utils/metaCapi';

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { eventName, eventId, eventSourceUrl, userData, customData } = body;

    if (!eventName || !eventId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'eventName and eventId are required' }),
      };
    }

    const clientIp = event.headers['client-ip'] || event.headers['x-forwarded-for'] || '';
    const clientUserAgent = event.headers['user-agent'] || '';

    const enrichedUserData = {
      ...userData,
      clientIp,
      clientUserAgent,
    };

    const result = await sendMetaConversionsApiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      userData: enrichedUserData,
      customData,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: error?.message }),
    };
  }
};
