exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_ACCESS_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'MP_ACCESS_TOKEN não configurado' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { body = {}; }

  const preferencia = {
    items: [{
      title: 'ContratAí Mensal',
      description: 'Acesso mensal ao ContratAí — contratos, cobranças e recibos',
      quantity: 1,
      currency_id: 'BRL',
      unit_price: 34.99,
    }],
    payer: {
      email: body.email || '',
    },
    back_urls: {
      success: 'https://contratai.netlify.app/?status=approved',
      failure: 'https://contratai.netlify.app/?status=failure',
      pending: 'https://contratai.netlify.app/?status=pending',
    },
    auto_return: 'approved',
    statement_descriptor: 'CONTRATAI',
  };

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencia),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.message || 'Erro ao criar preferência' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        id: data.id,
        init_point: data.init_point,       // produção
        sandbox_init_point: data.sandbox_init_point, // testes
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
