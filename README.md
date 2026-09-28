# biblioteca-bff

Este es el BFF del proyecto guia de DSY1107, tal como queda al terminar **L4 - La cadena
completa**. Es el punto de partida de **L6 - RabbitMQ y tu primer mensaje**: si llegaste a esa
sesion sin haber terminado L4, clona este repositorio en vez de tu propio codigo y sigue desde ahi.

No trae nada de L6: el `enviar` de `panel.service.ts` todavia no reenvia la cabecera
`Authorization` al microservicio de prestamos. Eso lo agregas tu en L6 S4.2.

## Que hay en cada carpeta

| Archivo | Que es |
|---|---|
| `src/main.ts` | Arranque de Nest, puerto 3000 |
| `src/app.module.ts` | Modulo raiz: `ConfigModule` global mas `PanelModule` |
| `src/auth/jwt.guard.ts` | `JwtGuard` - verifica firma, `iss`, `token_use` y `client_id` contra el JWKS de Cognito. Deja `req.usuario` con `sub`, `scope` y `grupos` |
| `src/auth/roles.decorator.ts` | `@Roles(...grupos)` - anota que grupos exige una ruta |
| `src/auth/rol.guard.ts` | `RolGuard` - lee la anotacion de `@Roles` y compara contra `req.usuario.grupos` |
| `src/panel/panel.service.ts` | Logica: llama a `LIBROS_URL` y `PRESTAMOS_URL` en paralelo, cruza los datos, filtra por dueno y valida las escrituras |
| `src/panel/panel.controller.ts` | Rutas HTTP del panel |

## Las rutas que sirve

| Metodo y ruta | Guards | Que hace | Llama a |
|---|---|---|---|
| `GET /panel` | `JwtGuard` | Los prestamos del usuario del token, con su libro cruzado | `LIBROS_URL`, `PRESTAMOS_URL` en paralelo |
| `GET /panel/serie` | `JwtGuard` | Lo mismo que `/panel` pero en serie, solo para medir la diferencia con el paralelo | idem, uno tras otro |
| `GET /panel/todos` | `JwtGuard`, `RolGuard` + `@Roles('bibliotecarios')` | Los prestamos de todos los usuarios | idem |
| `POST /panel/prestamos` | `JwtGuard` | Crea un prestamo del `libroId` del cuerpo a nombre del `sub` del token | `PRESTAMOS_URL` (POST) |
| `DELETE /panel/prestamos/:id` | `JwtGuard` | Marca un prestamo como devuelto, solo si es del `sub` del token | `PRESTAMOS_URL` (DELETE) |

Sin token, las cinco responden **401**. Con un token valido pero sin el grupo `bibliotecarios`,
`/panel/todos` responde **403**. El resto de rutas no exige ningun grupo.

## Como usarlo si no terminaste L4

Desde `$HOME/DSY1107` (haz fork del repo en GitHub primero):

```
git clone https://github.com/TU_USUARIO/biblioteca-bff-l6.git biblioteca-bff
cd biblioteca-bff
npm install
```

Copia `.env.example` a `.env` y completa `COGNITO_ISSUER` y `COGNITO_CLIENT_ID` con los valores de
tu ficha (los mismos que usa el gateway). `LIBROS_URL` y `PRESTAMOS_URL` ya vienen con los puertos
correctos si corres los microservicios como en L1/L4.

```
npm run start:dev
```

Si ya tenias una carpeta `biblioteca-bff`, renombrala primero (por ejemplo
`biblioteca-bff-anterior`) antes de clonar esta.

## Como se comprueba

La fila del BFF en la tabla "Antes de empezar" S1 de L6: **el BFF levanta en 3000 y `/panel`
responde con el token de `lector@`**. Con `npm run start:dev` corriendo, y un access token vigente
de `lector@biblioteca.test` en `$t`:

```
curl.exe -i http://localhost:3000/panel
curl.exe -i -H "Authorization: Bearer $t" http://localhost:3000/panel
```

Tiene que dar **401** sin cabecera y **200** con el token, con tus prestamos y su libro cruzado.

## Lo que no trae

Nada de L6: no hay `amqplib`, no hay `servicios/package.json` ni `servicios/.env`, y `enviar` en
`panel.service.ts` no reenvia el `Authorization` hacia `prestamos.mjs`. Eso es exactamente lo que
agregas en L6 S4.2, cuando `prestamos.mjs` empieza a publicar el evento `prestamo.creado` y necesita
el token para saber de quien es el prestamo.
