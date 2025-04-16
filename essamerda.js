javascript:(function() {
    console.log('Tentando reativar Copiar/Colar...');
    var allowCopyPaste = function(e) {
        e.stopImmediatePropagation();
        console.log('Evento bloqueado:', e.type);
        return true;
    };

    // 1. Remover estilos CSS que impedem a seleção
    try {
        let styleId = 'allow-select-style';
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove(); // Remove se já existir para aplicar de novo

        const css = '*, *::before, *::after { user-select: auto !important; -webkit-user-select: auto !important; -moz-user-select: auto !important; -ms-user-select: auto !important; }';
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        if (style.styleSheet) { // IE
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
        console.log('CSS para user-select aplicado.');
    } catch (err) {
        console.error("Erro ao aplicar CSS:", err);
    }

    // 2. Remover atributos e event listeners inline que bloqueiam
    const events = ['copy', 'paste', 'cut', 'selectstart', 'contextmenu', 'dragstart', 'mousedown'];
    const attributesToRemove = ['readonly', 'disabled', 'on' + events.join(', on'), 'maxlength']; // Inclui oncopy, onpaste etc. e input restrictions

    document.querySelectorAll('*').forEach(function(node) {
        // Remover atributos como readonly, disabled, maxlength (de inputs)
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
             if (node.hasAttribute('readonly')) node.removeAttribute('readonly');
             if (node.hasAttribute('disabled')) node.removeAttribute('disabled');
             if (node.hasAttribute('maxlength')) node.removeAttribute('maxlength');
        }

        // Remover event listeners definidos como atributos HTML (oncopy="return false", etc.)
        events.forEach(function(eventType) {
            var attr = 'on' + eventType;
             if (node.hasAttribute(attr)) {
                 node.removeAttribute(attr);
                 console.log(`Atributo ${attr} removido de:`, node);
             }
             // Também tentar anular a propriedade do evento
             if (typeof node[attr] === 'function') {
                  node[attr] = null;
                  console.log(`Propriedade ${attr} anulada em:`, node);
             }
        });
    });
    console.log('Atributos e listeners inline processados.');

    // 3. Adicionar listeners na fase de captura para parar a propagação de listeners adicionados via JS (addEventListener)
    events.forEach(function(eventType) {
        document.removeEventListener(eventType, allowCopyPaste, true); // Remove listener antigo se existir
        document.addEventListener(eventType, allowCopyPaste, true); // Adiciona na fase de captura (true)
    });
    console.log('Listeners na fase de captura adicionados para:', events.join(', '));

    // 4. Reativar menu de contexto globalmente (caso tenha sido desabilitado)
    document.oncontextmenu = null;
    window.oncontextmenu = null;
    if(document.body) document.body.oncontextmenu = null;


    alert('Tentativa de habilitar copiar/colar concluída!\n\nTente selecionar texto, usar Ctrl+C (ou Cmd+C) e Ctrl+V (ou Cmd+V) agora.\n\nNota: Pode não funcionar em todos os sites ou quebrar funcionalidades.');
    console.log('Reativação de Copiar/Colar finalizada.');

})();
