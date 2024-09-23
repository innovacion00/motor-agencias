document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.nav button');
    const contentSections = document.querySelectorAll('.content');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remover la clase 'active' de todos los botones
            buttons.forEach(btn => btn.classList.remove('active'));
            // Añadir la clase 'active' al botón clicado
            this.classList.add('active');

            // Ocultar todas las secciones de contenido
            contentSections.forEach(section => section.style.display = 'none');

            // Mostrar la sección de contenido correspondiente
            const city = this.textContent.trim();
            document.getElementById(city).style.display = 'block';
        });
    });
});
