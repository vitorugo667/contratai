exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_ACCESS_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Token não configurado' }) };
  }

  const paymentId = event.queryStringParameters?.payment_id;
  if (!paymentId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'payment_id obrigatório' }) };
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const data = await res.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: data.status,
        approved: data.status === 'approved',
        id: data.id,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
