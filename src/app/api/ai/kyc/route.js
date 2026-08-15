import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { selfieBase64, idBase64, docType, userName } = await req.json();

    if (!selfieBase64 || !idBase64 || !docType || !userName) {
      return NextResponse.json({ error: 'Missing required files or details' }, { status: 400 });
    }

    const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';

    const response = await axios.post(`${aiServerUrl}/api/ai/verify-kyc`, {
      selfie_base64: selfieBase64,
      id_base64: idBase64,
      doc_type: docType,
      user_name: userName
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy KYC error:', error.message);
    return NextResponse.json({ error: 'KYC AI server verification failed' }, { status: 500 });
  }
}
