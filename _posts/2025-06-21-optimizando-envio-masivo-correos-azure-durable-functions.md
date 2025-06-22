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
El orquestador (`SendEmailOrchestrator`) obtiene los correos pendientes desde endpoints configurables y los distribuye por cliente en paralelo, con monitoreo vía Application Insights.  
```csharp
[Function("SendEmailOrchestrator")]
public static async Task<List<string>> SendEmailOrchestrator(
    [OrchestrationTrigger] TaskOrchestrationContext context)
{
    var emails = await context.CallActivityAsync<List<Email>>(nameof(GetEmailsToSend), null);
    var distinctClients = emails.GroupBy(e => e.SystemSerial).Select(g => g.Key);
    int maxParallelClients = int.Parse(_configuration["maxParallelClients"] ?? "5");
    var parallelTasks = distinctClients.Take(maxParallelClients).Select(client =>
        context.CallSubOrchestratorAsync(nameof(SendEmailsToClientOrchestrator), new { ClientName = client, Emails = emails })
    ).ToList();
    await Task.WhenAll(parallelTasks);
    return new List<string> { "Orquestación completada" };
}
```

### 2. Suborquestador por Cliente  
Cada cliente tiene un suborquestador (`SendEmailsToClientOrchestrator`) que envía correos en lotes, manejando hasta `QtyEmails` por iteración.  
```csharp
[Function("SendEmailsToClientOrchestrator")]
public static async Task SendEmailsToClientOrchestrator(
    [OrchestrationTrigger] TaskOrchestrationContext context)
{
    var input = context.GetInput<dynamic>();
    var clientEmails = input.Emails.Where(e => e.SystemSerial == input.ClientName).Take(int.Parse(_configuration["QtyEmails"] ?? "5")).ToList();
    int batchSize = int.Parse(_configuration["batchSize"] ?? "5");
    for (int i = 0; i < clientEmails.Count; i += batchSize)
    {
        var batch = clientEmails.Skip(i).Take(batchSize).ToList();
        var sendTasks = batch.Select(email => context.CallActivityAsync(nameof(SendEmailHandler), email)).ToList();
        await Task.WhenAll(sendTasks);
    }
}
```

### 3. Enviar el Correo  
La actividad (`SendEmailHandler`) usa SMTP o la API de Brevo, con reintentos y telemetría para cada envío.  
```csharp
[Function("SendEmailHandler")]
public static async Task SendEmailHandler([ActivityTrigger] Email email, FunctionContext executionContext)
{
    var logger = executionContext.GetLogger("SendEmailHandler");
    if (!email.IsApiCall())
    {
        await SendEmailAsync(email, "Cuerpo del correo", logger); // SMTP con reintentos
    }
    else
    {
        await SendBrevoEmailAsync(email, "Cuerpo del correo", logger); // API Brevo
    }
}
```

## Paralelismo: Cómo Funciona  
- **Por Cliente**: El orquestador ejecuta hasta `maxParallelClients` suborquestadores en paralelo (e.g., 5 clientes).  
- **Por Lote**: Cada suborquestador procesa lotes de `batchSize` correos (e.g., 5 por iteración).  
La configuración se lee de `servers.json` y variables de entorno, optimizando recursos según la carga.

## Limitaciones a Tener en Cuenta  
- **Tiempo de Ejecución**: El límite por defecto es 5 minutos, extensible a 10 minutos con `functionTimeout`. Excederlo causa fallos.  
- **Escalabilidad**: Hasta 200 instancias simultáneas por región; ajustar `maxParallelClients` evita saturación.  
- **Latencia**: Almacenamiento duradero introduce retrasos; optimiza lotes y usa índices en `GetEmailsToSend`.  
- **Dependencias**: Requiere endpoints externos funcionales y claves API válidas (e.g., Brevo).

## Por Qué Vale la Pena  
Con este enfoque serverless eliminas servidores físicos, reduces costos y escalas según demanda. La telemetría de Application Insights ayuda a diagnosticar problemas en tiempo real.

## Siguientes Pasos  
- Ajustar `maxParallelClients` y `batchSize` según tu infraestructura.  
- Integrar autenticación en endpoints externos.  
- Explorar optimizaciones con Azure Monitor.  

## Código Fuente Completo  
Visita el repositorio [AzureDurableEmailOrchestration](https://github.com/freddan58/AzureDurableEmailOrchestration) para ver el código completo, incluyendo manejo de errores, telemetría y configuraciones.

## ¡Comparte tu Experiencia!  
¿Has implementado algo similar con Azure Durable Functions? ¿Tienes preguntas o sugerencias? ¡Déjame un comentario abajo! Me encantaría saber tu opinión y aprender de tus experiencias.  

También puedes seguirme en [GitHub](https://github.com/freddan58) o [X](https://x.com/freddan58) para más contenido sobre Azure y serverless.