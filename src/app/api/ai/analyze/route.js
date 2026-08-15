import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite-server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { title, description, imageBase64, mimeType } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    let existingComplaints = [];
    try {
      // Query recent complaints to pass to the AI server for duplicate matching
      const docs = await databases.listDocuments(databaseId, 'complaints');
      existingComplaints = docs.documents.map(d => ({
        $id: d.$id,
        id_complaint: d.id_complaint,
        complaint_title: d.complaint_title,
        original_text: d.original_text
      }));
    } catch (err) {
      console.error('Error fetching complaints for duplicate check:', err.message);
    }

    const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';

    const response = await axios.post(`${aiServerUrl}/api/ai/analyze-complaint`, {
      title,
      description,
      image_base_64: imageBase64 || null,
      mime_type: mimeType || null,
      existing_complaints: existingComplaints
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Proxy analyze error:', error.message);
    return NextResponse.json({ error: 'AI Server connection error or failed analysis' }, { status: 500 });
  }
}
