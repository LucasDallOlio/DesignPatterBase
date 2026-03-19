import { useEffect, useState, useCallback } from 'react';

/**
 * Hook de dados `useReviews`
 *
 * Ideia principal (design pattern):
 * - Centralizar em um único lugar toda a regra de:
 *   - buscar dados remotos (API)
 *   - controlar loading
 *   - controlar e expor erros
 * - O componente de UI só consome `reviews`, `loading`, `error`
 *   e não precisa saber como a requisição é feita.
 */

// URL base da API. Se um dia mudar (porta, domínio, etc)
// você altera só aqui.
const API_BASE_URL = 'http://localhost:8080';

/**
 * Custom Hook responsável por:
 * - Buscar a lista de receitas na API
 * - Expor o estado da requisição (dados, loading, erro)
 * - Oferecer uma função `refetch` para disparar nova busca sob demanda
 *
 * Aceita opções para funcionar bem com SSR:
 * - initialReviews: lista inicial vinda do servidor
 * - fetchOnMount: se true, faz a busca automática no primeiro render
 */
export function useReviews({ initialReviews = [], fetchOnMount = true } = {}) {
  // Estado com a lista de receitas retornada pela API
  const [reviews, setReviews] = useState(initialReviews);
  // Estado que indica se há uma requisição em andamento
  const [loading, setLoading] = useState(false);
  // Estado para armazenar mensagem de erro (se houver)
  const [error, setError] = useState(null);

  // ✅ Estados separados para o edit, evitando que o loading geral bloqueie a lista inteira
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Estados separados para o delete, pelo mesmo motivo do edit
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  /**
   * Função que faz a chamada à API.
   *
   * É memorizada com useCallback para:
   * - evitar recriar a função a cada render
   * - funcionar bem como dependência do useEffect
   */
  const fetchReviews = useCallback(async () => {
    // Sempre que for buscar, marcamos como carregando
    setLoading(true);
    // Limpamos erro anterior (se houver) antes de nova tentativa
    setError(null);

    try {
      // Chamada HTTP para a API de receitas
      const response = await fetch(`${API_BASE_URL}/reviews`);

      // Se a resposta veio com status de erro (4xx / 5xx),
      // disparamos uma exception para cair no catch
      if (!response.ok) {
        throw new Error(`Erro ao buscar reviews (status ${response.status})`);
      }

      // Convertemos o JSON e salvamos no estado
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      // Caso dê erro de rede, CORS, servidor, etc,
      // guardamos uma mensagem amigável em `error`
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      // Independente de sucesso ou erro, o loading termina aqui
      setLoading(false);
    }
  }, []);

  /**
   * Envia um PUT para /reviews/:id com os dados atualizados.
   *
   * - Atualiza o item localmente no estado (optimistic update opcional)
   *   para a UI refletir a mudança sem precisar refazer o fetch.
   * - Expõe `editLoading` e `editError` separados do loading geral.
   *
   * @param {string|number} id   - ID da review a ser editada
   * @param {object} updatedData - Campos atualizados a enviar no body
   * @returns {Promise<object|null>} - Retorna o dado atualizado ou null se falhar
   */
  const editReview = useCallback(async (id, updatedData) => {
    setEditLoading(true);
    setEditError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao editar review (status ${response.status})`);
      }

      const updated = await response.json();

      // Atualiza o item na lista local sem precisar refazer o fetch completo
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? updated : review))
      );

      return updated;
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setEditLoading(false);
    }
  }, []);

  /**
   * Envia um DELETE para /reviews/:id.
   *
   * - Remove o item localmente do estado após confirmação da API,
   *   evitando um refetch desnecessário.
   * - Expõe `deleteLoading` e `deleteError` separados do loading geral.
   *
   * @param {string|number} id - ID da review a ser removida
   * @returns {Promise<boolean>} - Retorna true se deletou com sucesso, false se falhou
   */
  const deleteReview = useCallback(async (id) => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir review (status ${response.status})`);
      }

      // Remove o item da lista local sem precisar refazer o fetch completo
      setReviews((prev) => prev.filter((review) => review.id !== id));

      return true;
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setDeleteLoading(false);
    }
  }, []);

  /**
   * useEffect pode disparar automaticamente a primeira busca de receitas,
   * dependendo da flag `fetchOnMount`. Isso permite usar o hook tanto em:
   * - páginas puramente client-side (fetchOnMount = true, padrão)
   * - páginas com SSR que já passam dados iniciais (fetchOnMount = false)
   */
  useEffect(() => {
    if (!fetchOnMount) return;
    fetchReviews();
  }, [fetchOnMount, fetchReviews]);

  /**
   * O hook retorna um "objeto de estado remoto" para o componente:
   * - reviews: dados
   * - loading: booleano indicando carregamento
   * - error: mensagem de erro (ou null)
   * - refetch: função para re-buscar os dados quando você quiser
   * - editReview: função para editar uma review por id
   * - editLoading: booleano indicando carregamento do edit
   * - editError: mensagem de erro do edit (ou null)
   * - deleteReview: função para excluir uma review por id
   * - deleteLoading: booleano indicando carregamento do delete
   * - deleteError: mensagem de erro do delete (ou null)
   */
  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    editReview,
    editLoading,
    editError,
    deleteReview,
    deleteLoading,
    deleteError,
  };
}