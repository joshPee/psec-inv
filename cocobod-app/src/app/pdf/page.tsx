'use client';

import { Button } from '@/components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PDFPage() {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Generate URL with timestamp to prevent caching
    setImageUrl(`/api/pdf?t=${Date.now()}`);
  }, []);

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = `/api/pdf?download=true&t=${Date.now()}`;
              link.download = 'qcc-info.jpg';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-[#123B70] hover:bg-[#0d2d52] gap-2"
          >
            <Download className="h-4 w-4" />
            Download Image
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-[#123B70]">QCC Information Document</h1>
            <p className="text-sm text-muted-foreground">View and download the official QCC information image</p>
          </div>
          
          <div className="p-4 flex justify-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="QCC Information"
                className="max-w-full h-auto"
                style={{ maxHeight: 'calc(100vh - 300px)' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
