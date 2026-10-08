'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the base URL for the QR code with timestamp for cache-busting
  const getPdfUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/pdf?t=${Date.now()}`;
    }
    return `/pdf?t=${Date.now()}`;
  };

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const pdfUrl = getPdfUrl();
      const qrDataUrl = await QRCode.toDataURL(pdfUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrDataUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code');
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qcc-pdf-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const url = getPdfUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QCC Image',
          text: 'Scan this QR code to access the QCC information image',
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('PDF URL copied to clipboard!');
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = '/api/pdf?download=true';
    link.download = 'qcc-info.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF QR Code Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {loading ? (
              <div className="h-64 w-64 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-slate-400">Generating QR Code...</span>
              </div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for PDF" 
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code to access the PDF document
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button 
                    onClick={handleDownloadImage}
                    className="bg-[#123B70] hover:bg-[#0d2d52]"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                  <Button 
                    onClick={handleDownload}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    onClick={generateQRCode}
                    variant="outline"
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh QR Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Place your JPG file in the <code className="bg-slate-100 px-1 py-0.5 rounded">public/qcc-info.jpg</code> directory</p>
          <p>2. The QR code will automatically point to <code className="bg-slate-100 px-1 py-0.5 rounded">/pdf</code> page</p>
          <p>3. Users can scan the QR code to view and download the JPG image</p>
          <p>4. You can download the QR code image for printing or sharing</p>
        </CardContent>
      </Card>
    </div>
  );
}
