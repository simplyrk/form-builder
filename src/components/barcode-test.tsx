"use client";

import React, { useState } from 'react';

import Image from 'next/image';

import { BarcodeScanner } from './barcode-scanner';
import { Button } from './ui/button';

export const BarcodeTest: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (value: string) => {
    setResult(value);
    setShowScanner(false);
  };

  const testWithStaticImage = async () => {
    setIsLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Import the ZXing library directly
      const { BrowserMultiFormatReader, DecodeHintType } = await import('@zxing/library');
      
      // Create hints map with TRY_HARDER enabled
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      // Create the reader with our hints
      const reader = new BrowserMultiFormatReader(hints);
      
      // Use the static image path
      const imagePath = '/media/ExampleCode.png';
      console.log('Testing with image:', imagePath);
      
      // Create an image element
      const img = document.createElement('img');
      
      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log('Test image loaded, dimensions:', img.width, 'x', img.height);
          resolve();
        };
        img.onerror = (e) => {
          console.error('Error loading test image:', e);
          reject(new Error('Failed to load test image'));
        };
        
        // Set the source AFTER setting up the event handlers
        img.src = imagePath;
      });
      
      // Create a canvas and draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0);
      console.log('Test image drawn to canvas');
      
      // Try to decode the barcode
      try {
        const result = await reader.decodeFromImage(undefined, imagePath);
        if (result) {
          console.log('Test successful! Barcode detected:', result.getText());
          setTestResult(result.getText());
        }
      } catch (e) {
        console.error('Test failed with direct image path:', e);
        
        // Try with data URL as fallback
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const result = await reader.decodeFromImage(undefined, dataUrl);
          if (result) {
            console.log('Test successful with data URL! Barcode detected:', result.getText());
            setTestResult(result.getText());
          }
        } catch (e) {
          console.error('Test failed with data URL:', e);
          setError('Failed to detect barcode in test image');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Test error:', error);
      setError(`Test failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Barcode Scanner Test</h2>
      
      {!showScanner ? (
        <div className="space-y-4">
          <Button 
            onClick={() => setShowScanner(true)}
            className="w-full"
          >
            Open Scanner
          </Button>
          
          <Button 
            onClick={testWithStaticImage}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test with Static Image'}
          </Button>
          
          {result && (
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded">
              <h3 className="font-bold">Scan Result:</h3>
              <p className="font-mono break-all">{result}</p>
            </div>
          )}
          
          {testResult && (
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
              <h3 className="font-bold">Test Result:</h3>
              <p className="font-mono break-all">{testResult}</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded">
              <h3 className="font-bold text-red-600 dark:text-red-400">Error:</h3>
              <p>{error}</p>
            </div>
          )}
          
          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Test Image:</h3>
            <div className="max-w-full h-auto">
              <Image 
                src="/media/ExampleCode.png" 
                alt="Test QR Code" 
                width={300}
                height={300}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}
