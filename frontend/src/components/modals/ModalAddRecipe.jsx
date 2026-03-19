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
import { Plus, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080';

const EMPTY_FORM = {
    title: '',
    description: '',
    prepTime: '',
    ingredients: [''],
    steps: [''],
};

export function ModalAddRecipe({ open, onOpenChange, onSuccess }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function handleField(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleListChange(field, index, value) {
        setForm((prev) => {
            const updated = [...prev[field]];
            updated[index] = value;
            return { ...prev, [field]: updated };
        });
    }

    function addListItem(field) {
        setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
    }

    function removeListItem(field, index) {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    }

    async function handleSubmit() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    prepTime: Number(form.prepTime),
                    ingredients: form.ingredients.filter((i) => i.trim() !== ''),
                    steps: form.steps.filter((s) => s.trim() !== ''),
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao criar receita (status ${response.status})`);
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
            <DialogContent className="rounded-3xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Nova receita</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="add-title">Título</Label>
                        <Input id="add-title" name="title" placeholder="Ex: Bolo de cenoura" value={form.title} onChange={handleField} className="rounded-xl" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="add-description">Descrição</Label>
                        <Textarea id="add-description" name="description" placeholder="Descreva a receita..." value={form.description} onChange={handleField} className="rounded-xl resize-none" rows={2} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="add-prepTime">Tempo de preparo (min)</Label>
                        <Input id="add-prepTime" name="prepTime" type="number" placeholder="Ex: 45" value={form.prepTime} onChange={handleField} className="rounded-xl" />
                    </div>

                    {/* Ingredientes */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Ingredientes</Label>
                        <div className="flex flex-col gap-2">
                            {form.ingredients.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => handleListChange('ingredients', i, e.target.value)}
                                        placeholder={`Ingrediente ${i + 1}`}
                                        className="rounded-xl"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeListItem('ingredients', i)}
                                        disabled={form.ingredients.length === 1}
                                        className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('ingredients')} className="gap-2 rounded-full self-start">
                                <Plus className="h-3.5 w-3.5" /> Adicionar ingrediente
                            </Button>
                        </div>
                    </div>

                    {/* Passos */}
                    <div className="flex flex-col gap-1.5">
                        <Label>Modo de preparo</Label>
                        <div className="flex flex-col gap-2">
                            {form.steps.map((step, i) => (
                                <div key={i} className="flex gap-2">
                                    <Textarea
                                        value={step}
                                        onChange={(e) => handleListChange('steps', i, e.target.value)}
                                        placeholder={`Passo ${i + 1}`}
                                        className="rounded-xl resize-none"
                                        rows={2}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeListItem('steps', i)}
                                        disabled={form.steps.length === 1}
                                        className="shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addListItem('steps')} className="gap-2 rounded-full self-start">
                                <Plus className="h-3.5 w-3.5" /> Adicionar passo
                            </Button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => handleOpenChange(false)} disabled={loading}>
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