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
import { Plus, Trash2 } from 'lucide-react';

export function ModalEditRecipe({ open, onOpenChange, recipe, onSubmit, loading }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        prepTime: '',
        ingredients: [''],
        steps: [''],
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (recipe) {
            setForm({
                title: recipe.title ?? '',
                description: recipe.description ?? '',
                prepTime: recipe.prepTime ?? '',
                ingredients: recipe.ingredients?.length ? recipe.ingredients : [''],
                steps: recipe.steps?.length ? recipe.steps : [''],
            });
            setError(null);
        }
    }, [recipe]);

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
        setError(null);
        try {
            await onSubmit({
                title: form.title,
                description: form.description,
                prepTime: Number(form.prepTime),
                ingredients: form.ingredients.filter((i) => i.trim() !== ''),
                steps: form.steps.filter((s) => s.trim() !== ''),
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
            <DialogContent className="rounded-3xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Editar receita</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-title">Título</Label>
                        <Input id="edit-title" name="title" value={form.title} onChange={handleField} className="rounded-xl" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Textarea id="edit-description" name="description" value={form.description} onChange={handleField} className="rounded-xl resize-none" rows={2} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-prepTime">Tempo de preparo (min)</Label>
                        <Input id="edit-prepTime" name="prepTime" type="number" value={form.prepTime} onChange={handleField} className="rounded-xl" />
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
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}