'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModalEditReview({ open, onOpenChange, review, onSubmit, loading }) {
    const [form, setForm] = useState({ author: '', comment: '', recipeId: '', rating: 0 });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (review) {
            setForm({
                author: review.author ?? '',
                comment: review.comment ?? '',
                recipeId: review.recipeId ?? '',
                rating: review.rating ?? 0,
            });
            setError(null);
        }
    }, [review]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleRating(value) {
        setForm((prev) => ({ ...prev, rating: value }));
    }

    async function handleSubmit() {
        setError(null);
        try {
            await onSubmit({
                author: form.author,
                comment: form.comment,
                recipeId: Number(form.recipeId),
                rating: Number(form.rating),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
    }

    function handleOpenChange(value) {
        if (!value) setError(null);
        onOpenChange(value);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Editar avaliação</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-author">Autor</Label>
                        <Input
                            id="edit-author"
                            name="author"
                            placeholder="Seu nome"
                            value={form.author}
                            onChange={handleChange}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-recipeId">ID da receita</Label>
                        <Input
                            id="edit-recipeId"
                            name="recipeId"
                            type="number"
                            placeholder="Ex: 1"
                            value={form.recipeId}
                            onChange={handleChange}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Nota</Label>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleRating(i + 1)}
                                    className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={cn(
                                            'h-6 w-6 transition-colors',
                                            i < form.rating
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'fill-muted text-muted-foreground/30'
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-comment">Comentário</Label>
                        <Textarea
                            id="edit-comment"
                            name="comment"
                            placeholder="Escreva sua avaliação..."
                            value={form.comment}
                            onChange={handleChange}
                            className="rounded-xl resize-none"
                            rows={3}
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button className="rounded-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
