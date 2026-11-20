# Incorporación a Rosa Pastell

Esta guía se puede compartir. No contiene credenciales ni concede permisos.
Pide al titular del proyecto la ficha operativa privada para coordinar el alta.

## Qué acceso pedir

| Si vas a trabajar en… | Pide al titular… |
| --- | --- |
| Código | Colaboración en GitHub para ramas y pull requests. Clonar el repositorio público no requiere invitación. |
| Frontend y despliegues | Acceso al proyecto Vercel para previews y logs; permisos de producción solo si tendrás ese rol. |
| Catálogo, stock, precios o pedidos | Usuario propio en WordPress, con permisos acordes a la tarea. No necesitas SSH para operar la tienda. |
| Backend e infraestructura | Alta SSH con tu usuario y tu llave pública; privilegios administrativos solo si son necesarios. Si el rol lo requiere, acceso al proyecto del proveedor del VPS y a su consola de recuperación. |
| Correo transaccional | Acceso a Resend para verificar entregas y rebotes. No necesitas recibir la clave de envío para revisar entregas. |
| Dominio o pagos | Acceso a DNS/registrador o Wompi únicamente si operarás esa integración y con autorización del titular. |

Usa cuentas individuales y MFA donde esté disponible. El titular registra en
privado quién aprueba, qué se concedió y cuándo revisarlo o revocarlo. No se
comparten cuentas personales, contraseñas, llaves SSH privadas ni códigos MFA.

## Entorno local

Usa Node.js 22 (Next.js en este repo requiere al menos 20.9) y npm. Clona el
repositorio, crea tu rama y solicita configuración de **pruebas** antes de
iniciar. Usa un WooCommerce aislado con datos ficticios; si no está disponible,
puedes correr las pruebas de Node sin conectarte a la tienda. Un preview no es
un entorno aislado si sus credenciales apuntan a producción.

```sh
npm ci
node --test tests/*.test.cjs
npm run dev
```

Con el entorno de pruebas configurado, abre [localhost:3000](http://localhost:3000).
Guarda variables locales en `.env.local` (ignorado por Git). En Vercel, separa
Development, Preview y Production; no descargues credenciales productivas al
equipo para desarrollar.

| Uso | Nombres de variables, sin valores |
| --- | --- |
| WooCommerce | `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET` |
| Webhooks de WooCommerce | `WOOCOMMERCE_WEBHOOK_SECRET` |
| Correo | `RESEND_API_KEY`, `EMAIL_FROM` |
| Frontend | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Wompi, solo para pruebas autorizadas de la integración | `NEXT_PUBLIC_WOMPI_ENABLED`, `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET` |

Las variables `NEXT_PUBLIC_*` son visibles en el navegador. Para el trabajo
habitual deja Wompi deshabilitado y no configures credenciales reales de
envío. No redirijas webhooks de producción a un preview.

## Antes de desplegar

1. Valida en la rama con las pruebas pertinentes. Para un cambio PHP, usa
   la versión del backend, revisa sintaxis y ejecuta las pruebas aplicables
   sin datos reales. Para Next.js, sigue también [AGENTS.md](../AGENTS.md).
2. Separa los cambios de otros trabajos, crea el commit, súbelo y verifica
   que la rama remota contiene el commit. La integración con `main` puede
   disparar el despliegue productivo del frontend: coordina antes de integrar.
3. Vercel no instala PHP en el VPS. Para cambios de backend, conserva un
   respaldo privado acotado, aplica solo los archivos del commit acordado
   y sigue la [guía operativa](../ops/rosapastell/README.md).
4. Confirma revisión, destino y estado del despliegue; verifica navegación
   y salud sin crear pedidos, mover stock, emitir facturas ni enviar correos
   reales. Registra la revisión y el resultado sanitizado. Para revertir,
   recupera solo el código/configuración afectado; no reemplaces la base con
   una copia anterior.

No guardes en Git inventarios privados, respaldos, llaves, archivos de entorno,
logs reales ni datos de clientes. Si trabajas en Rosa, no intervengas el otro
sitio del VPS compartido. Cambios de DNS, accesos, pagos y recuperación se
coordinan explícitamente con el titular.
