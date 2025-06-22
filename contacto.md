---
layout: page
title: Contáctame
permalink: /contacto/
---

# Contáctame

Rellena el formulario a continuación para ponerte en contacto conmigo. Estoy encantado de discutir sobre consultoría en Azure, desarrollo en .NET Core, modernización de aplicaciones o cualquier otra necesidad técnica que tengas.

<form id="my-form" action="https://formspree.io/f/xblyaqaw" method="POST" style="display: flex; flex-direction: column; gap: 1rem; max-width: 500px; margin: 0 auto; padding: 1rem; background-color: #2a2a2a; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="name" style="font-weight: bold; color: #e0e0e0;">Nombre:</label>
    <input type="text" id="name" name="name" placeholder="Tu nombre" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem;" oninvalid="this.setCustomValidity('Por favor, ingresa tu nombre')" oninput="this.setCustomValidity('')">
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="email" style="font-weight: bold; color: #e0e0e0;">Correo Electrónico:</label>
    <input type="email" id="email" name="email" placeholder="Tu correo" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem;" oninvalid="this.setCustomValidity('Por favor, ingresa un correo válido')" oninput="this.setCustomValidity('')">
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="message" style="font-weight: bold; color: #e0e0e0;">Mensaje:</label>
    <textarea id="message" name="message" placeholder="Tu mensaje" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem; min-height: 100px; resize: vertical;" oninvalid="this.setCustomValidity('Por favor, ingresa un mensaje con tu propósito')" oninput="this.setCustomValidity('')"></textarea>
  </div>
  <button type="submit" style="padding: 0.5rem 1rem; border: none; border-radius: 4px; background-color: #1e90ff; color: #fff; font-weight: bold; cursor: pointer; transition: background-color 0.3s;">Enviar</button>
  <p id="my-form-status" style="color: #e0e0e0; margin: 0;"></p>
</form>

<script>
  var form = document.getElementById("my-form");
  
  async function handleSubmit(event) {
    event.preventDefault();
    var status = document.getElementById("my-form-status");
    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var message = document.getElementById("message").value.trim();

    // Validación adicional
    if (!name || !email || !message) {
      status.innerHTML = "Todos los campos son obligatorios. Por favor, completa el formulario.";
      return;
    }
    if (message.length < 10) {
      status.innerHTML = "El mensaje debe tener al menos 10 caracteres para detallar tu propósito.";
      return;
    }

    var data = new FormData(event.target);
    fetch(event.target.action, {
      method: form.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        status.innerHTML = "¡Gracias por tu mensaje! Te contactaré pronto.";
        form.reset();
      } else {
        response.json().then(data => {
          if (Object.hasOwn(data, 'errors')) {
            status.innerHTML = data["errors"].map(error => error["message"]).join(", ");
          } else {
            status.innerHTML = "Oops! Hubo un problema al enviar tu formulario.";
          }
        });
      }
    }).catch(error => {
      status.innerHTML = "Oops! Hubo un problema al enviar tu formulario.";
    });
  }
  form.addEventListener("submit", handleSubmit);
</script>