
import dot from '../src/dotHelpers.js';
import { get, set } from '../src/dotHelpers.js';



describe('Path Utility Functions', () => {

    describe('get()', () => {
        const mockData = {
            user: {
                id: 1,
                profile: { name: 'John Doe' },
                tags: ['admin', 'editor']
            },
            data: [
                { id: 'a', val: 10 },
                { id: 'b', val: 20 }
            ]
        };

        // --- Happy Path ---
        test('should retrieve a simple nested value', () => {
            expect(get(mockData, 'user.profile.name')).toBe('John Doe');
        });

        test('should retrieve a value from an array using index', () => {
            expect(get(mockData, 'user.tags[0]')).toBe('admin');
            expect(get(mockData, 'data[1].val')).toBe(20);
        });

        // --- Edge Cases ---
        test('should return undefined for invalid path types', () => {
            expect(get(mockData, null)).toBeUndefined();
            expect(get(mockData, 123)).toBeUndefined();
        });

        test('should return undefined for non-existent paths', () => {
            expect(get(mockData, 'user.nonExistent')).toBeUndefined();
            expect(get(mockData, 'data[99]')).toBeUndefined();
        });

        test('should handle empty or whitespace paths', () => {
            expect(get(mockData, '')).toBeUndefined();
        });

        test('should handle accessing properties on null/undefined records gracefully', () => {
            expect(get(null, 'any.path')).toBeUndefined();
        });
    });

    describe('set()', () => {
        let record;

        beforeEach(() => {
            record = {};
        });

        // --- Happy Path ---
        test('should set a simple nested property', () => {
            const result = set(record, 'a.b.c', 100);
            expect(result.a.b.c).toBe(100);
        });

        test('should create arrays when numeric keys are used', () => {
            const result = set(record, 'items[0].name', 'First Item');
            expect(Array.isArray(result.items)).toBe(true);
            expect(result.items[0].name).toBe('First Item');
        });

        test('should update existing values', () => {
            const initial = { user: { name: 'Old' } };
            const result = set(initial, 'user.name', 'New');
            expect(result.user.name).toBe('New');
        });

        // --- Edge Cases ---
        test('should return undefined for invalid or empty paths', () => {
            expect(set(record, null, 'val')).toBeUndefined();
            expect(set(record, '', 'val')).toBeUndefined();
        });

        test('should initialize an empty record if null is passed', () => {
            const result = set(null, 'top.level', 'value');
            expect(result.top.level).toBe('value');
        });

        test('should handle string-to-array conversion when numeric index is encountered', () => {
            const strRecord = { key: "I am a string" };
            // Your logic: if p is numeric, it forces workingRecord to be an array
            const result = set(strRecord, 'key[0]', 'New Value');
            expect(Array.isArray(result.key)).toBe(true);
            expect(result.key[0]).toBe('New Value');
        });

        test('should handle very deep paths', () => {
            const result = set({}, 'one.two.three.four.five', 'done');
            expect(result.one.two.three.four.five).toBe('done');
        });
    });
});