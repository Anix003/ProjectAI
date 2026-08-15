'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { databases } from '@/lib/appwrite-client';
import { 
  ArrowLeft, Upload, UserCheck, ShieldCheck, 
  AlertTriangle, Scan, Camera, FileDigit, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';

export default function KYCPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');
  
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieB64, setSelfieB64] = useState('');
  
  const [idFile, setIdFile] = useState(null);
  const [idB64, setIdB64] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  const handleSelfieChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelfieFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSelfieB64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleIdChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdB64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    if (!docNumber || !selfieB64 || !idB64) {
      setError('Please upload both photos and enter the document number.');
      return;
    }
    setError('');
    setIsVerifying(true);
    setResult(null);

    try {
      const response = await axios.post('/api/ai/kyc', {
        selfieBase64: selfieB64,
        idBase64: idB64,
        docType,
        userName: `${user.profileDetails?.First_name} ${user.profileDetails?.Last_name}`
      });

      const data = response.data;
      setResult(data);

      if (data.status === 'Verified') {
        // 1. Update KYC status in database
        await databases.updateDocument(databaseId, 'users', user.$id, {
          kyc_status: 'VERIFIED'
        });

        // 2. Log KYC record
        await databases.createDocument(databaseId, 'KYC', 'unique()', {
          kyc_id: `KYC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          id_user: user.$id,
          document_type: docType,
          document_number: docNumber,
          document_image: 'stored_id_file_id',
          face_image: 'stored_selfie_file_id',
          verification_score: parseFloat(data.face_match_score || 0.9),
          status: 'Verified',
          details: JSON.stringify(data)
        });

        // 3. Refresh AuthContext
        await refreshUser();
      } else {
        setError(data.details || 'Verification failed. Document details or face match did not align.');
      }
    } catch (err) {
      console.error(err);
      setError('KYC server validation failed. Verification timeout.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Scan className="text-blue-500 w-5 h-5" />
              Automated Citizen KYC
            </h1>
            <p className="text-xs text-gray-400 mt-1">Our AI vision model will instantly analyze your face match against your government ID.</p>
          </div>

          {result?.status === 'Verified' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold text-white">KYC Verification Successful</h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                Your identity has been validated successfully with a match confidence of{' '}
                <strong>{Math.round((result.face_match_score || 0.9) * 100)}%</strong>. You are now a Verified Citizen.
              </p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-6 rounded-xl transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleKYCSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doc Type Selector */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                {/* Doc Number Input */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Document Number</label>
                  <div className="relative">
                    <FileDigit className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder="e.g. 1234 5678 9012"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upload Selfie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold block">1. Take / Upload Selfie</label>
                  <div className="border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-xl p-5 text-center relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleSelfieChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      required
                    />
                    <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    {selfieFile ? (
                      <span className="text-xs text-blue-400 font-bold block">{selfieFile.name}</span>
                    ) : (
                      <span className="text-xs text-gray-500 block">Click to upload selfie</span>
                    )}
                  </div>
                </div>

                {/* Upload ID Document */}
                <div className="space-y-2">
                  <label className="text-gray-400 font-bold block">2. Upload ID card (Front)</label>
                  <div className="border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-xl p-5 text-center relative cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleIdChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      required
                    />
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    {idFile ? (
                      <span className="text-xs text-blue-400 font-bold block">{idFile.name}</span>
                    ) : (
                      <span className="text-xs text-gray-500 block">Click to upload ID photo</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl mt-6 transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                {isVerifying ? 'AI Vision matching face...' : 'Start Automated KYC'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
