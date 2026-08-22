# Ideias de produto para o Gonin

## Direção de produto

O Gonin deve parecer um fórum leve e livre: um espaço para escolher assuntos, testar ideias e continuar conversas sem a pressão de criar um post perfeito.

Frase guia:

> Ideias não precisam nascer prontas. No Gonin, elas podem começar pequenas e crescer com a conversa.

## Conversas reacendidas

Objetivo: evitar que boas ideias sumam apenas porque o post ficou antigo.

Comportamento sugerido:

- Quando um post antigo recebe um novo comentário, ele ganha um campo `revivedAt`.
- Posts com `revivedAt` recente aparecem em uma área chamada `Conversas reacendidas`.
- A ordenação dessa área prioriza posts antigos que voltaram a receber interação.
- A interface pode mostrar um selo discreto: `Voltaram a falar sobre isso`.

Primeiro escopo:

- Considerar um post "reacendido" quando receber comentário depois de um período sem atividade.
- Usar `revivedAt` como timestamp no documento do post.
- Exibir até 3 posts reacendidos na home do fórum.

## Ideias abertas

Objetivo: deixar claro que nem todo post precisa ser uma resposta final ou um conteúdo polido.

Tipos iniciais:

- `Pergunta`
- `Ideia`
- `Discussão`
- `Feedback`

Uso na interface:

- O usuário escolhe o tipo ao criar um post.
- O tipo aparece como selo no card do post.
- Filtros por tipo podem ser adicionados depois nas páginas de tópicos.

## Relação com a landing page

As highlights da landing devem comunicar essa proposta:

- Menos feed, mais escolha.
- Um lugar para testar ideias.
- Boas conversas podem voltar.

Essas mensagens criam uma diferença clara em relação a feeds sociais comuns e fóruns mais pesados.
