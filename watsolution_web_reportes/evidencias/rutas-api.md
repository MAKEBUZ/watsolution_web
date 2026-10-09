# Inventario estático de rutas HTTP

Roles exactos; ROLE_ADMIN no implica ROLE_USER. Webhook valida firma; refresh valida cookie/token. Las rutas de Swagger y Socket.IO se describen en el reporte backend.

| Método | Ruta | Guardas | Roles | Ubicación |
|---|---|---|---|---|
| POST | /api/register | Sin guarda JWT | sin rol específico | server/src/web/rest/account.controller.ts:33 |
| GET | /api/activate | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/account.controller.ts:44 |
| GET | /api/authenticate | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:57 |
| GET | /api/account | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:70 |
| POST | /api/account | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:84 |
| POST | /api/account/change-password | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:99 |
| POST | /api/account/reset-password/init | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:114 |
| POST | /api/account/reset-password/finish | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/account.controller.ts:127 |
| GET | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:34 |
| GET | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:52 |
| POST | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:63 |
| PUT | /api/addresses | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:78 |
| PUT | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:91 |
| DELETE | /api/addresses/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/address.controller.ts:104 |
| GET | /api/admin/stats | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:57 |
| GET | /api/admin/dashboard | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:65 |
| GET | /api/admin/activity | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:73 |
| GET | /api/admin/users-with-status | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:81 |
| GET | /api/admin/people/:personId/qr | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:89 |
| POST | /api/admin/billing/generate | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/admin.controller.ts:125 |
| POST | /api/ai/chat | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/ai.controller.ts:13 |
| POST | /api/ai/admin/chat | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/ai.controller.ts:25 |
| POST | /api/ai/admin/seed-faqs | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/ai.controller.ts:36 |
| GET | /api/bold/hash | UseGuards(AuthGuard, RolesGuard, RecordAccessGuard) | Roles(RoleType.USER) | server/src/web/rest/bold.controller.ts:17 |
| POST | /api/bold/webhook | Sin guarda JWT | sin rol específico | server/src/web/rest/bold.controller.ts:27 |
| GET | /api/bold/result/:invoiceId | UseGuards(AuthGuard, RolesGuard, RecordAccessGuard) | Roles(RoleType.USER) | server/src/web/rest/bold.controller.ts:40 |
| GET | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:44 |
| GET | /api/invoices/by-person/:personId | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:62 |
| GET | /api/invoices/download/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:76 |
| GET | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:116 |
| POST | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:128 |
| POST | /api/invoices/:id/generate-pdf | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:154 |
| PUT | /api/invoices | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:197 |
| PUT | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:210 |
| DELETE | /api/invoices/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/invoice.controller.ts:223 |
| GET | /management/info | Sin guarda JWT | sin rol específico | server/src/web/rest/management.controller.ts:11 |
| GET | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:35 |
| GET | /api/meters/by-person/:personId | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:53 |
| GET | /api/meters/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:67 |
| POST | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:79 |
| PUT | /api/meters | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:94 |
| PUT | /api/meters/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:107 |
| DELETE | /api/meters/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/meter.controller.ts:120 |
| POST | /api/mobile/permit | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:15 |
| GET | /api/mobile/bootstrap | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:18 |
| POST | /api/mobile/sync/push | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/mobile.controller.ts:21 |
| POST | /api/mobile/assign | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/mobile.controller.ts:24 |
| GET | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/noticia.controller.ts:34 |
| GET | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/noticia.controller.ts:48 |
| POST | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:55 |
| PUT | /api/noticias | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:65 |
| PUT | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:74 |
| DELETE | /api/noticias/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/noticia.controller.ts:83 |
| GET | /api/notifications | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:17 |
| PATCH | /api/notifications/read-all | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:26 |
| GET | /api/notifications/unread-count | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN, RoleType.OPERATOR) | server/src/web/rest/notification.controller.ts:35 |
| GET | /api/people/me | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/person.controller.ts:47 |
| GET | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:57 |
| GET | /api/people/:id | UseGuards(AuthGuard, RolesGuard); UseGuards(RecordAccessGuard) | Roles(RoleType.USER, RoleType.ADMIN) | server/src/web/rest/person.controller.ts:71 |
| POST | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:79 |
| PUT | /api/people | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:141 |
| PUT | /api/people/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:159 |
| DELETE | /api/people/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/person.controller.ts:176 |
| GET | /api/portal/dashboard | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.USER) | server/src/web/rest/portal.controller.ts:19 |
| GET | /api/public/noticias | Sin guarda JWT | sin rol específico | server/src/web/rest/public-noticias.controller.ts:15 |
| GET | /api/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/public.user.controller.ts:19 |
| GET | /api/authorities | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/public.user.controller.ts:39 |
| GET | /api/reportes | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:34 |
| GET | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:48 |
| POST | /api/reportes | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:55 |
| PUT | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:65 |
| DELETE | /api/reportes/:id | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/reporte.controller.ts:74 |
| POST | /api/session/refresh | Sin guarda JWT | sin rol específico | server/src/web/rest/session.controller.ts:12 |
| POST | /api/session/logout | UseGuards(AuthGuard) | sin rol específico | server/src/web/rest/session.controller.ts:22 |
| GET | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:43 |
| POST | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:62 |
| PUT | /api/admin/users | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:78 |
| GET | /api/admin/users/:login | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:105 |
| DELETE | /api/admin/users/:login | UseGuards(AuthGuard, RolesGuard) | Roles(RoleType.ADMIN) | server/src/web/rest/user.controller.ts:117 |
| POST | /api/authenticate | Sin guarda JWT | sin rol específico | server/src/web/rest/user.jwt.controller.ts:17 |