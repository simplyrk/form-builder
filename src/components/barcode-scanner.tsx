"use client";

import React, { useEffect, useRef, useState } from 'react';

import { 
  BrowserMultiFormatReader,
  BinaryBitmap, 
  HybridBinarizer, 
  GlobalHistogramBinarizer,
  HTMLCanvasElementLuminanceSource,
  DecodeHintType
} from '@zxing/library';
import { Camera, Loader2, Upload } from 'lucide-react';

import { Button } from './ui/button';

interface BarcodeScannerProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  onScan?: (value: string) => void;
  onClose?: () => void;
  required?: boolean;
  disabled?: boolean;
}

export function BarcodeScanner({ 
  id, 
  value = '', 
  onChange, 
  onScan, 
  onClose,
  required = false,
  disabled = false
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize the barcode reader
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    readerRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      stopScanning();
    };
  }, []);

  // Start the camera and scanning process
  const startScanning = async () => {
    try {
      setIsLoading(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        setIsScanning(true);
        scanFrame();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop scanning and release resources
  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsScanning(false);
    
    if (onClose) {
      onClose();
    }
  };

  // Process a single video frame
  const scanFrame = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current || !readerRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Try to decode using image data URL
    try {
      const imageData = canvas.toDataURL('image/jpeg');
      
      readerRef.current.decodeFromImage(undefined, imageData)
        .then(result => {
          if (result) {
            const text = result.getText();
            
            // Call the appropriate callback
            if (onChange) onChange(text);
            if (onScan) onScan(text);
            
            // Stop scanning after successful scan
            stopScanning();
          } else {
            // Continue scanning if no result
            animationFrameRef.current = requestAnimationFrame(scanFrame);
          }
        })
        .catch(() => {
          // Continue scanning on error
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        });
    } catch (error) {
      console.error('Error processing frame:', error);
      animationFrameRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Handle file upload for barcode scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !readerRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      
      // Try to decode the barcode from the image
      const result = await readerRef.current.decodeFromImage(undefined, imageUrl);
      
      if (result) {
        const text = result.getText();
        
        // Call the appropriate callback
        if (onChange) onChange(text);
        if (onScan) onScan(text);
      }
      
      // Clean up the URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error scanning file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the component
  if (isScanning) {
    return (
      <div className="relative">
        {/* Video element for camera feed */}
        <video 
          ref={videoRef}
          className="w-full h-auto rounded-md"
          playsInline
          muted
        />
        
        {/* Hidden canvas for processing */}
        <canvas 
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2/3 h-1/3 border-2 border-white/50 rounded-md"></div>
        </div>
        
        {/* Cancel button */}
        <Button
          type="button"
          variant="secondary"
          className="absolute top-2 right-2"
          onClick={stopScanning}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {/* Camera button */}
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={startScanning}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          Scan Barcode
        </Button>
        
        {/* File upload button */}
        <div className="relative">
          <input
            type="file"
            id={`file-upload-${id}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || isLoading}
          />
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isLoading}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Display current value if available */}
      {value && (
        <div className="p-2 bg-primary/10 border border-primary/20 rounded-md">
          <p className="text-sm font-medium">{value}</p>
        </div>
      )}
    </div>
  );
}
