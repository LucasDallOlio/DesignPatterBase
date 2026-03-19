'use client';

import { useState } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Clock,
  RefreshCw,
  ChefHat,
  AlertCircle,
  Flame,
  ShoppingBasket,
  ListOrdered,
  ChevronDown,
  Star,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalEditRecipe } from '@/components/modals/ModalEditRecipe';
import { ModalAddRecipe } from '@/components/modals/ModalAddRecipe';

/* ─── card individual ────────────────────────────────────── */
function RecipeCard({ recipe, index, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className={cn(
        'group relative rounded-3xl border border-border bg-card overflow-hidden',
        'transition-all duration-300',
        open ? 'shadow-lg' : 'hover:shadow-md',
      )}
    >
      {/* número do índice decorativo */}
      <span className="absolute right-5 top-4 font-mono text-6xl font-black leading-none text-muted-foreground/10 select-none pointer-events-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* ── cabeçalho clicável ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-6 pt-5 pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 pr-12">
          <div className="flex-1">
            {/* pill de tempo */}
            <Badge
              variant="secondary"
              className="mb-3 gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            >
              <Clock className="h-3 w-3" />
              {recipe.prepTime} min de preparo
            </Badge>

            <h2 className="text-xl font-bold leading-tight text-card-foreground">
              {recipe.title}
            </h2>

            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          </div>

          {/* ícone expand */}
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted transition-colors group-hover:bg-accent">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-300',
                open && 'rotate-180',
              )}
            />
          </div>
        </div>

        {/* prévia dos ingredientes quando fechado */}
        {!open && recipe.ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 pr-12">
            {recipe.ingredients.slice(0, 4).map((item, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-foreground"
              >
                {item}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                +{recipe.ingredients.length - 4}
              </span>
            )}
          </div>
        )}
      </button>

      {/* ── painel expandido ── */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <Separator />

          <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
            {/* Ingredientes */}
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBasket className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Ingredientes
                  </h3>
                </div>
                <ul className="space-y-2">
                  {recipe.ingredients.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-card-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modo de preparo */}
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Flame className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Modo de preparo
                  </h3>
                </div>
                <ol className="space-y-3">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed text-card-foreground pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* ── rodapé: reviews + ações ── */}
          <div className="px-6 pb-5">
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <Link
                href={`/reviews`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2',
                  'text-sm font-medium text-foreground transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Star className="h-3.5 w-3.5 text-primary" />
                Ver avaliações
              </Link>

              {/* ── botões de editar e excluir ── */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
                  className="gap-1.5 rounded-full hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
                  className="gap-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ─── página principal ───────────────────────────────────── */
export function RecipesPageClient({ initialRecipes }) {
  const { recipes, loading, error, refetch, editRecipe, editLoading, deleteRecipe } = useRecipes({
    initialRecipes,
    fetchOnMount: initialRecipes.length === 0,
  });

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  function handleEdit(recipe) {
    setSelectedRecipe(recipe);
    setIsEditOpen(true);
  }

  async function handleDelete(id) {
    await deleteRecipe(id);
  }

  return (
    <div className="min-h-screen w-full bg-background px-4 py-12">
      {/* glow decorativo */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% -5%, hsl(var(--primary) / 0.3), transparent)',
        }}
      />

      <main className="relative mx-auto w-full max-w-2xl">
        {/* ── header ── */}
        <header className="mb-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <ChefHat className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Receitas
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                Cardápio
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {recipes.length} receita{recipes.length !== 1 ? 's' : ''} · clique para expandir
              </p>
            </div>

            {/* ── ações do header: recarregar + adicionar ── */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
                className="gap-2 rounded-full"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                Recarregar
              </Button>

              <Button
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="gap-2 rounded-full"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>
          </div>
          <Separator className="mt-6" />
        </header>

        {/* ── loading ── */}
        {loading && (
          <ul className="space-y-4">
            {[1, 2, 3].map((n) => (
              <li key={n} className="rounded-3xl border border-border p-6">
                <Skeleton className="mb-3 h-5 w-32 rounded-full" />
                <Skeleton className="mb-2 h-6 w-56 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <div className="mt-3 flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── erro ── */}
        {error && !loading && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar receitas: {error}</AlertDescription>
          </Alert>
        )}

        {/* ── vazio ── */}
        {!loading && !error && recipes.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ListOrdered className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma receita cadastrada ainda.</p>
          </div>
        )}

        {/* ── lista ── */}
        {!loading && recipes.length > 0 && (
          <ul className="space-y-4">
            {recipes.map((recipe, idx) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={idx}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      {/* ── modais ── */}
      <ModalEditRecipe
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        recipe={selectedRecipe}
        onSubmit={async (updatedData) => {
          const result = await editRecipe(selectedRecipe.id, updatedData);
          if (result) setIsEditOpen(false);
        }}
        loading={editLoading}
      />

      <ModalAddRecipe
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => {
          setIsAddOpen(false);
          refetch();
        }}
      />
    </div>
  );
}