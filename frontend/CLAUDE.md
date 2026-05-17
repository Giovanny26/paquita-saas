# Frontend — Guía de desarrollo

Stack: React 19 · TypeScript · Vite 8 · Tailwind CSS v4 · Zustand · React Router v7 · Axios

## Scripts

```bash
npm run dev          # dev server en localhost:5173
npm run build        # build de producción
npm run lint         # ESLint
npm run format       # Prettier (escribe)
npm run format:check # Prettier (solo verifica)
```

## Estructura de carpetas

```
src/
├── api/             # Llamadas HTTP — una función por endpoint, tipadas
│   ├── client.ts    # instancia de axios con interceptors de auth y 401
│   ├── auth.api.ts  # authApi.login / register / me
│   └── generation.api.ts  # generationApi.textToImage / imageToImage
├── components/      # Componentes UI reutilizables, sin lógica de negocio
│   ├── PageHeader.tsx    # Header de páginas de generación (título + créditos + back)
│   ├── NsfwToggle.tsx    # Toggle SFW/NSFW
│   └── ImageResult.tsx   # Panel de resultado (loading / imagen / vacío)
├── hooks/           # Custom hooks — encapsulan estado + lógica, no JSX
│   ├── useTextToImage.ts
│   └── useImageToImage.ts
├── pages/           # Componentes de página — solo UI + composición
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── TextToImage.tsx
│   └── ImageToImage.tsx
├── store/
│   └── authStore.ts # Estado global de auth con Zustand (persisted)
└── types/
    └── index.ts     # Interfaces compartidas: User, Generation
```

## Reglas de arquitectura

### Capa API (`src/api/`)
- Cada archivo agrupa endpoints de un dominio (auth, generation, avatar, etc.).
- Las funciones retornan el `data` del response, nunca el objeto axios completo.
- Los tipos de parámetros y respuesta se definen **en el mismo archivo**.
- Nunca llamar `client` directamente desde un componente o página.

```ts
// ✅ Correcto
export const generationApi = {
  textToImage: async (params: TextToImageParams): Promise<GenerationResult> => {
    const res = await client.post('/generation/text-to-image', params);
    return res.data;
  },
};

// ❌ Incorrecto — axios en el componente
const res = await client.post('/generation/text-to-image', { prompt });
```

### Custom Hooks (`src/hooks/`)
- Un hook por feature de generación (T2I, I2I, Avatar, etc.).
- El hook maneja: estado local (prompt, loading, imageUrl, error) + llamada a la API + `fetchMe`.
- Las páginas solo llaman al hook y pasan los valores al JSX.
- El nombre siempre empieza con `use`.

```ts
// Patrón base para hooks de generación
export function useXxx(): UseXxxReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fetchMe = useAuthStore((s) => s.fetchMe);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const data = await xxxApi.xxx(params);
      // actualizar estado con resultado
      await fetchMe(); // refresca créditos del usuario
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Error genérico';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, generate, /* ... */ };
}
```

### Componentes compartidos (`src/components/`)
- Solo props + JSX, sin llamadas a la API ni lógica de negocio.
- Si un elemento UI aparece en 2+ lugares, va a `components/`.

**PageHeader** — usar en todas las páginas de generación:
```tsx
<PageHeader title="Text to Image" credits={user?.credits} backTo="/dashboard" />
```

**NsfwToggle** — siempre envuelto en `{user?.plan !== 'FREE' && ...}`:
```tsx
{user?.plan !== 'FREE' && <NsfwToggle value={isNsfw} onChange={setIsNsfw} />}
```

**ImageResult** — panel de resultado con los tres estados:
```tsx
<ImageResult loading={loading} imageUrl={imageUrl} loadingText="Generando..." />
```

### Páginas (`src/pages/`)
- Responsabilidad: composición de hooks + componentes + layout.
- Solo lógica UI mínima (ej: guard de plan FREE antes de llamar al hook).
- No hacen fetch directo, siempre a través de un hook.

```tsx
// Patrón de una página de generación
export default function NuevaFeature() {
  const user = useAuthStore((s) => s.user);
  const { /* estado */ } = useNuevaFeature();

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Nueva Feature" credits={user?.credits} backTo="/dashboard" />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* UI */}
      </main>
    </div>
  );
}
```

### Estado global (`src/store/`)
- Solo para estado que cruza múltiples páginas (user, token).
- Estado local de un feature va en el hook correspondiente.
- `authStore` expone: `user`, `token`, `isAuthenticated`, `login`, `register`, `logout`, `fetchMe`.
- Llamar `fetchMe()` después de cada generación para actualizar los créditos en la UI.

### Tipos (`src/types/index.ts`)
- Interfaces compartidas entre múltiples archivos.
- Tipos locales a un archivo se definen en el mismo archivo.

## Cómo agregar una nueva feature de generación

1. **API**: agregar función en `src/api/generation.api.ts` (o crear `xxx.api.ts` si es un dominio nuevo).
2. **Hook**: crear `src/hooks/useXxx.ts` con el patrón base.
3. **Página**: crear `src/pages/Xxx.tsx` usando el hook + componentes compartidos.
4. **Ruta**: agregar `<Route>` en `src/App.tsx` con `<PrivateRoute>`.
5. **Dashboard**: agregar la card correspondiente con `onClick={() => navigate('/xxx')}`.
6. Correr `npm run format && npm run lint` antes de commitear.

## Errores y tipado

Los errores de axios se castean así (evita `any`):

```ts
} catch (err: unknown) {
  const msg =
    (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
    'Mensaje fallback';
  setError(msg);
}
```

## Prettier + ESLint

- Prettier con `singleQuote`, `semi`, `trailingComma: 'es5'`, `printWidth: 100`.
- ESLint incluye `eslint-config-prettier` para que no haya conflictos.
- No usar `any` — usar `unknown` y castear explícitamente.
