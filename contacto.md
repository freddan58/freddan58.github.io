---
layout: page
title: Contáctame
permalink: /contacto/
---

# Contáctame

Rellena el formulario a continuación para ponerte en contacto conmigo. Estoy encantado de discutir sobre consultoría en Azure, desarrollo en .NET Core, modernización de aplicaciones o cualquier otra necesidad técnica que tengas.

<form action="https://formspree.io/f/xblyaqaw" method="POST" style="display: flex; flex-direction: column; gap: 1rem; max-width: 500px; margin: 0 auto; padding: 1rem; background-color: #2a2a2a; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="name" style="font-weight: bold; color: #e0e0e0;">Nombre:</label>
    <input type="text" id="name" name="name" placeholder="Tu nombre" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem;">
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="email" style="font-weight: bold; color: #e0e0e0;">Correo Electrónico:</label>
    <input type="email" id="email" name="email" placeholder="Tu correo" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem;">
  </div>
  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
    <label for="message" style="font-weight: bold; color: #e0e0e0;">Mensaje:</label>
    <textarea id="message" name="message" placeholder="Tu mensaje" required style="padding: 0.5rem; border: 1px solid #444; border-radius: 4px; background-color: #333; color: #e0e0e0; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
  </div>
  <button type="submit" style="padding: 0.5rem 1rem; border: none; border-radius: 4px; background-color: #1e90ff; color: #fff; font-weight: bold; cursor: pointer; transition: background-color 0.3s;">Enviar</button>
</form>