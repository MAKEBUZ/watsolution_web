<script setup lang="ts">
import { computed } from 'vue';
import { useAccountStore } from '@/shared/config/store/account-store';
const account = useAccountStore();
const destination = computed(() => (account.account?.authorities?.includes('ROLE_ADMIN') ? '/admin/resumen' : '/portal'));
</script>

<template>
  <div class="service-home">
    <section class="service-hero">
      <div class="hero-copy">
        <p class="eyebrow">WATSOLUTION / OFICINA VIRTUAL</p>
        <h1>Tu servicio de agua.<br /><span>Todo en un lugar.</span></h1>
        <p class="hero-description">
          Consulta tus facturas, revisa tu consumo y realiza tus pagos sin desplazarte. Información clara para estar al día con tu servicio.
        </p>
        <div class="hero-links">
          <router-link :to="destination" class="primary-action">Ingresar a mi cuenta <span aria-hidden="true">↗</span></router-link>
          <router-link to="/pagos" class="secondary-action">Pagar una factura →</router-link>
        </div>
        <p class="hero-footnote">Accede con el usuario registrado en tu acueducto.</p>
      </div>
      <aside class="service-directory" aria-label="Servicios en línea">
        <div class="directory-heading"><font-awesome-icon icon="tint" /><span>Oficina virtual</span><small>Autoservicio</small></div>
        <router-link to="/pagos" class="directory-row"
          ><span class="directory-number">01</span>
          <div>
            <h2>Facturas y pagos</h2>
            <p>Consulta tus saldos y paga con Bold.</p>
          </div>
          <span aria-hidden="true">↗</span></router-link
        >
        <router-link to="/portal" class="directory-row"
          ><span class="directory-number">02</span>
          <div>
            <h2>Mi consumo</h2>
            <p>Revisa el historial de tu servicio.</p>
          </div>
          <span aria-hidden="true">↗</span></router-link
        >
        <router-link to="/noticias" class="directory-row"
          ><span class="directory-number">03</span>
          <div>
            <h2>Avisos del acueducto</h2>
            <p>Consulta las novedades publicadas.</p>
          </div>
          <span aria-hidden="true">↗</span></router-link
        >
        <div class="directory-note">Información de tu cuenta disponible al iniciar sesión.</div>
      </aside>
    </section>
    <section class="service-guide">
      <div>
        <p class="eyebrow">PAGOS EN LÍNEA</p>
        <h2>Una ruta clara para<br />ponerte al día.</h2>
        <router-link to="/pagos">Ir a mis pagos →</router-link>
      </div>
      <article>
        <span>01 / CONSULTA</span>
        <h3>Selecciona tu factura</h3>
        <p>Encuentra las facturas pendientes y revisa su fecha de vencimiento.</p>
      </article>
      <article>
        <span>02 / REVISA</span>
        <h3>Confirma el valor</h3>
        <p>Verifica la referencia y el total antes de continuar a la pasarela.</p>
      </article>
      <article>
        <span>03 / PAGA</span>
        <h3>Continúa con Bold</h3>
        <p>Elige un medio de pago disponible y consulta el resultado de la transacción.</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.service-home {
  background: #f6f7f9;
  color: #162b3c;
}
.service-hero {
  max-width: 1240px;
  margin: auto;
  padding: 100px 32px 88px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  align-items: center;
}
.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #52716c;
  margin-bottom: 25px;
}
h1 {
  font-size: clamp(36px, 4.1vw, 58px);
  line-height: 1.12;
  letter-spacing: -2px;
  font-weight: 600;
  margin-bottom: 24px;
}
h1 span {
  color: #14766e;
}
.hero-description {
  font-size: 17px;
  line-height: 1.8;
  color: #62717e;
  max-width: 490px;
}
.hero-links {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-top: 32px;
}
.primary-action {
  background: #176b61;
  color: white;
  padding: 14px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  gap: 25px;
}
.secondary-action {
  font-size: 14px;
  font-weight: 600;
}
.hero-footnote {
  font-size: 12px;
  color: #74818c;
  margin-top: 22px;
}
.service-directory {
  background: white;
  border: 1px solid #dce3e6;
  border-radius: 10px;
  box-shadow: 0 12px 35px #162b3c08;
  overflow: hidden;
}
.directory-heading {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e9ec;
  font-weight: 600;
}
.directory-heading svg {
  color: #14766e;
}
.directory-heading small {
  margin-left: auto;
  color: #6f7e88;
  font-weight: 400;
}
.directory-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px 24px;
  border-bottom: 1px solid #edf0f2;
}
.directory-row:hover {
  background: #f7faf9;
  opacity: 1;
}
.directory-number {
  font-size: 12px;
  color: #8c999f;
  font-variant-numeric: tabular-nums;
}
.directory-row div {
  flex: 1;
}
.directory-row h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.directory-row p {
  font-size: 13px;
  color: #74818c;
  margin: 0;
}
.directory-note {
  padding: 17px 24px;
  font-size: 11px;
  color: #7b8790;
  background: #fafbfc;
}
.service-guide {
  background: white;
  border-top: 1px solid #e1e7eb;
  padding: 50px max(32px, calc((100vw - 1176px) / 2));
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  gap: 40px;
}
.service-guide .eyebrow {
  margin-bottom: 15px;
}
.service-guide h2 {
  font-size: 25px;
  line-height: 1.3;
  letter-spacing: -0.6px;
}
.service-guide a {
  display: inline-block;
  margin-top: 14px;
  color: #14766e;
  font-size: 13px;
  font-weight: 600;
}
.service-guide article {
  padding-top: 8px;
}
.service-guide article span {
  font-size: 10px;
  letter-spacing: 1.5px;
  color: #84919b;
}
.service-guide h3 {
  font-size: 16px;
  margin: 20px 0 12px;
  font-weight: 600;
}
.service-guide article p {
  font-size: 13px;
  line-height: 1.8;
  color: #6b7984;
}
@media (max-width: 900px) {
  .service-hero {
    gap: 35px;
    padding: 60px 24px;
    grid-template-columns: 1fr;
  }
  .service-guide {
    grid-template-columns: 1fr 1fr;
    padding: 35px 24px;
    gap: 30px;
  }
}
@media (max-width: 480px) {
  .hero-links {
    align-items: flex-start;
    flex-direction: column;
  }
  .service-guide {
    grid-template-columns: 1fr;
  }
  h1 {
    letter-spacing: -1px;
  }
}
</style>
