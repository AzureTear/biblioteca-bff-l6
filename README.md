# biblioteca-bff-l6

El BFF del proyecto guía de DSY1107, **tal como queda al terminar L4 · La cadena completa**. Es el
punto de partida de **L6 · RabbitMQ y tu primer mensaje** para quien no llegó a terminar L4: haces
fork, le pones tus valores y arrancas L6 desde el mismo lugar que el resto del curso.

Si ya tienes tu propio `biblioteca-bff` con L4 completo, **no necesitas este repositorio**: sigue con
el tuyo.

## Qué hay en cada archivo

| Archivo | Qué es |
|---|---|
| `src/main.ts` | Arranque de Nest, puerto **3000** |
| `src/app.module.ts` | Módulo raíz: `ConfigModule` global más `PanelModule` |
| `src/auth/jwt.guard.ts` | `JwtGuard`: verifica firma, `iss`, `token_use` y `client_id` contra el JWKS de Cognito, y deja `req.usuario` con `sub`, `scope` y `grupos` |
| `src/auth/roles.decorator.ts` | `@Roles(...grupos)`: anota qué grupos exige una ruta |
| `src/auth/rol.guard.ts` | `RolGuard`: lee la anotación de `@Roles` y la compara con `req.usuario.grupos` |
| `src/panel/panel.service.ts` | La lógica: llama a `LIBROS_URL` y `PRESTAMOS_URL` en paralelo, cruza los datos, filtra por dueño y valida las escrituras |
| `src/panel/panel.controller.ts` | Las rutas HTTP del panel |

## Las rutas que sirve

| Método y ruta | Guards | Qué hace | Llama a |
|---|---|---|---|
| `GET /panel` | `JwtGuard` | Los préstamos del usuario del token, con su libro cruzado | `LIBROS_URL` y `PRESTAMOS_URL`, en paralelo |
| `GET /panel/serie` | `JwtGuard` | Lo mismo, en serie, solo para medir la diferencia con el paralelo | Los mismos, uno tras otro |
| `GET /panel/todos` | `JwtGuard`, `RolGuard` + `@Roles('bibliotecarios')` | Los préstamos de todos | Los mismos |
| `POST /panel/prestamos` | `JwtGuard` | Crea un préstamo del `libroId` del cuerpo a nombre del `sub` del token | `PRESTAMOS_URL` (`POST`) |
| `DELETE /panel/prestamos/:id` | `JwtGuard` | Marca un préstamo como devuelto, solo si es del `sub` del token | `PRESTAMOS_URL` (`DELETE`) |

Sin token, las cinco responden **401**. Con un token válido sin el grupo `bibliotecarios`,
`/panel/todos` responde **403**. El gateway las publica como `/v1/panel...`.

## Cómo usarlo

Necesitas **Node 24.15.0 o superior** y **npm 11** (`node -v`, `npm -v`).

**1 · Fork y clon.** Abre [github.com/Umbingelelo/biblioteca-bff-l6](https://github.com/Umbingelelo/biblioteca-bff-l6)
y aprieta **Fork**. Si ya tienes una carpeta `biblioteca-bff` de antes, renómbrala primero a
`biblioteca-bff-anterior`. Después, parado en `$HOME/DSY1107`, los mismos comandos sirven en Windows
(PowerShell), macOS y Linux, uno por línea:

```bash
cd $HOME/DSY1107
git clone https://github.com/TU_USUARIO/biblioteca-bff-l6.git biblioteca-bff
cd biblioteca-bff
npm install
cp .env.example .env
```

Si clonaste `Umbingelelo/biblioteca-bff-l6` sin forkear, lo notas recién en el `git push` (un 403):
forkea y `git remote set-url origin https://github.com/TU_USUARIO/biblioteca-bff-l6.git`, sin volver a
clonar.

**2 · El `.env`.** Completa `COGNITO_ISSUER` y `COGNITO_CLIENT_ID` con los valores de tu ficha: son
los mismos que usa tu gateway. `LIBROS_URL` y `PRESTAMOS_URL` ya vienen con los puertos del curso.

**3 · Arráncalo** en su propia terminal:

```bash
npm run start:dev
```

Si falta una variable, no arranca y te dice cuál: `Configuration key "COGNITO_ISSUER" does not exist`.

## Cómo se comprueba

Es la fila del BFF en «Antes de empezar» §1 de L6: **el BFF levanta en 3000 y `/panel` responde con
el token de `lector@`**. Con los dos microservicios de `L1-gateway` corriendo y un access token vigente
de `lector@biblioteca.test` —el del tramo 6 de L3; si no lo tienes, el README de `biblioteca-web-l6`
explica cómo copiarlo desde el navegador—:

**Windows (PowerShell):**

```powershell
$t = "<TOKEN_LECTOR>"
curl.exe -i http://localhost:3000/panel
curl.exe -i -H "Authorization: Bearer $t" http://localhost:3000/panel
```

**macOS y Linux:**

```bash
t="<TOKEN_LECTOR>"
curl -i http://localhost:3000/panel
curl -i -H "Authorization: Bearer $t" http://localhost:3000/panel
```

**Qué tienes que ver:** **401** sin cabecera y **200** con el token, con tus préstamos y su libro
cruzado.

## Lo que este repositorio NO trae

Nada de L6. El método `enviar` de `panel.service.ts` todavía **no reenvía** la cabecera
`Authorization` a `prestamos.mjs`: eso lo agregas tú en **L6 §4.2**, cuando `prestamos.mjs` empieza a
publicar `prestamo.creado` y necesita el token para saber de quién es el préstamo.

`test/app.e2e-spec.ts` es el que dejó `nest new` y prueba un `GET /` que L4 borró. No es parte del
laboratorio: no lo corras.
