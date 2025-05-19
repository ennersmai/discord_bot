const { containsUrl, extractUrls } = require('../src/utils/linkDetection');

describe('Link Detection Utility', () => {
    describe('containsUrl', () => {
        test('should return true for a URL with http', () => {
            expect(containsUrl('Check out http://example.com')).toBe(true);
        });

        test('should return true for a URL with https', () => {
            expect(containsUrl('Visit https://example.com for more info')).toBe(true);
        });

        test('should return true for a URL with www', () => {
            expect(containsUrl('Visit www.example.com for more info')).toBe(true);
        });

        test('should return true for a URL without http/https/www prefix', () => {
            expect(containsUrl('Visit example.com for more info')).toBe(true);
        });

        test('should return true for a URL with path', () => {
            expect(containsUrl('Visit https://example.com/path/to/page')).toBe(true);
        });

        test('should return true for a URL with query parameters', () => {
            expect(containsUrl('Visit https://example.com?param=value')).toBe(true);
        });

        test('should return false for text without a URL', () => {
            expect(containsUrl('This is just a regular message')).toBe(false);
        });

        test('should return false for undefined content', () => {
            expect(containsUrl(undefined)).toBe(false);
        });

        test('should return false for null content', () => {
            expect(containsUrl(null)).toBe(false);
        });

        test('should return false for empty string', () => {
            expect(containsUrl('')).toBe(false);
        });
    });

    describe('extractUrls', () => {
        test('should extract a single URL from text', () => {
            const text = 'Check out https://example.com';
            expect(extractUrls(text)).toEqual(['https://example.com']);
        });

        test('should extract multiple URLs from text', () => {
            const text = 'Visit https://example.com and http://test.com';
            expect(extractUrls(text)).toEqual(['https://example.com', 'http://test.com']);
        });

        test('should extract URLs with various formats', () => {
            const text = 'Multiple formats: https://example.com, http://test.com, www.another.com, simple.com';
            const expected = [
                'https://example.com',
                'http://test.com',
                'www.another.com',
                'simple.com'
            ];
            const result = extractUrls(text);
            expected.forEach(url => {
                expect(result).toContain(url);
            });
            expect(result.length).toBe(expected.length);
        });

        test('should return an empty array for text without URLs', () => {
            expect(extractUrls('This is just a regular message')).toEqual([]);
        });

        test('should return an empty array for undefined content', () => {
            expect(extractUrls(undefined)).toEqual([]);
        });

        test('should return an empty array for null content', () => {
            expect(extractUrls(null)).toEqual([]);
        });

        test('should return an empty array for empty string', () => {
            expect(extractUrls('')).toEqual([]);
        });
    });
}); 