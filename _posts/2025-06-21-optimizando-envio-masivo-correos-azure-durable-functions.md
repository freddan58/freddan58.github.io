---
layout: post  
title: "Optimizando el Envío Masivo de Correos con Azure Durable Functions"  
date: 2025-06-21  
categories: azure durable-functions serverless email  
author: Freddy Urbano  
---

## El Problema  
Muchas organizaciones enfrentan problemas al enviar correos masivos desde servidores tradicionales: colas de envío que se atascan, alto consumo de CPU y disco, y un rendimiento que se desploma bajo presión. Estos cuellos de botella dificultan procesos críticos como notificaciones o campañas de marketing.  

La solución: modernizar el envío con **Azure Durable Functions**, una tecnología serverless que elimina estos dolores de cabeza y escala sin complicaciones.

## ¿Qué es Azure Durable Functions?  
Es una extensión de Azure Functions que permite escribir flujos de trabajo coordinados (stateful) en un entorno sin servidor. Usamos un **patrón de orquestación** donde una función principal (orquestador) reparte el trabajo a otras funciones más pequeñas (actividades), como enviar correos.

## Cómo Implementarlo  
### 1. Orquestador Principal  
El orquestador (`SendEmailOrchestrator`) obtiene los correos pendientes y los distribuye por cliente en paralelo.  
```csharp
[Function("SendEmailOrchestrator")]
public static async Task<List<string>> SendEmailOrchestrator(
    [OrchestrationTrigger] TaskOrchestrationContext context)
{
    var emails = await context.CallActivityAsync<List<Email>>(nameof(GetEmailsToSend), null);
    var distinctClients = emails.GroupBy(e => e.SystemSerial).Select(g => g.Key);
    int maxParallelClients = 5; // Límite configurable
    var parallelTasks = distinctClients.Take(maxParallelClients).Select(client =>
        context.CallSubOrchestratorAsync(nameof(SendEmailsToClientOrchestrator), new { ClientName = client, Emails = emails })
    ).ToList();
    await Task.WhenAll(parallelTasks);
    return new List<string> { "Orquestación completada" };
}
```

### 2. Suborquestador por Cliente  
Cada cliente tiene su propio suborquestador (`SendEmailsToClientOrchestrator`) que envía correos en lotes.  
```csharp
[Function("SendEmailsToClientOrchestrator")]
public static async Task SendEmailsToClientOrchestrator(
    [OrchestrationTrigger] TaskOrchestrationContext context)
{
    var input = context.GetInput<dynamic>();
    var clientEmails = input.Emails.Where(e => e.SystemSerial == input.ClientName).Take(5).ToList();
    int batchSize = 5;
    for (int i = 0; i < clientEmails.Count; i += batchSize)
    {
        var batch = clientEmails.Skip(i).Take(batchSize).ToList();
        var sendTasks = batch.Select(email => context.CallActivityAsync(nameof(SendEmailHandler), email)).ToList();
        await Task.WhenAll(sendTasks);
    }
}
```

### 3. Enviar el Correo  
La actividad (`SendEmailHandler`) usa SMTP o una API (ej. Brevo) para el envío real.  
```csharp
[Function("SendEmailHandler")]
public static async Task SendEmailHandler([ActivityTrigger] Email email, FunctionContext executionContext)
{
    var logger = executionContext.GetLogger("SendEmailHandler");
    if (!email.IsApiCall())
    {
        await SendEmailAsync(email, "Cuerpo del correo", logger); // SMTP
    }
    else
    {
        await SendBrevoEmailAsync(email, "Cuerpo del correo", logger); // API
    }
}
```

## Paralelismo: Cómo Funciona  
- **Por Cliente**: El orquestador principal ejecuta hasta `maxParallelClients` suborquestadores en paralelo (ej. 5 clientes a la vez).  
- **Por Lote**: Cada suborquestador envía correos en lotes de `batchSize` (ej. 5 correos por iteración).  
Esto maximiza la eficiencia sin saturar el sistema. Ajusta estos valores según la carga y los recursos disponibles.

## Limitaciones a Tener en Cuenta  
- **Tiempo de Ejecución**: Las Durable Functions tienen un límite (configurable, pero finito). Si la orquestación tarda demasiado, falla.  
- **Escalabilidad**: Aunque es serverless, hay un tope de instancias simultáneas. Demasiados clientes o correos pueden requerir ajustes.  
- **Latencia**: El estado se guarda en almacenamiento duradero (ej. Azure Storage), lo que puede ralentizar operaciones masivas.  
Para mitigar esto, optimiza lotes y controla el paralelismo.

## Por Qué Vale la Pena  
Con este enfoque serverless eliminas servidores físicos, reduces costos y escalas según demanda. Ideal para organizaciones que quieren modernizar sin complicaciones.

## Siguientes Pasos  
- Añadir monitoreo con Application Insights.  
- Ajustar `maxParallelClients` y `batchSize` según tus necesidades.  
- Integrar con otras herramientas de Azure para más funcionalidades.

## ¡Comparte tu Experiencia!
¿Has implementado algo similar con Azure Durable Functions? ¿Tienes preguntas o sugerencias sobre este enfoque? ¡Déjame un comentario abajo! Me encantaría saber tu opinión y aprender de tus experiencias.

También puedes seguirme en [GitHub](https://github.com/freddan58) o [X](https://x.com/freddan58) para más contenido sobre Azure y serverless.