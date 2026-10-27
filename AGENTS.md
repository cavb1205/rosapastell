<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repositorio y producción

- Todo cambio que llegue a producción debe quedar versionado y subido al
  repositorio correspondiente. No dar por terminado un despliegue con código
  únicamente local o publicado desde una copia sin commit/push.
- Antes de promover un despliegue, crear un commit acotado con su código,
  pruebas y documentación relevante, subirlo y verificar que la rama remota
  contiene ese commit. No incluir cambios pendientes ajenos a la tarea.
- Registrar la relación entre la revisión de código, el despliegue y las
  comprobaciones realizadas. Comprobar el resultado del despliegue automático
  cuando el push lo active.
- Los cambios de configuración productiva deben conservar una representación
  reproducible y sin secretos en su repositorio. Nunca subir credenciales,
  archivos de entorno, llaves privadas, respaldos o datos de clientes.
