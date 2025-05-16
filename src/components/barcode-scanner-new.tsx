'use client';

import React, { useEffect, useRef, useState } from 'react';

import { BarcodeFormat, BinaryBitmap, BrowserMultiFormatReader, DecodeHintType, HTMLCanvasElementLuminanceSource, HybridBinarizer } from '@zxing/library';
import { Camera, Check, Loader2, UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  id: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange: (value: string) => void;
}

export function BarcodeScanner({ id, required = false, disabled = false, value = '', onChange }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Create a reader with appropriate hints
  const createReader = () => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    
    readerRef.current = new BrowserMultiFormatReader(hints);
  };
  
  // Start the scanner
  const startScanner = async () => {
    setIsLoading(true);
    setShowScanner(true);
    
    try {
      // Create reader if not already created
      if (!readerRef.current) {
        createReader();
      }
      
      // Request camera access
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Could not access camera. Please check permissions.');
      setShowScanner(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Stop the scanner
  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setScanning(false);
    setShowScanner(false);
  };
  
  // Process a frame from the video
  const processVideoFrame = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Declare the fallback function before using it
    const tryImageDataFallback = () => {
      try {
        // Get image data for processing
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        if (readerRef.current) {
          readerRef.current.decodeFromImage(undefined, imageData)
            .then(result => {
              if (result) {
                handleSuccessfulScan(result.getText());
              }
            })
            .catch(error => {
              if (debugMode) {
                console.log('Image data fallback error:', error.message);
              }
              setScanning(false);
            });
        }
      } catch (e) {
        console.error('Error with image data fallback:', e);
        setScanning(false);
      }
    };
    
    try {
      // Create a luminance source from the canvas
      const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
      
      // Ensure we have a reader
      if (!readerRef.current) {
        createReader();
      }
      
      if (readerRef.current) {
        // Use decodeFromImage instead of decodeFromBinaryBitmap
        try {
          // Convert canvas to data URL and use that instead
          const dataUrl = canvas.toDataURL('image/png');
          const img = document.createElement('img');
          img.src = dataUrl;
          
          readerRef.current.decodeFromImage(img)
            .then(result => {
              if (result) {
                handleSuccessfulScan(result.getText());
              }
            })
            .catch(error => {
              if (debugMode) {
                console.log('Binary bitmap scan error:', error.message);
              }
              // Try fallback method
              tryImageDataFallback();
            });
        } catch (e) {
          console.error('Error with direct canvas access:', e);
          // Fallback to image data method
          tryImageDataFallback();
        }
      }
    } catch (e) {
      console.error('Error with direct canvas access:', e);
      // Fallback to image data method
      tryImageDataFallback();
    }
  };
  
  // Handle successful barcode scan
  const handleSuccessfulScan = (scannedValue: string) => {
    onChange(scannedValue);
    stopScanner();
    toast.success('Barcode scanned successfully');
  };
  
  // Process frames at regular intervals
  useEffect(() => {
    let frameId: number;
    
    const processFrame = () => {
      processVideoFrame();
      if (scanning) {
        frameId = requestAnimationFrame(processFrame);
      }
    };
    
    if (scanning) {
      frameId = requestAnimationFrame(processFrame);
    }
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [scanning]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Handle file upload for barcode scanning
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Create reader if not already created
      if (!readerRef.current) {
        createReader();
      }
      
      // Create a URL for the file
      const imageUrl = URL.createObjectURL(file);
      
      // Scan the image
      const result = await readerRef.current?.decodeFromImage(undefined, imageUrl);
      
      if (result) {
        handleSuccessfulScan(result.getText());
      } else {
        toast.error('No barcode found in the image');
      }
      
      // Clean up the URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error scanning file:', error);
      toast.error('Failed to scan barcode from image');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Display the current value if one exists */}
      {value ? (
        <div className="flex items-center space-x-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
          <Check className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium flex-1 truncate">{value}</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => onChange('')}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : showScanner ? (
        <div className="relative border rounded-md overflow-hidden bg-black">
          {/* Video element for camera feed */}
          <video 
            ref={videoRef} 
            className="w-full aspect-video object-cover"
            playsInline
            muted
          />
          
          {/* Canvas for processing (hidden) */}
          <canvas 
            ref={canvasRef} 
            className="hidden"
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-2/3 h-2/3 border-2 border-white/50 rounded-lg"></div>
            <p className="text-white mt-2 text-sm">Position barcode within the frame</p>
          </div>
          
          {/* Close button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={stopScanner}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Camera button */}
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={startScanner}
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
              id={`barcode-file-${id}`}
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
              <UploadIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value}
        required={required}
      />
    </div>
  );
}
