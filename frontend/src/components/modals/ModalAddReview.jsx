'use client';

import { useState } from 'react';
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

const API_BASE_URL = 'http://localhost:8080';

const EMPTY_FORM = { author: '', comment: '', recipeId: '', rating: 0 };

export function ModalAddReview({ open, onOpenChange, onSuccess }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleRating(value) {
        setForm((prev) => ({ ...prev, rating: value }));
    }

    async function handleSubmit() {
        setLoading(true);
        setError(null);

        try {
            const recipeId = Number(form.recipeId);
            const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: form.author,
                    comment: form.comment,
                    rating: Number(form.rating),
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar review (status ${response.status})`);
            }

            setForm(EMPTY_FORM);
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(value) {
        if (!value) {
            setForm(EMPTY_FORM);
            setError(null);
        }
        onOpenChange(value);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="rounded-3xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Nova avaliação</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="add-author">Autor</Label>
                        <Input
                            id="add-author"
                            name="author"
                            placeholder="Seu nome"
                            value={form.author}
                            onChange={handleChange}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="add-recipeId">ID da receita</Label>
                        <Input
                            id="add-recipeId"
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
                        <Label htmlFor="add-comment">Comentário</Label>
                        <Textarea
                            id="add-comment"
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
                        {loading ? 'Salvando...' : 'Adicionar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
