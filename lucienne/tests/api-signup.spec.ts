import { test, expect } from '@playwright/test';

const SIGNUP_ENDPOINT = '/api/auth/signup';


const testUser = {
    name: "Playwright Test",
    // Usamos un timestamp para asegurar que el email sea único en cada ejecución
    email: `test_user_${Date.now()}@example.com`, 
    // Contraseña que cumple las reglas: 8+ caracteres, mayúscula, número
    password: "Password123", 
};

test.describe('API /api/auth/signup', () => {

    // Prueba 1: Registro exitoso (Status 201)
    test('debe registrar un nuevo usuario con datos válidos y retornar 201', async ({ request }) => {

        const response = await request.post(SIGNUP_ENDPOINT, {
            data: testUser,
        });

        expect(response.status()).toBe(201);

    
        const body = await response.json();
        expect(body).toHaveProperty('user');
        
 
        expect(body.user.name).toBe(testUser.name);
        expect(body.user.email).toBe(testUser.email);
        expect(body.user.role).toBe("cliente");
        

        expect(body.user.password).toBeUndefined();

    });

    // Prueba 2: Intento de registro con email ya existente (Status 409)
    test('debe retornar 409 si el email ya existe', async ({ request }) => {
 
        await request.post(SIGNUP_ENDPOINT, { data: testUser });

        // Intentar registrar el mismo usuario nuevamente
        const response = await request.post(SIGNUP_ENDPOINT, {
            data: testUser,
        });

    
        expect(response.status()).toBe(409);

        const body = await response.json();
        expect(body).toHaveProperty('error', 'El email ya está registrado');
    });

//alidación de campos incompletos (Status 400)
    test('debe retornar 400 si faltan campos obligatorios', async ({ request }) => {
        const incompleteUser = {
            name: "Incompleto",
            email: "falta_pass@example.com",
            // Falta 'password'
        };

        const response = await request.post(SIGNUP_ENDPOINT, {
            data: incompleteUser,
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty('error', 'Todos los campos son obligatorios');
    });


    test('debe retornar 400 si la contraseña no cumple los requisitos de seguridad', async ({ request }) => {
        const weakPassUser = {
            name: "Debil",
            email: `weak_${Date.now()}@example.com`,
            password: "short", 
        };

        const response = await request.post(SIGNUP_ENDPOINT, {
            data: weakPassUser,
        });


        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty('error', 'La contraseña debe tener 8 caracteres, una mayúscula y un número');
    });
});