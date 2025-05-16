import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarcodeScanner } from '@/components/barcode-scanner';

// Mock the BrowserMultiFormatReader and related classes
jest.mock('@zxing/library', () => ({
  BrowserMultiFormatReader: jest.fn().mockImplementation(() => ({
    decode: jest.fn().mockResolvedValue({ getText: () => '123456789' }),
    decodeFromImage: jest.fn().mockResolvedValue({ getText: () => '123456789' }),
    reset: jest.fn()
  })),
  BinaryBitmap: jest.fn(),
  HybridBinarizer: jest.fn(),
  GlobalHistogramBinarizer: jest.fn(),
  HTMLCanvasElementLuminanceSource: jest.fn(),
  DecodeHintType: {
    TRY_HARDER: 2,
    POSSIBLE_FORMATS: 'possible_formats'
  }
}));

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{
        stop: jest.fn()
      }]
    })
  },
  writable: true
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn().mockReturnValue({
    data: new Uint8ClampedArray(100)
  }),
  putImageData: jest.fn(),
  createPattern: jest.fn(),
  setTransform: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn()
});

// Mock toDataURL
HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,abc123');

describe('BarcodeScanner', () => {
  const props = {
    id: 'barcode-1',
    required: true,
    onChange: jest.fn(),
    value: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the barcode scanner', () => {
    render(<BarcodeScanner {...props} />);
    expect(screen.getByText(/Scan Barcode/i)).toBeInTheDocument();
  });

  it('displays the scanned value when provided', () => {
    const value = '123456789';
    render(<BarcodeScanner {...props} value={value} />);
    expect(screen.getByText(value)).toBeInTheDocument();
  });

  it('starts scanning when the button is clicked', () => {
    render(<BarcodeScanner {...props} />);
    fireEvent.click(screen.getByText(/Scan Barcode/i));
    
    // Check for camera activation
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('should call onChange when clearing a value', () => {
    const value = '123456789';
    const onChange = jest.fn();
    render(<BarcodeScanner {...props} value={value} onChange={onChange} />);
    
    // Find the clear button and click it
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should not show scan buttons when disabled', () => {
    render(<BarcodeScanner {...props} disabled={true} />);
    
    // No buttons should be visible when disabled
    expect(screen.queryByText(/Scan Barcode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Upload Image/i)).not.toBeInTheDocument();
  });
});
