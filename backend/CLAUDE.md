# Backend — Guía de desarrollo

Stack: Node.js · Express 5 · TypeScript · Prisma · Supabase PostgreSQL · JWT

## Scripts

```bash
npm run dev          # dev server con nodemon
npm run build        # compila a dist/
npm run start        # ejecuta dist/index.js
npm run lint         # ESLint
npm run format       # Prettier (escribe)
npm run format:check # Prettier (solo verifica)
```

## Estructura de carpetas

```
src/
├── index.ts               — bootstrap: middlewares, rutas, errorHandler
├── types/
│   └── index.ts           — ApiError, interfaces compartidas (ProviderImageResult, AvatarOptions)
├── middleware/
│   ├── auth.ts            — JWT authMiddleware → pone req.userId
│   └── errorHandler.ts    — captura ApiError y errores genéricos
├── providers/             — llamadas directas a APIs de IA, sin lógica de negocio
│   ├── falProvider.ts     — fal.ai: T2I, I2I, I2V, generateAvatarFaces (SFW)
│   └── vastProvider.ts    — Vast.ai (self-hosted Qwen): T2I, I2I (NSFW)
├── services/              — lógica de negocio: validaciones, DB, providers
│   ├── userService.ts     — findById, requirePaidPlan, requireNsfwAccess, requireCredits, deductCredits
│   ├── generationService.ts — textToImage, imageToImage, imageToVideo, getHistory
│   └── avatarService.ts   — getOptions, generatePreviews, save, findByUserId, generateWithAvatar
├── controllers/           — HTTP: extraen params, validan shape, llaman al service, responden
│   ├── authController.ts
│   ├── generationController.ts
│   ├── avatarController.ts
│   └── jobController.ts
├── routes/                — define rutas y aplica authMiddleware
│   ├── auth.ts
│   ├── generation.ts
│   ├── avatar.ts
│   └── jobs.ts
└── lib/
    └── prisma.ts          — instancia singleton de PrismaClient
```

## Reglas de arquitectura

### Providers (`src/providers/`)
- Responsabilidad única: llamar a la API de IA y retornar un resultado tipado.
- No acceden a DB, no validan planes, no manejan créditos.
- Retornan `ProviderImageResult` o `ProviderVideoResult` (definidos en `types/index.ts`).
- No usar `as any` — tipificar el input como `Record<string, unknown>` y el output como el tipo esperado.

```ts
// ✅ Correcto
const result = await fal.subscribe<FalInput, ProviderImageResult>(endpoint, { input: { ... } });
return result.data;

// ❌ Incorrecto
const result = await fal.subscribe(endpoint, { input: { ... } as any });
return result.data as any;
```

### Services (`src/services/`)
- Orquestan: validar user → validar plan/créditos → llamar provider → guardar en DB → descontar créditos.
- Lanzan `ApiError` para errores de negocio (plan, créditos, not found).
- No hacen res.json() ni tocan req/res.
- Usan `userService` para validaciones comunes de usuario.

```ts
// Patrón base de un método de service
someAction: async (userId: string, params: Params): Promise<Result> => {
  const user = await userService.findById(userId);   // 404 si no existe
  userService.requirePaidPlan(user);                 // 403 si FREE
  userService.requireCredits(user, cost);            // 402 si insuficientes

  const result = await falProvider.someCall(params);

  const record = await prisma.someModel.create({ data: { ... } });
  await userService.deductCredits(userId, cost);

  return { record, imageUrl: result.images[0]?.url ?? null };
},
```

### Controllers (`src/controllers/`)
- Solo extraen parámetros del request, validan que existan, llaman al service y responden.
- **Sin try/catch** — Express 5 maneja errores async automáticamente y los pasa al errorHandler.
- **Sin lógica de negocio** — eso va en el service.

```ts
// ✅ Correcto — controller thin
export const generateTextToImage = async (req: Request, res: Response) => {
  const { prompt, isNsfw = false } = req.body;
  if (!prompt) throw new ApiError(400, 'Prompt requerido');

  const result = await generationService.textToImage(req.userId, { prompt, isNsfw });
  res.json(result);
};

// ❌ Incorrecto — lógica de negocio en el controller
export const generateTextToImage = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.plan === 'FREE' && isNsfw) return res.status(403).json({ error: '...' });
    // ...
  } catch (error) {
    res.status(500).json({ error: 'Error interno' });
  }
};
```

### Error handling

`ApiError` para cualquier error de negocio predecible:

```ts
import { ApiError } from '../types';

throw new ApiError(400, 'Prompt requerido');
throw new ApiError(403, 'Plan FREE no permite contenido NSFW');
throw new ApiError(404, 'Usuario no encontrado');
throw new ApiError(402, 'Créditos insuficientes');
```

El `errorHandler` middleware (registrado al final en `index.ts`) convierte `ApiError` en la respuesta HTTP correcta. Errores no previstos retornan 500.

### userService — validaciones de usuario

Siempre usar `userService` para las validaciones comunes:

```ts
const user = await userService.findById(userId);    // lanza 404 si no existe
userService.requirePaidPlan(user);                  // lanza 403 si FREE
userService.requireNsfwAccess(user);                // lanza 403 si FREE
userService.requireCredits(user, cost);             // lanza 402 si insuficientes
await userService.deductCredits(userId, cost);      // descuenta créditos
```

### Providers: cuándo usar cada uno

| Caso | Provider |
|------|----------|
| T2I SFW | `falProvider.textToImage` |
| T2I NSFW | `vastProvider.textToImage` |
| I2I SFW | `falProvider.imageToImage` |
| I2I NSFW | `vastProvider.imageToImage` |
| I2V | `falProvider.imageToVideo` |
| Avatar faces | `falProvider.generateAvatarFaces` |
| Avatar + consistency | `falProvider.imageToImage` (siempre fal.ai para consistencia visual) |

### Tipos compartidos (`src/types/index.ts`)
- `ApiError` — clase de error con statusCode
- `ProviderImageResult` — `{ images: { url: string }[] }`
- `ProviderVideoResult` — `{ video: { url: string } }`
- `AvatarOptions` — opciones del avatar pack

Interfaces locales a un archivo se definen en el mismo archivo.

## Cómo agregar una nueva feature

1. **Provider** (si es un nuevo endpoint de IA): agregar método en `falProvider.ts` o `vastProvider.ts`.
2. **Service**: agregar método en el service correspondiente o crear `src/services/xxxService.ts`.
3. **Controller**: crear `src/controllers/xxxController.ts` (thin).
4. **Route**: crear `src/routes/xxx.ts` y registrar en `index.ts`.
5. Correr `npm run format && npm run lint` antes de commitear.

## Prisma

- Importar siempre como named export: `import { prisma } from '../lib/prisma'`.
- No usar el default export.

## Prettier + ESLint

- Mismo config que frontend: `singleQuote`, `semi`, `trailingComma: 'es5'`, `printWidth: 100`.
- Variables intencionales no usadas: usar prefijo `_` (ej: `_req`, `_next`).
- Catch blocks sin variable: usar `catch { }` (ES2019+).
- No usar `any` — tipar correctamente o usar `unknown` con cast explícito.
