import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge Tailwind classes correctly', () => {
    // Test basic class merging
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    
    // Test conditional class application
    const isPrimary = true;
    expect(cn('btn', isPrimary && 'btn-primary')).toBe('btn btn-primary');
    
    // Test falsy values are filtered out
    expect(cn('btn', false && 'hidden', null, undefined, 0, '')).toBe('btn');
    
    // Test class name conflicts are resolved correctly
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('p-4', 'px-6')).toBe('p-4 px-6');
    
    // Test with array input
    expect(cn(['flex', 'items-center'], 'justify-between')).toBe('flex items-center justify-between');
  });
}); 