import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { history, new_message } = await req.json();

    if (!new_message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';

    const response = await axios.post(`${aiServerUrl}/api/ai/chat`, {
      history: history || [],
      new_message
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy chat error:', error.message);
    return NextResponse.json({ error: 'AI Server chat connection failed' }, { status: 500 });
  }
}
