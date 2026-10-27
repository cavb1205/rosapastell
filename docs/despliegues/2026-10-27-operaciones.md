# Versionado y mantenimiento acotado del backend — 27/10/2026

## Código y configuración incluidos

- Plugin propio de precios por rol: versión 0.1.1, contrastado por SHA-256
  con el código productivo. Se incorpora al repositorio sin cambiarlo,
  reinstalarlo o alterar precios/metadatos.
- Fragmentos reproducibles de Nginx/FPM y logrotate de la instrumentación
  privada, junto con instrucciones de integración y reversión en
  `ops/rosapastell/README.md`. No son una configuración completa del VPS.
- Wrapper cron: define `SCRIPT_NAME` antes de cargar WordPress. Conserva la
  comprobación del entorno/base, la ejecución nativa y el horario existente.
- MU-plugin administrativo: retira únicamente la minigráfica automática de
  Jetpack del admin. No cambia CDN, opciones, módulos, credenciales o egress.
- Pruebas de configuración y prueba PHP aislada de la retirada del callback.

Los archivos nuevos deben estar en la rama remota antes de instalarlos.
Registrar el resultado de aplicación en una revisión posterior; este documento
describe la preparación, no afirma por adelantado que el servidor cambió.

## Medición y decisiones

Se contrastaron ventanas de igual duración antes/después de la 404. La forma
de consulta que antes solicitaba productos populares desapareció de la
ventana posterior. Hubo menor tráfico y distinta mezcla de solicitudes:
no se atribuye toda la reducción de latencia al parche ni se promete un
porcentaje de mejora o capacidad para un lanzamiento.

Se mantienen seis procesos PHP. No se ejecutó carga artificial, compra,
reserva o correo de prueba. No quedaban tareas Yoast programadas al revisar:
no corresponde borrarlas ni modificar la base por ese aviso histórico.

La minigráfica intentaba obtener una imagen remota no disponible bajo la
política de salida. Se evita su petición automática sin ampliar conectividad.
Esto no habilita el servicio remoto ni asegura que toda pantalla de Jetpack
funcione. Una solicitud de checkout lenta observada en el registro histórico
requiere investigación separada; no se modifican transacciones por intuición.

## Alcance de privacidad

Este repositorio es público. Los informes detallados de seguridad/migración,
respaldos, telemetría y datos operativos reales permanecen privados. Aquí se
versionan el código verificable, la configuración sin secretos y este resumen.

Wompi, almacenamiento externo, credenciales, parches de sistema y cambios del
POS no forman parte de esta intervención. No contratar servicios, abrir
destinos de red, rotar claves o tocar una caja como consecuencia de este commit.
