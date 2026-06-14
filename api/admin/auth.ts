// api/admin/auth.ts - Authenticate admin access

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const { password } = await request.json();

    // Try multiple possible environment variable names for the admin password
    const adminPassword = 
      process.env.ADMIN_PASSWORD ||
      process.env.ADMINPW ||
      process.env.adminpw ||
      process.env.ADMIN_PW;

    console.log('[AUTH] Checking password. Env vars available:', {
      hasADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
      hasADMINPW: !!process.env.ADMINPW,
      hasadminpw: !!process.env.adminpw,
      hasADMIN_PW: !!process.env.ADMIN_PW,
    });

    if (!adminPassword) {
      console.error('[AUTH] No password configured in environment');
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Check password
    if (password === adminPassword) {
      console.log('[AUTH] Password correct');
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      console.log('[AUTH] Password incorrect');
      // Don't reveal if password is wrong or not configured
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AUTH Error]', errorMsg);
    
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
