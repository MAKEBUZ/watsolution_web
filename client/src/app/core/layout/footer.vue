<template>
  <footer class="service-footer">
    <div>
      <router-link to="/" class="footer-brand">WatSolution</router-link>
      <p>Oficina virtual de servicios de agua.</p>
    </div>
    <nav aria-label="Enlaces del pie de página">
      <router-link to="/noticias">Noticias</router-link><router-link to="/portal">Mi cuenta</router-link
      ><router-link to="/politica-privacidad">Política de privacidad</router-link>
    </nav>
    <span>© {{ new Date().getFullYear() }} WatSolution</span>
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
