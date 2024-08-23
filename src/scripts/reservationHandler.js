document.getElementById('reservation-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = event.target.name.value;
    const email = event.target.email.value;
    
    // Lógica para manejar la reserva
    console.log(`Reservando para: ${name} con el correo: ${email}`);
    
    // Aquí podrías hacer una llamada a una API para realizar la reserva
  });
  