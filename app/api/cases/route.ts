import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://37.27.255.95:8090';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/cases${queryString ? `?${queryString}` : ''}`;

  console.log('[Proxy GET /api/cases]', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const url = `${API_BASE_URL}/api/cases`;

  console.log('[Proxy POST /api/cases]', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to post data' }, { status: 500 });
  }
}
