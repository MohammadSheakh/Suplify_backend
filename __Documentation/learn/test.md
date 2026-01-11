//------------ Testing

> #### 13. How do you test error scenarions and edge cases
```ts

    1. Testing error responses
    test('returns 400 for invalid input', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({}); // empty object
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
    })

    2. Testing error throwing
    test('throws specific error', () => {
        expect(() => validateInput(null)).toThrow(ValidationError);

        expect(() => validateInput('')).toThrow('Input required')
    });


    3. Testing edge cases
    describe('edge cases', () => {
        test('handles empty array', () => {
            expect(processArray([])).toEqual([])
        })

        test('handles null input', () => {
            expect(processArray(null)).toBeNull();
        });
        
        test('handles large numbers', () => {
            expect(add(Number.MAX_SAFE_INTEGER, 1))
            .toBe(Number.MAX_SAFE_INTEGER + 1);
        });
        
        test('handles special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>'))
            .not.toContain('<script>');
        });
    })

    /*-------------------
        
        ✔️ Deploy migrations to production with 🎯prisma migrate deploy🚦     
        
    -------------------*/
    
```

> #### 
```ts

    1. Create migration after schema changes
    > npx prisma migrate dev --name add_user_profile

    /*-------------------
        
        ✔️ Deploy migrations to production with 🎯prisma migrate deploy🚦     
        
    -------------------*/
    
```
// hello row .. generate code for api testing

