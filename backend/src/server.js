const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Middleware didático para simular atraso em TODAS as requisições
app.use(async (req, res, next) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  next();
});

// Dados em memória
let nextRecipeId = 1;
let nextReviewId = 1;

const recipes = [];
const reviews = [];

// Validações básicas
function isValidRecipe(body) {
  const { title, description, prepTime, ingredients, steps } = body;

  if (
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    typeof prepTime !== 'number' ||
    !Array.isArray(ingredients) ||
    !Array.isArray(steps)
  ) {
    return false;
  }

  return true;
}

function isValidReview(body) {
  const { recipeId, rating, comment, author } = body;

  if (
    typeof recipeId !== 'number' ||
    typeof rating !== 'number' ||
    rating < 1 ||
    rating > 5 ||
    typeof comment !== 'string' ||
    typeof author !== 'string'
  ) {
    return false;
  }

  const recipeExists = recipes.some((r) => r.id === recipeId);
  if (!recipeExists) {
    return false;
  }

  return true;
}

// Configuração do Swagger (OpenAPI 3)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Receitas',
    version: '1.0.0',
    description:
      'API REST didática para gerenciamento de receitas e avaliações, com dados em memória.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  components: {
    schemas: {
      Recipe: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Bolo de cenoura' },
          description: {
            type: 'string',
            example: 'Um bolo de cenoura fofinho com cobertura de chocolate.',
          },
          prepTime: { type: 'integer', example: 45 },
          ingredients: {
            type: 'array',
            items: { type: 'string' },
            example: ['3 cenouras', '2 xícaras de farinha', '3 ovos'],
          },
          steps: {
            type: 'array',
            items: { type: 'string' },
            example: ['Bater tudo no liquidificador', 'Assar por 40 minutos'],
          },
        },
        required: ['title', 'description', 'prepTime', 'ingredients', 'steps'],
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          recipeId: { type: 'integer', example: 1 },
          rating: {
            type: 'integer',
            minimum: 1,
            maximum: 5,
            example: 5,
          },
          comment: {
            type: 'string',
            example: 'Ficou maravilhoso, recomendo!',
          },
          author: { type: 'string', example: 'João' },
        },
        required: ['recipeId', 'rating', 'comment', 'author'],
      },
    },
  },
  paths: {
    '/recipes': {
      get: {
        summary: 'Lista todas as receitas',
        tags: ['Recipes'],
        responses: {
          200: {
            description: 'Lista de receitas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Recipe' },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Cria uma nova receita',
        tags: ['Recipes'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Recipe',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Receita criada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Recipe' },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
          },
        },
      },
    },
    '/recipes/{id}': {
      get: {
        summary: 'Busca uma receita pelo ID',
        tags: ['Recipes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Receita encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Recipe' },
              },
            },
          },
          404: {
            description: 'Receita não encontrada',
          },
        },
      },
      put: {
        summary: 'Atualiza uma receita existente',
        tags: ['Recipes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Recipe',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Receita atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Recipe' },
              },
            },
          },
          400: { description: 'Dados inválidos' },
          404: { description: 'Receita não encontrada' },
        },
      },
      delete: {
        summary: 'Remove uma receita',
        tags: ['Recipes'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: { description: 'Receita removida com sucesso' },
          404: { description: 'Receita não encontrada' },
        },
      },
    },
    '/recipes/{id}/reviews': {
      get: {
        summary: 'Lista todas as avaliações de uma receita',
        tags: ['Reviews'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Lista de avaliações da receita',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Review' },
                },
              },
            },
          },
          404: { description: 'Receita não encontrada' },
        },
      },
      post: {
        summary: 'Cria uma avaliação para uma receita',
        tags: ['Reviews'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    example: 4,
                  },
                  comment: {
                    type: 'string',
                    example: 'Bem gostosa, só faltou sal.',
                  },
                  author: { type: 'string', example: 'Maria' },
                },
                required: ['rating', 'comment', 'author'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Avaliação criada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          400: { description: 'Dados inválidos' },
          404: { description: 'Receita não encontrada' },
        },
      },
    },
    '/reviews': {
      get: {
        summary: 'Lista todas as avaliações',
        tags: ['Reviews'],
        responses: {
          200: {
            description: 'Lista de avaliações',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Review' },
                },
              },
            },
          },
        },
      },
    },
    '/reviews/{reviewId}': {
      get: {
        summary: 'Busca uma avaliação pelo ID',
        tags: ['Reviews'],
        parameters: [
          {
            name: 'reviewId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Avaliação encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          404: { description: 'Avaliação não encontrada' },
        },
      },
      put: {
        summary: 'Atualiza uma avaliação existente',
        tags: ['Reviews'],
        parameters: [
          {
            name: 'reviewId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                    example: 4,
                  },
                  comment: {
                    type: 'string',
                    example: 'Mudando minha opinião após fazer de novo.',
                  },
                  author: { type: 'string', example: 'Maria' },
                },
                required: ['rating', 'comment', 'author'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Avaliação atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Review' },
              },
            },
          },
          400: { description: 'Dados inválidos' },
          404: { description: 'Avaliação não encontrada' },
        },
      },
      delete: {
        summary: 'Remove uma avaliação',
        tags: ['Reviews'],
        parameters: [
          {
            name: 'reviewId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: { description: 'Avaliação removida com sucesso' },
          404: { description: 'Avaliação não encontrada' },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoints de receitas
app.get('/recipes', (req, res) => {
  res.json(recipes);
});

app.get('/recipes/:id', (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receita não encontrada' });
  }

  res.json(recipe);
});

app.post('/recipes', (req, res) => {
  if (!isValidRecipe(req.body)) {
    return res.status(400).json({
      message:
        'Dados inválidos. Esperado: { title: string, description: string, prepTime: number, ingredients: string[], steps: string[] }',
    });
  }

  const recipe = {
    id: nextRecipeId++,
    title: req.body.title,
    description: req.body.description,
    prepTime: req.body.prepTime,
    ingredients: req.body.ingredients,
    steps: req.body.steps,
  };

  recipes.push(recipe);

  res.status(201).json(recipe);
});

app.put('/recipes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = recipes.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receita não encontrada' });
  }

  if (!isValidRecipe(req.body)) {
    return res.status(400).json({
      message:
        'Dados inválidos. Esperado: { title: string, description: string, prepTime: number, ingredients: string[], steps: string[] }',
    });
  }

  const updated = {
    id,
    title: req.body.title,
    description: req.body.description,
    prepTime: req.body.prepTime,
    ingredients: req.body.ingredients,
    steps: req.body.steps,
  };

  recipes[index] = updated;

  res.json(updated);
});

app.delete('/recipes/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = recipes.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receita não encontrada' });
  }

  recipes.splice(index, 1);

  res.status(204).send();
});

// Endpoints de avaliações
app.get('/recipes/:id/reviews', (req, res) => {
  const recipeId = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return res.status(404).json({ message: 'Receita não encontrada' });
  }

  const recipeReviews = reviews.filter((rev) => rev.recipeId === recipeId);
  res.json(recipeReviews);
});

app.post('/recipes/:id/reviews', (req, res) => {
  const recipeId = Number(req.params.id);
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return res.status(404).json({ message: 'Receita não encontrada' });
  }

  const body = {
    ...req.body,
    recipeId,
  };

  if (!isValidReview(body)) {
    return res.status(400).json({
      message:
        'Dados inválidos. Esperado: { rating: number (1-5), comment: string, author: string }',
    });
  }

  const review = {
    id: nextReviewId++,
    recipeId,
    rating: body.rating,
    comment: body.comment,
    author: body.author,
  };

  reviews.push(review);

  res.status(201).json(review);
});

app.get('/reviews', (req, res) => {
  res.json(reviews);
});

app.get('/reviews/:reviewId', (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const review = reviews.find((rev) => rev.id === reviewId);

  if (!review) {
    return res.status(404).json({ message: 'Avaliação não encontrada' });
  }

  res.json(review);
});

app.put('/reviews/:reviewId', (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const index = reviews.findIndex((rev) => rev.id === reviewId);

  if (index === -1) {
    return res.status(404).json({ message: 'Avaliação não encontrada' });
  }

  const existing = reviews[index];

  const body = {
    recipeId: existing.recipeId,
    rating: req.body.rating,
    comment: req.body.comment,
    author: req.body.author,
  };

  if (!isValidReview(body)) {
    return res.status(400).json({
      message:
        'Dados inválidos. Esperado: { rating: number (1-5), comment: string, author: string }',
    });
  }

  const updated = {
    id: reviewId,
    recipeId: existing.recipeId,
    rating: body.rating,
    comment: body.comment,
    author: body.author,
  };

  reviews[index] = updated;

  res.json(updated);
});

app.delete('/reviews/:reviewId', (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const index = reviews.findIndex((rev) => rev.id === reviewId);

  if (index === -1) {
    return res.status(404).json({ message: 'Avaliação não encontrada' });
  }

  reviews.splice(index, 1);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor de receitas rodando em http://localhost:${PORT}`);
  console.log(`Documentação Swagger em http://localhost:${PORT}/api-docs`);
});

