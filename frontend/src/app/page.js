import { RecipesPageClient } from '../components/blocks/RecipesPageClient';

async function getRecipes() {
  try {
    const res = await fetch('http://localhost:8080/recipes', {
      // Garante SSR sempre fresco, sem cache em build.
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch {
    // Em caso de erro no servidor, devolve lista vazia
    // (o hook no client pode lidar com recarregar e mostrar erro)
    return [];
  }
}

// Componente de página é um Server Component por padrão em app router,
// então aqui já estamos fazendo SSR ao buscar os dados com `await getRecipes()`.
export default async function Home() {
  const recipes = await getRecipes();

  return <RecipesPageClient initialRecipes={recipes} />;
}

