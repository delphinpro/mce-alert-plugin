const types = [
    { text: 'Простой текст (default)', value: 'default' },
    { text: 'Информация (info)', value: 'info' },
    { text: 'Уведомление (success)', value: 'success' },
    { text: 'Предупреждение (warning)', value: 'warning' },
    { text: 'Важная информация (danger)', value: 'danger' },
];

const getSelectedAlertBlock = editor => editor.selection.getNode().closest('.alert');

const getSelectedContent = editor => {
    // Получаем выделенный текст
    const selectedContent = editor.selection.getContent().trim();
    return selectedContent.length && selectedContent.startsWith('<')
           ? selectedContent
           : `<p>${selectedContent}</p>`;
};

const insertAlertBlock = (editor, type) => {
    const node = getSelectedAlertBlock(editor);
    if (node) {
        // Если курсор внутри блока, то просто меняем его тип
        node.className = `alert alert-${type}`;
    } else {
        // Если курсор вне блока, то вставляем новый
        editor.insertContent(`<div class="alert alert-${type}">${getSelectedContent(editor)}</div>`);
    }
};

const openDialog = editor => {
    const alert = editor.selection.getNode().closest('.alert');
    let currentType = 'default';
    let matches = /alert-(default|info|success|warning|danger)/.exec(alert?.className);
    if (alert && matches) currentType = matches[1];

    editor.windowManager.open({
        // Заголовок диалога
        title: 'Информационное сообщение',
        // Содержимое диалога
        body: {
            type: 'panel',
            // Список элементов
            items: [
                {
                    type : 'listbox',      // Выпадающий список
                    name : 'type',         // Имя для доступа из кода
                    label: 'Тип сообщения',// Подпись
                    items: types,          // Список значений в списке
                },
            ],
        },
        // Набор кнопок в диалоге
        buttons: [
            {
                type: 'cancel',
                name: 'cancel',
                text: 'Cancel',
            },
            {
                type   : 'submit',
                name   : 'save',
                text   : 'Save',
                primary: true,
            },
        ],
        // Данные для передачи в диалог
        initialData: {
            type: currentType,
        },
        // Обработчик сохранения
        onSubmit: api => {
            const data = api.getData();
            insertAlertBlock(editor, data.type);
            api.close();
        },
    });
};

const onSetupEditable = (editor, onChanged = () => {}) => api => {
    const nodeChanged = () => {
        api.setEnabled(editor.selection.isEditable());
        onChanged(api);
    };
    editor.on('NodeChange', nodeChanged);
    nodeChanged();
    return () => {
        editor.off('NodeChange', nodeChanged);
    };
};

export const AlertsPlugin = editor => {

    // Выполняемая команда
    editor.addCommand('edit_alert', () => {
        // Открываем диалог настроек блока сообщения
        openDialog(editor);
    });

    // Кнопка с идентификатором 'alerts'
    editor.ui.registry.addToggleButton('alerts', {
        icon    : 'warning',
        text    : 'Alert',
        onAction: () => editor.execCommand('edit_alert'),
        onSetup : onSetupEditable(editor, api => {
            api.setActive(editor.selection.getStart().closest('.alert') !== null);
        }),
    });

    editor.on('keydown', function (e) {
        if (e.keyCode === 27 || (e.keyCode === 13 && e.ctrlKey)) {

            const alertBlock = editor.selection ? editor.selection.getNode().closest('.alert') : null;
            if (alertBlock) {
                e.preventDefault();
                const container = alertBlock.parentNode;
                const isLast = alertBlock === container.lastChild;
                let nextElement = alertBlock.nextElementSibling;

                if (isLast) {
                    nextElement = editor.dom.create('p');
                    nextElement.innerHTML = '<br data-mce-bogus>';
                    editor.dom.insertAfter(nextElement, alertBlock);
                }

                const rng = editor.dom.createRng();
                rng.setStart(nextElement, 0);
                rng.setEnd(nextElement, 0);
                editor.selection.setRng(rng);
            }
        }
    });


    editor.on('dblclick', e => {
        if (e.target.closest('.alert')) {
            e.preventDefault();
            openDialog(editor);
        }
    });

};
