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

## Aplicación y comprobación

Código operativo: commit `e7dc4be6a44072e3267466dd96e5b7e9a40c02a4`, subido y
contrastado con `origin/main` antes de instalar. Aplicación del wrapper y el
MU-plugin: 27/10/2026 a las 22:21:31 UTC, mediante sustitución atómica y
respaldo privado. Los hashes instalados coincidieron con los versionados.

La siguiente ejecución programada del cron terminó correctamente; no hubo
nuevos avisos `SCRIPT_NAME` en la ventana revisada. No se ejecutó WordPress
manualmente para forzar tareas. La lectura autenticada del administrador mostró
el nuevo MU-plugin, HTTP 200 y la barra sin la minigráfica. No se cambiaron
opciones de Jetpack, precios, stock, pausa o pagos. Los procesos principales
se conservaron: no se reiniciaron servicios ni se pausaron tiendas.

48 pruebas Node, ESLint dirigido, sintaxis PHP 8.4 y prueba PHP sintética del
callback correctos. Se verificaron portada HTTP 200 y bloqueo público del
estado FPM con HTTP 404. La configuración de logs versionada coincide con la
activa; los fragmentos se documentan sin exponer registros reales.

El push generó también el despliegue del frontend
`dpl_3C95qig1dqwr6snzmQUVQDd9Gt2w`, READY, con los dominios productivos.
Ese despliegue de Vercel no instala PHP en el VPS: la aplicación del backend
se hizo de forma separada según el procedimiento anterior.

Quedan para diagnóstico específico la lentitud de una petición histórica de
checkout y una advertencia de requisitos PDF observada en el admin. No se
ocultó el aviso, no se emitieron facturas ni se habilitaron capacidades de
servidor para hacerlo desaparecer. No se certifica capacidad de lanzamiento
sin una prueba de concurrencia representativa y aislada.
