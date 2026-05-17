<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeSection = ref('s1');
const showBackTop = ref(false);

const sections = [
  { id: 's1',  num: '1',  title: 'Identificación del Responsable' },
  { id: 's2',  num: '2',  title: 'Alcance de la Política' },
  { id: 's3',  num: '3',  title: 'Definiciones' },
  { id: 's4',  num: '4',  title: 'Finalidades del Tratamiento' },
  { id: 's5',  num: '5',  title: 'Datos Personales Recopilados' },
  { id: 's6',  num: '6',  title: 'Derechos del Titular' },
  { id: 's7',  num: '7',  title: 'Mecanismos para Ejercer los Derechos' },
  { id: 's8',  num: '8',  title: 'Deberes del Responsable' },
  { id: 's9',  num: '9',  title: 'Medidas de Seguridad' },
  { id: 's10', num: '10', title: 'Transferencia de Datos' },
  { id: 's11', num: '11', title: 'Retención y Supresión' },
  { id: 's12', num: '12', title: 'Cookies' },
  { id: 's13', num: '13', title: 'Menores de Edad' },
  { id: 's14', num: '14', title: 'Vigencia y Modificaciones' },
  { id: 's15', num: '15', title: 'Autorización' },
  { id: 's16', num: '16', title: 'Marco Normativo' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

function onScroll() {
  showBackTop.value = window.scrollY > 400;
  for (const s of [...sections].reverse()) {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= 120) {
      activeSection.value = s.id;
      break;
    }
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <div class="pp-root">

    <!-- ── Hero ─────────────────────────────────────────────────── -->
    <header class="pp-hero">
      <div class="pp-hero__waves" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 60 C360 120 1080 0 1440 60 L1440 120 L0 120 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M0 80 C480 20 960 110 1440 50 L1440 120 L0 120 Z" fill="rgba(255,255,255,0.08)" />
        </svg>
      </div>
      <div class="pp-hero__inner">
        <div class="pp-hero__badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
          </svg>
        </div>
        <h1 class="pp-hero__title">Política de Privacidad y Protección de Datos</h1>
        <p class="pp-hero__org">Asociación Junta Administradora Acueducto Juanoy · NIT 900.009.297-6</p>
        <div class="pp-hero__meta">
          <span>Vigente desde: Mayo 2026</span>
          <span>Versión 1.0</span>
          <span>Ley 1581 de 2012</span>
        </div>
      </div>
    </header>

    <div class="pp-body">

      <!-- ── Sidebar nav ──────────────────────────────────────────── -->
      <aside class="pp-nav">
        <p class="pp-nav__label">Contenido</p>
        <nav>
          <button
            v-for="s in sections"
            :key="s.id"
            class="pp-nav__item"
            :class="{ 'pp-nav__item--active': activeSection === s.id }"
            @click="scrollTo(s.id)"
          >
            <span class="pp-nav__num">{{ s.num }}</span>
            <span class="pp-nav__text">{{ s.title }}</span>
          </button>
        </nav>
        <button class="pp-nav__back" @click="router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver
        </button>
      </aside>

      <!-- ── Main content ─────────────────────────────────────────── -->
      <main class="pp-main">

        <!-- 1 -->
        <section :id="'s1'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">1</span>
            <h2>Identificación del Responsable del Tratamiento</h2>
          </div>
          <p class="pp-text">En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> (Régimen de Protección de Datos Personales de Colombia), la entidad que se describe a continuación actúa como Responsable del tratamiento de los datos personales recopilados a través de la plataforma WatSolution.</p>
          <div class="pp-info-grid">
            <div class="pp-info-card">
              <div class="pp-info-card__icon">🏛️</div>
              <div>
                <div class="pp-info-card__label">Razón Social</div>
                <div class="pp-info-card__val">Asociación Junta Administradora Acueducto Juanoy</div>
              </div>
            </div>
            <div class="pp-info-card">
              <div class="pp-info-card__icon">🔢</div>
              <div>
                <div class="pp-info-card__label">NIT</div>
                <div class="pp-info-card__val">900.009.297-6</div>
              </div>
            </div>
            <div class="pp-info-card">
              <div class="pp-info-card__icon">📍</div>
              <div>
                <div class="pp-info-card__label">Domicilio</div>
                <div class="pp-info-card__val">San Juan de Pasto, Nariño, Colombia</div>
              </div>
            </div>
            <div class="pp-info-card">
              <div class="pp-info-card__icon">📧</div>
              <div>
                <div class="pp-info-card__label">Correo Habeas Data</div>
                <div class="pp-info-card__val">habeasdata@acueductojuanoy.com</div>
              </div>
            </div>
            <div class="pp-info-card">
              <div class="pp-info-card__icon">📱</div>
              <div>
                <div class="pp-info-card__label">Contacto</div>
                <div class="pp-info-card__val">3154536292 / 3127731946</div>
              </div>
            </div>
            <div class="pp-info-card">
              <div class="pp-info-card__icon">🌐</div>
              <div>
                <div class="pp-info-card__label">Plataforma</div>
                <div class="pp-info-card__val">WatSolution — watsolutionweb-production.up.railway.app</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2 -->
        <section :id="'s2'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">2</span>
            <h2>Alcance de la Política</h2>
          </div>
          <p class="pp-text">La presente política aplica a todos los datos personales recolectados, almacenados, procesados y transmitidos a través de los componentes de WatSolution:</p>
          <ul class="pp-list">
            <li>Portal web informativo</li>
            <li>Aplicación móvil para funcionarios del acueducto (Android 10+)</li>
            <li>Panel de usuario para suscriptores del acueducto</li>
            <li>Módulo de chatbot integrado en WhatsApp Business</li>
            <li>Sistema de notificaciones por WhatsApp y SMS</li>
            <li>Módulo de monitoreo del tanque principal (simulación IoT)</li>
            <li>Sistema de facturación, pagos y generación de recibos</li>
          </ul>
          <div class="pp-callout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Esta política cubre a todas las personas naturales cuyos datos sean tratados: suscriptores del acueducto, funcionarios y administradores de la Junta.
          </div>
        </section>

        <!-- 3 -->
        <section :id="'s3'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">3</span>
            <h2>Definiciones</h2>
          </div>
          <div class="pp-table-wrap">
            <table class="pp-table">
              <thead><tr><th>Término</th><th>Definición</th><th>Aplicación en WatSolution</th></tr></thead>
              <tbody>
                <tr><td><strong>Dato personal</strong></td><td>Cualquier información vinculada o que permita identificar a una persona natural.</td><td>Nombre, cédula, dirección, correo, teléfono, consumo de agua.</td></tr>
                <tr><td><strong>Dato sensible</strong></td><td>Información que afecta la intimidad o puede generar discriminación.</td><td>No se recopilan datos sensibles en WatSolution.</td></tr>
                <tr><td><strong>Titular</strong></td><td>Persona natural cuyos datos son objeto de tratamiento.</td><td>Suscriptores y funcionarios del Acueducto Juanoy.</td></tr>
                <tr><td><strong>Responsable</strong></td><td>Entidad que decide sobre el tratamiento de los datos.</td><td>Asociación Junta Administradora Acueducto Juanoy.</td></tr>
                <tr><td><strong>Encargado</strong></td><td>Persona que realiza el tratamiento por cuenta del responsable.</td><td>Desarrolladores del proyecto WatSolution.</td></tr>
                <tr><td><strong>Tratamiento</strong></td><td>Cualquier operación sobre datos personales.</td><td>Registro de consumos, facturación, envío de notificaciones.</td></tr>
                <tr><td><strong>Autorización</strong></td><td>Consentimiento previo, expreso e informado del titular.</td><td>Aceptación de esta política al registrarse.</td></tr>
                <tr><td><strong>Habeas data</strong></td><td>Derecho del titular a conocer, actualizar y rectificar sus datos.</td><td>Canal habeasdata@acueductojuanoy.com</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 4 -->
        <section :id="'s4'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">4</span>
            <h2>Finalidades del Tratamiento</h2>
          </div>
          <p class="pp-text">WatSolution aplica el principio de <strong>minimización de datos</strong>: los datos personales recolectados serán utilizados exclusivamente para las siguientes finalidades:</p>
          <div class="pp-purpose-grid">
            <div v-for="p in purposes" :key="p.icon" class="pp-purpose">
              <div class="pp-purpose__icon">{{ p.icon }}</div>
              <div class="pp-purpose__title">{{ p.title }}</div>
              <div class="pp-purpose__desc">{{ p.desc }}</div>
            </div>
          </div>
        </section>

        <!-- 5 -->
        <section :id="'s5'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">5</span>
            <h2>Datos Personales Recopilados</h2>
          </div>
          <div class="pp-data-cols">
            <div class="pp-data-group">
              <div class="pp-data-group__title">
                <span>👤</span> Suscriptores (usuarios del acueducto)
              </div>
              <ul class="pp-list pp-list--compact">
                <li>Nombre completo</li>
                <li>Número de documento de identidad (cédula)</li>
                <li>Dirección del inmueble y barrio</li>
                <li>Número de teléfono / celular</li>
                <li>Correo electrónico</li>
                <li>Número de suscriptor y número de medidor</li>
                <li>Historial de lecturas de consumo mensual</li>
                <li>Historial de facturas y estado de pago</li>
                <li>Estrato socioeconómico (para cálculo de tarifa)</li>
              </ul>
            </div>
            <div class="pp-data-group">
              <div class="pp-data-group__title">
                <span>🏢</span> Funcionarios y administradores
              </div>
              <ul class="pp-list pp-list--compact">
                <li>Nombre completo y número de documento</li>
                <li>Correo electrónico y número de celular</li>
                <li>Credenciales de acceso (correo + contraseña cifrada)</li>
                <li>Registro de actividad en la plataforma (log de auditoría)</li>
              </ul>
              <div class="pp-data-group__title" style="margin-top:16px">
                <span>🤖</span> Datos generados automáticamente
              </div>
              <ul class="pp-list pp-list--compact">
                <li>Fecha y hora de inicio de sesión</li>
                <li>Registros de sincronización offline-online</li>
                <li>Datos de uso de la plataforma (métricas de acceso)</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 6 -->
        <section :id="'s6'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">6</span>
            <h2>Derechos del Titular</h2>
          </div>
          <p class="pp-text">De conformidad con el <strong>Artículo 8 de la Ley 1581 de 2012</strong>, los titulares de datos personales tienen los siguientes derechos:</p>
          <div class="pp-rights-grid">
            <div v-for="r in rights" :key="r.title" class="pp-right">
              <div class="pp-right__icon">{{ r.icon }}</div>
              <div class="pp-right__title">{{ r.title }}</div>
              <div class="pp-right__desc">{{ r.desc }}</div>
            </div>
          </div>
          <div class="pp-callout pp-callout--warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Si considera que sus derechos han sido vulnerados puede acudir a la <strong>Superintendencia de Industria y Comercio (SIC)</strong>: www.sic.gov.co · Línea nacional: 01-8000-910-165
          </div>
        </section>

        <!-- 7 -->
        <section :id="'s7'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">7</span>
            <h2>Mecanismos para Ejercer los Derechos</h2>
          </div>
          <div class="pp-table-wrap">
            <table class="pp-table">
              <thead><tr><th>Canal</th><th>Descripción</th><th>Detalle</th></tr></thead>
              <tbody>
                <tr><td>📧 Correo electrónico</td><td>Canal principal para solicitudes habeas data</td><td>habeasdata@acueductojuanoy.com</td></tr>
                <tr><td>🏢 Atención presencial</td><td>Punto físico del acueducto Juanoy en Pasto, Nariño</td><td>Lunes a viernes, horario de atención del acueducto</td></tr>
                <tr><td>📞 Teléfono</td><td>Línea de atención de la Junta</td><td>3154536292 — 3127731946</td></tr>
                <tr><td>⏱ Consultas</td><td>Plazo máximo para responder solicitudes de acceso</td><td>10 días hábiles (prorrogables 5 días)</td></tr>
                <tr><td>⏱ Reclamos</td><td>Plazo para resolver reclamos de rectificación</td><td>15 días hábiles (prorrogables 8 días)</td></tr>
                <tr><td>📋 Requisitos</td><td>Información necesaria para tramitar la solicitud</td><td>Nombre completo, documento, descripción, contacto</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 8 -->
        <section :id="'s8'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">8</span>
            <h2>Deberes del Responsable del Tratamiento</h2>
          </div>
          <ul class="pp-list">
            <li>Garantizar al titular el pleno y efectivo ejercicio de sus derechos de habeas data.</li>
            <li>Solicitar y conservar copia de la autorización otorgada por el titular.</li>
            <li>Informar debidamente al titular sobre la finalidad del tratamiento.</li>
            <li>Conservar la información bajo condiciones de seguridad para impedir su adulteración, pérdida o acceso no autorizado.</li>
            <li>Garantizar que la información proporcionada al encargado sea veraz, completa y actualizada.</li>
            <li>Adoptar un manual interno de políticas y procedimientos para el cumplimiento de la Ley 1581 de 2012.</li>
            <li>Tramitar las consultas y reclamos en los términos señalados en la ley.</li>
            <li>Abstenerse de circular información cuyo tratamiento esté vetado por el titular o la ley.</li>
          </ul>
        </section>

        <!-- 9 -->
        <section :id="'s9'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">9</span>
            <h2>Medidas de Seguridad</h2>
          </div>
          <p class="pp-text">WatSolution implementa las siguientes medidas técnicas, humanas y administrativas para proteger los datos personales:</p>
          <div class="pp-security-grid">
            <div v-for="m in security" :key="m.title" class="pp-security">
              <div class="pp-security__icon">{{ m.icon }}</div>
              <div class="pp-security__title">{{ m.title }}</div>
              <div class="pp-security__desc">{{ m.desc }}</div>
            </div>
          </div>
        </section>

        <!-- 10 -->
        <section :id="'s10'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">10</span>
            <h2>Transferencia y Transmisión de Datos</h2>
          </div>
          <p class="pp-text">WatSolution <strong>no comparte ni vende datos personales a terceros con fines comerciales</strong>. Los datos únicamente se comparten con los siguientes prestadores de servicios en calidad de encargados del tratamiento:</p>
          <div class="pp-table-wrap">
            <table class="pp-table">
              <thead><tr><th>Proveedor</th><th>Propósito</th><th>Datos compartidos</th></tr></thead>
              <tbody>
                <tr><td>WhatsApp Business API (Meta)</td><td>Envío de notificaciones de facturación, pagos y soporte</td><td>Número de celular y contenido del mensaje</td></tr>
                <tr><td>Proveedor de SMS</td><td>Mensajes SMS como canal de respaldo</td><td>Número de celular y texto del mensaje</td></tr>
                <tr><td>Railway (Infraestructura)</td><td>Hospedaje del backend, BD PostgreSQL y almacenamiento S3</td><td>Todos los datos de la plataforma (bajo contrato)</td></tr>
                <tr><td>Pasarela PSE (futuro)</td><td>Pagos en línea (simulación en fase 1)</td><td>No se transmiten datos financieros reales en fase 1</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pp-callout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            WatSolution no realiza transferencias internacionales de datos. Toda la información se almacena y procesa bajo los términos de los proveedores mencionados.
          </div>
        </section>

        <!-- 11 -->
        <section :id="'s11'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">11</span>
            <h2>Retención y Supresión de Datos</h2>
          </div>
          <p class="pp-text">Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades del tratamiento y las obligaciones legales aplicables:</p>
          <div class="pp-retention-list">
            <div class="pp-retention-item">
              <div class="pp-retention-item__period">≥ 5 años</div>
              <div class="pp-retention-item__desc">Historial de consumo y facturación — en cumplimiento del Decreto 1076 de 2015 y normas contables del sector de agua potable.</div>
            </div>
            <div class="pp-retention-item">
              <div class="pp-retention-item__period">Vigencia contrato</div>
              <div class="pp-retention-item__desc">Datos de suscriptores activos — durante toda la vigencia del contrato de servicio de agua.</div>
            </div>
            <div class="pp-retention-item">
              <div class="pp-retention-item__period">Hasta 2 años</div>
              <div class="pp-retention-item__desc">Datos de suscriptores inactivos — después de la desactivación, salvo obligación legal de conservación mayor.</div>
            </div>
            <div class="pp-retention-item">
              <div class="pp-retention-item__period">≥ 2 años</div>
              <div class="pp-retention-item__desc">Logs de actividad y auditoría.</div>
            </div>
            <div class="pp-retention-item">
              <div class="pp-retention-item__period">Al expirar</div>
              <div class="pp-retention-item__desc">Datos de acceso (tokens, sesiones) — eliminados automáticamente al expirar la sesión.</div>
            </div>
          </div>
        </section>

        <!-- 12 -->
        <section :id="'s12'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">12</span>
            <h2>Uso de Cookies y Tecnologías Similares</h2>
          </div>
          <p class="pp-text">El portal web de WatSolution puede utilizar <strong>cookies de sesión estrictamente necesarias</strong> para mantener la sesión activa del usuario autenticado. No se utilizan cookies de rastreo ni publicidad de terceros.</p>
          <div class="pp-callout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Los usuarios pueden configurar su navegador para rechazar cookies, aunque esto puede afectar el funcionamiento de la plataforma.
          </div>
        </section>

        <!-- 13 -->
        <section :id="'s13'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">13</span>
            <h2>Tratamiento de Datos de Menores de Edad</h2>
          </div>
          <div class="pp-callout pp-callout--warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            WatSolution <strong>no está dirigido a menores de 18 años</strong>. La plataforma no recopila deliberadamente datos de menores de edad. En caso de identificar que se han recopilado datos de un menor sin la debida autorización del representante legal, se procederá a su eliminación inmediata.
          </div>
        </section>

        <!-- 14 -->
        <section :id="'s14'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">14</span>
            <h2>Vigencia y Modificaciones de la Política</h2>
          </div>
          <div class="pp-table-wrap">
            <table class="pp-table">
              <thead><tr><th>Aspecto</th><th>Detalle</th></tr></thead>
              <tbody>
                <tr><td>Fecha de entrada en vigencia</td><td>Mayo de 2026</td></tr>
                <tr><td>Comunicación de cambios</td><td>Notificación por WhatsApp y publicación en el portal web</td></tr>
                <tr><td>Plazo de comunicación</td><td>10 días hábiles de antelación antes de que los cambios entren en vigencia</td></tr>
                <tr><td>Versión actual</td><td>Versión 1.0 — Mayo 2026</td></tr>
                <tr><td>Acceso al documento</td><td>watsolutionweb-production.up.railway.app/politica-privacidad</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 15 -->
        <section :id="'s15'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">15</span>
            <h2>Autorización para el Tratamiento de Datos</h2>
          </div>
          <p class="pp-text">Al registrarse en la plataforma WatSolution, el titular otorga su <strong>consentimiento previo, expreso e informado</strong> para el tratamiento de sus datos personales de acuerdo con las finalidades descritas en esta política.</p>
          <p class="pp-text">Para los suscriptores registrados por un funcionario, la autorización se obtiene mediante la firma del formulario de vinculación al servicio de acueducto.</p>
          <div class="pp-callout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            La autorización podrá ser revocada en cualquier momento mediante solicitud escrita dirigida a <strong>habeasdata@acueductojuanoy.com</strong>, sin que ello genere efectos retroactivos sobre el tratamiento realizado con anterioridad.
          </div>
        </section>

        <!-- 16 -->
        <section :id="'s16'" class="pp-section">
          <div class="pp-section__head">
            <span class="pp-section__num">16</span>
            <h2>Marco Normativo Aplicable</h2>
          </div>
          <div class="pp-law-list">
            <div class="pp-law-item">
              <div class="pp-law-item__badge">Ley 1581 / 2012</div>
              <div>Ley de Protección de Datos Personales de Colombia.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">Decreto 1377 / 2013</div>
              <div>Reglamentación parcial de la Ley 1581 de 2012.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">Decreto 1074 / 2015</div>
              <div>Decreto Único Reglamentario del Sector Comercio, Industria y Turismo.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">Decreto 1076 / 2015</div>
              <div>Decreto Único Reglamentario del Sector Agua Potable y Saneamiento Básico.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">Resolución 2115 / 2016</div>
              <div>Mínimo vital de agua potable.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">ISO/IEC 27001:2013</div>
              <div>Estándares internacionales de seguridad de la información.</div>
            </div>
            <div class="pp-law-item">
              <div class="pp-law-item__badge">ISO/IEC 25010:2011</div>
              <div>Modelos de calidad de software, aplicado en los escenarios de seguridad de WatSolution.</div>
            </div>
          </div>
        </section>

        <!-- Footer de la policy -->
        <div class="pp-footer-card">
          <div class="pp-footer-card__logo">💧</div>
          <p>Asociación Junta Administradora Acueducto Juanoy · NIT 900.009.297-6</p>
          <p>San Juan de Pasto, Nariño, Colombia</p>
          <p><a href="mailto:habeasdata@acueductojuanoy.com">habeasdata@acueductojuanoy.com</a> · 3154536292</p>
          <p class="pp-footer-card__version">Política de Privacidad Versión 1.0 — Mayo 2026</p>
        </div>

      </main>
    </div>

    <!-- Back to top -->
    <button v-if="showBackTop" class="pp-back-top" @click="window.scrollTo({top:0,behavior:'smooth'})">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
    </button>

  </div>
</template>

<script lang="ts">
// expose window for template
const window = globalThis;
</script>

<style lang="scss" scoped>
/* ── Root ─────────────────────────────────────────────────────── */
.pp-root {
  min-height: 100vh;
  background: #f0f4f9;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.pp-hero {
  position: relative;
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 55%, #1976d2 100%);
  color: #fff;
  padding: 56px 40px 72px;
  overflow: hidden;
}
.pp-hero__waves {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  svg { display: block; width: 100%; height: 60px; }
}
.pp-hero__inner {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
}
.pp-hero__badge {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.3);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.pp-hero__title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 10px;
}
.pp-hero__org {
  font-size: 0.95rem;
  opacity: 0.85;
  margin-bottom: 20px;
}
.pp-hero__meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  span {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 0.8rem;
    font-weight: 600;
  }
}

/* ── Body layout ──────────────────────────────────────────────── */
.pp-body {
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* ── Sidebar ──────────────────────────────────────────────────── */
.pp-nav {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  background: #fff;
  border-radius: 14px;
  padding: 18px 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  border: 1px solid #dde4ef;
}
.pp-nav__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: #7a8aaa;
  margin-bottom: 10px;
  padding: 0 6px;
}
.pp-nav__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 2px;
  transition: background 0.15s;
  &:hover { background: #f0f4ff; }
  &--active {
    background: #e8f0fe;
    .pp-nav__num { background: #1565c0; color: #fff; }
    .pp-nav__text { color: #1565c0; font-weight: 700; }
  }
}
.pp-nav__num {
  min-width: 20px; height: 20px;
  border-radius: 50%;
  background: #e0e7f5;
  color: #3a5a9b;
  font-size: 0.68rem;
  font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.pp-nav__text {
  font-size: 0.78rem;
  color: #4a5568;
  line-height: 1.35;
}
.pp-nav__back {
  display: flex; align-items: center; gap: 6px;
  margin-top: 14px; padding: 8px 10px;
  width: 100%; border: 1px solid #dde4ef;
  border-radius: 8px; background: transparent;
  font-size: 0.8rem; color: #4a5568;
  cursor: pointer; font-weight: 600;
  transition: background 0.15s;
  &:hover { background: #f0f4ff; }
}

/* ── Main ─────────────────────────────────────────────────────── */
.pp-main {
  flex: 1;
  min-width: 0;
}

/* ── Section ──────────────────────────────────────────────────── */
.pp-section {
  background: #fff;
  border-radius: 14px;
  padding: 28px 30px;
  margin-bottom: 20px;
  box-shadow: 0 1px 6px rgba(0,0,0,.06);
  border: 1px solid #e4ecf5;
}
.pp-section__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  h2 {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1a2a4a;
    margin: 0;
  }
}
.pp-section__num {
  min-width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1565c0, #1976d2);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Text & List ──────────────────────────────────────────────── */
.pp-text {
  font-size: 0.92rem;
  color: #3a4a62;
  line-height: 1.7;
  margin-bottom: 14px;
}
.pp-list {
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  li {
    font-size: 0.9rem;
    color: #3a4a62;
    padding-left: 22px;
    position: relative;
    &::before {
      content: '●';
      color: #1976d2;
      font-size: 0.5rem;
      position: absolute;
      left: 4px;
      top: 5px;
    }
  }
  &--compact li { font-size: 0.85rem; }
}

/* ── Callout ──────────────────────────────────────────────────── */
.pp-callout {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #e8f4fd;
  border-left: 4px solid #1976d2;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  font-size: 0.87rem;
  color: #1a3a5c;
  line-height: 1.6;
  margin-top: 16px;
  svg { flex-shrink: 0; margin-top: 2px; color: #1976d2; }
  &--warn {
    background: #fff8e1;
    border-left-color: #f59e0b;
    color: #6b4c00;
    svg { color: #f59e0b; }
  }
}

/* ── Table ────────────────────────────────────────────────────── */
.pp-table-wrap { overflow-x: auto; }
.pp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  thead { background: #1565c0; color: #fff; }
  th { padding: 10px 14px; text-align: left; font-weight: 600; }
  td { padding: 9px 14px; color: #3a4a62; border-bottom: 1px solid #e8edf5; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f7faff; }
}

/* ── Info cards (section 1) ───────────────────────────────────── */
.pp-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
}
.pp-info-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #f4f8ff;
  border: 1px solid #dde8f8;
  border-radius: 10px;
  padding: 14px 16px;
}
.pp-info-card__icon { font-size: 1.4rem; flex-shrink: 0; }
.pp-info-card__label { font-size: 0.72rem; color: #7a90b8; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 3px; }
.pp-info-card__val { font-size: 0.87rem; color: #1a2a4a; font-weight: 600; }

/* ── Purpose grid (section 4) ────────────────────────────────── */
.pp-purpose-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.pp-purpose {
  background: #f4f8ff;
  border: 1px solid #dde8f8;
  border-radius: 10px;
  padding: 16px 14px;
  text-align: center;
}
.pp-purpose__icon { font-size: 1.8rem; margin-bottom: 8px; }
.pp-purpose__title { font-size: 0.82rem; font-weight: 700; color: #1a2a4a; margin-bottom: 6px; }
.pp-purpose__desc { font-size: 0.76rem; color: #5a6a88; line-height: 1.5; }

/* ── Rights grid (section 6) ─────────────────────────────────── */
.pp-rights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.pp-right {
  background: linear-gradient(135deg, #f4f8ff, #edf3ff);
  border: 1px solid #c8daf8;
  border-radius: 10px;
  padding: 16px 14px;
}
.pp-right__icon { font-size: 1.6rem; margin-bottom: 8px; }
.pp-right__title { font-size: 0.85rem; font-weight: 800; color: #1565c0; margin-bottom: 5px; }
.pp-right__desc { font-size: 0.78rem; color: #4a5c7a; line-height: 1.5; }

/* ── Data columns (section 5) ────────────────────────────────── */
.pp-data-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
}
.pp-data-group {
  background: #f4f8ff;
  border: 1px solid #dde8f8;
  border-radius: 10px;
  padding: 16px 18px;
}
.pp-data-group__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 800; color: #1565c0;
  margin-bottom: 12px;
}

/* ── Security grid (section 9) ───────────────────────────────── */
.pp-security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}
.pp-security {
  background: #f4f8ff;
  border-left: 4px solid #1976d2;
  border-radius: 0 10px 10px 0;
  padding: 14px 16px;
}
.pp-security__icon { font-size: 1.4rem; margin-bottom: 6px; }
.pp-security__title { font-size: 0.83rem; font-weight: 800; color: #1a2a4a; margin-bottom: 5px; }
.pp-security__desc { font-size: 0.78rem; color: #4a5c7a; line-height: 1.5; }

/* ── Retention list (section 11) ─────────────────────────────── */
.pp-retention-list { display: flex; flex-direction: column; gap: 10px; }
.pp-retention-item {
  display: flex; gap: 14px; align-items: flex-start;
  background: #f4f8ff; border-radius: 8px; padding: 12px 16px;
  border: 1px solid #dde8f8;
}
.pp-retention-item__period {
  min-width: 110px;
  font-size: 0.8rem; font-weight: 800; color: #1565c0;
  background: #e0ecff; border-radius: 6px; padding: 4px 10px;
  text-align: center;
}
.pp-retention-item__desc { font-size: 0.87rem; color: #3a4a62; line-height: 1.6; }

/* ── Law list (section 16) ───────────────────────────────────── */
.pp-law-list { display: flex; flex-direction: column; gap: 10px; }
.pp-law-item {
  display: flex; gap: 14px; align-items: flex-start;
  font-size: 0.88rem; color: #3a4a62; padding: 10px 0;
  border-bottom: 1px solid #e8edf5;
  &:last-child { border: none; }
}
.pp-law-item__badge {
  min-width: 150px;
  background: #1565c0; color: #fff;
  border-radius: 6px; padding: 4px 10px;
  font-size: 0.76rem; font-weight: 700;
  text-align: center; flex-shrink: 0;
}

/* ── Footer card ─────────────────────────────────────────────── */
.pp-footer-card {
  background: linear-gradient(135deg, #0d47a1, #1565c0);
  color: rgba(255,255,255,0.9);
  border-radius: 14px;
  padding: 28px 32px;
  text-align: center;
  p { font-size: 0.87rem; margin: 4px 0; }
  a { color: rgba(255,255,255,0.85); text-decoration: underline; }
}
.pp-footer-card__logo { font-size: 2.2rem; margin-bottom: 10px; }
.pp-footer-card__version { margin-top: 14px; font-size: 0.78rem; opacity: 0.7; }

/* ── Back to top ─────────────────────────────────────────────── */
.pp-back-top {
  position: fixed; bottom: 28px; right: 28px;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #1565c0;
  border: none; color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 14px rgba(21,101,192,0.4);
  transition: transform 0.15s;
  &:hover { transform: translateY(-2px); }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .pp-nav { display: none; }
  .pp-body { padding: 16px 12px 40px; }
  .pp-section { padding: 20px 16px; }
  .pp-hero { padding: 40px 20px 56px; }
}
</style>

<!-- data constants below script setup -->
<script lang="ts">
const purposes = [
  { icon: '👤', title: 'Gestión de usuarios', desc: 'Crear, modificar y desactivar cuentas de suscriptores y funcionarios.' },
  { icon: '📊', title: 'Medición y facturación', desc: 'Registrar lecturas de consumo mensual y generar facturas de cobro.' },
  { icon: '💳', title: 'Cobro y pagos', desc: 'Gestionar el pago de facturas en línea y generar comprobantes digitales.' },
  { icon: '🔔', title: 'Notificaciones', desc: 'Enviar avisos de facturación y recordatorios por WhatsApp y SMS.' },
  { icon: '📈', title: 'Historial de consumo', desc: 'Almacenar el historial mensual y anual de consumo por suscriptor.' },
  { icon: '💬', title: 'Atención al usuario', desc: 'Resolver consultas mediante el chatbot integrado.' },
  { icon: '📑', title: 'Estadísticas', desc: 'Generar reportes de recaudo y consumo para la Junta.' },
  { icon: '🤖', title: 'Predicción IA', desc: 'Detectar consumos anómalos y generar predicciones.' },
  { icon: '🔒', title: 'Seguridad', desc: 'Registrar actividad de funcionarios para trazabilidad y auditoría.' },
];
const rights = [
  { icon: '👁️', title: 'Conocer', desc: 'Acceder gratuitamente a los datos almacenados desde el Panel de Usuario.' },
  { icon: '✏️', title: 'Actualizar', desc: 'Solicitar la corrección de datos inexactos o desactualizados.' },
  { icon: '🔄', title: 'Rectificar', desc: 'Exigir la corrección de datos tratados de manera incorrecta.' },
  { icon: '🚫', title: 'Revocar', desc: 'Retirar el consentimiento otorgado para el tratamiento.' },
  { icon: '🗑️', title: 'Suprimir', desc: 'Solicitar la eliminación cuando los datos no sean necesarios.' },
  { icon: '⚖️', title: 'Quejarse', desc: 'Acudir a la SIC si considera que sus derechos han sido vulnerados.' },
];
const security = [
  { icon: '🔐', title: 'Cifrado en tránsito', desc: 'Toda comunicación viaja bajo protocolo HTTPS/TLS.' },
  { icon: '🗄️', title: 'Cifrado en reposo', desc: 'Contraseñas almacenadas con hash bcrypt (AES-256).' },
  { icon: '🎭', title: 'Autenticación por roles', desc: 'El sistema restringe el acceso según el rol asignado.' },
  { icon: '🔑', title: 'Tokens JWT', desc: 'Autenticación stateless con tokens firmados y expiración.' },
  { icon: '🚧', title: 'Bloqueo por intentos', desc: 'El sistema bloquea el acceso tras 5 intentos fallidos.' },
  { icon: '💾', title: 'Copias de seguridad', desc: 'Backups diferenciales diarios y completos semanales.' },
  { icon: '📋', title: 'Log de actividad', desc: 'Todas las acciones críticas quedan registradas para auditoría.' },
  { icon: '🎓', title: 'Capacitación', desc: 'Los funcionarios reciben capacitación sobre manejo de datos.' },
];
</script>
