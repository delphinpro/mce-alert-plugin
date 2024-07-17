import { AlertsPlugin } from './alerts.js';

// Добавим плагин в tinymce с идентификатором 'alerts'
tinymce.PluginManager.add('alerts', AlertsPlugin);

tinymce.init({
    target: document.getElementById('editor'),
    // Укажем идентификатор плагина, чтобы редактор его начал использовать
    plugins: ['code', 'alerts'],
    // Укажем идентификатор кнопки, чтобы редактор её создал
    toolbar    : 'code | h2 h3 | bold italic underline | alerts',
    skin       : 'tinymce-5-dark',
    menubar    : false,
    branding   : false,
    height     : 500,
    content_css: './tinymce-content.css',
});
