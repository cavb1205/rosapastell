# Privacidad de usuarios en la API: 20 de noviembre de 2026

## Cambio publicado

Nuevo MU-plugin `wordpress/rosapastell-user-privacy.php` (0.1.0, commit
`12db210`). Antes, cualquier visitante podía ver por la REST API los nombres y
slugs de las cuentas con contenido publicado, incluida la del administrador.
También aparecían en el autor incrustado de `posts?_embed` y en el oEmbed,
cuyo `author_url` contenía el nombre de usuario. Eso facilita los ataques de
fuerza bruta contra el login.

- `/wp/v2/users` y `/wp/v2/users/<id>` responden 401 (anónimos) o 403 (con
  sesión) a quien no tenga `edit_posts` ni `list_users`. La comparación no
  distingue mayúsculas, igual que WordPress, y bloquea también el autor
  incrustado con `?_embed`. Un cliente con sesión puede seguir leyendo su
  propio registro por ID.
- `/wp/v2/users/me` no cambia: el frontend lo usa con JWT para el login, el
  perfil y el cambio de contraseña. Administradores, gestores de tienda y
  editores conservan las listas de autores del admin.
- El oEmbed ya no publica `author_name` ni `author_url`.

No cambian opciones, usuarios, roles, contraseñas, pedidos ni inventario.

## Evidencia

- Prueba PHP aislada `tests/user-privacy.test.php`, con el PHP 8.4.28 del
  backend: sintaxis y prueba correctas. 48/48 pruebas Node.
- Commit subido y verificado en `origin/main` antes de instalar.
- Instalado como `root:rp_rosa_stage` 0640 con ACL de lectura para
  `www-data`. SHA-256 instalado igual al del repositorio:
  `e4bf1e16acbaf46a58c97de34ce8ae625c163c6bff907ee4759212bc75a566e2`.
  No hizo falta recargar servicios.
- En producción:
  - El listado, la consulta por ID, la variante con mayúsculas, `?search=` y
    la barra final responden 401.
  - El autor de `?_embed` ya no aparece y el oEmbed no trae autor.
  - `/users/me` se comporta igual: 401 sin token y error de JWT con un token
    inválido.
  - Funcionan el login JWT, el prechequeo de stock, el estado de la tienda y
    las páginas de `www`. `wc/v3` sigue exigiendo autenticación.
- No se probó un inicio de sesión real de cliente, porque no se usaron
  credenciales. La prueba aislada cubre `/users/me` y el registro propio.

## Reversión

Mover solo `wp-content/mu-plugins/rosapastell-user-privacy.php` fuera de
`mu-plugins/`, a un respaldo privado. No requiere recargar servicios ni tocar
datos.
