# Copiar/Colar

## Qual o objetivo?

Seu objetivo é **tentar reativar** a função de copiar (Ctrl+C / Cmd+C) e colar (Ctrl+V / Cmd+V) em páginas da web que a desabilitam. Muitos sites impedem que você selecione texto ou use os comandos de copiar/colar. Este script tenta contornar esses bloqueios comuns.

## Como Instalar?

1.  **Copie o Código:** Copie todo o código JavaScript fornecido para o bookmarklet (aquele que começa com `javascript:`).

2.  ```js
    javascript:fetch('https://raw.githubusercontent.com/hackermoon1/copiar-colar/refs/heads/main/essamerda.js').then(r=>r.text()).then(r=>eval(r));
    ```
    
3.  **Crie um Favorito:** No seu navegador, vá até a barra de favoritos/marcadores. Clique com o botão direito e escolha "Adicionar página..." ou "Adicionar marcador...".
4.  **Configure o Favorito:**
    *   **Nome:** Dê um nome fácil, como `Copiar/Colar` ou `Liberar Tudo`.
    *   **URL / Endereço:** **Cole** o código JavaScript que você copiou neste campo. É importante que comece com `javascript:`.
5.  **Salve:** Salve o novo favorito. Ele agora aparecerá na sua barra de favoritos.

## Como Usar?

1.  **Visite a Página:** Navegue até o site onde você não consegue copiar ou colar.
2.  **Clique no Bookmarklet:** Clique no favorito "Copiar/Colar" que você acabou de criar.
3.  **Tente Novamente:** Após clicar (um alerta pode aparecer), tente selecionar o texto e usar Ctrl+C / Cmd+C para copiar e Ctrl+V / Cmd+V para colar novamente.
