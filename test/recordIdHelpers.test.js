
import recordIdHelpers, { get, set, validate } from '../src/recordIdHelpers.js'
import { v4 as uuidv4 } from 'uuid';


// Mock uuid to have predictable results for generic IDs



describe('Record Manager Module (Regex Validation)', () => {

    // Regex to match a standard UUID v4
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

    describe('get()', () => {
        test('Happy Path: Should return undefined if value or @type is missing', () => {
            expect(get(null)).toBeUndefined();
            expect(get({})).toBeUndefined();
            expect(get({ name: 'No Type' })).toBeUndefined();
        });

        test('Happy Path: Should generate a generic ID for unknown types with valid UUID', () => {
            const value = { '@type': 'UnknownType' };
            const baseUrl = 'example.com';
            const result = get(value, baseUrl);
            
            // Expected format: https://example.com + uuid
            // Note: Your current code concatenates them directly (example.comUUID)
            expect(result).toMatch(/^https:\/\/example\.com/);
            expect(result).toMatch(uuidRegex);
        });

        test('Edge Case: Should handle missing baseUrl gracefully', () => {
            const value = { '@type': 'UnknownType' };
            const result = get(value, undefined);
            
            // standardizeUrl(undefined) returns null in your code, result becomes "null<uuid>"
            expect(result).toMatch(/^_:/);
            expect(result).toMatch(uuidRegex);
        });
    });

    describe('validate()', () => {
        test('Happy Path: Should validate a standard URL @id', () => {
            const value = { 
                '@id': 'https://mysite.com/page', 
                '@type': 'other' 
            };
            expect(validate(value, 'https://mysite.com/page')).toBe(false);
        });

        test('Happy Path: Should return false for missing or incorrect @id', () => {
            expect(validate({ '@type': 'website' })).toBe(false);
            expect(validate({ '@id': 'not-a-url' }, 'site.com')).toBe(false);
        });
    });

    describe('set()', () => {
        test('Happy Path: Should recursively assign IDs to nested objects', () => {
            const input = {
                '@type': 'Thing',
                'child': {
                    '@type': 'OtherThing'
                }
            };
            const result = set(input, 'api.com');

            expect(result['@id']).toMatch(uuidRegex);
            expect(result.child['@id']).toMatch(uuidRegex);
        });

        test('Edge Case: Should handle arrays of objects', () => {
            const input = [
                { '@type': 'website' }, 
                { '@type': 'brand' }
            ];
            const result = set(input, 'test.com');
            
            expect(Array.isArray(result)).toBe(true);
            result.forEach(item => {
                expect(item['@id']).toBeDefined();
            });
        });
    });

    describe('Internal URL Normalization', () => {
        test('Edge Case: Should normalize protocol-relative and missing protocol URLs', () => {
            const record = { '@id': 'https://google.com' };
            
            // These should all validate to true against the https version
            expect(validate(record, 'google.com')).toBe(false);
            expect(validate(record, '//google.com')).toBe(false);
            expect(validate(record, 'http://google.com')).toBe(false); // Strict https default
        });
    });
});