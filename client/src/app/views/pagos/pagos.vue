<template>
  <div class="pagos-bg d-flex align-items-start justify-content-center py-5">
    <div class="pagos-card card shadow-sm">
      <div class="card-body p-4">
        <!-- PSE Logo -->
        <div class="text-center mb-3">
          <img src="/content/images/pse-logo.png" alt="PSE Logo" class="pse-logo" onerror="this.style.display='none'" />
        </div>

        <!-- Title -->
        <div class="text-center mb-4">
          <h2 class="font-weight-bold mb-1">Pagos en Línea</h2>
          <p class="text-muted small">Completa los datos para realizar tu pago de forma segura</p>
        </div>

        <!-- Reference Summary -->
        <div class="ref-box d-flex align-items-center justify-content-between mb-4 p-3">
          <div>
            <span class="text-muted small">Referencia:</span>
            <span class="font-weight-bold ml-1">{{ invoiceRef }}</span>
          </div>
          <div>
            <span class="text-muted small">Total a pagar:</span>
            <span class="text-primary font-weight-bold ml-1" style="font-size:1.1rem;">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>

        <!-- Form -->
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="font-weight-600">Tipo de Persona</label>
              <select class="form-control" v-model="form.personType">
                <option value="natural">Persona Natural</option>
                <option value="juridica">Persona Jurídica</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="font-weight-600">Banco</label>
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <font-awesome-icon icon="building-columns" class="text-muted" />
                  </span>
                </div>
                <select class="form-control border-left-0" v-model="form.bank">
                  <option value="">Selecciona tu banco</option>
                  <option value="bancolombia">Bancolombia</option>
                  <option value="davivienda">Davivienda</option>
                  <option value="bogota">Banco de Bogotá</option>
                  <option value="occidente">Banco de Occidente</option>
                  <option value="popular">Banco Popular</option>
                  <option value="bbva">BBVA</option>
                  <option value="nequi">Nequi</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="font-weight-600">Tipo de Documento</label>
              <select class="form-control" v-model="form.docType">
                <option value="cc">Cédula de Ciudadanía</option>
                <option value="ce">Cédula de Extranjería</option>
                <option value="nit">NIT</option>
                <option value="pp">Pasaporte</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="font-weight-600">Número de Documento</label>
              <input
                type="text"
                class="form-control"
                placeholder="Ej: 12345678"
                v-model="form.docNumber"
              />
            </div>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="security-notice d-flex align-items-start p-3 mb-4">
          <font-awesome-icon icon="shield-alt" class="text-success mr-2 mt-1" />
          <span class="small text-success">
            Tus datos están protegidos con encriptación de grado bancario PCI-DSS.
          </span>
        </div>

        <!-- Error / Success -->
        <div v-if="errorMsg" class="alert alert-danger mb-3">{{ errorMsg }}</div>
        <div v-if="successMsg" class="alert alert-success mb-3">{{ successMsg }}</div>

        <!-- CTA Button -->
        <button
          class="btn btn-pse btn-block font-weight-bold"
          @click="submitPayment"
          :disabled="isPaying"
        >
          <font-awesome-icon :icon="isPaying ? 'spinner' : 'credit-card'" :spin="isPaying" class="mr-2" />
          {{ isPaying ? 'Procesando...' : 'Pagar con PSE →' }}
        </button>

        <!-- Back link -->
        <div class="text-center mt-3">
          <router-link to="/portal" class="text-muted small">
            ← Volver al Portal
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./pagos.component.ts"></script>

<style scoped>
.pagos-bg {
  background: #f0f5fb;
  min-height: calc(100vh - 60px);
}

.pagos-card {
  width: 100%;
  max-width: 580px;
  border-radius: 18px;
  border: none;
}

.pse-logo {
  height: 50px;
  object-fit: contain;
}

.ref-box {
  background: #f8fafc;
  border: 1px solid #e9ecef;
  border-radius: 10px;
}

.security-notice {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.btn-pse {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.8rem;
  font-size: 1rem;
  transition: background 0.2s;
}
.btn-pse:hover:not(:disabled) { background: #1d4ed8; }
.btn-pse:disabled { opacity: 0.7; cursor: not-allowed; }

.font-weight-600 { font-weight: 600; }
</style>
