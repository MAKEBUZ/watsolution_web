<template>
  <footer class="service-footer">
    <div>
      <router-link to="/" class="footer-brand">WatSolution</router-link>
      <p>Oficina virtual de servicios de agua.</p>
    </div>
    <nav aria-label="Enlaces del pie de página">
      <router-link to="/noticias">Noticias</router-link><router-link to="/portal">Mi cuenta</router-link
      ><router-link to="/politica-privacidad">Política de privacidad</router-link>
      <a href="/condiciones-del-servicio/">Condiciones del servicio</a>
      <a href="/whatsapp/">Mi WhatsApp</a>
    </nav>
    <div class="footer-creators">
      <span>UN PROYECTO CREADO POR</span><strong>Diego Ocampo</strong><strong>Dylan Rodriguez</strong>
      <p>Diseño y desarrollo de WatSolution.</p>
    </div>
    <div class="footer-rights">© {{ new Date().getFullYear() }} Diego Ocampo y Dylan Rodriguez. Todos los derechos reservados.</div>
  </footer>
</template>
<style scoped>
.service-footer {
  padding: 32px max(24px, calc((100vw - 1176px) / 2));
  display: flex;
  align-items: center;
  gap: 40px;
  border-top: 1px solid #e0e7eb;
  background: #fff;
  color: #758590;
  font-size: 12px;
}
.footer-brand {
  font-size: 17px;
  font-weight: 600;
  color: #176b61;
}
.service-footer p {
  margin: 8px 0 0;
  font-size: 11px;
}
.service-footer nav {
  display: flex;
  gap: 24px;
  margin-left: auto;
}
.service-footer nav a {
  font-size: 12px;
  font-weight: 400;
}
.service-footer > span {
  font-size: 11px;
  white-space: nowrap;
}
@media (max-width: 760px) {
  .service-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 24px;
  }
  .service-footer nav {
    margin: 0;
    flex-wrap: wrap;
    gap: 18px;
  }
}
</style>
<style scoped>
.service-footer {
  flex-wrap: wrap;
  padding-top: 48px;
  background: #143e43;
  color: #b8d2c6;
  gap: 40px;
}
.footer-brand {
  color: #e7f8ef;
  font-size: 26px;
}
.service-footer nav a {
  color: #d9eee4;
}
.footer-creators {
  display: grid;
  gap: 10px;
  margin-left: auto;
}
.footer-creators > span {
  font-size: 10px;
  letter-spacing: 0.12em;
}
.footer-creators strong {
  font-size: 15px;
  font-weight: 600;
  color: white;
}
.footer-rights {
  width: 100%;
  border-top: 1px solid #456662;
  padding-top: 22px;
  font-size: 11px;
  line-height: 1.8;
}
.service-footer p {
  font-size: 12px;
  line-height: 1.8;
}
@media (max-width: 760px) {
  .footer-creators {
    margin-left: 0;
  }
}
</style>
