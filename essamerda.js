javascript:(function() {
    'use strict';
    console.clear(); // Limpa console para melhor visualização
    console.log('%c[Ultra Copy/Paste Enabler] Iniciando...', 'color: #007bff; font-weight: bold;');

    const SCRIPT_ID = 'ultra-copy-paste-enabler-style';
    const MAX_DEPTH = 50; // Limite de profundidade para evitar recursão infinita

    // --- 1. Injeção Agressiva de CSS ---
    try {
        let existingStyle = document.getElementById(SCRIPT_ID);
        if (existingStyle) existingStyle.remove();

        const css = `
            *, *::before, *::after {
                user-select: auto !important;
                -webkit-user-select: auto !important;
                -moz-user-select: auto !important;
                -ms-user-select: auto !important;
                pointer-events: auto !important; /* Evita overlays que bloqueiam seleção */
                cursor: auto !important; /* Reseta cursor caso esteja como 'not-allowed' etc */
            }
            ::selection {
                background-color: #007bff !important; /* Azul vibrante */
                color: white !important;
            }
            ::-moz-selection { /* Para Firefox */
                background-color: #007bff !important;
                color: white !important;
            }
            input, textarea {
                 /* Permitir seleção dentro de inputs desabilitados visualmente */
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                 user-select: text !important;
            }
        `;
        const style = document.createElement('style');
        style.id = SCRIPT_ID;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        (document.head || document.documentElement).appendChild(style);
        console.log('%c[CSS] Estilos de seleção e ponteiro forçados.', 'color: green;');
    } catch (err) {
        console.error('[CSS] Erro ao aplicar estilos:', err);
    }

    // --- 2. Lista Expandida de Eventos a Interceptar ---
    const eventsToNeutralize = [
        'copy', 'paste', 'cut',                  // Clipboard
        'select', 'selectstart', 'selectionchange', // Seleção
        'contextmenu',                          // Menu de Contexto
        'drag', 'dragstart',                    // Arrastar
        'mousedown', 'mouseup', 'click',        // Mouse
        'keydown', 'keypress', 'keyup'           // Teclado
    ];

    // --- 3. Função para Processar um Nó (Elemento) ---
    function processNode(node) {
        if (!node || typeof node.removeAttribute !== 'function') return;

        // Remover atributos restritivos comuns
        ['readonly', 'disabled', 'draggable'].forEach(attr => {
            if (node.hasAttribute(attr)) {
                // Manter visualmente desabilitado mas permitir interacao interna se possivel
                if(attr === 'disabled') {
                     node.removeAttribute(attr);
                     // Adicionar uma classe para possivel estilo customizado se necessario
                     // node.classList.add('visually-disabled-but-unlocked');
                } else {
                    node.removeAttribute(attr);
                }
                console.log(`[Node] Atributo '${attr}' removido de:`, node.tagName, node.id ? `#${node.id}` : '');
            }
        });
         // Permitir comprimento máximo (pode ser útil para colar)
         if (node.hasAttribute('maxlength')) {
             node.removeAttribute('maxlength');
              console.log(`[Node] Atributo 'maxlength' removido de:`, node.tagName);
         }

        // Remover handlers de eventos inline (on*) e propriedades JS
        eventsToNeutralize.forEach(eventType => {
            const attrName = 'on' + eventType;
            if (node.hasAttribute(attrName)) {
                node.removeAttribute(attrName);
                console.log(`[Node] Atributo '${attrName}' removido de:`, node.tagName);
            }
            // Tentar anular propriedades de evento diretamente
            if (typeof node[attrName] === 'function') {
                try {
                    node[attrName] = null;
                    console.log(`[Node] Propriedade '${attrName}' anulada em:`, node.tagName);
                } catch (e) {
                    // Alguns navegadores podem impedir isso em certos elementos
                     console.warn(`[Node] Não foi possível anular a propriedade '${attrName}' em:`, node.tagName, e.message);
                }
            }
        });

        // Tentativa (menos segura) de remover listeners adicionados com addEventListener
        // Nota: Isso requer conhecimento prévio dos listeners, o que é impossível.
        // A abordagem de captura (item 4) é geralmente mais eficaz.
        // eventsToNeutralize.forEach(eventType => {
        //     // Não há uma forma padrão de listar ou remover listeners anônimos
        //     // A linha abaixo é apenas ilustrativa e não funcionará na prática
        //     // node.removeEventListener(eventType, ???, true);
        //     // node.removeEventListener(eventType, ???, false);
        // });
    }

    // --- 4. Percorrer DOM Principal e Shadow DOMs Abertos ---
    function traverseDOM(rootNode, depth = 0) {
        if (depth > MAX_DEPTH) {
            console.warn('[Traversal] Profundidade máxima atingida, parando a recursão.');
            return;
        }

        const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT);
        let currentNode;
        while (currentNode = walker.nextNode()) {
            processNode(currentNode);

            // Verificar e percorrer Shadow DOM se existir e estiver aberto
            if (currentNode.shadowRoot && currentNode.shadowRoot.mode === 'open') {
                console.log('%c[ShadowDOM] Encontrado e percorrendo Shadow Root em:', 'color: orange;', currentNode.tagName);
                traverseDOM(currentNode.shadowRoot, depth + 1);
            }
        }
         // Processar o nó raiz também (útil para o shadow root inicial)
         if (rootNode !== document) {
              processNode(rootNode.host || rootNode); // Processa o host do shadow root ou o próprio root
         }
    }

    console.log('[Traversal] Iniciando varredura do DOM (incluindo Shadow DOMs abertos)...');
    try {
         traverseDOM(document.documentElement); // Começa pelo <html>
         console.log('%c[Traversal] Varredura do DOM concluída.', 'color: green;');
    } catch(err) {
         console.error('[Traversal] Erro durante a varredura do DOM:', err);
    }


    // --- 5. Interceptar Eventos na Fase de Captura (Mais Eficaz) ---
    const eventHandler = function(e) {
        // Permitir comportamento padrão para combinações comuns de atalho
        // (O stopImmediatePropagation já evita que listeners do site bloqueiem)
        // if (e.type === 'keydown') {
        //     if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'z', 'y'].includes(e.key.toLowerCase())) {
        //          console.log(`[Capture] Permitindo ${e.key} + Ctrl/Cmd`);
        //          // Não parar aqui, deixar o navegador fazer a ação padrão
        //          return true;
        //     }
        // }

        e.stopImmediatePropagation(); // Impede outros listeners (do site) no mesmo elemento de rodarem
        console.log(`%c[Capture] Evento '${e.type}' interceptado e propagação interrompida em:`, 'color: purple;', e.target.tagName);
        // Retornar true pode ajudar em alguns casos, mas stopImmediatePropagation é a chave.
        return true;
    };

    eventsToNeutralize.forEach(function(eventType) {
        // Remover listener antigo (se o bookmarklet for rodado de novo) para evitar duplicatas
        document.removeEventListener(eventType, eventHandler, true);
        // Adicionar o novo listener na fase de CAPTURA (true)
        document.addEventListener(eventType, eventHandler, true);
    });
    console.log('%c[Capture] Listeners de captura adicionados para:', 'color: green;', eventsToNeutralize.join(', '));


    // --- 6. Resetar Handlers Globais ---
    try {
        window.oncontextmenu = null;
        document.oncontextmenu = null;
        if(document.body) document.body.oncontextmenu = null;
        window.oncopy = null; document.oncopy = null; if(document.body) document.body.oncopy = null;
        window.onpaste = null; document.onpaste = null; if(document.body) document.body.onpaste = null;
        window.oncut = null; document.oncut = null; if(document.body) document.body.oncut = null;
        window.onselectstart = null; document.onselectstart = null; if(document.body) document.body.onselectstart = null;
        console.log('%c[Global] Handlers globais (oncontextmenu, oncopy, etc.) resetados.', 'color: green;');
    } catch (err) {
         console.error('[Global] Erro ao resetar handlers globais:', err);
    }

    // --- Finalização ---
    console.log('%c[Ultra Copy/Paste Enabler] Processamento concluído!', 'color: #007bff; font-weight: bold;');
    alert('Tentativa AVANÇADA de habilitar Copiar/Colar concluída!\n\nVerifique o console (F12) para detalhes.\n\nLembre-se: Pode não funcionar em todos os sites ou quebrar funcionalidades.');

})();
