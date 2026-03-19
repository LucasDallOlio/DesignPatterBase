'use client';

import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  MessageSquareQuote,
  RefreshCw,
  AlertCircle,
  ListOrdered,
  Star,
  ExternalLink,
  User,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModalEditReview } from '@/components/modals/ModalEditReview';
import { ModalAddReview } from '@/components/modals/ModalAddReview';

/* ─── card individual da avaliação ───────────────────────── */
function ReviewCard({ review, index, onEdit, onDelete }) {
  return (
    <li className="group relative rounded-3xl border border-border bg-card p-6 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* número do índice decorativo */}
      <span className="absolute right-5 top-4 font-mono text-6xl font-black leading-none text-muted-foreground/10 select-none pointer-events-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="relative z-10 flex flex-col gap-4">
        {/* ── cabeçalho do card: autor e nota ── */}
        <div className="flex items-start justify-between pr-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-card-foreground">
                {review.author}
              </h3>
              {/* Estrelas */}
              <div className="mt-0.5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── botões de ação: editar e excluir ── */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(review)}
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
              aria-label="Editar avaliação"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(review.id)}
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
              aria-label="Excluir avaliação"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* ── corpo: comentário ── */}
        <p className="text-sm leading-relaxed text-muted-foreground italic">
          "{review.comment}"
        </p>

        {/* ── rodapé: link para a receita ── */}
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary" className="font-medium">
            Receita #{review.recipeId}
          </Badge>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Link href={`/`}>
              Ver receita
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
}

/* ─── página principal ───────────────────────────────────── */
export function ReviewsPageClient({ initialReviews }) {
  const { reviews, loading, error, refetch, editReview, editLoading, deleteReview } = useReviews({
    initialReviews,
    fetchOnMount: initialReviews?.length === 0,
  });

  // controle do modal de edição
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // controle do modal de adição
  const [isAddOpen, setIsAddOpen] = useState(false);

  function handleEdit(review) {
    setSelectedReview(review);
    setIsEditOpen(true);
  }

  async function handleDelete(id) {
    await deleteReview(id);
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
                <MessageSquareQuote className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Comunidade
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                Avaliações
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {reviews?.length || 0} avaliaç
                {reviews?.length !== 1 ? 'ões' : 'ão'} recebida
                {reviews?.length !== 1 ? 's' : ''}
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
              <li key={n} className="rounded-3xl border border-border p-6 bg-card">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="mb-2 h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full rounded-md mb-2" />
                <Skeleton className="h-4 w-2/3 rounded-md mb-6" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* ── erro ── */}
        {error && !loading && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar avaliações: {error}</AlertDescription>
          </Alert>
        )}

        {/* ── vazio ── */}
        {!loading && !error && reviews?.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ListOrdered className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma avaliação encontrada ainda.
            </p>
          </div>
        )}

        {/* ── lista ── */}
        {!loading && reviews?.length > 0 && (
          <ul className="space-y-4">
            {reviews.map((review, idx) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={idx}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      {/* ── modais ── */}
      <ModalEditReview
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        review={selectedReview}
        onSubmit={async (updatedData) => {
          const result = await editReview(selectedReview.id, updatedData);
          if (result) setIsEditOpen(false);
        }}
        loading={editLoading}
      />

      <ModalAddReview
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